// Importa os módulos necessários
const express = require('express'); // Framework para criar o servidor e rotas
const mysql2 = require('mysql2'); // Biblioteca para conexão com o banco de dados MySQL
const cors = require('cors'); // Middleware para permitir requisições de outras origens (Cross-Origin Resource Sharing)
const bcrypt = require('bcrypt'); // Biblioteca para criptografar senhas
const swaggerJsDoc = require('swagger-jsdoc'); // Para gerar documentação Swagger a partir do código
const swaggerUi = require('swagger-ui-express'); // Para exibir a interface gráfica da documentação Swagger
const multer = require('multer'); // Middleware para lidar com uploads de arquivos
const path = require('path'); // Módulo nativo para lidar com caminhos de arquivos/diretórios
const fileUpload = require('express-fileupload'); // Middleware adicional para uploads de arquivos

// Inicializa o aplicativo Express
const app = express();
const port = 3009; // Define a porta em que o servidor será executado

// Configuração do banco de dados
const dbCategoria = mysql2.createConnection({
    host: 'localhost', // Endereço do servidor de banco de dados
    user: 'root', // Usuário do banco de dados
    password: 'root', // Senha do banco de dados
    database: 'usuario', // Nome do banco de dados
});

// Estabelece conexão com o banco de dados
dbCategoria.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados usuario:', err); // Loga o erro, caso aconteça
        return;
    }
    console.log('Conectado ao banco de dados.'); // Confirma conexão bem-sucedida
});

// Middlewares globais para o Express
app.use(express.json()); // Permite manipular dados no formato JSON
app.use(cors()); // Habilita requisições entre origens diferentes
app.use(express.urlencoded({ extended: true })); // Permite manipular dados no formato URL-encoded

// Configuração do multer para gerenciar uploads de imagens
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Define o diretório onde as imagens serão armazenadas
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Renomeia o arquivo com um timestamp
    }
});
const upload = multer({ storage: storage }); // Inicializa o multer com a configuração

// Configuração do Swagger para documentação
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0', // Versão do Swagger/OpenAPI
        info: {
            title: 'API de Tarefas', // Título da API
            version: '1.0.0', // Versão da API
            description: 'API para gerenciar tarefas' // Descrição da API
        },
        servers: [
            {
                url: `http://localhost:${port}`, // URL do servidor local
                description: 'Servidor local'
            }
        ]
    },
    apis: ['./back/*.js'], // Caminho para os arquivos que contêm as anotações Swagger
};

// Gera a documentação Swagger
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs)); // Configura a interface do Swagger

// Inicia o servidor na porta definida
app.listen(port, () => {
    console.log(`Executando na porta ${port}`);
});

// Rota GET para verificar se o banco de dados está funcionando
app.get('/', (req, res) => {
    const query = 'SELECT * FROM perfil LIMIT 1'; // Consulta de teste no banco
    dbCategoria.query(query, (err, result) => {
        if (err) {
            console.error('Erro ao executar a query:', err);
            res.status(500).send('Erro no servidor'); // Retorna erro de servidor
            return;
        }

        if (result.length > 0) {
            res.send(JSON.stringify(result[0])); // Retorna o primeiro registro encontrado
        } else {
            res.send('Nenhum dado encontrado.'); // Caso não haja registros
        }
    });
});

// Rota POST para cadastro de usuários
app.post('/cadastro', async (req, res) => {
    console.log('Dados recebidos:', req.body);
    const { email, nome, senha } = req.body;

    // Verifica se todos os campos obrigatórios foram preenchidos
    if (!email || !nome || !senha) {
        return res.status(400).json({ success: false, message: "Todos os campos são obrigatórios." });
    }

    console.log('entrou')
    try {
        const resultado = await registrarUsuario(nome, email, senha); // Registra o usuário no banco
        console.log(resultado)
        res.status(200).json({
            success: true,
            message: "Usuário registrado com sucesso"
        });
    } catch (err) {
        console.error('Erro ao registrar o usuário:', err);
        res.status(400).json({ success: false, message: "Erro ao registrar o usuário" });
    }
});

// Função auxiliar para registrar um usuário no banco de dados
async function registrarUsuario(nome, email, senha) {
    const senhaHash = await bcrypt.hash(senha, 10); // Criptografa a senha usando bcrypt
    return new Promise((resolve, reject) => {
        dbCategoria.query(
            'INSERT INTO perfil (nome, email, senha) VALUES (?, ?, ?)', // Query de inserção no banco
            [nome, email, senhaHash],
            (err, result) => {
                if (err) {
                    return reject(err); // Retorna erro caso a query falhe
                }
                resolve(result); // Resolve a promessa caso a query seja bem-sucedida
            }
        );
    });
}

// Rota POST para login de usuários
app.post('/login', async (req, res) => {
    const { email, senha } = req.body; // Recebe email e senha do corpo da requisição
    try {
        const usuario = await validarLogin(email, senha); // Valida as credenciais do usuário
        if (usuario) {
            res.json({ success: true, message: "Login realizado com sucesso!" });
        } else {
            res.json({ success: false, message: "Credenciais inválidas." });
        }
    } catch (error) {
        res.json({ success: false, message: "Erro no servidor." });
    }
});

// Função para validar login
async function validarLogin(email, senha) {
    return new Promise((resolve, reject) => {
        dbCategoria.query(
            'SELECT * FROM perfil WHERE email = ?', // Consulta o banco pelo email
            [email],
            async (err, results) => {
                if (err) return reject(err);
                if (results.length > 0) {
                    const user = results[0];
                    const senhaValida = await bcrypt.compare(senha, user.senha); // Compara a senha fornecida com a senha criptografada no banco
                    if (senhaValida) return resolve(user);
                }
                resolve(null);
            }
        );
    });
}

// Rota POST para cadastrar itens com imagem
app.post('/cadastrar-item', upload.single('imagem'), (req, res) => {
    const { nome, categoria_id } = req.body; // Recebe nome e categoria do corpo da requisição
    const imagem = req.file ? req.file.filename : null; // Recebe o nome do arquivo, se enviado

    const query = 'INSERT INTO itens (nome, imagem, categoria_id) VALUES (?, ?, ?)'; // Query de inserção no banco
    dbCategoria.query(query, [nome, imagem, categoria_id], (err, result) => {
        if (err) {
            console.error('Erro ao cadastrar item:', err);
            return res.status(500).send('Erro ao cadastrar o item');
        }
        res.send('Item cadastrado com sucesso!'); // Retorna sucesso caso a query seja bem-sucedida
    });
});

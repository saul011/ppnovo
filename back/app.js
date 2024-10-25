const express = require('express');
const mysql2 = require('mysql2');
const cors = require('cors');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 3009;

// Conexão com o banco de dados 'categoria'
const dbCategoria = mysql2.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'usuario',
});

// Estabelecendo a conexão com o banco de dados 'categoria'
dbCategoria.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados categoria:', err);
        return;
    }
    console.log('Conectado ao banco de dados.');
});


app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// Configuração do multer para upload de imagem
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Configuração do Swagger
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'API de Tarefas',
            version: '1.0.0',
            description: 'API para gerenciar tarefas'
        },
        servers: [
            {
                url: `http://localhost:${port}`,
                description: 'Servidor local'
            }
        ]
    },
    apis: ['./back/*.js'], // Caminho para os arquivos com anotações Swagger
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Rota GET para verificar se o banco de dados 'perfil' está funcionando
app.get('/', (req, res) => {
    const query = 'SELECT * FROM perfil LIMIT 1';
    dbCategoria.query(query, (err, result) => {
        if (err) {
            console.error('Erro ao executar a query:', err);
            res.status(500).send('Erro no servidor');
            return;
        }

        if (result.length > 0) {
            res.send(JSON.stringify(result[0]));
        } else {
            res.send('Nenhum dado encontrado.');
        }
    });
});

/**
 * @swagger
 * /cadastro:
 *   post:
 *     summary: Cadastra uma nova tarefa
 *     responses:
 *       201:
 *         description: Sucesso!
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
app.post('/cadastro', (req, res) => {
    const { email, nome, senha } = req.body;
    const query = 'INSERT INTO perfil (email, nome, senha) VALUES (?, ?, ?)';
    const values = [email, nome, senha];

    dbCategoria.query(query, values, (err, results) => {
        if (err) {
            console.error('Erro ao inserir os dados:', err);
            return res.status(500).send('Erro ao registrar o usuário');
        }
        res.status(201).send('Usuário registrado com sucesso');
    });
});

// Rota para carregar o formulário
app.post('/cadastrar-item', upload.single('imagem'), (req, res) => {
    const { nome, categoria_id } = req.body; // Remova 'descricao' e 'preco' se não estiverem no formulário
    const imagem = req.file ? req.file.filename : null;

    const query = 'INSERT INTO itens (nome, imagem, categoria_id) VALUES (?, ?, ?)';
    dbCategoria.query(query, [nome, imagem, categoria_id], (err, result) => {
        if (err) {
            console.error('Erro ao cadastrar item:', err); // Adicione um log de erro
            return res.status(500).send('Erro ao cadastrar o item');
        }
        res.send('Item cadastrado com sucesso!');
    });
});



// Iniciar o servidor
app.listen(port, () => {
    console.log(`Executando na porta ${port}`);
});

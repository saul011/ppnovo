// app.js

const express = require('express');
const mysql2 = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt'); // Adicionando o bcrypt para criptografar senhas
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 3009;

// Conexão com o banco de dados 'usuario'
const dbCategoria = mysql2.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'usuario',
});

// Estabelecendo a conexão com o banco de dados 'usuario'
dbCategoria.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados usuario:', err);
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

// Rota GET para verificar se o banco de dados 'usuario' está funcionando
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
 *     summary: Cadastra um novo usuário
 *     responses:
 *       201:
 *         description: Sucesso!
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
app.post('/cadastro', async (req, res) => {
    const { email, nome, senha } = req.body;

    try {
        const resultado = await registrarUsuario(nome, email, senha);
        res.status(200).json({
            success: true,
            message: "Usuário registrado com sucesso"});
    } catch (err) {
        console.error('Erro ao registrar o usuário:', err);
        res.status(400).json({ success: false, message: "Erro ao registrar o usuário"});
    }
});

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Realiza o login do usuário
 *     responses:
 *       200:
 *         description: Sucesso!
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
app.post('/login', async (req, res) => {
    const { email, senha } = req.body;
    try {
        const usuario = await validarLogin(email, senha);
        if (usuario) {
            res.json({ success: true, message: "Login realizado com sucesso!" });
        } else {
            res.json({ success: false, message: "Credenciais inválidas." });
        }
    } catch (error) {
        res.json({ success: false, message: "Erro no servidor." });
    }
});

// Função para registrar um novo usuário com senha criptografada
async function registrarUsuario(nome, email, senha) {
    const senhaHash = await bcrypt.hash(senha, 10); // Criptografa a senha
    return new Promise((resolve, reject) => {
        dbCategoria.query(
            'INSERT INTO perfil (nome, email, senha) VALUES (?, ?, ?)',
            [nome, email, senhaHash],
            async (err, result) => {
                if (err) return reject(err);
                resolve(result);
            }
        );
    });
}

// Função para validar o login
async function validarLogin(email, senha) {
    return new Promise((resolve, reject) => {
        dbCategoria.query(
            'SELECT * FROM perfil WHERE email = ?',
            [email],
            async (err, results) => {
                if (err) return reject(err);
                if (results.length > 0) {
                    const user = results[0];
                    const senhaValida = await bcrypt.compare(senha, user.senha);
                    if (senhaValida) return resolve(user);
                }
                resolve(null);
            }
        );
    });
}

// Rota para carregar o formulário
app.post('/cadastrar-item', upload.single('imagem'), (req, res) => {
    const { nome, categoria_id } = req.body;
    const imagem = req.file ? req.file.filename : null;

    const query = 'INSERT INTO itens (nome, imagem, categoria_id) VALUES (?, ?, ?)';
    dbCategoria.query(query, [nome, imagem, categoria_id], (err, result) => {
        if (err) {
            console.error('Erro ao cadastrar item:', err);
            return res.status(500).send('Erro ao cadastrar o item');
        }
        res.send('Item cadastrado com sucesso!');
    });
});

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Executando na porta ${port}`);
});

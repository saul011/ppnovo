const express = require('express');
const mysql2 = require('mysql2');
const cors = require('cors');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const app = express();

app.use(express.json());
app.use(cors());
const port = 3000;

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
  apis: ['./src/server.js'], // Caminho para os arquivos com anotações Swagger
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Conexão com o banco de dados
const db = mysql2.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'usuario',
  port: 3306, // Aqui você provavelmente deve usar a porta do MySQL (geralmente 3306), e não a do servidor
});

db.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
    return;
  }
  console.log('Conectado ao banco de dados MySQL.');
});

// Rota GET
app.get('/', (req, res) => {
  const query = 'SELECT * FROM perfil LIMIT 1';
  db.query(query, (err, result) => {
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               nome:
 *                 type: string
 *               senha:
 *                 type: string
 *     responses:
 *       201:
 *         description: Sucesso ao cadastrar a tarefa!
 *       500:
 *         description: Erro no servidor.
 */
app.post('/cadastro', (req, res) => {
  const { email, nome, senha } = req.body;
  const query = 'INSERT INTO perfil (email, nome, senha) VALUES (?, ?, ?)';
  const values = [email, nome, senha];

  db.query(query, values, (err, results) => {
    if (err) {
      console.error('Erro ao inserir os dados:', err);
      return res.status(500).send('Erro ao registrar o usuário');
    }
    res.status(201).send('Usuário registrado com sucesso');
  });
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Executando na porta ${port}`);
});

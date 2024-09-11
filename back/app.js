const express = require('express')
const mysql2 = require('mysql2')
const cors = require('cors')
const app = express()
app.use(express.json());
app.use(cors())
const port = 3000

const db = mysql2.createConnection(
  {
    host: 'localhost',
    user: 'usuario',
    password: 'senhausuario',
    database: 'base'
  }
)

db.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
    return;
  }
  console.log('Conectado ao banco de dados MySQL.');
});

app.get('/', (req, res) => {
  const query = 'SELECT * FROM usuario LIMIT 1';

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

app.post('/cadastro', (req, res) => {
    const { email, nome, senha } = req.body;


   // Query para inserir dados na tabela usuario
   const query = 'INSERT INTO usuario (email, nome, senha) VALUES (?, ?, ?)';
   const values = [email, nome, senha];

   db.query(query, values, (err, results) => {
       if (err) {
           console.error('Erro ao inserir os dados:', err);
           return res.status(500).send('Erro ao registrar o usuário');
       }
       res.send('ok');
       console.log(results)
   });
   console.log(query,values)
});


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})


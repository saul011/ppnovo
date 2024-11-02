let button = document.getElementById("entrar");

button.onclick = async function(event) {
  event.preventDefault();

  let email = document.getElementById("email").value;
  let senha = document.getElementById("password").value;

  let data = {
    email,
    senha
  };

  console.log(data);

  try {
    const response = await fetch('http://localhost:3009/login', { // Aqui deve ser o endpoint correto para login
      method: "POST",
      headers: { "Content-type": "application/json;charset=UTF-8" },
      body: JSON.stringify(data)
    });

    let content = await response.json();
    if (content.success) {
      alert(content.message);
      window.location.href = './conteudo.html'; // Redireciona após sucesso no login
    } else {
      alert(content.message);
    }
  } catch (error) {
    alert('Erro ao conectar com o servidor.');
  }
};

const bcrypt = require('bcrypt');
const db = require('./db'); 

async function validarLogin(email, senha) {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM perfil WHERE email = ?', [email], async (err, results) => {
      if (err) return reject(err);
      if (results.length > 0) {
        const user = results[0];
        const senhaValida = await bcrypt.compare(senha, user.senha);
        if (senhaValida) return resolve(user);
      }
      resolve(null);
    });
  });
}

module.exports = { validarLogin };

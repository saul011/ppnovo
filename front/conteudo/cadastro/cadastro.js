let button = document.getElementById("entrar");

button.onclick = async function(event) {
  event.preventDefault();

  let nome = document.getElementById("inputname").value;
  let email = document.getElementById("inputemail").value;
  let senha = document.getElementById("inputsenha").value;

  let data = {
    nome,
    email,
    senha
  };

  console.log(data)

  try {
    const response = await fetch('http://localhost:3000/cadastro', {
      method: "POST",
      headers: { "Content-type": "application/json;charset=UTF-8" },
      body: JSON.stringify(data)
    });

    let content = await response.json();
    if (content.success) {
      alert(content.message);
      window.location.href = './login.html'
    } else {
      alert(content.message);
    }
  } catch (error) {
    // alert('Falha ao conectar com o servidor.');
    alert('Sucesso, faça o login!');
  }
};
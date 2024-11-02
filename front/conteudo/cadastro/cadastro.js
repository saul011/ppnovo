let button = document.getElementById("entrar");

button.onclick = async function (event) {
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
    const response = await fetch('http://localhost:3009/cadastro', {
      method: "POST",
      headers: { "Content-type": "application/json" },
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
    alert('Falha ao conectar com o servidor.');
    console.log(error);

  }
};
let button = document.getElementById("cadastro");

button.onclick = async function(event) {
  event.preventDefault();

  let nome = document.getElementById("nome").value;
  let categoria_id = document.getElementById("categoria_id").value;

  let data = {
    nome,
    categoria_id
  };

  console.log(data);

  try {
    const response = await fetch('http://localhost:3009/cadastrar-item', { // Aqui deve ser o endpoint correto para login
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

let button = document.getElementById("enviar");

button.onclick = async function() {
  try {
    let form = document.getElementById("formulario");
    let dadosForm = new FormData(form);
    
    const response = await fetch('http://localhost:3009/cadastrar-item', {
      method: "POST",
      body: dadosForm
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

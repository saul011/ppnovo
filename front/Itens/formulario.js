// Rota para carregar o formulário
app.get('/cadastrar-item', (req, res) => {
    const query = 'SELECT * FROM categoria';
    dbCategoria.query(query, (err, result) => {
        if (err) throw err;
        res.render('formulario', { categorias: result });
    });
});

// Rota para processar o cadastro do item
app.post('/cadastrar-item', upload.single('imagem'), (req, res) => {
    const { nome, categoria_id } = req.body; // Remova 'descricao' e 'preco' se não estiverem no formulário
    const imagem = req.file ? req.file.filename : null;

    const query = 'INSERT INTO itens (nome, imagem, categoria_id) VALUES (?, ?, ?)';
    dbItens.query(query, [nome, imagem, categoria_id], (err, result) => {
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

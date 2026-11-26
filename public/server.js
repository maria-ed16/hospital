const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;
const DB_FILE = path.join(__dirname, 'db.json');

// Middlewares
app.use(cors()); // Permite requisições de outras origens
app.use(express.json()); // Permite receber dados no formato JSON
app.use(express.static(path.join(__dirname, 'public'))); // Serve os
// arquivos do frontend

// Função auxiliar para salvar no banco deb dados
function salvarBancoDeDados(dados) {
    fs.writeFileSync(DB_FILE, JSON.stringify(dados, null, 2));
    // nill, 2 serve para deixar o JSON formatado e fácil de ler
}

// Função para ler os dados do banco
function lerBancoDados() {
    if (!fs.existsSync(DB_FILE)) {
        const dbInicial = { alunos: [] };
        salvarBancoDeDados(dbInicial);
        return dbInicial;
    }
   
    const dados = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(dados);
}

// CREATE (Criar - POST)
app.post('/api/alunos', (req, res) => {
    const { nome, email, curso } = req.body;

    //Validação simples
    if (!nome || !email || !curso) {
        return res.status(400).
        json({ erro: "Todos os campos são obrigatórios!"});
    }

    const db = lerBancoDados();

    // calcula o próximo ID
    const nextId = db.alunos.length > 0 ?
    Math.max(...db.alunos.map(a => a.id)) + 1 : 1;

    const novoAluno = {
        id: nextId,
        nome,
        email,
        curso,
    };

    db.alunos.push(novoAluno);
    salvarBancoDeDados(db);

    res.status(201).json(novoAluno);
});

// READ (Ler/Listar - GET)
app.get('/api/alunos', (req, res) => {
    const db = lerBancoDados();
    res.json(db.alunos);
});

// UPDATE (Atualizar - PUT)
app.put('/api/alunos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { nome, email, curso} = req.body;

    const db = lerBancoDados();
    const index = db.alunos.findIndex(a => a.id === id);

    if (index === -1) {
        return res.status(404).json({ erro: 'Alunos não encontrado!'});
    }

    db.alunos[index] = { ...db.alunos[index], nome, email, curso };
    salvarBancoDeDados(db); // Salva a alteração no arquivo 
    res.json(db.alunos[index]);
});

// DELETE (deletar - DELETE)
app.delete('/api/alunos/:id' , (req, res) => {
    const id = Number(req.params.id);
    const db = lerBancoDados();
    const index = db.alunos.findIndex(a => a.id === id);

    if (index === -1) {
        return res.status(404).json({ erro: 'aluno não encontrado!'}) 
    }

    db.alunos.splice(index, 1); // Remove o aluno da lista 
    salvarBancoDeDados(db); // Salvar a alteração no arquivo 

    res.status(204).send();
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`🚀servidor rodando na porta ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}`);
    console.log(`Banco de dados local ativo no arquivo db.json`)
});

const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

app.use(express.static(path.join(__dirname, "../frontend")));

const DB_FILE = path.join(__dirname, "db.json");

// LER BANCO DE DADOS
function readDB() {
    if (!fs.existsSync(DB_FILE)) {
        return {
            usuarios: [],
            pacientes: [],
            triagens: [],
            consultas: []
        };
    }

    const db = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));

    db.usuarios = db.usuarios || [];
    db.pacientes = db.pacientes || [];
    db.triagens = db.triagens || [];
    db.consultas = db.consultas || [];

    return db;
}

// SALVAR BANCO DE DADOS
function writeDB(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// LOGIN
app.post("/login", (req, res) => {
    try {
        const db = readDB();

        const usuario = req.body.usuario;
        const senha = req.body.senha;

        const user = db.usuarios.find(u =>
            u.usuario === usuario &&
            u.senha === senha
        );

        if (!user) {
            return res.status(401).json({
                erro: "Login inválido"
            });
        }

        return res.json(user);

    } catch (erro) {
        console.error("Erro no login:", erro);

        return res.status(500).json({
            erro: "Erro interno no login."
        });
    }
});

// LISTAR PACIENTES DO ATENDIMENTO
app.get("/atendimento", (req, res) => {
    try {
        const db = readDB();
        return res.json(db.pacientes);

    } catch (erro) {
        console.error("Erro ao listar pacientes:", erro);

        return res.status(500).json({
            erro: "Erro ao carregar pacientes."
        });
    }
});

// CADASTRAR PACIENTE
app.post("/atendimento", (req, res) => {
    try {
        const db = readDB();

        const nome = (req.body.nome || "").trim();
        const cpf = (req.body.cpf || "").trim();
        const tipo = req.body.tipo;

        if (!nome || !cpf || !tipo) {
            return res.status(400).json({
                erro: "Preencha o nome, o CPF e o tipo de atendimento."
            });
        }

        const paciente = {
            id: Date.now(),
            nome: nome,
            cpf: cpf,
            tipo: tipo,
            status: "triagem",
            createdAt: new Date().toISOString()
        };

        db.pacientes.push(paciente);
        writeDB(db);

        return res.status(201).json({
            mensagem: "Paciente enviado para triagem!",
            paciente: paciente
        });

    } catch (erro) {
        console.error("Erro ao cadastrar paciente:", erro);

        return res.status(500).json({
            erro: "Erro ao salvar paciente no banco de dados."
        });
    }
});

// SALVAR TRIAGEM
app.post("/triagem", (req, res) => {
    try {
        const db = readDB();

        const nome = (req.body.nome || "").trim();
        const temperatura = Number(req.body.temperatura);

        if (!nome || !req.body.sintoma ||
            req.body.temperatura === undefined ||
            req.body.temperatura === "") {
            return res.status(400).json({
                erro: "Preencha o nome, o sintoma e a temperatura."
            });
        }

        let risco = req.body.risco;

        if (temperatura >= 39) {
            risco = "vermelho";
        } else if (temperatura >= 38) {
            risco = "amarelo";
        } else if (!risco) {
            risco = "verde";
        }

        const triagem = {
            id: Date.now(),
            nome: nome,
            sintoma: req.body.sintoma,
            temperatura: temperatura,
            alergia: req.body.alergia || "",
            observacao: req.body.observacao || "",
            risco: risco,
            status: "aguardando_medico",
            createdAt: new Date().toISOString()
        };

        db.triagens.push(triagem);
        writeDB(db);

        return res.status(201).json({
            mensagem: "Triagem salva com sucesso!",
            triagem: triagem
        });

    } catch (erro) {
        console.error("Erro na triagem:", erro);

        return res.status(500).json({
            erro: "Erro ao salvar a triagem."
        });
    }
});

// LISTAR TRIAGENS
app.get("/triagens", (req, res) => {
    try {
        const db = readDB();
        return res.json(db.triagens);

    } catch (erro) {
        console.error("Erro ao listar triagens:", erro);

        return res.status(500).json({
            erro: "Erro ao consultar triagens."
        });
    }
});

// LISTA DE MEDICAÇÕES DISPONÍVEIS
app.get("/lista-medicacoes", (req, res) => {
    res.json([
        "Dipirona",
        "Paracetamol",
        "Ibuprofeno",
        "Amoxicilina",
        "Azitromicina",
        "Loratadina",
        "Omeprazol",
        "Buscopan",
        "Dramin",
        "Soro fisiológico"
    ]);
});

// SALVAR CONSULTA MÉDICA
app.post("/consulta", (req, res) => {
    try {
        const db = readDB();

        const consulta = {
            id: Date.now(),
            paciente: req.body.paciente,
            diagnostico: req.body.diagnostico,
            medicacao: req.body.medicacao,
            obs: req.body.obs,
            createdAt: new Date().toISOString()
        };

        db.consultas.push(consulta);
        writeDB(db);

        return res.status(201).json({
            mensagem: "Consulta salva com sucesso!",
            consulta: consulta
        });

    } catch (erro) {
        console.error("Erro ao salvar consulta:", erro);

        return res.status(500).json({
            erro: "Erro ao salvar a consulta."
        });
    }
});

// LISTAR MEDICAÇÕES PRESCRITAS
app.get("/medicacoes", (req, res) => {
    try {
        const db = readDB();
        return res.json(db.consultas);

    } catch (erro) {
        console.error("Erro ao listar medicações:", erro);

        return res.status(500).json({
            erro: "Erro ao consultar medicações."
        });
    }
});

// INICIAR SERVIDOR
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🏥 Hospital Pro rodando na porta ${PORT}`);
});

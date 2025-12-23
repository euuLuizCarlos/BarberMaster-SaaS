const db = require('../config/db');
const logAcao = require('../utils/logger');

exports.createService = async (req, res) => {
    try {
        const { nome, preco, duracao_minutos } = req.body;
        const barbeiro_id = req.user.id; 

        const [result] = await db.execute(
            'INSERT INTO servicos (barbeiro_id, nome, preco, duracao_minutos) VALUES (?, ?, ?, ?)',
            [barbeiro_id, nome, preco, duracao_minutos]
        );

        res.status(201).json({ message: "Serviço cadastrado!", id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: "Erro ao salvar serviço", details: error.message });
    }
};

exports.getMyServices = async (req, res) => {
    try {
        const barbeiro_id = req.user.id;
        const [servicos] = await db.execute('SELECT * FROM servicos WHERE barbeiro_id = ?', [barbeiro_id]);
        res.json(servicos);
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar serviços" });
    }
};

exports.deleteService = async (req, res) => {
    try {
        const { id } = req.params;
        const barbeiro_id = req.user.id;

        const [result] = await db.execute(
            'DELETE FROM servicos WHERE id = ? AND barbeiro_id = ?',
            [id, barbeiro_id]
        );

        if (result.affectedRows === 0) {
            return res.status(403).json({ error: "Permissão negada." });
        }

        // SALVANDO O LOG DA AÇÃO
        await logAcao(barbeiro_id, "DELETOU_SERVICO", `Serviço ID ${id} removido.`, req.ip);

        res.json({ message: "Serviço removido e ação registrada!" });
    } catch (error) {
        res.status(500).json({ error: "Erro ao deletar" });
    }
};
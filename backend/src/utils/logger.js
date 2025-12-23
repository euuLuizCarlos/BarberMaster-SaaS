const db = require('../config/db');

const logAcao = async (barbeiro_id, acao, detalhes, ip) => {
    try {
        await db.execute(
            'INSERT INTO logs_sistema (barbeiro_id, acao, detalhes, ip_address) VALUES (?, ?, ?, ?)',
            [barbeiro_id, acao, detalhes, ip]
        );
    } catch (error) {
        console.error("Erro ao salvar log:", error.message);
    }
};

module.exports = logAcao;
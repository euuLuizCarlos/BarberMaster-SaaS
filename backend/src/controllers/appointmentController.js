const db = require('../config/db');

exports.createAppointment = async (req, res) => {
    try {
        const { barbeiro_id, cliente_nome, cliente_telefone, servico_id, data_hora } = req.body;

        // 1. Validar se o horário já está ocupado para este barbeiro
        const [ocupado] = await db.execute(
            'SELECT * FROM agendamentos WHERE barbeiro_id = ? AND data_hora = ? AND status != "cancelado"',
            [barbeiro_id, data_hora]
        );

        if (ocupado.length > 0) {
            return res.status(400).json({ error: "Este horário já não está disponível." });
        }

        // 2. Inserir o agendamento
        const [result] = await db.execute(
            'INSERT INTO agendamentos (barbeiro_id, cliente_nome, cliente_telefone, servico_id, data_hora) VALUES (?, ?, ?, ?, ?)',
            [barbeiro_id, cliente_nome, cliente_telefone, servico_id, data_hora]
        );

        res.status(201).json({ message: "Agendamento marcado com sucesso!", id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: "Erro ao processar agendamento", details: error.message });
    }
};

// Listar a agenda do barbeiro logado
exports.getMyAppointments = async (req, res) => {
    try {
        const barbeiro_id = req.user.id;
        const [rows] = await db.execute(`
            SELECT a.*, s.nome as servico_nome, s.preco 
            FROM agendamentos a 
            JOIN servicos s ON a.servico_id = s.id 
            WHERE a.barbeiro_id = ? 
            ORDER BY a.data_hora ASC`, 
            [barbeiro_id]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: "Erro ao procurar agenda" });
    }
};

exports.getDashboard = async (req, res) => {
    try {
        const barbeiro_id = req.user.id;
        
        // Pega a data de hoje no formato YYYY-MM-DD
        const hoje = new Date().toISOString().split('T')[0];

        const [stats] = await db.execute(`
            SELECT 
                COUNT(*) as total_agendamentos,
                SUM(s.preco) as faturamento_estimado
            FROM agendamentos a
            JOIN servicos s ON a.servico_id = s.id
            WHERE a.barbeiro_id = ? 
            AND DATE(a.data_hora) = ?
            AND a.status != 'cancelado'`, 
            [barbeiro_id, hoje]
        );

        res.json({
            data: hoje,
            resumo: stats[0]
        });
    } catch (error) {
        res.status(500).json({ error: "Erro ao carregar dashboard" });
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const barbeiro_id = req.user.id;

        // Validar se o agendamento pertence a este barbeiro
        const [agendamento] = await db.execute(
            'SELECT * FROM agendamentos WHERE id = ? AND barbeiro_id = ?',
            [id, barbeiro_id]
        );

        if (agendamento.length === 0) {
            return res.status(404).json({ error: "Agendamento não encontrado ou sem permissão." });
        }

        // Atualizar o status
        await db.execute(
            'UPDATE agendamentos SET status = ? WHERE id = ?',
            [status, id]
        );

        res.json({ message: `Status atualizado para ${status}!` });
    } catch (error) {
        res.status(500).json({ error: "Erro ao atualizar status" });
    }
};

exports.createAppointment = async (req, res) => {
    try {
        const { barbeiro_id, cliente_nome, cliente_telefone, servico_id, data_hora } = req.body;
        
        const dataAgendamento = new Date(data_hora);
        const diaSemana = dataAgendamento.getDay(); // 0-6
        const horaMinuto = dataAgendamento.toTimeString().split(' ')[0]; // HH:MM:SS

        // 1. Verificar se a barbearia abre neste dia e horário
        const [config] = await db.execute(
            'SELECT * FROM configuracoes_barbearia WHERE barbeiro_id = ? AND dia_semana = ? AND esta_aberto = 1',
            [barbeiro_id, diaSemana]
        );

        if (config.length === 0) {
            return res.status(400).json({ error: "A barbearia não abre neste dia." });
        }

        const { hora_abertura, hora_fechamento } = config[0];
        if (horaMinuto < hora_abertura || horaMinuto >= hora_fechamento) {
            return res.status(400).json({ error: `Horário fora do expediente. Abrimos das ${hora_abertura} às ${hora_fechamento}.` });
        }

        // 2. Verificar se o horário já está ocupado (Sua lógica anterior)
        const [ocupado] = await db.execute(
            'SELECT * FROM agendamentos WHERE barbeiro_id = ? AND data_hora = ? AND status != "cancelado"',
            [barbeiro_id, data_hora]
        );

        if (ocupado.length > 0) {
            return res.status(400).json({ error: "Este horário já está reservado." });
        }

        // 3. Se passou em tudo, salva
        await db.execute(
            'INSERT INTO agendamentos (barbeiro_id, cliente_nome, cliente_telefone, servico_id, data_hora) VALUES (?, ?, ?, ?, ?)',
            [barbeiro_id, cliente_nome, cliente_telefone, servico_id, data_hora]
        );

        res.status(201).json({ message: "Agendamento blindado com sucesso!" });
    } catch (error) {
        res.status(500).json({ error: "Erro interno", details: error.message });
    }
};
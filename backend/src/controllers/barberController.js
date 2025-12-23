const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const emailService = require('../services/emailService');

exports.register = async (req, res) => {
    const { nome_barbearia, nome_dono, email, senha, chave } = req.body;

    try {
        // 1. Verificar se a chave é válida e está disponível
        const [chaves] = await db.execute(
            'SELECT * FROM chaves_acesso WHERE codigo_chave = ? AND status = "disponivel"',
            [chave]
        );

        if (chaves.length === 0) {
            return res.status(400).json({ error: "Chave inválida ou já utilizada." });
        }

        // 2. Criptografar a senha do barbeiro
        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(senha, salt);

        // 3. Salvar o barbeiro e marcar a chave como usada (Transação)
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            await connection.execute(
                'INSERT INTO barbeiros (nome_barbearia, nome_dono, email, senha, chave_usada) VALUES (?, ?, ?, ?, ?)',
                [nome_barbearia, nome_dono, email, senhaHash, chave]
            );

            await connection.execute(
                'UPDATE chaves_acesso SET status = "usada", usada_em = NOW() WHERE codigo_chave = ?',
                [chave]
            );

            await connection.commit();
            res.status(201).json({ message: "Barbearia cadastrada com sucesso! Bem-vindo ao time." });
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }

    } catch (error) {
        res.status(500).json({ error: "Erro no cadastro", details: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, senha } = req.body;

        // 1. Busca o barbeiro
        const [users] = await db.execute('SELECT * FROM barbeiros WHERE email = ?', [email]);
        
        if (users.length === 0) {
            return res.status(401).json({ error: "E-mail ou senha incorretos" });
        }

        const barber = users[0];

        // 2. Verifica a senha
        const senhaValida = await bcrypt.compare(senha, barber.senha);
        if (!senhaValida) {
            return res.status(401).json({ error: "E-mail ou senha incorretos" });
        }

        // 3. Gera o Token (Aqui colocamos o ID do Barbeiro no Payload)
        const token = jwt.sign(
            { id: barber.id, role: 'barber_admin' },
            process.env.JWT_SECRET,
            { expiresIn: '7d' } // Barbeiro fica logado por mais tempo
        );

        res.json({
            message: `Bem-vindo, ${barber.nome_dono}!`,
            token,
            barbearia: barber.nome_barbearia
        });

    } catch (error) {
        res.status(500).json({ error: "Erro no login", details: error.message });
    }
};

exports.setBusinessHours = async (req, res) => {
    try {
        const barbeiro_id = req.user.id;
        const { horarios } = req.body; // Espera um array de horários

        // Deleta configurações antigas para sobrescrever
        await db.execute('DELETE FROM configuracoes_barbearia WHERE barbeiro_id = ?', [barbeiro_id]);

        // Insere os novos horários
        for (let h of horarios) {
            await db.execute(
                'INSERT INTO configuracoes_barbearia (barbeiro_id, dia_semana, hora_abertura, hora_fechamento) VALUES (?, ?, ?, ?)',
                [barbeiro_id, h.dia_semana, h.hora_abertura, h.hora_fechamento]
            );
        }

        res.json({ message: "Horários de funcionamento atualizados!" });
    } catch (error) {
        res.status(500).json({ error: "Erro ao configurar horários", details: error.message });
    }
};

exports.getLogs = async (req, res) => {
    try {
        const barbeiro_id = req.user.id;
        const [logs] = await db.execute(
            'SELECT acao, detalhes, ip_address, criado_em FROM logs_sistema WHERE barbeiro_id = ? ORDER BY criado_em DESC LIMIT 50',
            [barbeiro_id]
        );
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar histórico de atividades" });
    }
};

exports.registerBarber = async (req, res) => {
    const { 
        nome, email, password, nome_barbearia, documento, 
        telefone, cep, rua, numero, bairro, localidade, uf,
        codigo_verificacao 
    } = req.body;

    const foto_perfil = req.file ? req.file.filename : null;

    try {
        // --- NOVO: VALIDAÇÃO DO CÓDIGO DE E-MAIL ---
        const [verificacao] = await db.execute(
            'SELECT * FROM verificacoes_email WHERE email = ? AND codigo = ? AND expira_em > NOW()',
            [email, codigo_verificacao]
        );

        if (verificacao.length === 0) {
            return res.status(400).json({ error: "Código de verificação inválido ou expirado." });
        }
        // ------------------------------------------

        // 2. Criptografia da senha
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 3. Limpeza de máscaras
        const cleanDocumento = documento.replace(/\D/g, '');
        const cleanTelefone = telefone.replace(/\D/g, '');
        const cleanCep = cep.replace(/\D/g, '');

        // 4. Inserção no Banco (Usando Transação para garantir que o código seja deletado apenas se o cadastro der certo)
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            const sql = `
                INSERT INTO barbeiros 
                (nome_dono, email, senha, nome_barbearia, documento, telefone, cep, rua, numero, bairro, localidade, uf, foto_perfil) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const [result] = await connection.execute(sql, [
                nome, email, passwordHash, nome_barbearia, cleanDocumento, 
                cleanTelefone, cleanCep, rua, numero, bairro, localidade, uf, foto_perfil
            ]);

            // Deleta o código usado para ele não ser reutilizado
            await connection.execute('DELETE FROM verificacoes_email WHERE email = ?', [email]);

            await connection.commit();

            res.status(201).json({ 
                message: 'Barbearia cadastrada com sucesso!', 
                userId: result.insertId 
            });

        } catch (dbError) {
            await connection.rollback();
            throw dbError;
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Erro ao cadastrar barbeiro:', error);
        
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'E-mail ou Documento já cadastrado.' });
        }
        
        res.status(500).json({ 
            error: 'Erro ao cadastrar barbearia', 
            details: error.message 
        });
    }
};

exports.sendVerificationCode = async (req, res) => {
    try {
        const { email } = req.body;
        
        // Gera código de 6 dígitos
        const codigo = Math.floor(100000 + Math.random() * 900000).toString();
        const expiraEm = new Date(Date.now() + 15 * 60 * 1000);

        // Salva ou atualiza o código para esse email
        await db.execute(
            'INSERT INTO verificacoes_email (email, codigo, expira_em) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE codigo = ?, expira_em = ?',
            [email, codigo, expiraEm, codigo, expiraEm]
        );

        // Envia o e-mail (ou loga no console em modo dev)
        await emailService.enviarCodigo(email, codigo);

        res.json({ 
            message: "Código enviado com sucesso!",
            devMode: !process.env.EMAIL_USER || process.env.EMAIL_USER === 'seu-email@gmail.com'
        });
    } catch (error) {
        console.error('Erro ao enviar código:', error);
        res.status(500).json({ 
            error: error.message || "Erro ao enviar e-mail"
        });
    }
};
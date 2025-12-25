const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const emailService = require('../services/emailService');

// --- 1. REGISTRO (APENAS E-MAIL) ---
exports.registerBarber = async (req, res) => {
    const { 
        nome, email, password, nome_barbearia, documento, 
        telefone, cep, rua, numero, bairro, localidade, uf,
        codigo_verificacao 
    } = req.body;

    const foto_perfil = req.file ? req.file.filename : null;

    try {
        // Validação do código de e-mail
        const [verificacao] = await db.execute(
            'SELECT * FROM verificacoes_email WHERE email = ? AND codigo = ? AND expira_em > NOW()',
            [email, codigo_verificacao]
        );

        if (verificacao.length === 0) {
            return res.status(400).json({ error: "Código de e-mail inválido ou expirado." });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            // O INSERT agora deixa 'chave_usada' como NULL para ser preenchida na etapa 2
            const sql = `
                INSERT INTO barbeiros 
                (nome_dono, email, senha, nome_barbearia, documento, telefone, cep, rua, numero, bairro, localidade, uf, foto_perfil, chave_usada) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)
            `;

            const [result] = await connection.execute(sql, [
                nome, email, passwordHash, nome_barbearia, documento, 
                telefone, cep, rua, numero, bairro, localidade, uf, foto_perfil
            ]);

            await connection.execute('DELETE FROM verificacoes_email WHERE email = ?', [email]);

            await connection.commit();

            // Retornamos o ID para o frontend usar na tela de licença
            res.status(201).json({ 
                message: 'E-mail verificado! Quase lá.', 
                userId: result.insertId 
            });

        } catch (dbError) {
            await connection.rollback();
            throw dbError;
        } finally {
            connection.release();
        }

    } catch (error) {
        res.status(500).json({ error: 'Erro no cadastro', details: error.message });
    }
};

// --- 2. LOGIN (COM TRAVA DE LICENÇA) ---
exports.login = async (req, res) => {
    try {
        const { email, senha } = req.body;
        const [users] = await db.execute('SELECT * FROM barbeiros WHERE email = ?', [email]);
        
        if (users.length === 0) return res.status(401).json({ error: "E-mail ou senha incorretos" });

        const barber = users[0];
        const senhaValida = await bcrypt.compare(senha, barber.senha);
        if (!senhaValida) return res.status(401).json({ error: "E-mail ou senha incorretos" });

        const token = jwt.sign(
            { id: barber.id, role: 'barber_admin' },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: `Bem-vindo, ${barber.nome_dono}!`,
            token,
            user: {
                id: barber.id,
                nome_barbearia: barber.nome_barbearia,
                licencaAtiva: barber.chave_usada !== null 
            }
        });
    } catch (error) {
        res.status(500).json({ error: "Erro no servidor" });
    }
};

// --- 3. ATIVAÇÃO DA LICENÇA (ETAPA FINAL) ---
exports.validarLicenca = async (req, res) => {
    try {
        const { chave, userId } = req.body; 
        // Se o usuário já estiver logado, usamos o ID do token, senão o enviado pelo corpo
        const barbeiroId = req.user ? req.user.id : userId;

        if (!barbeiroId) return res.status(400).json({ error: "ID do usuário não identificado." });

        // Verificar se a chave existe
        const [resultado] = await db.execute(
            'SELECT * FROM chaves_acesso WHERE codigo_chave = ? AND status = "disponivel"',
            [chave]
        );

        if (resultado.length === 0) {
            return res.status(400).json({ error: "Chave inválida ou já utilizada." });
        }

        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            // 1. Vincula a chave ao barbeiro
            await connection.execute(
                'UPDATE barbeiros SET chave_usada = ? WHERE id = ?',
                [chave, barbeiroId]
            );

            // 2. Mata a chave no painel master
            await connection.execute(
                'UPDATE chaves_acesso SET status = "usada", barbeiro_id = ?, usada_em = NOW() WHERE codigo_chave = ?',
                [barbeiroId, chave]
            );

            await connection.commit();
            res.json({ message: "Licença ativada com sucesso!" });
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    } catch (error) {
        res.status(500).json({ error: "Erro ao validar licença." });
    }
};

// --- MANTENHA AS OUTRAS FUNÇÕES (forgotPassword, resetPassword, etc) ABAIXO ---

// 1. Solicitar recuperação (Gera token e envia e-mail)
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        
        // Verifica se o barbeiro existe
        const [user] = await db.execute('SELECT id FROM barbeiros WHERE email = ?', [email]);
        if (user.length === 0) return res.status(404).json({ error: "E-mail não encontrado." });

        const token = crypto.randomBytes(32).toString('hex');
        const expiraEm = new Date(Date.now() + 3600000); // 1 hora de validade

        await db.execute(
            'INSERT INTO recuperacao_senha (email, token, expira_em) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE token = ?, expira_em = ?',
            [email, token, expiraEm, token, expiraEm]
        );

        // Link que aponta para o seu FRONTEND
        const linkRedefinicao = `http://localhost:5173/reset-password?token=${token}&email=${email}`;
        await emailService.enviarLinkRecuperacao(email, linkRedefinicao);

        res.json({ message: "Link de recuperação enviado com sucesso!" });
    } catch (error) {
        res.status(500).json({ error: "Erro ao processar solicitação" });
    }
};

// 2. Resetar a senha (Substitui no banco)
exports.resetPassword = async (req, res) => {
    try {
        const { email, token, novaSenha } = req.body;

        // Valida token e expiração
        const [validacao] = await db.execute(
            'SELECT * FROM recuperacao_senha WHERE email = ? AND token = ? AND expira_em > NOW()',
            [email, token]
        );

        if (validacao.length === 0) return res.status(400).json({ error: "Token inválido ou expirado." });

        // Criptografa nova senha
        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(novaSenha, salt);

        // Atualiza e limpa o token
        const connection = await db.getConnection();
        await connection.beginTransaction();
        try {
            await connection.execute('UPDATE barbeiros SET senha = ? WHERE email = ?', [senhaHash, email]);
            await connection.execute('DELETE FROM recuperacao_senha WHERE email = ?', [email]);
            await connection.commit();
            res.json({ message: "Senha atualizada com sucesso!" });
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally { connection.release(); }
    } catch (error) {
        res.status(500).json({ error: "Erro ao redefinir senha" });
    }
};

// --- ENVIAR CÓDIGO DE VERIFICAÇÃO ---
exports.sendVerificationCode = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: "E-mail é obrigatório" });
        }

        // Verificar se o e-mail já está cadastrado
        const [existing] = await db.execute('SELECT id FROM barbeiros WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ error: "E-mail já cadastrado" });
        }

        // Gerar código de 6 dígitos
        const codigo = crypto.randomInt(100000, 999999).toString();
        const expiraEm = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

        // Deletar códigos antigos para este e-mail
        await db.execute('DELETE FROM verificacoes_email WHERE email = ?', [email]);

        // Inserir novo código
        await db.execute(
            'INSERT INTO verificacoes_email (email, codigo, expira_em) VALUES (?, ?, ?)',
            [email, codigo, expiraEm]
        );

        // Enviar e-mail
        await emailService.enviarCodigo(email, codigo);

        res.json({ message: "Código enviado para o e-mail" });
    } catch (error) {
        console.error('Erro ao enviar código:', error);
        res.status(500).json({ error: "Erro ao enviar código de verificação" });
    }
};

// --- OBTER LOGS (PLACEHOLDER) ---
exports.getLogs = async (req, res) => {
    try {
        // Implementação futura para logs do sistema
        res.json({ logs: [] });
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar logs" });
    }
};

exports.getAguardandoLicenca = async (req, res) => {
    try {
        const [pendentes] = await db.execute(
            'SELECT id, nome_dono, nome_barbearia, email, criado_em FROM barbeiros WHERE chave_usada IS NULL ORDER BY criado_em DESC'
        );
        res.json(pendentes);
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar pendentes" });
    }
};

// 2. Modificar o envio da chave para ser vinculado ao e-mail do barbeiro
// (Essa lógica vai no seu controller do ADMIN MASTER, onde você gera a chave)
exports.gerarEEnviarChave = async (req, res) => {
    const { barbeiroEmail, barbeiroId } = req.body;
    const novaChave = `BARBER-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    try {
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            // Salva a chave como disponível no banco
            await connection.execute(
                'INSERT INTO chaves_acesso (codigo_chave, status) VALUES (?, "disponivel")',
                [novaChave]
            );

            // Envia o e-mail para o barbeiro
            await emailService.enviarChaveAcesso(barbeiroEmail, novaChave);

            await connection.commit();
            res.json({ message: "Chave gerada e enviada para o e-mail do barbeiro!", chave: novaChave });
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    } catch (error) {
        res.status(500).json({ error: "Erro ao processar chave" });
    }
};
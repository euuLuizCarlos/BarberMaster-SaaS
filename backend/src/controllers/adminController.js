const db = require('../config/db');
const bcrypt = require('bcryptjs');
const { z } = require('zod');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Validador de dados (Zod) - Garante que o email é real e a senha é forte
const adminSchema = z.object({
    nome: z.string().min(3, "Nome deve ter ao menos 3 caracteres"),
    email: z.string().email("Email inválido"),
    senha: z.string().min(6, "A senha deve ter no mínimo 6 caracteres")
});

exports.createMaster = async (req, res) => {
    try {
        // 1. Validar os dados recebidos
        const { nome, email, senha } = adminSchema.parse(req.body);

        // 2. Criptografar a senha (Segurança de Mercado)
        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(senha, salt);

        // 3. Salva no banco
        const [result] = await db.execute(
            'INSERT INTO admin_master (nome, email, senha) VALUES (?, ?, ?)',
            [nome, email, senhaHash]
        );

        res.status(201).json({ 
            message: "Admin Master criado com sucesso!",
            id: result.insertId 
        });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(500).json({ error: "Erro ao criar admin", details: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, senha } = req.body;

        // 1. Buscar o admin pelo email
        const [users] = await db.execute('SELECT * FROM admin_master WHERE email = ?', [email]);
        
        if (users.length === 0) {
            return res.status(401).json({ error: "Credenciais inválidas" });
        }

        const user = users[0];

        // 2. Comparar a senha digitada com o Hash do banco
        const senhaValida = await bcrypt.compare(senha, user.senha);
        if (!senhaValida) {
            return res.status(401).json({ error: "Credenciais inválidas" });
        }

        // 3. Gerar o Token JWT (Vale por 24 horas)
        const token = jwt.sign(
            { id: user.id, role: 'admin_master' },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: "Login realizado com sucesso!",
            token,
            user: { nome: user.nome, email: user.email }
        });

    } catch (error) {
        res.status(500).json({ error: "Erro no servidor", details: error.message });
    }
};

exports.generateKey = async (req, res) => {
    try {
        // Gera um código aleatório de 8 caracteres (Ex: BARBER-A1B2C3D4)
        const randomCode = crypto.randomBytes(4).toString('hex').toUpperCase();
        const codigo_chave = `BARBER-${randomCode}`;

        // Salva a chave no banco como 'disponivel'
        await db.execute(
            'INSERT INTO chaves_acesso (codigo_chave, status) VALUES (?, ?)',
            [codigo_chave, 'disponivel']
        );

        res.status(201).json({
            message: "Chave de licença gerada com sucesso!",
            chave: codigo_chave
        });
    } catch (error) {
        res.status(500).json({ error: "Erro ao gerar chave", details: error.message });
    }
};


exports.getKeys = async (req, res) => {
    try {
        // Removi o b.nome e deixei apenas o email, ou mude para o nome correto da sua coluna
        const [rows] = await db.execute(`
            SELECT 
                c.*, 
                b.email as email_barbeiro 
            FROM chaves_acesso c
            LEFT JOIN barbeiros b ON c.barbeiro_id = b.id
            ORDER BY c.criado_em DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error("Erro na query getKeys:", error);
        res.status(500).json({ error: "Erro ao buscar chaves" });
    }
};

exports.deleteKey = async (req, res) => {
    try {
        const { id } = req.params;

        // Verifica se a chave existe antes de deletar
        const [chave] = await db.execute('SELECT * FROM chaves_acesso WHERE id = ?', [id]);
        
        if (chave.length === 0) {
            return res.status(404).json({ error: "Chave não encontrada." });
        }

        await db.execute('DELETE FROM chaves_acesso WHERE id = ?', [id]);

        res.json({ message: "Chave de teste removida com sucesso!" });
    } catch (error) {
        res.status(500).json({ error: "Erro ao excluir chave", details: error.message });
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

exports.gerarEEnviarChave = async (req, res) => {
    const { barbeiroEmail, barbeiroId } = req.body;
    const emailService = require('../services/emailService');
    
    try {
        // Gera um código aleatório
        const randomCode = crypto.randomBytes(4).toString('hex').toUpperCase();
        const novaChave = `BARBER-${randomCode}`;

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
            res.json({ 
                message: "Chave gerada e enviada para o e-mail do barbeiro!", 
                chave: novaChave 
            });
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    } catch (error) {
        res.status(500).json({ 
            error: "Erro ao processar chave", 
            details: error.message 
        });
    }
};
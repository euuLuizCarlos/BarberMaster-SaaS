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
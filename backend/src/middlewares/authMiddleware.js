const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ error: "Acesso negado. Token não fornecido." });
    }

    try {
        const tokenLimpo = token.replace('Bearer ', '');
        const verificado = jwt.verify(tokenLimpo, process.env.JWT_SECRET);
        req.user = verificado;
        next();
    } catch (error) {
        res.status(400).json({ error: "Token inválido ou expirado" });
    }
};
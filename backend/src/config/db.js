const mysql = require('mysql2/promise');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const db = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root', 
    password: process.env.DB_PASS || '12345678',
    database: process.env.DB_NAME || 'barber_master_pro',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const testConnection = async () => {
    try {
        const connection = await db.getConnection();
        console.log("✅ BANCO DE DADOS CONECTADO COM SUCESSO!");
        connection.release();
    } catch (error) {
        console.error("❌ ERRO NA CONEXÃO:", error.message);
    }
};

testConnection();
module.exports = db;
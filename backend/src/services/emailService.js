const nodemailer = require('nodemailer');

// Verificar se as credenciais de email estão configuradas
const isEmailConfigured = () => {
    return process.env.EMAIL_USER && 
           process.env.EMAIL_PASS && 
           process.env.EMAIL_USER !== 'seu-email@gmail.com' &&
           process.env.EMAIL_PASS !== 'sua-senha-de-app-aqui';
};

// Configuração do transportador (quem vai enviar o e-mail)
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

exports.enviarCodigo = async (email, codigo) => {
    // MODO DESENVOLVIMENTO: Se email não está configurado, apenas loga no console
    if (!isEmailConfigured()) {
        console.log('\n' + '='.repeat(60));
        console.log('🔧 MODO DESENVOLVIMENTO - Email não configurado');
        console.log('='.repeat(60));
        console.log(`📧 Email destino: ${email}`);
        console.log(`🔑 Código de verificação: ${codigo}`);
        console.log('='.repeat(60) + '\n');
        console.log('💡 Para enviar emails reais, configure EMAIL_USER e EMAIL_PASS no .env\n');
        return; 
    }

    const mailOptions = {
        from: `"BarberMaster SaaS" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Seu Código de Verificação - BarberMaster',
        html: `
            <div style="font-family: sans-serif; background-color: #023047; color: white; padding: 40px; border-radius: 10px; text-align: center;">
                <h1 style="color: #FFB703;">BarberMaster</h1>
                <p style="font-size: 18px;">Olá! Estamos quase lá.</p>
                <p>Use o código abaixo para validar seu cadastro profissional:</p>
                <div style="background-color: rgba(255, 183, 3, 0.1); border: 2px dashed #FFB703; padding: 20px; margin: 20px 0;">
                    <span style="font-size: 40px; font-weight: bold; letter-spacing: 10px; color: #FFB703;">${codigo}</span>
                </div>
                <p style="font-size: 12px; color: #8ecae6;">Este código expira em 15 minutos.</p>
                <hr style="border: 0; border-top: 1px solid #219ebc; margin: 20px 0;">
                <p style="font-size: 10px; color: #8ecae6;">Se você não solicitou este cadastro, apenas ignore este e-mail.</p>
            </div>
        `
    };

    return transporter.sendMail(mailOptions);
};

exports.enviarLinkRecuperacao = async (email, link) => {
    // MODO DESENVOLVIMENTO
    if (!isEmailConfigured()) {
        console.log('\n' + '='.repeat(60));
        console.log('🔧 MODO DESENVOLVIMENTO - Recuperação de Senha');
        console.log('='.repeat(60));
        console.log(`📧 Email destino: ${email}`);
        console.log(`🔗 Link de recuperação: ${link}`);
        console.log('='.repeat(60) + '\n');
        return;
    }

    const mailOptions = {
        from: `"BarberMaster" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Recuperação de Senha - BarberMaster',
        html: `
            <div style="font-family: sans-serif; background-color: #023047; color: white; padding: 40px; border-radius: 10px; text-align: center;">
                <h1 style="color: #FFB703;">BarberMaster</h1>
                <p style="font-size: 18px;">Recuperação de Senha</p>
                <p>Você solicitou a redefinição de senha. Clique no botão abaixo para criar uma nova senha:</p>
                <div style="margin: 30px 0;">
                    <a href="${link}" style="background:#FFB703; padding:15px 30px; color:#023047; text-decoration:none; font-weight:bold; border-radius:8px; display:inline-block;">REDEFINIR SENHA</a>
                </div>
                <p style="font-size: 12px; color: #8ecae6;">Este link expira em 1 hora.</p>
                <hr style="border: 0; border-top: 1px solid #219ebc; margin: 20px 0;">
                <p style="font-size: 10px; color: #8ecae6;">Se você não solicitou esta recuperação, apenas ignore este e-mail.</p>
            </div>
        `
    };
    return transporter.sendMail(mailOptions);
};
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Seu gmail
        pass: process.env.EMAIL_PASS  // Sua "Senha de App" do Google
    }
});

exports.enviarCodigo = async (email, codigo) => {
    const mailOptions = {
        from: '"BarberMaster 💈" <seu-email@gmail.com>',
        to: email,
        subject: 'Seu Código de Segurança Evolution',
        text: `Seu código de verificação é: ${codigo}`,
        html: `<b>Seu código de verificação é: <h1 style="color: #FFB703;">${codigo}</h1></b>`
    };
    return transporter.sendMail(mailOptions);
};
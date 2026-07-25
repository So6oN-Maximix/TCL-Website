const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    tls: {
        rejectUnauthorized: false
    }
});

async function sendResetMail(email, token) {
    const resetLink = `${process.env.BASE_URL}/reset_password?token=${token}`;

    const mailOptions = {
        from: `"TC Lanrivoaré" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "🎾 Réinitialisation de votre mot de passe",
        text: `Bonjour, cliquez sur ce lien pour réinitialiser votre mot de passe : ${resetLink}`,
        html: `
        <div style="font-family: Arial, Helvetica, sans-serif; background-color: #E9E2CE; padding: 40px 20px; margin: 0;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #F6F4EC; border-radius: 4px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                
                <!-- Header (Vert avec liseré jaune) -->
                <div style="background-color: #1B4332; border-bottom: 3px solid #C7B824; padding: 30px 20px; text-align: center;">
                    <h1 style="color: #F6F4EC; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">TC Lanrivoaré</h1>
                </div>
                
                <!-- Contenu principal -->
                <div style="padding: 40px 30px; color: #14231C; font-size: 16px; line-height: 1.6;">
                    <p style="margin-top: 0;">Bonjour,</p>
                    <p>Une demande de réinitialisation de mot de passe a été effectuée pour votre compte <strong>TC Lanrivoaré</strong>. Aucun problème, cela arrive à tout le monde !</p>
                    
                    <!-- Bouton d'action (Terre battue) -->
                    <div style="text-align: center; margin: 35px 0;">
                        <a href="${resetLink}" style="background-color: #C1440E; color: #F6F4EC; padding: 14px 28px; text-decoration: none; border-radius: 2px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; display: inline-block;">Réinitialiser mon mot de passe</a>
                    </div>
                    
                    <p>Ce lien est valable <strong>10 minutes</strong>. Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail en toute sécurité.</p>
                    
                    <p style="margin-bottom: 0;">À très vite sur les courts,<br><em>L'équipe du TC Lanrivoaré</em></p>
                </div>
                
                <!-- Footer (Vert sombre) -->
                <div style="background-color: #0E251A; color: #B9C7BE; text-align: center; padding: 20px; font-size: 13px;">
                    <p style="margin: 0;">© ${new Date().getFullYear()} Tennis Club Lanrivoaré. Tous droits réservés.</p>
                </div>
                
            </div>
        </div>
        `
    };

    return transporter.sendMail(mailOptions);
}

module.exports = { sendResetMail };
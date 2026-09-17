function escapeHtml(str) {
	return String(str)
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");
}

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

async function sendBookingConfirmationMail(email, prenom, courtName, dateStr, heureDebut) {
    const profileLink = `${process.env.BASE_URL}/profil`;
    const heureFin = heureDebut + 1;

    const mailOptions = {
        from: `"TC Lanrivoaré" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "🎾 Confirmation de votre réservation",
        text: `Bonjour ${prenom}, votre réservation pour le ${courtName} le ${dateStr} de ${heureDebut}h à ${heureFin}h est confirmée.`,
        html: `
        <div style="font-family: Arial, Helvetica, sans-serif; background-color: #E9E2CE; padding: 40px 20px; margin: 0;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #F6F4EC; border-radius: 4px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                
                <!-- Header (Vert avec liseré jaune) -->
                <div style="background-color: #1B4332; border-bottom: 3px solid #C7B824; padding: 30px 20px; text-align: center;">
                    <h1 style="color: #F6F4EC; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">TC Lanrivoaré</h1>
                </div>
                
                <!-- Contenu principal -->
                <div style="padding: 40px 30px; color: #14231C; font-size: 16px; line-height: 1.6;">
                    <p style="margin-top: 0;">Bonjour <strong>${prenom}</strong>,</p>
                    <p>Bonne nouvelle ! Votre réservation au club a bien été enregistrée. Voici le récapitulatif de votre créneau :</p>
                    
                    <!-- Encart des détails du créneau -->
                    <div style="background-color: #E9E2CE; border-left: 4px solid #1B4332; padding: 20px; margin: 25px 0; border-radius: 0 4px 4px 0;">
                        <ul style="list-style: none; padding: 0; margin: 0;">
                            <li style="margin-bottom: 10px;"><strong>Court :</strong> ${courtName}</li>
                            <li style="margin-bottom: 10px;"><strong>Date :</strong> ${dateStr.split(" ").map(mot => mot.charAt(0).toUpperCase() + mot.slice(1)).join(" ")}</li>
                            <li style="margin-bottom: 0;"><strong>Heure :</strong> ${heureDebut}h00 - ${heureFin}h00</li>
                        </ul>
                    </div>
                    
                    <p>En cas d'empêchement, merci de penser à libérer le court depuis votre espace personnel afin d'en faire profiter les autres membres.</p>
                    
                    <!-- Bouton d'action (Terre battue) -->
                    <div style="text-align: center; margin: 35px 0;">
                        <a href="${profileLink}" style="background-color: #C1440E; color: #F6F4EC; padding: 14px 28px; text-decoration: none; border-radius: 2px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; display: inline-block;">Gérer mes réservations</a>
                    </div>
                    
                    <p style="margin-bottom: 0;">Bon match !<br><em>L'équipe du TC Lanrivoaré</em></p>
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

async function sendCancelConfirmationMail(email, prenom, courtName, dateStr, heureDebut) {
    const bookingLink = `${process.env.BASE_URL}/reservations`; 
    const heureFin = heureDebut + 1;

    const mailOptions = {
        from: `"TC Lanrivoaré" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "🎾 Annulation de votre réservation",
        text: `Bonjour ${prenom}, votre réservation pour le ${courtName} le ${dateStr} de ${heureDebut}h à ${heureFin}h a bien été annulée.`,
        html: `
        <div style="font-family: Arial, Helvetica, sans-serif; background-color: #E9E2CE; padding: 40px 20px; margin: 0;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #F6F4EC; border-radius: 4px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                
                <!-- Header (Vert avec liseré jaune) -->
                <div style="background-color: #1B4332; border-bottom: 3px solid #C7B824; padding: 30px 20px; text-align: center;">
                    <h1 style="color: #F6F4EC; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">TC Lanrivoaré</h1>
                </div>
                
                <!-- Contenu principal -->
                <div style="padding: 40px 30px; color: #14231C; font-size: 16px; line-height: 1.6;">
                    <p style="margin-top: 0;">Bonjour <strong>${prenom}</strong>,</p>
                    <p>Nous vous confirmons que votre réservation a bien été <strong>annulée</strong>. Le créneau suivant est de nouveau disponible pour les autres membres du club :</p>
                    
                    <!-- Encart des détails du créneau annulé -->
                    <div style="background-color: #E9E2CE; border-left: 4px solid #C1440E; padding: 20px; margin: 25px 0; border-radius: 0 4px 4px 0;">
                        <ul style="list-style: none; padding: 0; margin: 0;">
                            <li style="margin-bottom: 10px;"><strong>Court :</strong> ${courtName}</li>
                            <li style="margin-bottom: 10px;"><strong>Date :</strong> ${dateStr.split(" ").map(mot => mot.charAt(0).toUpperCase() + mot.slice(1)).join(" ")}</li>
                            <li style="margin-bottom: 0;"><strong>Heure :</strong> ${heureDebut}h00 - ${heureFin}h00</li>
                        </ul>
                    </div>
                    
                    <p>Merci d'avoir pensé à libérer le court ! N'hésitez pas à consulter la grille des disponibilités si vous souhaitez jouer à un autre moment.</p>
                    
                    <!-- Bouton d'action (Terre battue) -->
                    <div style="text-align: center; margin: 35px 0;">
                        <a href="${bookingLink}" style="background-color: #C1440E; color: #F6F4EC; padding: 14px 28px; text-decoration: none; border-radius: 2px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; display: inline-block;">Réserver un autre créneau</a>
                    </div>
                    
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

async function sendUserRequestMail(nom, email, sujet, message) {
    const destinataire = process.env.CONTACT_EMAIL;

    const mailOptions = {
        from: `"Formulaire de contact — TC Lanrivoaré" <${process.env.SMTP_USER}>`,
        to: destinataire,
        replyTo: email,
        subject: `🎾 Nouveau message de contact — ${nom} - ${sujet}`,
        text: `Nouveau message via le formulaire de contact du site.\n\nNom : ${nom}\nEmail : ${email}\n\nMessage :\n${message}`,
        html: `
        <div style="font-family: Arial, Helvetica, sans-serif; background-color: #E9E2CE; padding: 40px 20px; margin: 0;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #F6F4EC; border-radius: 4px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">

                <!-- Header (Vert avec liseré jaune) -->
                <div style="background-color: #1B4332; border-bottom: 3px solid #C7B824; padding: 30px 20px; text-align: center;">
                    <h1 style="color: #F6F4EC; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">TC Lanrivoaré</h1>
                </div>

                <!-- Contenu principal -->
                <div style="padding: 40px 30px; color: #14231C; font-size: 16px; line-height: 1.6;">
                    <p style="margin-top: 0;">Nouveau message reçu via le formulaire de contact du site :</p>

                    <!-- Encart des coordonnées de l'expéditeur -->
                    <div style="background-color: #E9E2CE; border-left: 4px solid #1B4332; padding: 20px; margin: 25px 0; border-radius: 0 4px 4px 0;">
                        <ul style="list-style: none; padding: 0; margin: 0;">
                            <li style="margin-bottom: 10px;"><strong>Nom :</strong> ${escapeHtml(nom)}</li>
                            <li style="margin-bottom: 0;"><strong>Email :</strong> ${escapeHtml(email)}</li>
                        </ul>
                    </div>

                    <p style="margin-bottom: 8px;"><strong>Message :</strong></p>
                    <div style="background-color: #F6F4EC; border: 1px solid #DAD2B8; padding: 16px; border-radius: 2px; white-space: pre-wrap;">${escapeHtml(message)}</div>

                    <p style="margin-top: 30px;">Pour répondre, répondez directement à cet e-mail — la réponse partira à l'adresse du visiteur (${escapeHtml(email)}), pas à cette boîte.</p>

                    <p style="margin-bottom: 0;">L'équipe du site,<br><em>TC Lanrivoaré</em></p>
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

module.exports = { sendResetMail, sendBookingConfirmationMail, sendCancelConfirmationMail, sendUserRequestMail };
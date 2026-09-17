const express = require("express");
const prisma = require("../lib/prisma");
const { sendUserRequestMail } = require("../lib/mailer")

const router = express.Router();

router.post("/request", async (req, res) => {
    try {
		const { nom, email, sujet, message } = req.body;
        sendUserRequestMail(nom, email, sujet, message);
        res.status(200).json({ message: "Request sent !" });
    } catch (error) {
		console.error(error);
		res.status(500).json({ error: "Erreur serveur" });
    }
});

module.exports = router;
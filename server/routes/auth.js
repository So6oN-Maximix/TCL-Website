const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");

const router = express.Router();

function requireAuth(req, res, next) {
	const header = req.headers.authorization;
	if (!header || !header.startsWith('Bearer ')) return res.status(401).json({ error: 'Non authentifié' });

	const token = header.slice(7);

	try {
		const payload = jwt.verify(token, process.env.JWT_SECRET);
		req.userId = payload.userId;
		req.userRole = payload.role;
		next();
	} catch (err) {
		return res.status(401).json({ error: 'Session expirée, merci de vous reconnecter' });
	}
}

function normalizeFrenchPhone(raw) {
	if (!raw) return null;
	const digits = raw.replace(/[\s.\-()]/g, "");
 
	if (/^0[1-9]\d{8}$/.test(digits)) {
		return `+33${digits.slice(1)}`;
	}
	if (/^\+33[1-9]\d{8}$/.test(digits)) {
		return digits;
	}
	return undefined;
}

router.post("/signup", async (req, res) => {
	try {
		const { email, password, prenom, nom, licence, phone } = req.body;

		if (!email || !password || !prenom || !nom) return res.status(400).json({ error: "Champs manquants" });

		let normalizedPhone = null;
		if (phone) {
			normalizedPhone = normalizeFrenchPhone(phone);
			if (normalizedPhone === undefined) {
				return res.status(400).json({ error: "Numéro de téléphone invalide" });
			}
		}

		const existing = await prisma.user.findUnique({ where: { email } });
		if (existing) return res.status(409).json({ error: "Un compte existe déjà avec cet e-mail" });

		const hashedPassword = await bcrypt.hash(password, 10);

		const user = await prisma.user.create({
			data: { email, password: hashedPassword, prenom, nom, licence, phone: normalizedPhone },
		});

		res.status(201).json({ id: user.id, email: user.email, prenom: user.prenom, nom: user.nom });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Erreur serveur" });
	}
});

router.post("/login", async (req, res) => {
	try {
		const { email, password } = req.body;
		if (!email || !password) return res.status(400).json({ error: "Champs manquants" });

		const user = await prisma.user.findUnique({ where: { email } });
		if (!user) return res.status(401).json({ error: "Identifiants invalides" });

		const validPassword = await bcrypt.compare(password, user.password);
		if (!validPassword) return res.status(401).json({ error: "Identifiants invalides" });

		const token = jwt.sign(
			{ userId: user.id, role: user.role },
			process.env.JWT_SECRET,
			{ expiresIn: "7d" }
		);

		res.json({
			token,
			user: { id: user.id, email: user.email, prenom: user.prenom, nom: user.nom, role: user.role },
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Erreur serveur" });
	}
});

router.get('/me', requireAuth, async (req, res) => {
	try {
		const user = await prisma.user.findUnique({ where: { id: req.userId } });
		if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });
 
		res.json({
			id: user.id,
			email: user.email,
			prenom: user.prenom,
			nom: user.nom,
			licence: user.licence,
			phone: user.phone,
			role: user.role,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Erreur serveur' });
	}
});

router.post('/forgot-password', async (req, res) => {
	try {
		const { email } = req.body;
		if (!email) return res.status(400).json({ error: 'Champs manquants' });

		const user = await prisma.user.findUnique({ where: { email } });

		if (user) {
			const token = require('crypto').randomBytes(32).toString('hex');
			const expiry = new Date(Date.now() + 10 * 60 * 1000);

			await prisma.user.update({
				where: { id: user.id },
				data: { resetToken: token, resetTokenExpiry: expiry },
			});

			console.log(`Lien de réinitialisation pour ${email} : http://localhost:3000/reset-password?token=${token}`);
		}

		res.json({ message: 'Si un compte existe avec cet e-mail, un lien de réinitialisation a été envoyé.' });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Erreur serveur' });
	}
});

router.post('/reset-password', async (req, res) => {
	try {
		const { token, newPassword } = req.body;
		if (!token || !newPassword) return res.status(400).json({ error: 'Champs manquants' });

		const user = await prisma.user.findFirst({
			where: { resetToken: token, resetTokenExpiry: { gt: new Date() } },
		});
		if (!user) return res.status(400).json({ error: 'Lien invalide ou expiré' });

		const hashedPassword = await bcrypt.hash(newPassword, 10);
		await prisma.user.update({
			where: { id: user.id },
			data: { password: hashedPassword, resetToken: null, resetTokenExpiry: null },
		});

		res.json({ message: 'Mot de passe mis à jour' });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Erreur serveur' });
	}
});

module.exports = router;
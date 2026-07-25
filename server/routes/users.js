const express = require("express");
const prisma = require("../lib/prisma");

const router = express.Router();

router.get('/role', async (req, res) => {
	try {
		const { role } = req.query;
		const users = await prisma.user.findMany({
			where: role ? { role } : {},
			select: { prenom: true, nom: true, email: true, poste: true },
		});

		const ordrePostes = {
			"PRESIDENT": 1,
			"PRESIDENTE": 1,
			"VICE-PRESIDENT": 2,
			"VICE-PRESIDENTE": 2,
			"TRESORIER": 3,
			"TRESORIERE": 3,
			"SECRETAIRE": 4,
			"DEVELOPPEUR": 5
		};

		users.sort((a, b) => {
			const poidsA = ordrePostes[a.poste] || 99;
			const poidsB = ordrePostes[b.poste] || 99;
			return poidsA - poidsB;
		});

		res.json(users);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Erreur serveur' });
	}
});

module.exports = router;
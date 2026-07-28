const express = require("express");
const prisma = require("../lib/prisma");

const router = express.Router();

router.get("/all", async (req, res) => {
    try {
		const teams = await prisma.team.findMany({
			select: { id: true, nom: true, categorie: true }
		});

		res.json(teams);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Erreur serveur' });
	}
});

module.exports = router;
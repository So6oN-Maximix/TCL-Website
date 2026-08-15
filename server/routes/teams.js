const express = require("express");
const prisma = require("../lib/prisma");

const router = express.Router();

router.get("/all", async (req, res) => {
    try {
		const teams = await prisma.team.findMany({
			select: { id: true, nom: true, categorie: true },
			orderBy: { id: "asc" }
		});

		res.json(teams);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Erreur serveur' });
	}
});

router.get("/number", async (req, res) => {
	try {
		const { id } = req.query;
		const teamMembers = await prisma.user.aggregate({
			_count: { id: true },
			where: { teamId: parseInt(id) }
		});

		res.json(teamMembers);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Erreur serveur' });
	}
});

router.post("/add", async (req, res) => {
	try {
		const {nom, categorie, resultats} = req.body;
		
		if (!nom || !categorie) return res.status(400).json({ error: "Champs manquants" });

		const existing = await prisma.team.findUnique({ where: { nom: nom } });
		if (existing) return res.status(409).json({ error: "Ce nom d'équipe existe déja !" });

		const user = await prisma.team.create({ data: { nom, categorie, resultats } });
		res.status(200).json({ message: "User successfully added", user });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Erreur serveur' });
	}
});

router.post("/save", async (req, res) => {
	try {
		const { id, nom, categorie, resultats } = req.body;
		if (!nom || !categorie) return res.status(400).json({error: "Champs manquants"});

		const existing = await prisma.team.findUnique({
			where: {
				nom: nom,
				NOT: {
					id: id
				}
			}
		});
		if (existing) return res.status(409).json({ error: "Ce nom d'équipe existe déja !" });

		const user = await prisma.team.update({
			where: { id: id },
			data: { nom, categorie, resultats: resultats ? resultats : "Aucun résultats" }
		})
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Erreur serveur' });
	}
});

module.exports = router;
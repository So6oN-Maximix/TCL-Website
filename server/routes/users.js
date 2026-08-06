const express = require("express");
const prisma = require("../lib/prisma");
const bcrypt = require("bcryptjs");

const router = express.Router();

router.get("/role", async (req, res) => {
	try {
		const { role } = req.query;
		const users = await prisma.user.findMany({
			where: role ? { role } : {},
			select: { prenom: true, nom: true, email: true, poste: true }
		});

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

router.get("/all", async (req, res) => {
	try {
		const users = await prisma.user.findMany({
			select: {
				id: true,
				sexe: true,
				prenom: true,
				nom: true,
				email: true,
				role: true,
				licence: true,
				poste: true,
				cotisationPayed: true,
				teamId: true
			}
		});

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

router.post("/add", async (req, res) => {
	try {
		const {prenom, nom, email, password, sexe, role, licence, cotisation} = req.body;
		
		if (!nom || !prenom || !email || !password) return res.status(400).json({ error: "Champs manquants" });

		const existing = await prisma.user.findUnique({ where: { email } });
		if (existing) return res.status(409).json({ error: "Un compte existe déjà avec cet e-mail" });

		const hashedPassword = await bcrypt.hash(password, 10);
		const poste = role === "ADMIN" ? "COACH" : (role === "MEMBER" ? "JOUEUR" : "VISITEUR");

		const user = await prisma.user.create({ data: { prenom, nom, email, password: hashedPassword, sexe, role, poste, cotisationPayed: cotisation } });
		res.status(200).json({ message: "User successfully added", user });
	} catch (error) {
		console.log("Error while adding player :", error);
	}
});

router.post("/save", async (req, res) => {
	try {
		const {id, role, teamId, cotisation, licence} = req.body;
		const updatedUser = await prisma.user.update({
			where: {id: id},
			data: {role, teamId: teamId !== "" ? parseInt(teamId) : null, cotisationPayed: cotisation, licence}
		});

		res.status(200).json({ message: "User successfully saved", updatedUser });
	} catch (error) {
		console.log("Error while saving player : ", error);
	}
})

const ordrePostes = {
	"PRESIDENT": 1,
	"PRESIDENTE": 1,
	"VICE_PRESIDENT": 2,
	"VICE_PRESIDENTE": 2,
	"TRESORIER": 3,
	"TRESORIERE": 3,
	"SECRETAIRE": 4,
	"DEVELOPPEUR": 5,
	"COACH": 6,
	"JOUEUR": 7,
	"VISITEUR": 8
};

module.exports = router;
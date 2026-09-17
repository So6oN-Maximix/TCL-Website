const express = require("express");
const prisma = require("../lib/prisma");

const router = express.Router();

router.post("/save", async (req, res) => {
    try {
		const { titre, contenu, categorie, adminId } = req.body;
        const news = await prisma.news.create({
            data: { titre, contenu, categorie, adminId }
        });
        res.status(200).json({ message: "News successfully saved", news });
    } catch (error) {
		console.error(error);
		res.status(500).json({ error: "Erreur serveur" });
    }
});

router.get("/all", async (req, res) => {
    try {
        const allNews = await prisma.news.findMany({
            select: {
                titre: true,
                contenu: true,
                categorie: true,
                datePublication: true
            },
            orderBy: { datePublication: "asc" }
        });
        res.json(allNews);
    } catch (error) {
		console.error(error);
		res.status(500).json({ error: "Erreur serveur" });
    }
});

module.exports = router;
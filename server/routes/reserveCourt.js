const express = require("express");
const prisma = require("../lib/prisma");

const router = express.Router();

router.post("/block", async (req, res) => {
    try {
		const { courtId, date, heureDebut, raison } = req.body;
        const indisponibility = await prisma.indisponibilite.create({ data: { courtId, date: new Date(date), heureDebut: heureDebut, raison } });
        res.status(200).json({ message: "Indisponibility successfully added", indisponibility });
    } catch (error) {
		console.error(error);
		res.status(500).json({ error: "Erreur serveur" });
    }
});

router.get("/indispo", async (req, res) => {
    try {
		const indisponibilites = await prisma.indisponibilite.findMany({
			select: {
                courtId: true,
                date: true,
                heureDebut: true,
                raison: true
            }
        });
		res.json(indisponibilites);
    } catch (error) {
		console.error(error);
		res.status(500).json({ error: "Erreur serveur" });
    }
});

router.get("/bookings", async (req, res) => {
    try {
		const bookings = await prisma.booking.findMany({
			select: {
                courtId: true,
                userId: true,
                date: true,
                heureDebut: true,
                user: {
                    select: {
                        prenom: true,
                        nom: true
                    }
                }
            }
        });
		res.json(bookings);
    } catch (error) {
		console.error(error);
		res.status(500).json({ error: "Erreur serveur" });
    }
});

router.post("/booking", async (req, res) => {
    try {
        const { courtId, userId, date, heureDebut } = req.body;
        const userBooking = await prisma.booking.create({ data: { courtId, userId, date, heureDebut } });
        res.status(200).json({ message: `Booking successfully added for ID ${userId}`, userBooking });
    } catch (error) {
		console.error(error);
		res.status(500).json({ error: "Erreur serveur" });
    }
});

module.exports = router;
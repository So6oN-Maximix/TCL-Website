const express = require("express");
const prisma = require("../lib/prisma");
const { sendBookingConfirmationMail, sendCancelConfirmationMail } = require("../lib/mailer")

const router = express.Router();

router.post("/block", async (req, res) => {
    try {
        const indisponibility = await prisma.indisponibilite.create({ data: req.body });
        res.status(200).json({ message: "Indisponibility successfully added", indisponibility });
    } catch (error) {
		console.error(error);
		res.status(500).json({ error: "Erreur serveur" });
    }
});

router.get("/indispo", async (req, res) => {
    try {
        const today = new Date(req.query.today);

        let lastMonday = new Date(today);
        while (lastMonday.getDay() !== 1) lastMonday.setDate(lastMonday.getDate() - 1);
        lastMonday.setUTCHours(0, 0, 0, 0);

        const endWeek = new Date(lastMonday);
        endWeek.setUTCDate(lastMonday.getUTCDate() + 6);
        endWeek.setUTCHours(23, 59, 59, 999);

        if (today >= lastMonday && today <= endWeek) lastMonday = new Date(today);

		const indisponibilites = await prisma.indisponibilite.findMany({
			select: {
                courtId: true,
                dateDebut: true,
                raison: true,
                court: {
                    select: {
                        nom: true,
                        type: true
                    }
                }
            },
            where: {
                dateDebut: {
                    gte: lastMonday,
                    lte: endWeek
                }
            },
            orderBy: { dateDebut: "asc" }
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
                dateDebut: true,
                user: {
                    select: {
                        prenom: true,
                        nom: true
                    }
                },
                court: {
                    select: {
                        nom: true,
                        type: true
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
        const user = await prisma.user.findUnique({
            select: { email: true, prenom: true },
            where: { id: userId }
        });
        const court = await prisma.court.findUnique({
            select: { nom: true },
            where: { id: courtId }
        });
        const dateOptions = { weekday: "long", day: "numeric", month: "long" };
        const dateStr = new Date(date).toLocaleDateString("fr-FR", dateOptions);
        sendBookingConfirmationMail(user.email, user.prenom, court.nom, dateStr, heureDebut)
            .catch(err => console.error("Erreur lors de l'envoi du mail de réservation :", err));
        res.status(200).json({ message: `Booking successfully added for ID ${userId}`, userBooking });
    } catch (error) {
		console.error(error);
		res.status(500).json({ error: "Erreur serveur" });
    }
});

router.post("/cancel", async (req, res) => {
    try {
        const { courtId, userId, date, heureDebut } = req.body;
        const deleteElement = await prisma.booking.deleteMany({
            where: {
                courtId: parseInt(courtId),
                date: new Date(date),
                heureDebut: parseInt(heureDebut)
            }
        });
        const user = await prisma.user.findUnique({
            select: { email: true, prenom: true },
            where: { id: userId }
        });
        const court = await prisma.court.findUnique({
            select: { nom: true },
            where: { id: courtId }
        });
        const dateOptions = { weekday: "long", day: "numeric", month: "long" };
        const dateStr = new Date(date).toLocaleDateString("fr-FR", dateOptions);
        sendCancelConfirmationMail(user.email, user.prenom, court.nom, dateStr, heureDebut)
            .catch(err => console.error("Erreur lors de l'envoi du mail d'annulation :", err));
        res.status(200).json({ message: `Booking successfully deleted`, deleteElement });
    } catch (error) {
		console.error(error);
		res.status(500).json({ error: "Erreur serveur" });
    }
});

router.post("/recuringBlock", async (req, res) => {
    try {
        const dataForm = req.body;

        const formattedDays = dataForm.jours.map(day => parseInt(day));
        const intervalles = [];
        for (let i = parseInt(dataForm.heureDebut); i < parseInt(dataForm.heureFin); i++) intervalles.push(i);
        const currentDate = new Date(dataForm.startDate);

        let endDate;
        if (dataForm.recurrenceEnd === "on-date") endDate = new Date(dataForm.dateFin);
        else if (dataForm.recurrenceEnd === "after-count") {
            endDate = new Date(currentDate);
            endDate.setDate(currentDate.getDate() + 7 * parseInt(dataForm.occurrences) - 1);
        }
        endDate.setUTCHours(23, 59, 59, 999);

        const toPushToPrisma = [];
        while (currentDate <= endDate) {
            if (formattedDays.includes(currentDate.getDay())) {
                const fixedDate = new Date(currentDate);
                intervalles.forEach(async hour => {
                    fixedDate.setUTCHours(hour, 0, 0, 0)
                    toPushToPrisma.push({
                        courtId: parseInt(dataForm.court),
                        dateDebut: fixedDate,
                        raison: dataForm.raison
                    });
                });
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }
        if (toPushToPrisma.length > 0) await prisma.indisponibilite.createMany({ data: toPushToPrisma });
        res.status(200).json({ message: `Recuring block successfully added`, toPushToPrisma });
    } catch (error) {
		console.error(error);
		res.status(500).json({ error: "Erreur serveur" });
    }
});

router.post("/deleteBlock", async (req, res) => {
    try {
        const { courtId, startDate } = req.body;
        const deleteBlock = await prisma.indisponibilite.deleteMany({
            where: {
                courtId: parseInt(courtId),
                dateDebut: new Date(startDate),
            }
        });
        res.status(200).json({ message: `Block successfully deleted`, deleteBlock });
    } catch (error) {
		console.error(error);
		res.status(500).json({ error: "Erreur serveur" });
    }
});

module.exports = router;
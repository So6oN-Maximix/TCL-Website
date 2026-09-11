const express = require("express");
const prisma = require("../lib/prisma");

const router = express.Router();

router.post("/block", (req, res) => {
    try {
		const { courtId, startHour, raison } = req.body;
        console.log(courtId, startHour, raison);
    } catch (error) {
		console.error(err);
		res.status(500).json({ error: "Erreur serveur" });
    }
})

module.exports = router;
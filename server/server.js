require("dotenv").config();
const express = require("express");
const path = require("path");
const crypto = require("crypto");

const authRoutes = require("./routes/auth");
const usersRoutes = require("./routes/users");
const teamsRoutes = require("./routes/teams");
const reservationRoutes = require("./routes/reserveCourt");
const contactRoutes = require("./routes/contact");
const actualitesRoutes = require("./routes/actualites");

const app = express();
const PORT = process.env.PORT || 3000;

const root = path.join(__dirname, "..");
app.use(express.json());

process.env.JWT_SECRET = crypto.randomBytes(64).toString("hex");

app.use("/styles.css", express.static(path.join(root, "styles.css")));
app.use("/JS", express.static(path.join(root, "JS")));
app.use("/images", express.static(path.join(root, "images")));

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/teams", teamsRoutes);
app.use("/api/reserveCourt", reservationRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/actualites", actualitesRoutes);

app.get("/", (req, res) => res.sendFile(path.join(root, "index.html")));

app.get("/:page", (req, res) => res.sendFile(path.join(root, "HTML", `${req.params.page}.html`), (err) => {
	if (err) res.status(404).send("Page non trouvée");
}));

app.listen(PORT, () => console.log(`Serveur lancé sur http://localhost:${PORT}`));
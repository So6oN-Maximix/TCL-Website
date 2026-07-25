// ============================================================
// Page profil — TC Lanrivoaré
// ============================================================
// Pour l'instant, la page affiche des données de démonstration
// écrites en dur dans profil.html. Ce script :
//   1) essaie de remplacer ces données par celles de l'utilisateur
//      réellement connecté (si connexion.js les a stockées),
//   2) gère le bouton de déconnexion,
//   3) valide le formulaire de changement de mot de passe côté
//      client (l'appel à une vraie route API reste à brancher).
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
	hydrateFromStoredUser();
    checkSession();
	setupLogout();
	setupPasswordForm();
});

async function checkSession() {
	const token = localStorage.getItem("token");
	if (!token) return;
 
	try {
		const res = await fetch("/api/auth/me", {
			headers: { Authorization: `Bearer ${token}` }
		});

		if (!res.ok) {
			localStorage.removeItem("token");
			localStorage.removeItem("user");
			window.location.href = "/connexion";
			return;
		}

		const user = await res.json();
		localStorage.setItem("user", JSON.stringify(user));
		applyUserToDom(user);
	} catch (err) {
		console.error("Impossible de vérifier la session :", err);
	}
}

function hydrateFromStoredUser() {
	const raw = localStorage.getItem("user");
	if (!raw) return;

	let user;
	try {
		user = JSON.parse(raw);
	} catch {
		return;
	}
    applyUserToDom(user);
}

function applyUserToDom(user) {
	const nameEl = document.getElementById("profile-name");
	const avatarEl = document.getElementById("profile-avatar");
 
	if (user.prenom && user.nom) {
		nameEl.textContent = `${user.prenom} ${user.nom}`.toUpperCase();
		avatarEl.textContent = `${user.prenom[0]}${user.nom[0]}`.toUpperCase();
	}

	document.querySelectorAll(".info-row").forEach((row) => {
		const label = row.querySelector(".k")?.textContent.trim();
		const value = row.querySelector(".v");
		if (!value) return;
		if (label === "E-mail" && user.email) value.textContent = user.email;
		if (label === "Prénom" && user.prenom) value.textContent = user.prenom;
		if (label === "Nom" && user.nom) value.textContent = user.nom;
		if (label === "N° de licence FFT" && user.licence) value.textContent = user.licence;
	});
}

function setupLogout() {
	const btn = document.getElementById("logout-btn");
	if (!btn) return;

	btn.addEventListener("click", () => {
		localStorage.removeItem("token");
		localStorage.removeItem("user");
		window.location.href = "/connexion";
	});
}

function setupPasswordForm() {
	const form = document.getElementById("password-form");
	if (!form) return;

	const errorEl = document.getElementById("password-error");

	form.addEventListener("submit", async (e) => {
		e.preventDefault();
		errorEl.style.display = "none";

		const current = document.getElementById("current-password").value;
		const next = document.getElementById("new-password").value;
		const confirm = document.getElementById("confirm-new-password").value;

		if (!current || !next || !confirm) {
			showError("Merci de remplir tous les champs.");
			return;
		}
		if (next.length < 8) {
			showError("Le nouveau mot de passe doit contenir au moins 8 caractères.");
			return;
		}
		if (next !== confirm) {
			showError("Les deux mots de passe ne correspondent pas.");
			return;
		}

		showError("Cette action n'est pas encore connectée à une route API — formulaire prêt côté front.", true);
		form.reset();
	});

	function showError(message, isInfo = false) {
		errorEl.textContent = message;
		errorEl.style.color = isInfo ? "var(--court-green)" : "var(--clay)";
		errorEl.style.display = "block";
	}
}
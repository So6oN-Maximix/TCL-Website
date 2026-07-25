const params = new URLSearchParams(window.location.search);
const token = params.get("token");

document.getElementById("reset-form").addEventListener("submit", async (e) => {
	e.preventDefault();

	const newPassword = document.getElementById("new-password").value;
	const confirmPassword = document.getElementById("confirm-new-password").value;
	const errorEl = document.getElementById("reset-error");
	const successEl = document.getElementById("reset-success");

	errorEl.style.display = "none";
	successEl.style.display = "none";

	if (!token) {
		errorEl.textContent = "Lien invalide : aucun token trouvé dans l'URL";
		errorEl.style.display = "block";
		return;
	}

	if (newPassword !== confirmPassword) {
		errorEl.textContent = "Les mots de passe ne correspondent pas";
		errorEl.style.display = "block";
		return;
	}

	try {
		const res = await fetch("/api/auth/reset-password", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ token, newPassword }),
		});
		const data = await res.json();

		if (!res.ok) {
			errorEl.textContent = data.error || "Erreur lors de la réinitialisation";
			errorEl.style.display = "block";
			return;
		}

		successEl.textContent = "Mot de passe mis à jour, redirection vers la connexion...";
		successEl.style.display = "block";

		setTimeout(() => {
			window.location.href = "/connexion";
		}, 1500);
	} catch (err) {
		errorEl.textContent = "Impossible de contacter le serveur";
		errorEl.style.display = "block";
	}
});
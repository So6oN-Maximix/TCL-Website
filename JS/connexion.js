const authPanels = {
	login: { form: document.getElementById("login-panel"), foot: document.getElementById("login-foot") },
	signup: { form: document.getElementById("signup-panel"), foot: document.getElementById("signup-foot") }
};

function showAuthPanel(target, tabEl) {
	const current = target === "login" ? "signup" : "login";

	document.querySelectorAll(".auth-tab").forEach(t => t.classList.remove("active"));
	tabEl.classList.add("active");

	authPanels[current].form.classList.add("auth-fade-out");
	authPanels[current].foot.classList.add("auth-fade-out");

	setTimeout(() => {
		authPanels[current].form.style.display = "none";
		authPanels[current].foot.style.display = "none";
		authPanels[current].form.classList.remove("auth-fade-out");
		authPanels[current].foot.classList.remove("auth-fade-out");

		authPanels[target].form.style.display = "block";
		authPanels[target].foot.style.display = "block";
		authPanels[target].form.classList.add("auth-fade-in");
		authPanels[target].foot.classList.add("auth-fade-in");

		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				authPanels[target].form.classList.remove("auth-fade-in");
				authPanels[target].foot.classList.remove("auth-fade-in");
			});
		});
	}, 180);
}

document.getElementById("login-panel").addEventListener("submit", async (e) => {
	e.preventDefault();
	const errorEl = document.getElementById("login-error");
	errorEl.style.display = "none";

	try {
		const res = await fetch("/api/auth/login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				email: document.getElementById("email").value,
				password: document.getElementById("password").value,
			}),
		});
		const data = await res.json();

		if (!res.ok) {
			errorEl.textContent = data.error || "Erreur de connexion";
			errorEl.style.display = "block";
			return;
		}

		localStorage.setItem("token", data.token);
		window.location.href = "/profil";
	} catch (err) {
		errorEl.textContent = "Impossible de contacter le serveur";
		errorEl.style.display = "block";
	}
});

document.getElementById("signup-panel").addEventListener("submit", async (e) => {
	e.preventDefault();
	const errorEl = document.getElementById("signup-error");
	errorEl.style.display = "none";

	if (document.getElementById("signup-password").value !== document.getElementById("confirm-password").value) {
		errorEl.textContent = "Les mots de passe ne correspondent pas";
		errorEl.style.display = "block";
		return;
	}

	try {
		const res = await fetch("/api/auth/signup", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				prenom: document.getElementById("prenom").value,
				nom: document.getElementById("nom").value,
				email: document.getElementById("signup-email").value,
				licence: document.getElementById("licence").value,
				password: document.getElementById("signup-password").value,
			}),
		});
		const data = await res.json();

		if (!res.ok) {
			errorEl.textContent = data.error || "Erreur lors de la création du compte";
			errorEl.style.display = "block";
			return;
		}

		const loginRes = await fetch('/api/auth/login', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				email: document.getElementById('signup-email').value,
				password: document.getElementById('signup-password').value,
			}),
		});
		const loginData = await loginRes.json();
		localStorage.setItem('token', loginData.token);
		window.location.href = '/profil';
	} catch (err) {
		errorEl.textContent = "Impossible de contacter le serveur";
		errorEl.style.display = "block";
	}
});

function showForgotPanel() {
	document.getElementById('login-panel').style.display = 'none';
	document.getElementById('login-foot').style.display = 'none';
	document.getElementById('forgot-panel').style.display = 'block';
}

async function submitForgotPassword() {
	const email = document.getElementById('forgot-email').value;
	const messageEl = document.getElementById('forgot-message');

	const res = await fetch('/api/auth/forgot-password', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ email }),
	});
	const data = await res.json();

	messageEl.textContent = data.message;
	messageEl.style.display = 'block';
}
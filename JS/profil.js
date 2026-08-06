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

	applyRoleVisibility(user.role, user.email);

	document.querySelectorAll(".info-row").forEach((row) => {
		const label = row.querySelector(".k")?.textContent.trim();
		const value = row.querySelector(".v");
		if (!value) return;
		if (label === "E-mail" && user.email) value.textContent = user.email;
		if (label === "Prénom" && user.prenom) value.textContent = user.prenom;
		if (label === "Nom" && user.nom) value.textContent = user.nom;
		if (label === "N° de licence FFT" && user.licence) value.textContent = user.licence;
		if (label === "Téléphone" && user.phone) value.textContent = formatPhone(user.phone);
	});
}

function formatPhone(raw) {
	const phoneNumber = "0" + raw.split("+33")[1]
	const printedPhoneNumber =  phoneNumber.match(/.{1,2}/g).join("-");
	return printedPhoneNumber;
}

const ROLE_LABELS = {
	VISITER: "Visiteur",
	ATTENTE_MEMBER: "En Attente",
	MEMBER: "Licencié",
	ADMIN: "Administrateur",
};
const TABLE_BADGE_CLASSES = {
	VISITER: "badge-visiteur",
	ATTENTE_MEMBER: "badge-attente",
	MEMBER: "badge-member",
	ADMIN: "badge-admin",
};
const ROLE_BADGE_CLASSES = {
	VISITER: "role-badge-visiteur",
	ATTENTE_MEMBER: "role-badge-visiteur",
	MEMBER: "role-badge-membre",
	ADMIN: "role-badge-admin",
};

function applyRoleVisibility(rawRole, rawEmail) {
	const role = (rawRole || "VISITER").toUpperCase();
	if (role === "ADMIN") updateAdminTable(rawEmail);

	document.querySelectorAll("[data-role-visible]").forEach((el) => {
		const allowed = el.dataset.roleVisible.split(",").map((r) => r.trim().toUpperCase());
		el.hidden = !allowed.includes(role);
	});

	const badge = document.getElementById("role-badge");
	if (badge) {
		badge.textContent = ROLE_LABELS[role] || role;
		badge.className = `role-badge ${ROLE_BADGE_CLASSES[role] || ""}`;
	}
}

async function updateAdminTable(email) {
	try {
		const res = await fetch("/api/users/all", {
			method: "GET",
			headers: { "Content-Type": "application/json" }
		});
		const data = await res.json();

		const wrap = document.querySelector(".admin-table-wrap");
        wrap.querySelectorAll(".admin-table-row").forEach(row => row.remove());

		for (const user of data) addUserToAdminTable(user, email);

		document.querySelectorAll(".admin-actions button").forEach(btn => {
            btn.addEventListener("click", (e) => {
                console.log(`BTN id : ${e.target.id} / Test : ${e.target.textContent}`);
            });
        });
	} catch(error) {
		console.error(error);
	}
}

function addUserToAdminTable(user, email) {
	const globalDiv = document.createElement("div");
	globalDiv.classList.add("admin-table-row");

	const nameSpan = document.createElement("span");
	nameSpan.textContent = `${user.prenom} ${user.nom.toUpperCase()} - ${user.email}`;
	const badgeSpan = document.createElement("span");
	badgeSpan.classList.add(TABLE_BADGE_CLASSES[user.role]);
	badgeSpan.textContent = ROLE_LABELS[user.role];
	const roleSpan = document.createElement("span");
	roleSpan.textContent = user.role;
	const posteSpan = document.createElement("span");
	posteSpan.textContent = user.poste;

	const adminActionBadge = document.createElement("div");
	adminActionBadge.classList.add("admin-actions");

	globalDiv.appendChild(nameSpan);
	globalDiv.appendChild(badgeSpan);
	globalDiv.appendChild(roleSpan);
	globalDiv.appendChild(posteSpan);

	const textBtn = (user.role === "VISITER" || user.role === "ATTENTE_MEMBER") ? "Passer Membre" : (user.role === "MEMBER" ? "Passer Admin" : "Retirer les droits");
	globalDiv.innerHTML +=
		user.email !== email
		? `
		<span class="admin-actions">
			<button type="button" class="btn-outline btn-small" id="btn-user-${user.id}">${textBtn}</button>
		</span>`
		: `
		<span class="admin-actions" style="color: var(--ink-soft); font-size: 13px; font-style: italic;">
			(Vous-même)
		</span>`
	;

	document.querySelector(".admin-table-wrap").appendChild(globalDiv);
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
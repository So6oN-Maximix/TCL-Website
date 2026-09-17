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
		if (label === "Nom" && user.nom) value.textContent = user.nom.toUpperCase();
		if (label === "Téléphone" && user.phone) value.textContent = formatPhone(user.phone);
		if (label === "N° de licence FFT" && user.licence) value.textContent = user.licence;
		if (label === "Cotisation 2025-2026" && user.cotisationPayed) value.textContent = user.cotisationPayed === "true" ? "À jour" : "Non payée";
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

function formatLongDate(date) {
    const dateFormat = new Date(date);
    const dateOptions = {weekday: "long", day: "numeric", month: "long"};
    return dateFormat.toLocaleDateString("fr-FR", dateOptions).split(" ").map(mot => mot.charAt(0).toUpperCase() + mot.slice(1)).join(" ");
}

function splitBookings(allBookings) {
	const now = new Date();
	const upcoming = [];
	const past = [];

	for (const booking of allBookings) {
		const bookingEnd = new Date(booking.date);
		bookingEnd.setHours(parseInt(booking.heureDebut) + 1, 0, 0, 0);

		if (bookingEnd <= now) {
			past.push(booking);
		} else {
			upcoming.push(booking);
		}
	}

	return { upcoming, past };
}

async function loadBookings() {
	const res = await fetch("/api/reserveCourt/bookings", {
		method: "GET",
		headers: { "Content-Type": "application/json" }
	});

	const allBookings = await res.json();
	const allBookingForUser = allBookings.filter(booking => booking.userId === parseInt(JSON.parse(localStorage.getItem("user")).id));
    allBookingForUser.sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();

        if (dateA !== dateB) return dateA - dateB;
        return a.heureDebut - b.heureDebut;
    });

	const { upcoming, past } = splitBookings(allBookingForUser);
	const bookingTable = document.querySelectorAll(".info-list");
	document.querySelector(".block-count").innerText = `${upcoming.length} à venir`;

	bookingTable[1].innerHTML = "";
	bookingTable[2].innerHTML = "";
	upcoming.forEach(booking => addToBookingList(booking, bookingTable[1]));
	past.forEach(booking => addToBookingList(booking, bookingTable[2]));
}

function addToBookingList(booking, selector) {
	const globalDiv = document.createElement("div");
	globalDiv.classList.add("booking-item");

	const infoDiv = document.createElement("div");
	const courtSpan = document.createElement("span");
	const courtTypeLower = booking.court.type.toLowerCase();
	const courtInfo = `${booking.court.nom} (${courtTypeLower.charAt(0).toUpperCase() + courtTypeLower.slice(1)})`;
	courtSpan.classList.add("booking-court");
	courtSpan.innerText = courtInfo;
	const daySpan = document.createElement("span");
	daySpan.classList.add("booking-when");
	const dateString = `${formatLongDate(new Date(booking.date))} · ${parseInt(booking.heureDebut)}h - ${parseInt(booking.heureDebut) + 1}h`
	daySpan.innerText = dateString;
	infoDiv.appendChild(courtSpan);
	infoDiv.appendChild(daySpan);

	const bookingEnd = new Date(booking.date);
	bookingEnd.setHours(parseInt(booking.heureDebut) + 1, 0, 0, 0);
	const isPast = bookingEnd <= new Date();

	globalDiv.appendChild(infoDiv);

	if (isPast) {
		const statusSpan = document.createElement("span");
		statusSpan.classList.add("booking-status", "past");
		statusSpan.innerText = "Passée";
		globalDiv.appendChild(statusSpan);
	} else {
		const actionDiv = document.createElement("div");
		actionDiv.classList.add("booking-item-actions");
		const statusSpan = document.createElement("span");
		statusSpan.classList.add("booking-status", "confirmed");
		statusSpan.innerText = "Confirmée";
		const cancelBtn = document.createElement("button");
		cancelBtn.type = "button";
		cancelBtn.classList.add("btn-cancel-booking");
		cancelBtn.innerText = "Annuler";

		cancelBtn.onclick = () => openCancelModal(courtInfo, dateString, booking);

		actionDiv.appendChild(statusSpan);
		actionDiv.appendChild(cancelBtn);
		globalDiv.appendChild(actionDiv);
	}

	selector.appendChild(globalDiv);
}

function openCancelModal(courtInfo, dateString, booking) {
	cancelBookingModal.hidden = false;
	const [ date, hours ] = dateString.split(" · ")
	document.getElementById("cancel-booking-summary").innerHTML = `${courtInfo} · ${date} · <strong>${hours}</strong>`;
	document.getElementById("confirm-cancel-booking-btn").onclick = async () => {
		try {
            const res = await fetch("/api/reserveCourt/cancel", {
                method: "POST", 
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    courtId: booking.courtId,
					userId: parseInt(JSON.parse(localStorage.getItem("user")).id),
                    date: booking.date,
                    heureDebut: booking.heureDebut
                })
            });

            if (res.ok) {
				loadBookings();
                cancelBookingModal.hidden = true;
                showToast("Réservation annulée avec succès !");
            } else {
                console.error("Erreur lors de la suppression de la réservation côté serveur.");
            }
        } catch (error) {
            console.error("Erreur réseau :", error);
        }
	};
}

function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast-notification";
    toast.innerText = message;
    
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add("show"), 10);
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function openModifyModal(personalInfoDiv) {
	const infoRows = personalInfoDiv.querySelectorAll(".info-row");
	const filteredInfoRows = Array.from(infoRows).filter(row => {
		const dataRoleVisible = row.getAttribute("data-role-visible");
		return !dataRoleVisible;
	});
	const formElements = modalModifyPersonalInfo.querySelectorAll(".form-group");
	formElements.forEach((form, index) => {
		form.querySelector("input").value = filteredInfoRows[index].querySelector(".v").innerText;
		form.querySelector("input").placeholder = filteredInfoRows[index].querySelector(".v").innerText;
	});
	modalModifyPersonalInfo.hidden = false;

	document.getElementById("save-profile-btn").onclick = async event => {
		event.preventDefault();

		const newPrenom = formElements[0].querySelector("input").value;
        const newNom = formElements[1].querySelector("input").value;
        const newEmail = formElements[2].querySelector("input").value;
        const newPhone = formElements[3].querySelector("input").value.slice(1);
		
		try {
            const res = await fetch("/api/users/modify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: parseInt(JSON.parse(localStorage.getItem("user")).id),
                    prenom: newPrenom,
                    nom: newNom,
                    email: newEmail,
                    phone: "+33" + newPhone.split("-").join("")
                })
            });

            if (res.ok) {
                modalModifyPersonalInfo.hidden = true;
                showToast("Profil mis à jour avec succès !");
            } else {
                console.error("Erreur lors de la mise à jour");
                showToast("Erreur lors de la mise à jour du profil.");
            }
        } catch (error) {
            console.error("Erreur réseau :", error);
        }
	};
}

const cancelBookingModal = document.getElementById("cancel-booking-modal-overlay");
const personalInfoDiv = document.getElementById("personal-info");
const modalModifyPersonalInfo = document.getElementById("edit-profile-modal-overlay");

document.addEventListener("DOMContentLoaded", () => {
	hydrateFromStoredUser();
    checkSession();
	setupLogout();
	setupPasswordForm();
	loadBookings();
});

cancelBookingModal.addEventListener("click", event => {
	if (event.target.classList.contains("modal-overlay") || event.target.classList.contains("modal-close") || event.target.id === "cancel-booking-modal-dismiss") cancelBookingModal.hidden = true;
});

personalInfoDiv.addEventListener("click", event => {
	event.preventDefault();
	if (event.target.tagName === "BUTTON") openModifyModal(personalInfoDiv);
});

modalModifyPersonalInfo.addEventListener("click", event => {
	if (event.target.classList.contains("modal-overlay") || event.target.classList.contains("modal-close") || event.target.id === "edit-profile-modal-cancel") modalModifyPersonalInfo.hidden = true;
});
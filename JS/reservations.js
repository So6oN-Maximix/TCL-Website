function openModal(targetElement) {
    const selectedDate = document.querySelector(".date-pill.selected");
    const selectedCourt = document.querySelector(".court-option.selected");
    const courtName = selectedCourt.querySelector(".name").innerText;
    const courtType = selectedCourt.querySelector(".type").innerText;

    document.getElementById("confirm-court-label").innerText = `${courtName} · ${courtType}`;
    document.getElementById("confirm-date-label").innerText = formatLongDate(new Date(selectedDate.getAttribute("data-date")));
    document.getElementById("confirm-slot-label").innerText = targetElement.innerText;
    disponibilityModal.hidden = false;
}

function renderGrid() {
    const courtId = parseInt(document.querySelector(".court-option.selected").getAttribute("data-court-id"));
    const date = document.querySelector(".date-pill.selected").getAttribute("data-date");

    hoursParent.innerHTML = "";

    const states = getSlotStates({ courtId, date, bookings: allBookings, indisponibilites: allIndisponibilites });
    states.forEach(state => {
        const formatedDiv = document.createElement("div");
        formatedDiv.classList.add("slot");
        formatedDiv.classList.add(state.status),
        formatedDiv.setAttribute("data-heure", state.heure);
        if (state.status === "unavailable") {
            formatedDiv.classList.add("slot-unblockable");
            formatedDiv.innerHTML = `
                ${state.heure}h - ${state.heure + 1}h
                <span class="slot-reason">${state.indispo.raison}</span>
            `;
        } else if (state.status === "taken") {
            formatedDiv.innerText = `${state.heure}h - ${state.heure + 1}h`;
            formatedDiv.title = `Court réservé par ${state.booking.user.prenom} ${state.booking.user.nom}`;
        } else {
            formatedDiv.innerText = `${state.heure}h - ${state.heure + 1}h`;
        }
        hoursParent.appendChild(formatedDiv);
    });
}

function formatLongDate(date) {
    const dateFormat = new Date(date);
    const dateOptions = {weekday: "long", day: "numeric", month: "long"};
    return dateFormat.toLocaleDateString("fr-FR", dateOptions);
}

function loadBookingSummary(targetEvent) {
    const selectedDate = document.querySelector(".date-pill.selected");
    const selectedCourt = document.querySelector(".court-option.selected");
    const courtName = selectedCourt.querySelector(".name").innerText;
    const courtType = selectedCourt.querySelector(".type").innerText;
    const longDate = formatLongDate(new Date(selectedDate.getAttribute("data-date")));
    document.querySelector(".booking-summary p").innerHTML = `${courtName} (${courtType}) · ${longDate.charAt(0).toUpperCase() + longDate.slice(1)} · <strong>${targetEvent.innerText}</strong>`;
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

const hoursParent = document.getElementById("hours-slot-grid");
const confirmBtn = document.getElementById("open-confirm-modal");
const disponibilityModal = document.getElementById("confirm-modal-overlay");
const confirmBookingBtn = document.getElementById("confirm-booking-btn");

hoursParent.addEventListener("click", event => {
    if (event.target.classList.contains("slot-blockable")) {
        hoursParent.querySelectorAll(".selected").forEach(elem => elem.classList.remove("selected"));
        event.target.classList.add("selected");
        loadBookingSummary(event.target);
    }
});

confirmBtn.addEventListener("click", () => openModal(document.querySelector(".slot.selected")));

disponibilityModal.addEventListener("click", event => {
    if (event.target.classList.contains("modal-overlay") || event.target.classList.contains("modal-close") || event.target.id === "confirm-modal-cancel") disponibilityModal.hidden = true;
});

confirmBookingBtn.onclick = async () => {
	const token = localStorage.getItem("token");
	const statusEl = document.getElementById("confirm-modal-status");

	if (!token) {
		showError("Veuillez vous connecter pour réserver un créneau.");
		return;
	}

	try {
        const currentUser = JSON.parse(localStorage.getItem("user"));
        const infos = {
            courtId: parseInt(document.querySelector(".court-option.selected").getAttribute("data-court-id")),
            userId: currentUser.id,
            date: new Date(document.querySelector(".date-pill.selected").getAttribute("data-date")),
            heureDebut: parseInt(document.querySelector(".slot.selected").getAttribute("data-heure"))
        }
		const res = await fetch("/api/reserveCourt/booking", {
			method: "POST",
			headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
			body: JSON.stringify(infos)
		});

		if (res.status === 401) {
			localStorage.removeItem("token");
			localStorage.removeItem("user");
			showError("Votre session a expiré, merci de vous reconnecter.");
			return;
		}

		if (!res.ok) {
			showError("Impossible de réserver ce créneau.");
			return;
		}

        allBookings.push({
            courtId: infos.courtId,
            userId: infos.userId,
            date: document.querySelector(".date-pill.selected").getAttribute("data-date") + "T00:00:00.000Z",
            heureDebut: infos.heureDebut,
            user: {
                prenom: currentUser.prenom,
                nom: currentUser.nom
            }
        });
        disponibilityModal.hidden = true;
        showToast(`Votre créneau a été réservé avec succès ${currentUser.prenom} !`);
        renderGrid();
	} catch (err) {
		showError("Erreur réseau, réessaie plus tard.");
	}

	function showError(msg) {
		statusEl.textContent = msg;
		statusEl.classList.remove("success");
		statusEl.classList.add("error");
		statusEl.hidden = false;
	}
};
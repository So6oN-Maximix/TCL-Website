function openModal(targetElement) {
    const activeCourt = document.querySelector(".court-option.selected");
    disponibilityModal.querySelector("#block-form-court-label").innerText = `${activeCourt.querySelector(".name").innerText} · ${activeCourt.querySelector(".type").innerText}`;
    disponibilityModal.querySelector("#block-form-court-label").setAttribute("data-court-id", activeCourt.getAttribute("data-court-id"));
    disponibilityModal.querySelector("#block-form-slot-label").innerText = targetElement.innerText;
    disponibilityModal.querySelector("#block-form-slot-label").setAttribute("data-heure",targetElement.getAttribute("data-heure"));
    disponibilityModal.hidden = false;
}

function renderGrid() {
    const courtId = parseInt(document.querySelector(".court-option.selected").getAttribute("data-court-id"));
    const date = document.querySelector(".date-pill.selected").getAttribute("data-date");

    updateGridHeader(courtId, date);
    hoursParent.innerHTML = "";

    const states = getSlotStates({ courtId, date, bookings: allBookings, indisponibilites: allIndisponibilites });
    states.forEach(state => {
        const formatedDiv = document.createElement("div");
        formatedDiv.classList.add("slot");
        formatedDiv.classList.add(state.status),
        formatedDiv.setAttribute("data-heure", state.heure);
        if (state.status === "unavailable") {
            formatedDiv.classList.add("slot-unblockable");
            formatedDiv.title = "Cliquer pour débloquer";
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

function updateGridHeader(courtId, date) {
    const gridTitle = document.getElementById("grid-title");
    const dateFormat = new Date(date);
    const dateOptions = {weekday: "long", day: "numeric", month: "long"};
    gridTitle.innerText = `Créneaux — Court ${courtId}, ${dateFormat.toLocaleDateString("fr-FR", dateOptions)}`;
}

const hoursParent = document.getElementById("admin-slot-grid");
const disponibilityModal = document.getElementById("block-modal-overlay");
const blockHoursForm = document.getElementById("block-form");

hoursParent.addEventListener("click", event => {
    if (event.target.classList.contains("slot-blockable")) openModal(event.target);
});

disponibilityModal.addEventListener("click", event => {
    if (event.target.classList.contains("modal-overlay") || event.target.classList.contains("modal-close") || event.target.id === "block-form-cancel") disponibilityModal.hidden = true;
});

blockHoursForm.addEventListener("submit", async event => {
	event.preventDefault();
	const dataForm = Object.fromEntries(new FormData(blockHoursForm));
    const targetCourt = disponibilityModal.querySelector("#block-form-court-label").getAttribute("data-court-id");
    const date = document.querySelector(".date-pill.selected").getAttribute("data-date");
    const targetHours = disponibilityModal.querySelector("#block-form-slot-label").getAttribute("data-heure");
    blockHoursForm.reset();
    disponibilityModal.hidden = true;

    const infos = {
        courtId: parseInt(targetCourt),
        date: date,
        heureDebut: parseInt(targetHours),
        raison: dataForm.raison
    };

    const res = await fetch("/api/reserveCourt/block", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(infos)
    });

    if (!res.ok) {
        alert("Impossible de bloquer ce créneau.");
        return;
    }

    allIndisponibilites.push(infos);
    renderGrid();
});
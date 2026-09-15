function openDisponobilityModal(targetElement) {
    const activeCourt = document.querySelector(".court-option.selected");
    disponibilityModal.querySelector("#block-form-court-label").innerText = `${activeCourt.querySelector(".name").innerText} · ${activeCourt.querySelector(".type").innerText}`;
    disponibilityModal.querySelector("#block-form-court-label").setAttribute("data-court-id", activeCourt.getAttribute("data-court-id"));
    disponibilityModal.querySelector("#block-form-slot-label").innerText = targetElement.innerText;
    disponibilityModal.querySelector("#block-form-slot-label").setAttribute("data-heure",targetElement.getAttribute("data-heure"));
    disponibilityModal.hidden = false;
}

function openUnlockModal(targetElement) {
    const activeCourt = document.querySelector(".court-option.selected");
    unlockModal.querySelector("#unblock-info-court").innerText = `${activeCourt.querySelector(".name").innerText} · ${activeCourt.querySelector(".type").innerText}`;
    unlockModal.querySelector("#unblock-info-date").innerText = formatLongDate(targetElement.querySelector(".date-pill.selected"));
    unlockModal.querySelector("#unblock-info-heure").innerText = `${parseInt(targetElement.getAttribute("data-heure"))}h - ${parseInt(targetElement.getAttribute("data-heure")) + 1}h`;
    unlockModal.querySelector("#unblock-info-raison").innerText = targetElement.querySelector(".slot-reason").innerText;
    unlockModal.hidden = false;
}

function openUnlockModalViaList(targetElement) {
    unlockModal.querySelector("#unblock-info-court").innerText = targetElement.querySelector(".block-court").innerText;
    unlockModal.querySelector("#unblock-info-date").innerText = targetElement.querySelector(".block-date").innerText;
    unlockModal.querySelector("#unblock-info-heure").innerText = targetElement.querySelector(".block-hours").innerText;
    unlockModal.querySelector("#unblock-info-raison").innerText = targetElement.querySelector(".block-reason").innerText;
    unlockModal.hidden = false;
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

function loadBlockList() {
    const blockListElement = document.getElementById("dispo-list");
    blockListElement.innerHTML = "";
    document.querySelector(".block-count").innerText = `${allIndisponibilites.length} créneau${allIndisponibilites.length > 1 ? "x" : ""} disponible${allIndisponibilites.length > 1 ? "s" : ""}`;
    allIndisponibilites.forEach(indispo => addBlockToList(indispo, blockListElement));
}

function addBlockToList(indispo, selector) {
    const globalDiv = document.createElement("div");
    globalDiv.classList.add("dispo-table-row");
    globalDiv.setAttribute("data-id", indispo.heureDebut);

    const spanCourt = document.createElement("span");
    spanCourt.classList.add("block-court");
    const lowerCourtType = indispo.court.type.toLowerCase();
    spanCourt.innerText = `${indispo.court.nom} · ${lowerCourtType.charAt(0).toUpperCase() + lowerCourtType.slice(1)}`;

    const spanDate = document.createElement("span");
    spanDate.classList.add("block-date");
    spanDate.innerText = formatLongDate(indispo.date);
    
    const spanHours = document.createElement("span");
    spanHours.classList.add("block-hours");
    spanHours.innerText = `${parseInt(indispo.heureDebut)}h - ${parseInt(indispo.heureDebut) + 1}h`;
    
    const spanReason = document.createElement("span");
    spanReason.classList.add("block-reason");
    spanReason.innerText = indispo.raison;

    const spanAdmin = document.createElement("span");
    spanAdmin.classList.add("admin-actions");
    const unblockBtn = document.createElement("button");
    unblockBtn.type = "button";
    unblockBtn.classList.add("btn-outline", "btn-small", "delete-btn");
    unblockBtn.innerText = "Débloquer";
    spanAdmin.appendChild(unblockBtn);

    globalDiv.appendChild(spanCourt);
    globalDiv.appendChild(spanDate);
    globalDiv.appendChild(spanHours);
    globalDiv.appendChild(spanReason);
    globalDiv.appendChild(spanAdmin);

    selector.appendChild(globalDiv);
}

const hoursParent = document.getElementById("admin-slot-grid");
const disponibilityModal = document.getElementById("block-modal-overlay");
const blockHoursForm = document.getElementById("block-form");
const unlockModal = document.getElementById("unblock-modal-overlay");
const blockList = document.getElementById("dispo-list");

hoursParent.addEventListener("click", event => {
    if (event.target.classList.contains("slot-blockable")) openDisponobilityModal(event.target);
    if (event.target.classList.contains("slot-unblockable")) openUnlockModal(event.target);
    if (event.target.classList.contains("slot-reason")) openUnlockModal(event.target.parentElement);
});

disponibilityModal.addEventListener("click", event => {
    if (event.target.classList.contains("modal-overlay") || event.target.classList.contains("modal-close") || event.target.id === "block-form-cancel") disponibilityModal.hidden = true;
});

unlockModal.addEventListener("click", event => {
    if (event.target.classList.contains("modal-overlay") || event.target.classList.contains("modal-close") || event.target.id === "unblock-form-cancel") unlockModal.hidden = true;
});

blockList.addEventListener("click", event => {
    if (event.target.classList.contains("delete-btn")) openUnlockModalViaList(event.target.parentElement.parentElement);
});

blockHoursForm.addEventListener("submit", async event => {
	event.preventDefault();
	const dataForm = Object.fromEntries(new FormData(blockHoursForm));
    const targetCourtId = disponibilityModal.querySelector("#block-form-court-label").getAttribute("data-court-id");
    const targetCourt = disponibilityModal.querySelector("#block-form-court-label").innerText.split(" · ");
    const date = document.querySelector(".date-pill.selected").getAttribute("data-date");
    const targetHours = disponibilityModal.querySelector("#block-form-slot-label").getAttribute("data-heure");
    blockHoursForm.reset();
    disponibilityModal.hidden = true;

    const infos = {
        courtId: parseInt(targetCourtId),
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

    allIndisponibilites.push({
        courtId: infos.courtId,
        date: infos.date,
        heureDebut: infos.heureDebut,
        raison: infos.raison,
        court: {
            nom: targetCourt[0],
            type: targetCourt[1]
        }
    });
    allIndisponibilites.sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();

        if (dateA !== dateB) return dateA - dateB;
        return a.heureDebut - b.heureDebut;
    });
    renderGrid();
    loadBlockList();
});
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
    const allIndisponibilitesList = Array.from(document.querySelectorAll(".dispo-table-row"));
    const targetLine = allIndisponibilitesList.find(item => {
        const courtId = item.querySelector(".block-court");
        const date = item.querySelector(".block-date");
        const startHour = item.querySelector(".block-hours");
        return courtId.getAttribute("data-court") === activeCourt.getAttribute("data-court-id") && date.getAttribute("data-date") === document.querySelector(".date-pill.selected").getAttribute("data-date") && startHour.getAttribute("data-heure") === targetElement.getAttribute("data-heure");
    });
    openUnlockModalViaList(targetLine);
}

function openUnlockModalViaList(targetElement) {
    unlockModal.querySelector("#unblock-info-court").innerText = targetElement.querySelector(".block-court").innerText;
    unlockModal.querySelector("#unblock-info-court").setAttribute("data-court", targetElement.querySelector(".block-court").getAttribute("data-court"));
    unlockModal.querySelector("#unblock-info-date").innerText = targetElement.querySelector(".block-date").innerText;
    unlockModal.querySelector("#unblock-info-date").setAttribute("data-date", targetElement.querySelector(".block-date").getAttribute("data-date"));
    unlockModal.querySelector("#unblock-info-heure").innerText = targetElement.querySelector(".block-hours").innerText;
    unlockModal.querySelector("#unblock-info-heure").setAttribute("data-heure", targetElement.querySelector(".block-hours").getAttribute("data-heure"));
    unlockModal.querySelector("#unblock-info-raison").innerText = targetElement.querySelector(".block-reason").innerText;
    unlockModal.querySelector("#unblock-info-raison").setAttribute("data-raison", targetElement.querySelector(".block-reason").getAttribute("data-raison"));
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

    const spanCourt = document.createElement("span");
    spanCourt.classList.add("block-court");
    const lowerCourtType = indispo.court.type.toLowerCase();
    spanCourt.innerText = `${indispo.court.nom} · ${lowerCourtType.charAt(0).toUpperCase() + lowerCourtType.slice(1)}`;
    spanCourt.setAttribute("data-court", indispo.courtId);
    spanCourt.setAttribute("data-type", lowerCourtType);

    const spanDate = document.createElement("span");
    spanDate.classList.add("block-date");
    spanDate.innerText = formatLongDate(indispo.dateDebut);
    spanDate.setAttribute("data-date", formatDate(new Date(indispo.dateDebut)));
    
    const spanHours = document.createElement("span");
    spanHours.classList.add("block-hours");
    spanHours.innerText = `${new Date(indispo.dateDebut).getHours()}h - ${new Date(indispo.dateDebut).getHours() + 1}h`;
    spanHours.setAttribute("data-heure", new Date(indispo.dateDebut).getHours());
    
    const spanReason = document.createElement("span");
    spanReason.classList.add("block-reason");
    spanReason.innerText = indispo.raison;
    spanReason.setAttribute("data-raison", indispo.raison);

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

function showModalStatus(formElement, message, type) {
    const statusEl = formElement.querySelector(".modal-status");
    if (!statusEl) return;

    statusEl.textContent = message;
    
    if (type === "error" || type === "success") statusEl.className = `modal-status ${type}`;
    statusEl.hidden = type === "error" || type === "success";
}

const hoursParent = document.getElementById("admin-slot-grid");

const disponibilityModal = document.getElementById("block-modal-overlay");
const blockHoursForm = document.getElementById("block-form");
const unlockModal = document.getElementById("unblock-modal-overlay");
const blockList = document.getElementById("dispo-list");
const unblockHoursForm = document.getElementById("unblock-form");

const recuringModalBtn = document.getElementById("open-recurring-modal");
const recuringModal = document.getElementById("recurring-modal-overlay");
const recuringForm = document.getElementById("recurring-form");

const dayPills = document.querySelectorAll(".weekday-pill");
const radioOptions = document.querySelectorAll('input[name="recurrenceEnd"]');
const dateLimit = document.getElementById("recurring-end-date");
const occurences = document.getElementById("recurring-occurrences");

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
    const startDate = new Date(date);
    startDate.setHours(parseInt(targetHours), 0, 0, 0);
    blockHoursForm.reset();
    disponibilityModal.hidden = true;

    const infos = {
        courtId: parseInt(targetCourtId),
        dateDebut: startDate,
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
        dateDebut: infos.dateDebut,
        raison: infos.raison,
        court: {
            nom: targetCourt[0],
            type: targetCourt[1]
        }
    });
    allIndisponibilites.sort((a, b) => new Date(a.dateDebut).getTime() - new Date(b.dateDebut).getTime());
    renderGrid();
    loadBlockList();
});

unblockHoursForm.addEventListener("submit", async event => {
    event.preventDefault();
    const courtId = unlockModal.querySelector("#unblock-info-court").getAttribute("data-court");
    const date = unlockModal.querySelector("#unblock-info-date").getAttribute("data-date");
    const startHour = unlockModal.querySelector("#unblock-info-heure").getAttribute("data-heure");
    const startDate = new Date(date);
    startDate.setHours(parseInt(startHour), 0, 0, 0);

    try {
        const deleteBlock = await fetch("/api/reserveCourt/deleteBlock", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ courtId, startDate })
        });

        if (!deleteBlock.ok) {
            showModalStatus(unblockHoursForm, "Impossible de débloquer ce créneau.", "error");
            return;
        }

        allIndisponibilites = allIndisponibilites.filter(indispo => {
            const isTarget = indispo.courtId === parseInt(courtId) && indispo.dateDebut === startDate;
            return !isTarget;
        });
        renderGrid();
        loadBlockList();
        unlockModal.hidden = true;
    } catch (error) {
        showModalStatus(unblockHoursForm, error, "error");
    }
});

recuringModalBtn.addEventListener("click", () => {
    recuringModal.hidden = false;
    document.body.style.overflow = "hidden";
});

recuringModal.addEventListener("click", event => {
    if (event.target.classList.contains("modal-overlay") || event.target.classList.contains("modal-close") || event.target.id === "recurring-modal-cancel") {
        recuringModal.hidden = true;
        document.body.style.overflow = "";
    }
});

dayPills.forEach(pill => {
    pill.onclick = () => {
        if (pill.classList.contains("selected")) pill.classList.remove("selected");
        else pill.classList.add("selected");
    }
});

radioOptions.forEach(option => {
    option.addEventListener("change", event => {
        if (event.target.value === "on-date") {
            dateLimit.disabled = false;
            occurences.disabled = true;
        } else if (event.target.value === "after-count") {
            dateLimit.disabled = true;
            occurences.disabled = false;
        }
    });
});

recuringForm.addEventListener("submit", async event => {
    event.preventDefault();
    showModalStatus(recuringForm, "", "none");

	const dataForm = Object.fromEntries(new FormData(recuringForm));
    const selectedPills = document.querySelectorAll(".weekday-pill.selected");
    const joursSelectionnes = Array.from(selectedPills).map(pill => pill.dataset.day);
    dataForm.jours = joursSelectionnes;

    if (joursSelectionnes.length === 0) {
        showModalStatus(recuringForm, "Veuillez sélectionner au moins un jour de la semaine.", "error");
        return;
    }
    if (parseInt(dataForm.heureDebut) >= parseInt(dataForm.heureFin)) {
        showModalStatus(recuringForm, "L'heure de fin doit être postérieure à l'heure de début.", "error");
        return;
    }
    if (!dataForm.occurrences && !dataForm.dateFin) {
        showModalStatus(recuringForm, "Veuillez sélectionner la date de fin ou une occurence", "error");
        return;
    }
    
    try {
        const postRecuringBlock = await fetch("/api/reserveCourt/recuringBlock", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dataForm)
        });
        const recuringBlockList = await postRecuringBlock.json();

        if (!postRecuringBlock.ok) {
            alert("Impossible de bloquer ces créneaux.");
            return;
        }

        const targetCourtSelect = document.getElementById("recurring-court");
        const courtText = targetCourtSelect.options[targetCourtSelect.selectedIndex].text.split(" · ");

        if (recuringBlockList.toPushToPrisma) {
            recuringBlockList.toPushToPrisma.forEach(block => {
                allIndisponibilites.push({
                    courtId: block.courtId,
                    dateDebut: block.dateDebut,
                    raison: block.raison,
                    court: {
                        nom: courtText[0],
                        type: courtText[1]
                    }
                });
            });

            allIndisponibilites.sort((a, b) => new Date(a.dateDebut).getTime() - new Date(b.dateDebut).getTime());

            renderGrid();
            loadBlockList();
        }

        recuringForm.reset();
        recuringModal.hidden = true;
        document.body.style.overflow = "";
    } catch (error) {
        showModalStatus(recuringForm, error, "error");
    }
});
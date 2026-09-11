function openModel(targetElement) {
    const activeCourt = document.querySelector(".court-option.selected");
    disponibilityModal.querySelector("#block-form-court-label").innerText = `${activeCourt.querySelector(".name").innerText} · ${activeCourt.querySelector(".type").innerText}`;
    disponibilityModal.querySelector("#block-form-court-label").setAttribute("data-court-id", activeCourt.getAttribute("data-court-id"));
    disponibilityModal.querySelector("#block-form-slot-label").innerText = targetElement.innerText;
    disponibilityModal.querySelector("#block-form-slot-label").setAttribute("data-heure",targetElement.getAttribute("data-heure"));
    disponibilityModal.hidden = false;
}

function loadDates() {
    const todayDate = new Date(Date.now());
    const dateOptions = {weekday: "long", day: "numeric", month: "long"};
    datePicker.innerHTML = "";
    for (let i = 0; i < 7; i++) {
        const formatedDate = new Date(todayDate);
        formatedDate.setDate(formatedDate.getDate() + i);
        const formatedLongDate = formatedDate.toLocaleDateString("fr-FR", dateOptions);
        const splitLongDate = formatedLongDate.split(" ");

        const globalDiv = document.createElement("div");
        globalDiv.classList.add("date-pill");
        if (i === 0) globalDiv.classList.add("selected");

        const yyyy = formatedDate.getFullYear();
        const mm = String(formatedDate.getMonth() + 1).padStart(2, '0');
        const dd = String(formatedDate.getDate()).padStart(2, '0');
        globalDiv.setAttribute("data-date", `${yyyy}-${mm}-${dd}`);
        globalDiv.innerHTML = `<span class="d">${splitLongDate[0].charAt(0).toUpperCase() + splitLongDate[0].slice(1, 3)} ${splitLongDate[1]}</span>${splitLongDate[2].slice(0, 4)}.`;

        datePicker.appendChild(globalDiv);
    }
}

async function getIndisponibilite() {
	try {
		const res = await fetch("/api/reserveCourt/all", {
			method: "GET",
			headers: { "Content-Type": "application/json" }
		});
		const data = await res.json();
        return data;
	} catch(error) {
		console.error(error);
	}
}

function loadIndisponibilite(indisponibilite) {
    const formatedDate = indisponibilite.date.split("T")[0];
    if (parseInt(document.querySelector(".court-option.selected").getAttribute("data-court-id")) === indisponibilite.courtId && document.querySelector(".date-pill.selected").getAttribute("data-date") === formatedDate) {
        const targetBtn = document.querySelector(`button[data-heure="${indisponibilite.heureDebut}"]`);
        const formatedDiv = document.createElement("div");
        formatedDiv.classList.add("slot", "unavailable", "slot-unblockable");
        formatedDiv.setAttribute("data-id", indisponibilite.heureDebut);
        formatedDiv.title = "Cliquer pour débloquer";
        formatedDiv.innerHTML = `
            ${targetBtn.innerText}
            <span class="slot-reason">${indisponibilite.raison}</span>
        `;
        targetBtn.replaceWith(formatedDiv);
    }
}

function renderGrid() {
    const courtId = parseInt(document.querySelector(".court-option.selected").getAttribute("data-court-id"));
    const date = document.querySelector(".date-pill.selected").getAttribute("data-date");
    const todayIndisponibility = allIndisponibilites.filter(indispo => indispo.courtId === courtId && indispo.date.split("T")[0] === date);
    const todayIndisponibilityHours = todayIndisponibility.map(item => item.heureDebut);

    updateGridHeader(courtId, date);
    hoursParent.innerHTML = "";

    for (const hour of HOURS) {
        if (todayIndisponibilityHours.includes(hour)) {
            const indisponibilite = todayIndisponibility.find(indispo => indispo.heureDebut === hour);
            const formatedDiv = document.createElement("div");
            formatedDiv.classList.add("slot", "unavailable", "slot-unblockable");
            formatedDiv.setAttribute("data-id", indisponibilite.heureDebut);
            formatedDiv.title = "Cliquer pour débloquer";
            formatedDiv.innerHTML = `
                ${hour}h - ${hour + 1}h
                <span class="slot-reason">${indisponibilite.raison}</span>
            `;
            hoursParent.appendChild(formatedDiv);
        } else {
            const formatedBtn = document.createElement("button");
            formatedBtn.type = "button";
            formatedBtn.classList.add("slot", "slot-blockable");
            formatedBtn.setAttribute("data-heure", hour);
            formatedBtn.innerText = `${hour}h - ${hour + 1}h`;
            hoursParent.appendChild(formatedBtn);
        }
    }
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
const datePicker = document.querySelector(".date-picker");
const courtPicker = document.querySelector(".booking-panel");

const HOURS = [9, 10, 11, 12, 14, 15, 16, 17, 18, 19, 20, 21];
let allIndisponibilites = [];

document.addEventListener("DOMContentLoaded", async () => {
    loadDates();
    allIndisponibilites = await getIndisponibilite();
    renderGrid();
});

hoursParent.addEventListener("click", event => {
    if (event.target.classList.contains("slot-blockable")) openModel(event.target);
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

datePicker.addEventListener("click", event => {
    if (event.target.classList.contains("date-pill")) {
        datePicker.querySelector(".selected").classList.remove("selected");
        event.target.classList.add("selected");
        renderGrid();
    }
    if (event.target.classList.contains("d")) {
        datePicker.querySelector(".selected").classList.remove("selected");
        event.target.parentElement.classList.add("selected");
        renderGrid();
    }
});

courtPicker.addEventListener("click", event => {
    if (event.target.classList.contains("court-option")) {
        courtPicker.querySelector(".selected").classList.remove("selected");
        event.target.classList.add("selected");
        renderGrid();
    }
});
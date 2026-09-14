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

        globalDiv.setAttribute("data-date", formatDate(formatedDate));
        globalDiv.innerHTML = `<span class="d">${splitLongDate[0].charAt(0).toUpperCase() + splitLongDate[0].slice(1, 3)} ${splitLongDate[1]}</span>${splitLongDate[2].slice(0, 4)}.`;

        datePicker.appendChild(globalDiv);
    }
}

function formatDate(date) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

async function getIndisponibilite() {
	try {
		const res = await fetch("/api/reserveCourt/indispo", {
			method: "GET",
			headers: { "Content-Type": "application/json" }
		});
		const data = await res.json();
        return data;
	} catch(error) {
		console.error(error);
	}
}

async function getBookings() {
	try {
		const res = await fetch("/api/reserveCourt/bookings", {
			method: "GET",
			headers: { "Content-Type": "application/json" }
		});
		const data = await res.json();
        return data;
	} catch(error) {
		console.error(error);
	}
}

function getSlotStates({ courtId, date, bookings, indisponibilites }) {
    const now = new Date(Date.now());
	const isToday = date === formatDate(now);

	return HOURS.map((heure) => {
		if (isToday && heure <= now.getHours()) return { heure, status: "past" };

		const booking = bookings.find((b) => b.courtId === courtId && b.date.split("T")[0] === date && b.heureDebut === heure);
		if (booking) return { heure, status: "taken", booking };

		const indispo = indisponibilites.find((i) => i.courtId === courtId && i.date.split("T")[0] === date && i.heureDebut === heure);
		if (indispo) return { heure, status: "unavailable", indispo };

		return { heure, status: "slot-blockable" };
	});
}

const HOURS = [9, 10, 11, 12, 14, 15, 16, 17, 18, 19, 20, 21];

const datePicker = document.querySelector(".date-picker");
const courtPicker = document.querySelector(".booking-panel");

let allIndisponibilites = [];
let allBookings = [];

document.addEventListener("DOMContentLoaded", async () => {
    loadDates();
    allIndisponibilites = await getIndisponibilite();
    allBookings = await getBookings();
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
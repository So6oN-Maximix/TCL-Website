function loadDates(mondayDate, todayDate) {
    const dateOptions = {weekday: "long", day: "numeric", month: "long"};
    for (let i = 0; i < 7; i++) {
        const formatedDate = new Date(mondayDate);
        formatedDate.setDate(formatedDate.getDate() + i);
        const formatedLongDate = formatedDate.toLocaleDateString("fr-FR", dateOptions);
        const splitLongDate = formatedLongDate.split(" ");

        const globalDiv = document.createElement("div");
        globalDiv.classList.add("date-pill");
        if (formatedDate.getDay() === (todayDate.getDay())) globalDiv.classList.add("selected");
        else if (formatedDate < todayDate) globalDiv.classList.add("past");

        globalDiv.setAttribute("data-date", formatDate(formatedDate));
        globalDiv.innerHTML = `<span class="d">${splitLongDate[0].charAt(0).toUpperCase() + splitLongDate[0].slice(1, 3)} ${splitLongDate[1]}</span>${splitLongDate[2].slice(0, 4)}.`;

        datePicker.appendChild(globalDiv);
    }
}

function loadWeek(mondayDate) {
    const weekHeader = document.getElementById("week-nav-label");
    const startWeekDate = new Date(mondayDate);
    const endWeekDate = new Date(startWeekDate);
    endWeekDate.setDate(mondayDate.getDate() + 6);
    const optionsMois = { month: "long" };
    const moisDebut = startWeekDate.toLocaleDateString("fr-FR", optionsMois);
    const moisFin = endWeekDate.toLocaleDateString("fr-FR", optionsMois);

    if (startWeekDate.getFullYear() !== endWeekDate.getFullYear()) weekHeader.textContent = `${startWeekDate.getDate()} ${moisDebut} ${startWeekDate.getFullYear()} – ${endWeekDate.getDate()} ${moisFin} ${endWeekDate.getFullYear()}`;
    else if (moisDebut !== moisFin) weekHeader.textContent = `${startWeekDate.getDate()} ${moisDebut} – ${endWeekDate.getDate()} ${moisFin} ${startWeekDate.getFullYear()}`;
    else weekHeader.textContent = `${startWeekDate.getDate()} – ${endWeekDate.getDate()} ${moisDebut} ${startWeekDate.getFullYear()}`;
}

function updateWeekUI(today) {
    let todayDate = new Date(today);
    const lastMonday = new Date(todayDate);
    while (lastMonday.getDay() !== 1) lastMonday.setDate(lastMonday.getDate() - 1);

    const realTodayDate = new Date(Date.now());
    const endWeekDate = new Date(lastMonday);
    endWeekDate.setDate(endWeekDate.getDate() + 6);
    if (realTodayDate >= lastMonday && realTodayDate <= endWeekDate) todayDate = new Date(realTodayDate);

    previousWeekBtn.style.visibility = previousBtnVisibility(lastMonday);
    datePicker.innerHTML = "";
    loadWeek(lastMonday);
    loadDates(lastMonday, todayDate);
    datePicker.scrollLeft = 0;
}

function formatDate(date) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

function formatLongDate(date) {
    const dateFormat = new Date(date);
    const dateOptions = {weekday: "long", day: "numeric", month: "long"};
    return dateFormat.toLocaleDateString("fr-FR", dateOptions).split(" ").map(mot => mot.charAt(0).toUpperCase() + mot.slice(1)).join(" ");
}

async function getIndisponibilite(today) {
	try {
		const res = await fetch(`/api/reserveCourt/indispo?today=${today}`, {
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

        const dateFormat = new Date(date);
        dateFormat.setHours(heure, 0, 0, 0);
		const booking = bookings.find((b) => b.courtId === courtId && new Date(b.dateDebut).getTime() === dateFormat.getTime());
		if (booking) return { heure, status: "taken", booking };

		const indispo = indisponibilites.find((i) => i.courtId === courtId && new Date(i.dateDebut).getTime() === dateFormat.getTime());
		if (indispo) return { heure, status: "unavailable", indispo };

		return { heure, status: "slot-blockable" };
	});
}

function previousBtnVisibility(mondayDate) {
    const today = new Date(Date.now());
    const currentMonday = new Date(mondayDate);
    return today >= currentMonday ? "hidden" : "visible";
}

const HOURS = [9, 10, 11, 12, 14, 15, 16, 17, 18, 19, 20, 21];

const previousWeekBtn = document.getElementById("prev-week-btn");
const newtWeekBtn = document.getElementById("next-week-btn");
const datePicker = document.querySelector(".date-picker");
const courtPicker = document.querySelector(".booking-panel");

let allIndisponibilites = [];
let allBookings = [];

document.addEventListener("DOMContentLoaded", async () => {
    updateWeekUI(new Date(Date.now()));
    allIndisponibilites = await getIndisponibilite(new Date(Date.now()));
    allBookings = await getBookings();
    renderGrid();
    loadBlockList();
});

datePicker.addEventListener("click", event => {
    if (event.target.classList.contains("date-pill")) {
        if (event.target.classList.contains("past")) return;
        datePicker.querySelector(".selected").classList.remove("selected");
        event.target.classList.add("selected");
        renderGrid();
        loadBlockList();
    }
    if (event.target.classList.contains("d")) {
        if (event.target.parentElement.classList.contains("past")) return;
        datePicker.querySelector(".selected").classList.remove("selected");
        event.target.parentElement.classList.add("selected");
        renderGrid();
        loadBlockList();
    }
});

courtPicker.addEventListener("click", async event => {
    if (event.target.classList.contains("court-option")) {
        courtPicker.querySelector(".selected").classList.remove("selected");
        event.target.classList.add("selected");
        renderGrid();
        loadBlockList();
    }
});

newtWeekBtn.addEventListener("click", async () => {
    const currentMonday = document.querySelectorAll(".date-pill")[0];
    const nextMondayDate = new Date(currentMonday.getAttribute("data-date"));
    nextMondayDate.setDate(nextMondayDate.getDate() + 7);
    allIndisponibilites = await getIndisponibilite(nextMondayDate);
    updateWeekUI(nextMondayDate);
    renderGrid();
    loadBlockList();
});
previousWeekBtn.addEventListener("click", async () => {
    const currentMonday = document.querySelectorAll(".date-pill")[0];
    const nextMondayDate = new Date(currentMonday.getAttribute("data-date"));
    nextMondayDate.setDate(nextMondayDate.getDate() - 7);
    allIndisponibilites = await getIndisponibilite(nextMondayDate);
    updateWeekUI(nextMondayDate);
    renderGrid();
    loadBlockList();
});
function openModel(targetElement) {
    const activeCourt = document.querySelector(".court-option.selected");
    disponibilityModal.querySelector("#block-form-court-label").innerText = `${activeCourt.querySelector(".name").innerText} · ${activeCourt.querySelector(".type").innerText}`;
    disponibilityModal.querySelector("#block-form-court-label").setAttribute("data-court-id", activeCourt.getAttribute("data-court-id"));
    disponibilityModal.querySelector("#block-form-slot-label").innerText = targetElement.innerText;
    disponibilityModal.querySelector("#block-form-slot-label").setAttribute("data-heure",targetElement.getAttribute("data-heure"));
    disponibilityModal.hidden = false;
}

const hoursParent = document.getElementById("admin-slot-grid");
const disponibilityModal = document.getElementById("block-modal-overlay");
const blockHoursForm = document.getElementById("block-form");

hoursParent.addEventListener("click", (event) => {
    if (event.target.classList.contains("slot-blockable")) openModel(event.target);
});

disponibilityModal.addEventListener("click", (event) => {
    if (event.target.classList.contains("modal-overlay") || event.target.classList.contains("modal-close") || event.target.id === "block-form-cancel") disponibilityModal.hidden = true;
});

blockHoursForm.addEventListener("submit", async (event) => {
	event.preventDefault();
	const dataForm = Object.fromEntries(new FormData(blockHoursForm));
    const targetCourt = disponibilityModal.querySelector("#block-form-court-label").getAttribute("data-court-id");
    const targetHours = disponibilityModal.querySelector("#block-form-slot-label").getAttribute("data-heure");
    blockHoursForm.reset();
    disponibilityModal.hidden = true;

    const res = await fetch("/api/reserveCourt/block", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            courtId: parseInt(targetCourt),
            startHour: parseInt(targetHours),
            raison: dataForm.raison
        })
    });
    const data = await res.json();
});
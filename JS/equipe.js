function addPoste(user, section) {
    const globalDiv = document.createElement("div");
    globalDiv.classList.add("team-card");

    const avatarDiv = document.createElement("div");
    avatarDiv.classList.add("avatar");
    avatarDiv.textContent = user["prenom"][0].toUpperCase() + user["nom"][0].toUpperCase();

    const nameDiv = document.createElement("div");
    nameDiv.classList.add("name");
    nameDiv.textContent = user["prenom"] + " " + user["nom"].toUpperCase();

    const roleDiv = document.createElement("div");
    roleDiv.classList.add("role");
    roleDiv.textContent = user["poste"].toLowerCase().split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join("-");

    const emailDiv = document.createElement("div");
    emailDiv.classList.add("email");
    emailDiv.textContent = user["email"];

    globalDiv.appendChild(avatarDiv);
    globalDiv.appendChild(nameDiv);
    globalDiv.appendChild(roleDiv);
    globalDiv.appendChild(emailDiv);

    section.appendChild(globalDiv);
}

const bureauSection = document.getElementById("bureau");
const compoBureauElement = bureauSection.querySelector(".team-grid");
const coachsSection = document.getElementById("coachs");
const compoCoachsElement = coachsSection.querySelector(".team-grid");

document.addEventListener("DOMContentLoaded", async () => {
    try {
		const res = await fetch("/api/users/role?role=ADMIN", {
			method: "GET",
			headers: { "Content-Type": "application/json" }
		});
        const data = await res.json();

        compoBureauElement.innerHTML = "";
        compoCoachsElement.innerHTML = "";

        for (const admin of data) {
            if (admin["poste"] !== "COACH") addPoste(admin, compoBureauElement);
            else addPoste(admin, compoCoachsElement);
        }
    } catch(error) {
        console.error(error);
    }
});
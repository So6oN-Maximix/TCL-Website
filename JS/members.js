function addUserToTable(user, placement) {
    const globalDiv = document.createElement("div");
    globalDiv.classList.add("admin-table-row", "admin-table-row-full");
    globalDiv.setAttribute("data-id", user.id);

    /* NAME AND EMAIL */
    const nameSpan = document.createElement("span");
    nameSpan.innerHTML = `<strong>${user.prenom} ${user.nom.toUpperCase()}</strong><br>`;
    const emailSpan = document.createElement("span");
    emailSpan.classList.add("section-note");
    emailSpan.style.margin = "0";
    emailSpan.textContent = user.email;
    nameSpan.appendChild(emailSpan);

    /* ROLE */
    const roleSpan = document.createElement("div");
    const roleSelect = document.createElement("select");
    roleSelect.classList.add("admin-field");
    roleSelect.setAttribute("data-field", "role");
    const isWaiting = user.role.includes("ATTENTE");
    const userFormattedRole = isWaiting ? "VISITER" : user.role;
    for (const role of ROLES) {
        const roleOption = document.createElement("option");
        roleOption.selected = role === userFormattedRole;
        roleOption.value = role;
        roleOption.textContent = role;
        roleSelect.appendChild(roleOption);
    }
    roleSpan.appendChild(roleSelect);

    /* TEAM ASSIGN */
    const teamSpan = document.createElement("div");
    const teamSelect = document.createElement("select");
    teamSelect.classList.add("admin-field");
    teamSelect.setAttribute("data-field", "teamId");
    const noneOption = document.createElement("option");
    if (isWaiting) noneOption.classList.add("selected");
    noneOption.value = "";
    noneOption.textContent = "— Aucune —";
    teamSelect.appendChild(noneOption);
    for (const team of TEAMS) {
        const isMaleCategory = !team["categorie"].includes("FEMININE");
        if (user.sexe === isMaleCategory) {
            const teamOption = document.createElement("option");
            teamOption.selected = user.teamId === team["id"];
            teamOption.value = team["nom"];
            teamOption.textContent = team["nom"];
            teamSelect.appendChild(teamOption);
        }
    }
    teamSpan.appendChild(teamSelect);

    /* COTISATION ON TIME */
    const cotizSpan = document.createElement("span");
    const cotizLabel = document.createElement("label");
    cotizLabel.style.display = "flex";
    cotizLabel.style.alignItems = "center",
    cotizLabel.style.gap = "6px";
    cotizLabel.style.fontSize = "13px";
    const upToDateInput = document.createElement("input");
    upToDateInput.type = "checkbox";
    upToDateInput.classList.add("admin-field");
    upToDateInput.setAttribute("data-field", "cotisationPayed");
    upToDateInput.checked = user.cotisationPayed;
    cotizLabel.appendChild(upToDateInput);
    cotizLabel.appendChild(document.createTextNode("À jour"));
    cotizSpan.appendChild(cotizLabel);

    /* LICENCE NUMBER */
    const licenceSpan = document.createElement("span");
    const licenceInput = document.createElement("input");
    licenceInput.type = "text";
    licenceInput.classList.add("admin-field");
    licenceInput.setAttribute("data-field", "licence");
    licenceInput.value = user.licence;
    licenceInput.placeholder = "N° Licence";
    licenceSpan.appendChild(licenceInput);

    /* ADMIN ACTIONS */
    const adminActionSpan = document.createElement("span");
    adminActionSpan.classList.add("admin-actions");
    const saveButton = document.createElement("button");
    saveButton.type = "button";
    saveButton.classList.add("btn-outline", "btn-small", "save-btn");
    saveButton.textContent = "Enregistrer";
    adminActionSpan.appendChild(saveButton);
    if (isWaiting) {
        const statusSpan = document.createElement("span");
        statusSpan.classList.add("save-status");
        statusSpan.style.color = "var(--clay)";
        statusSpan.textContent = "En Attente";
        adminActionSpan.appendChild(statusSpan);
    }

    /* GROUPING */
    globalDiv.appendChild(nameSpan);
    globalDiv.appendChild(roleSpan);
    globalDiv.appendChild(teamSpan);
    globalDiv.appendChild(cotizSpan);
    globalDiv.appendChild(licenceSpan);
    globalDiv.appendChild(adminActionSpan);

    placement.appendChild(globalDiv);
}

const ROLES = ["VISITER", "MEMBER", "ADMIN"];
let TEAMS = [];

const addPlayerBtn = document.getElementById("toggle-create-form");
const addPlayerForm = document.getElementById("member-create-form");

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const resTeams = await fetch("/api/teams/all");
        TEAMS = await resTeams.json();

        const resUsers = await fetch("/api/users/all");
        const users = await resUsers.json();
        const usersTable = document.getElementById("members-list");
        usersTable.innerHTML = "";
        for (const user of users) addUserToTable(user, usersTable);

        const createForm = document.getElementById('member-create-form');
        const toggleFormBtn = document.getElementById('toggle-create-form');
        const cancelFormBtn = document.getElementById('cancel-create-form');
        
        toggleFormBtn.addEventListener('click', (e) => {
            createForm.hidden = !createForm.hidden;
            e.stopPropagation();
        });

        cancelFormBtn.addEventListener('click', () => createForm.hidden = true);

        document.addEventListener('click', (e) => {
            if (!createForm.hidden && !createForm.contains(e.target)) createForm.hidden = true;
        });

        createForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const inputs = ["prenom", "nom", "email", "password", "sexe", "role", "licence", "cotisation"];
            let fetchBody = {}
            for (const input of inputs) {
                const inputElement = document.getElementById(`new-${input}`);
                fetchBody[input] = input === "sexe" ? inputElement.value === "true" : (input === "cotisation" ? inputElement.checked : inputElement.value);
            }

            try {
                const response = await fetch("/api/users/add", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(fetchBody)
                });

                if (response.ok) {
                    createForm.reset();
                    createForm.hidden = true;

                    const usersTable = document.getElementById("members-list");
                    const resUsers = await fetch("/api/users/all");
                    const users = await resUsers.json();
                    
                    usersTable.innerHTML = "";
                    for (const user of users) addUserToTable(user, usersTable);
                } else {
                    const errorData = await response.json();
                    alert("Erreur lors de l'ajout : " + (errorData.error || "Erreur inconnue"));
                }
            } catch (error) {
                console.error("Le fetch a échoué. Le serveur tourne-t-il ?", error);
                alert("Impossible de joindre le serveur. Vérifie ton terminal Node.js !");
            }
        });

        const searchInput = document.getElementById("search-input");
        
        searchInput.addEventListener("input", (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const rows = document.querySelectorAll("#members-list .admin-table-row");

            rows.forEach(row => {
                const nameAndEmailText = row.children[0].textContent.toLowerCase();
                if (nameAndEmailText.includes(searchTerm)) {
                    row.style.display = "";
                } else {
                    row.style.display = "none";
                }
            });
        });
    } catch (error) {
        console.error("Error while loading Teams : ", error);
    }
});
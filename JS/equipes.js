function addTeamToTable(team, membersNum) {
    const globalDiv = document.createElement("div");
    globalDiv.classList.add("team-table-row");
    globalDiv.setAttribute("data-id", team.id);

    /* NAME */
    const nameSpan = document.createElement("span");
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.classList.add("admin-field");
    nameInput.setAttribute("data-field", "nom");
    nameInput.value = team.nom;
    nameSpan.appendChild(nameInput);
    
    /* CATEGORIE */
    const categorieSpan = document.createElement("span");
    const categorieInput = document.createElement("input");
    categorieInput.type = "text";
    categorieInput.classList.add("admin-field");
    categorieInput.setAttribute("data-field", "categorie");
    categorieInput.value = team.categorie;
    categorieSpan.appendChild(categorieInput);
    
    /* RESULTS */
    const resultsSpan = document.createElement("span");
    const resultsInput = document.createElement("input");
    resultsInput.type = "text";
    resultsInput.classList.add("admin-field");
    resultsInput.setAttribute("data-field", "results");
    resultsInput.value = team.resultats ? team.resultats : "Aucun résultats";
    resultsSpan.appendChild(resultsInput);

    /* MEMBERS NUMBER */
    const membersSpan = document.createElement("span");
    membersSpan.classList.add("team-member-count");
    membersSpan.textContent = `${membersNum["_count"]["id"]} membre${membersNum["_count"]["id"] > 1 ? "s" : ""}`;

    /* ACTION BUTTONS */
    const buttonsSpan = document.createElement("span");
    buttonsSpan.classList.add("admin-actions");
    const statusSpan = document.createElement("span");
    statusSpan.classList.add("save-status");
    const saveBtn = document.createElement("button");
    saveBtn.type = "button";
    saveBtn.classList.add("btn-outline", "btn-small", "save-btn");
    saveBtn.textContent = "Enregistrer";
    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.classList.add("btn-outline", "btn-small", "delete-btn");
    deleteBtn.textContent = "Supprimer";

    buttonsSpan.appendChild(saveBtn);
    buttonsSpan.appendChild(deleteBtn);
    buttonsSpan.appendChild(statusSpan);

    /* APPEND ELEMENTS */
    globalDiv.appendChild(nameSpan);
    globalDiv.appendChild(categorieSpan);
    globalDiv.appendChild(resultsSpan);
    globalDiv.appendChild(membersSpan);
    globalDiv.appendChild(buttonsSpan);

    document.getElementById("teams-list").appendChild(globalDiv);
}

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const resTeams = await fetch("/api/teams/all");
        const dataTeams = await resTeams.json();
        document.getElementById("teams-list").innerHTML = "";

        dataTeams.forEach(async team => {
            const resMembersNum = await fetch(`/api/teams/number?id=${team.id}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });
            const membersNum = await resMembersNum.json();
            addTeamToTable(team, membersNum);
        });

        const createForm = document.getElementById('team-create-form');
        const toggleFormBtn = document.getElementById('toggle-create-form-team');

        createForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const inputs = ["nom", "categorie", "resultats"];
            let fetchBody = {}
            for (const input of inputs) {
                const inputElement = document.getElementById(`new-${input}`);
                fetchBody[input] = inputElement.value;
            }

            try {
                const response = await fetch("/api/teams/add", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(fetchBody)
                });

                if (response.ok) {
                    createForm.reset();

                    const teamTable = document.getElementById("teams-list");
                    const resTeams = await fetch("/api/teams/all");
                    const teams = await resTeams.json();
                    
                    teamTable.innerHTML = "";
                    teams.forEach(async team => {
                        const resMembersNum = await fetch(`/api/teams/number?id=${team.id}`, {
                            method: "GET",
                            headers: { "Content-Type": "application/json" }
                        });
                        const membersNum = await resMembersNum.json();
                        addTeamToTable(team, membersNum);
                    });
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
            const rows = document.querySelectorAll("#teams-list .team-table-row");

            rows.forEach(row => {
                const teamNameText = row.children[0].querySelector("input").value.toLowerCase();
                const categorieText = row.children[1].querySelector("input").value.toLowerCase();
                if (teamNameText.includes(searchTerm) || categorieText.includes(searchTerm)) {
                    row.style.display = "";
                } else {
                    row.style.display = "none";
                }
            });
        });
    } catch(error) {
        console.error("Error while loading teams : ", error);
    }
});
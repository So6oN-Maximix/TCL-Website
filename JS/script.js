function formateDate(date) {
    const dateFormat = new Date(date);
    const dateOptions = { day: "numeric", month: "long", year: "numeric"}
    return dateFormat.toLocaleDateString("fr-FR", dateOptions);
}

function addActualiteToTable(news, selector) {
    const globalDiv = document.createElement("div");
    globalDiv.classList.add("card");

    const tagSpan = document.createElement("span");
    tagSpan.classList.add("tag");
    tagSpan.innerText = news.categorie;

    const titleH = document.createElement("h3");
    titleH.innerText = news.titre;

    const contentP = document.createElement("p");
    contentP.innerText = news.contenu;

    const dateDiv = document.createElement("div");
    dateDiv.classList.add("date");
    dateDiv.innerText = formateDate(new Date(news.datePublication));

    globalDiv.appendChild(tagSpan);
    globalDiv.appendChild(titleH);
    globalDiv.appendChild(contentP);
    globalDiv.appendChild(dateDiv);

    selector.prepend(globalDiv);
}

document.addEventListener("DOMContentLoaded", async () => {
    const res = await fetch("/api/actualites/all", {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    });
    const allNews = await res.json();
    const allNewsSlice = allNews.slice(-3);

    const newsTable = document.querySelector(".cards");
    newsTable.innerHTML = "";
    allNewsSlice.forEach(news => addActualiteToTable(news, newsTable));
});
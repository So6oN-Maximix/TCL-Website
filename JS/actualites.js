function addToNewsList(date, title, tag, content, selector) {
    const globalDiv = document.createElement("div");
    globalDiv.classList.add("card");

    const dateDiv = document.createElement("div");
    dateDiv.classList.add("date");
    dateDiv.innerText = formateDate(new Date(date));

    const infoDiv = document.createElement("div");
    const tagSpan = document.createElement("span");
    tagSpan.classList.add("tag");
    tagSpan.innerText = tag.charAt(0) + tag.slice(1);
    const titleH = document.createElement("h3");
    titleH.innerText = title;
    const contentP = document.createElement("p");
    contentP.innerText = content;

    infoDiv.appendChild(tagSpan);
    infoDiv.appendChild(titleH);
    infoDiv.appendChild(contentP);
    globalDiv.appendChild(dateDiv);
    globalDiv.appendChild(infoDiv);
    selector.prepend(globalDiv);
}

function formateDate(date) {
    const dateFormat = new Date(date);
    const dateOptions = { day: "numeric", month: "long", year: "numeric"}
    return dateFormat.toLocaleDateString("fr-FR", dateOptions);
}

function loadNews(allNews) {
    const newsList = document.querySelector(".cards.stacked");
    newsList.innerHTML = "";
    allNews.forEach(news => addToNewsList(news.datePublication, news.titre, news.categorie, news.contenu, newsList))
}
 
function applyNewsFilter() {
	const cards = document.querySelectorAll(".cards.stacked .card");
 
	cards.forEach((card) => {
		const cardTag = card.querySelector(".tag")?.textContent.trim();
		const show = activeNewsFilter === "Toutes" || cardTag === activeNewsFilter;
		card.style.display = show ? "" : "none";
	});
}

const btnAddNews = document.getElementById("btn-add-news");
const modalNews = document.getElementById("add-news-modal-overlay");
const formNews = document.getElementById("add-news-form");
const errorEl = document.getElementById("add-news-status");

let activeNewsFilter = "Toutes";
 
document.querySelectorAll(".filter-tag").forEach((tagBtn) => {
	tagBtn.addEventListener("click", () => {
		document.querySelectorAll(".filter-tag").forEach((t) => t.classList.remove("active"));
		tagBtn.classList.add("active");
 
		activeNewsFilter = tagBtn.textContent.trim();
		applyNewsFilter();
	});
});

document.addEventListener("DOMContentLoaded", async () => {
    const rawUser = localStorage.getItem("user");
    if (rawUser) {
        const user = JSON.parse(rawUser);
        if (user.role === "ADMIN") {
            btnAddNews.hidden = false;
        }
    }

    const res = await fetch("/api/actualites/all", {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    });
    const allNews = await res.json();
    loadNews(allNews);
});

btnAddNews.addEventListener("click", () => modalNews.hidden = false);

modalNews.addEventListener("click", event => {
    if (event.target.classList.contains("modal-overlay") || event.target.classList.contains("modal-close") || event.target.id === "add-news-modal-cancel") modalNews.hidden = true;
});

formNews.addEventListener("submit", async event => {
    event.preventDefault();
    errorEl.style.display = "none";

    const title = formNews.elements["news-title"].value;
    const tag = formNews.elements["news-tag"].value;
    const content = formNews.elements["news-content"].value;

    if (!title || !content) {
        showError("Merci de remplir tous les champs.");
        return;
    }

    const newsList = document.querySelector(".cards.stacked");
    const res = await fetch("/api/actualites/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            titre: title,
            contenu: content,
            categorie: tag,
            adminId: parseInt(JSON.parse(localStorage.getItem("user")).id)
        })
    });
    addToNewsList(new Date(Date.now()), title, tag, content, newsList);

    formNews.reset();
    modalNews.hidden = true;

	function showError(message, isInfo = false) {
		errorEl.textContent = message;
		errorEl.style.color = isInfo ? "var(--court-green)" : "var(--clay)";
		errorEl.style.display = "block";
	}
})
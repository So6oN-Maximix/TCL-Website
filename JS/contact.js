function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast-notification";
    toast.innerText = message;
    
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add("show"), 10);
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

document.getElementById("contact-form").addEventListener("submit", async event => {
	event.preventDefault();

	const nom = document.getElementById("contact-nom").value.trim();
	const email = document.getElementById("contact-email").value.trim();
	const message = document.getElementById("contact-message").value.trim();
	const sujet = document.getElementById("contact-sujet").options[document.getElementById("contact-sujet").selectedIndex].text;
	const errorEl = document.getElementById("contact-error");
	const successEl = document.getElementById("contact-success");

	errorEl.style.display = "none";
	successEl.style.display = "none";

	if (!nom || !email || !message) {
		errorEl.textContent = "Merci de remplir tous les champs.";
		errorEl.style.display = "block";
		return;
	}

	await fetch("/api/contact/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
			nom: nom,
			email: email,
			sujet: sujet,
			message: message
		})
	});

	showToast("Votre message a bien été pris en compte, nous revenons vers vous rapidement.");
	successEl.style.display = "block";
	document.getElementById("contact-form").reset();
});
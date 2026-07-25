document.getElementById('contact-form').addEventListener('submit', (e) => {
	e.preventDefault();

	const nom = document.getElementById('contact-nom').value.trim();
	const email = document.getElementById('contact-email').value.trim();
	const message = document.getElementById('contact-message').value.trim();
	const errorEl = document.getElementById('contact-error');
	const successEl = document.getElementById('contact-success');

	errorEl.style.display = 'none';
	successEl.style.display = 'none';

	if (!nom || !email || !message) {
		errorEl.textContent = 'Merci de remplir tous les champs.';
		errorEl.style.display = 'block';
		return;
	}

	successEl.textContent = 'Votre message a bien été pris en compte, nous revenons vers vous rapidement.';
	successEl.style.display = 'block';
	document.getElementById('contact-form').reset();
});
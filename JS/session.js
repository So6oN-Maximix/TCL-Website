document.addEventListener('DOMContentLoaded', () => {
	const accountLink = document.getElementById('nav-account-link');
	if (!accountLink) return;

	const raw = localStorage.getItem('user');
	if (!raw) return;

	let user;
	try {
		user = JSON.parse(raw);
	} catch {
		return;
	}

	if (user?.prenom) {
		accountLink.textContent = "Mon Compte";
		accountLink.href = '/profil';
	}

	const token = localStorage.getItem('token');
	if (!token) return;

	fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
		.then((res) => {
			if (!res.ok) {
				localStorage.removeItem('token');
				localStorage.removeItem('user');
				accountLink.textContent = 'Connexion';
				accountLink.href = '/connexion';
			}
		})
		.catch(() => {});
});
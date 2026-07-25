const navToggle = document.getElementById('nav-toggle');
const navCollapsible = document.getElementById('nav-collapsible');

if (navToggle && navCollapsible) {
	navToggle.addEventListener('click', () => {
		const isOpen = navCollapsible.classList.toggle('open');
		navToggle.classList.toggle('open', isOpen);
		navToggle.setAttribute('aria-expanded', isOpen);
	});
}
const menuToggle = document.querySelector('.menu-toggle');
const mainNavigation = document.getElementById('main-navigation');

if (menuToggle && mainNavigation) {
  menuToggle.addEventListener('click', function () {
    const terbuka = mainNavigation.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(terbuka));
    menuToggle.setAttribute('aria-label', terbuka ? 'Tutup navigasi' : 'Buka navigasi');
  });

  const navigationLinks = document.querySelectorAll('.main-nav .nav-item');
  navigationLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      mainNavigation.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Buka navigasi');
    });
  });
}

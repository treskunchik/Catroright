const menu = document.getElementById('menu');
const collections = document.getElementById('collections');
const darker = document.getElementById('darker');

function isMobile() {
  return window.matchMedia('(max-width: 674px)').matches;
}

function closeMobileMenu() {
  collections.style.left = '-100%';
  document.body.style.overflow = '';
  darker.style.display = 'none';
}

function resetToDesktopMode() {
  collections.style.left = '';
  collections.style.position = '';
  document.body.style.overflow = '';
  darker.style.display = 'none';
}

menu.addEventListener('click', function () {
  if (isMobile()) {
    if (collections.style.left === '-100%' || collections.style.left === '') {
      collections.style.left = '0%';
      document.body.style.overflow = 'hidden';
      darker.style.display = 'block';
      darker.style.backgroundColor = 'rgba(43, 48, 51, 0.8)';
    } else {
      closeMobileMenu();
    }
  }
});

darker.addEventListener('click', closeMobileMenu);

function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

window.addEventListener('resize', debounce(() => {
  if (!isMobile()) {
    resetToDesktopMode();
  }
}, 150));

document.addEventListener('click', function(event) {
    if (window.matchMedia('(max-width: 674px)').matches) {
        if (event.target.classList.contains('closeAtClick')) {
            closeMobileMenu();
        }
    }
});
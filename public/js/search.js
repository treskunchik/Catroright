
const main_album = document.getElementById('main_album');
const search_album = document.getElementById('search_album');
const search = document.getElementById('search_input');
const searchResults = document.getElementById('album-container-search');

window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('focus') && urlParams.get('focus') === 'search') {
        const searchInput = document.getElementById('search_input');
        if (searchInput) {
            searchInput.focus();
        }
    }
});

let allWorks = [];
let isLoggedIn = false;

function renderCard(work, isLoggedIn) {
  let downloadElement = '';
  if (isLoggedIn) {
    downloadElement = `
      <a href="/uploads/${work.type}s/${work._id}/${work._id}${work.ext}" download class="btn btn-sm btn-outline-secondary download-link" data-work-id="${work._id}">
        Get it
      </a>
    `;
  } else {
    downloadElement = `
      <a href="login.html" class="btn btn-sm btn-outline-secondary">
        Log in to download
      </a>
    `;
  }

  const authorName = work.author?.username || 'Unknown';

  if (work.images.length === 1) {
    return `
      <div class="col">
        <div class="card shadow-sm">
          <div class="card-img-top" style="
            aspect-ratio: 2 / 1;
            background-image: url('/uploads/${work.type}s/${work._id}/1.jpg');
            background-size: cover;
            background-position: center;
          "></div>
          <div class="card-body">
            <h5 class="card-text">${work.title}</h5>
            <p class="card-text">${work.desc}</p>
            <div class="d-flex justify-content-between align-items-center">
              <div class="btn-group">${downloadElement}</div>
              <small class="text-muted">By ${authorName}</small>
            </div>
          </div>
        </div>
      </div>
    `;
  } else if (work.images.length === 2) {
    return `
      <div class="col">
        <div class="card shadow-sm">
          <div class="swiper mySwiper">
            <div class="swiper-wrapper">
              <div class="swiper-slide"><img src="/uploads/${work.type}s/${work._id}/1.jpg"></div>
              <div class="swiper-slide"><img src="/uploads/${work.type}s/${work._id}/2.jpg"></div>
            </div>
            <div class="swiper-button-next"></div>
            <div class="swiper-button-prev"></div>
            <div class="swiper-pagination"></div>
          </div>
          <div class="card-body">
            <h5 class="card-text">${work.title}</h5>
            <p class="card-text">${work.desc}</p>
            <div class="d-flex justify-content-between align-items-center">
              <div class="btn-group">${downloadElement}</div>
              <small class="text-muted">By ${authorName}</small>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  return '';
}

async function logDownload(workId) {
  try {
    await fetch('/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workId })
    });
  } catch (err) {
    console.warn('Failed to log download:', err);
  }
}

function initSearchSwipers() {
  document.querySelectorAll('#album-container-search .mySwiper').forEach(el => {
    if (el.swiper) el.swiper.destroy(true, true);
    new Swiper(el, {
      pagination: { el: el.querySelector('.swiper-pagination'), type: 'fraction' },
      navigation: {
        nextEl: el.querySelector('.swiper-button-next'),
        prevEl: el.querySelector('.swiper-button-prev')
      }
    });
  });
}

async function atStart() {
  try {
    const loginRes = await fetch('/enter');
    isLoggedIn = await loginRes.json();

    const worksRes = await fetch('/getWorks');
    const data = await worksRes.json();
    allWorks = Array.isArray(data) ? data : data.works || [];
  } catch (err) {
    console.error('Error in atStart:', err);
  }
}

search.addEventListener('focus', () => {
  main_album.style.display = 'none';
  search_album.style.display = 'block';
});

search.addEventListener('input', () => {
  const query = search.value.trim();
  if (!query) {
    searchResults.innerHTML = '';
    return;
  }

  const q = query.toLowerCase();
  const filtered = allWorks.filter(work =>
    work.title && work.title.toLowerCase().includes(q)
  );

  searchResults.innerHTML = filtered
    .map(work => renderCard(work, isLoggedIn))
    .join('');

  initSearchSwipers();

  searchResults.querySelectorAll('.download-link').forEach(link => {
    link.addEventListener('click', (e) => {
      const workId = e.currentTarget.getAttribute('data-work-id');
      logDownload(workId);
    });
  });
});

search.addEventListener('blur', () => {
  setTimeout(() => {
    if (!search.value.trim()) {
      search_album.style.display = 'none';
      main_album.style.display = 'block';
    }
  }, 150);
});

atStart();
const bestProjectsSection = document.getElementById('bestProjectsSection');
const mainProjectsSection = document.getElementById('mainProjectsSection');
const yourProjectsSection = document.getElementById('yourProjectsSection');
const bestModelsSection = document.getElementById('bestModelsSection');
const mainModelsSection = document.getElementById('mainModelsSection');
const yourModelsSection = document.getElementById('yourModelsSection');

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

async function atStart() {
  let isLoggedIn = false;
  let works = [];
  let currentUserId = null;

  try {
    const resEnter = await fetch('/enter');
    isLoggedIn = await resEnter.json();

    const resWorks = await fetch('/getWorks');
    const data = await resWorks.json();
    works = Array.isArray(data) ? data : data.works;
    currentUserId = data.userId || null;
  } catch (err) {
    console.error('Ошибка загрузки данных:', err);
    return;
  }

  const projects = works.filter(w => w.type === 'project');
  const models = works.filter(w => w.type === 'model');

  const sortedProjects = [...projects].sort((a, b) => b.downloads - a.downloads);
  const sortedModels = [...models].sort((a, b) => b.downloads - a.downloads);

  const bestProjects = sortedProjects.filter(w => w.downloads > 0).slice(0, 10);
  const bestModels = sortedModels.filter(w => w.downloads > 0).slice(0, 10);

  const mainProjects = sortedProjects.slice(bestProjects.length);
  const mainModels = sortedModels.slice(bestModels.length);

  const yourProjects = projects.filter(w => 
    currentUserId && w.author?._id?.toString() === currentUserId.toString()
  );
  const yourModels = models.filter(w => 
    currentUserId && w.author?._id?.toString() === currentUserId.toString()
  );

  bestProjectsSection.innerHTML = bestProjects.map(w => renderCard(w, isLoggedIn)).join('');
  bestModelsSection.innerHTML = bestModels.map(w => renderCard(w, isLoggedIn)).join('');
  mainProjectsSection.innerHTML = mainProjects.map(w => renderCard(w, isLoggedIn)).join('');
  mainModelsSection.innerHTML = mainModels.map(w => renderCard(w, isLoggedIn)).join('');

  yourProjectsSection.innerHTML = (isLoggedIn && yourProjects.length > 0)
    ? yourProjects.map(w => renderCard(w, isLoggedIn)).join('')
    : '<p class="text-muted text-center">It\'s empty</p>';

  yourModelsSection.innerHTML = (isLoggedIn && yourModels.length > 0)
    ? yourModels.map(w => renderCard(w, isLoggedIn)).join('')
    : '<p class="text-muted text-center">It\'s empty</p>';

  document.querySelectorAll('.mySwiper').forEach(el => {
    new Swiper(el, {
      pagination: { el: el.querySelector('.swiper-pagination'), type: 'fraction' },
      navigation: {
        nextEl: el.querySelector('.swiper-button-next'),
        prevEl: el.querySelector('.swiper-button-prev')
      }
    });
  });

  document.querySelectorAll('.download-link').forEach(link => {
    link.addEventListener('click', (e) => {
      const workId = link.getAttribute('data-work-id');
      if (workId) logDownload(workId);
    });
  });
}

atStart();
const LOGIN_PLACE_A = document.getElementById('LOGIN_PLACE_A');
const LOGIN_PLACE_B = document.getElementById('LOGIN_PLACE_B');

async function atStart() {
  try {
    const response = await fetch('/api/me', {
      method: 'GET',
      credentials: "include"
    });
    const data = await response.json();

    if (data.loggedIn) {
      LOGIN_PLACE_A.innerHTML = `
        <div class="dropdown text-end">
          <a href="#" class="link-body-emphasis text-decoration-none dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false" style="display: flex; flex-direction: row; align-items: center;">
            <div class="avatar-initials rounded-circle d-flex align-items-center justify-content-center"
                 style="width: 32px; height: 32px; background-color: #0d6efd; color: white; font-weight: 500; font-size: 14px;">
              ${data.username[0]}
            </div>
            <p class="SHOW_MOBILE" style="margin: 0 8px;">${data.username}</p>
          </a>
          <ul class="dropdown-menu text-small">
            <li><a class="dropdown-item" href="/publish.html">Create work</a></li>
            <li><a class="dropdown-item" href="/settings.html">Settings</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item" href="#" id="sign-out-button">Sign out</a></li>
          </ul>
        </div>
      `;
      LOGIN_PLACE_B.style.display = 'none';

      const signout = document.getElementById('sign-out-button');
      if (signout) {
        signout.addEventListener('click', async function(e) {
          e.preventDefault();
          try {
            const response = await fetch('/logout', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' }
            });
            if (response.ok) {
              window.location.href = '/login.html';
            } else {
              console.error('Logout failed');
            }
          } catch (err) {
            console.error('Network error during logout:', err);
          }
        });
      }

      if (window.location.pathname === '/settings.html') {
        const usernameEl = document.getElementById('username_SET');
        if (usernameEl) usernameEl.value = data.username;
              
        const emailEl = document.getElementById('email_SET');
        if (emailEl) emailEl.value = data.email;
              
        const idEl = document.getElementById('your_id_SET');
        if (idEl) idEl.textContent = data.userId;
      }
    } else {
      console.log('Нет логина');
    }
  } catch (err) {
    console.error('Error!', err);
  }
}

atStart();
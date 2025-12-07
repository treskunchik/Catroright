const usernameDOM = document.getElementById('username');
const passwordDOM = document.getElementById('password');

const loginAccount = document.getElementById('createAccount');

usernameDOM.addEventListener('blur', function(){
    if (usernameDOM.value){
        const validUsernamePattern = /^[a-zA-Z0-9_-]+$/;
        if (usernameDOM.value.length < 4 || usernameDOM.value.length > 16 || !validUsernamePattern.test(usernameDOM.value)) {
            document.getElementById('error-4').textContent = 'Invalid username format';
            this.classList.add('incorrect');
            this.classList.remove('correct');
        } else {
            document.getElementById('error-4').textContent = '';
            this.classList.add('correct');
            this.classList.remove('incorrect');
        }
    } else {
        document.getElementById('error-4').textContent = '';
        this.classList.remove('correct');
        this.classList.remove('incorrect');
    }
});

passwordDOM.addEventListener('blur', function(){
    if (passwordDOM.value){
        this.classList.add('correct');
    } else {
        this.classList.remove('correct');
        this.classList.remove('incorrect');
    }
});

loginAccount.addEventListener('click', async function(){
    if (usernameDOM.classList.contains('correct') && passwordDOM.classList.contains('correct')){
        console.log('Sending');
        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: usernameDOM.value,
                    password: passwordDOM.value
                })
            });

            const data = await response.json();

            if (response.ok) {
                window.location.href = '/index.html';
            } else {
                document.getElementById('error-4').textContent = data.message || 'Login failed';
            }
        } catch(err){
            console.log('Error!', err);
            document.getElementById('error-4').textContent = 'Network error';
        }
    }
});
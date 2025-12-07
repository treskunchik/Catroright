const usernameDOM = document.getElementById('username');
const emailDOM = document.getElementById('email');
const passwordDOM = document.getElementById('password');

const createAccount = document.getElementById('createAccount');

usernameDOM.addEventListener('blur', function(){
    if (usernameDOM.value){
        const validUsernamePattern = /^[a-zA-Z0-9_-]+$/;
        if (usernameDOM.value.length < 4 || usernameDOM.value.length > 16 || !validUsernamePattern.test(usernameDOM.value)){
            document.getElementById('error-1').textContent = 'Use 4 to 16 letters, digits, _ or -';
            usernameDOM.classList.add('incorrect');
            usernameDOM.classList.remove('correct');
        } else {
            document.getElementById('error-1').textContent = '';
            usernameDOM.classList.add('correct');
            usernameDOM.classList.remove('incorrect');
        }
    } else {
        document.getElementById('error-1').textContent = '';
        this.classList.remove('correct');
        this.classList.remove('incorrect');
    }
});

emailDOM.addEventListener('blur', async function(){
    if (emailDOM.value){
        try {
            const response = await fetch('/isTaken', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    item: emailDOM.value,
                    type: 'email'
                })
            })

            const isTaken = await response.json();
            if (isTaken){
                document.getElementById('error-2').textContent = 'Email invalid or taken';
                emailDOM.classList.add('incorrect');
                emailDOM.classList.remove('correct');
            } else if (!isTaken){
                document.getElementById('error-2').textContent = '';
                emailDOM.classList.add('correct');
                emailDOM.classList.remove('incorrect');
            }
        } catch(err){
            console.log('Error!')
        }
    } else {
        document.getElementById('error-2').textContent = '';
        this.classList.remove('correct');
        this.classList.remove('incorrect');
    }
});

passwordDOM.addEventListener('blur', function(){
    if (passwordDOM.value){
        if (passwordDOM.value.length < 8 || passwordDOM.value.length > 64){
            document.getElementById('error-3').textContent = 'Password too short';
            passwordDOM.classList.add('incorrect');
            passwordDOM.classList.remove('correct');
        } else {
            document.getElementById('error-3').textContent = '';
            passwordDOM.classList.add('correct');
            passwordDOM.classList.remove('incorrect');
        }
    } else {
        document.getElementById('error-3').textContent = '';
        this.classList.remove('correct');
        this.classList.remove('incorrect');
    }
})

createAccount.addEventListener('click', async function(){
    if (usernameDOM.classList.contains('correct') && emailDOM.classList.contains('correct') && passwordDOM.classList.contains('correct')){
        try {
            const response = await fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: usernameDOM.value,
                    password: passwordDOM.value,
                    email: emailDOM.value
                })
            });

            if (response.ok) {
                window.location.href = 'index.html';
            }
        } catch(err){
            console.log('Error!')
        }
    } else {

    }
})
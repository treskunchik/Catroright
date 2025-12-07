const username_SET = document.getElementById('username_SET');
const email_SET = document.getElementById('email_SET');
const change_username = document.getElementById('change_username');
const change_email = document.getElementById('change_email');

let startUsername;
let startEmail;

setTimeout(() => {
    startUsername = username_SET.value;
    startEmail = email_SET.value;
}, 56);

username_SET.addEventListener('blur', function(){
    if (username_SET.value){
        const validUsernamePattern = /^[a-zA-Z0-9_-]+$/;
        if ((username_SET.value.length < 4 || username_SET.value.length > 16 || !validUsernamePattern.test(username_SET.value)) && username_SET.value != startUsername){
            document.getElementById('error-5').textContent = 'Use 4 to 16 letters, digits, _ or -';
            username_SET.classList.add('incorrect');
            username_SET.classList.remove('correct');
        } else if (username_SET.value == startUsername){
            document.getElementById('error-5').textContent = '';
            username_SET.classList.remove('correct');
            username_SET.classList.remove('incorrect');
        } else {
            document.getElementById('error-5').textContent = '';
            username_SET.classList.add('correct');
            username_SET.classList.remove('incorrect');
        }
    } else {
        document.getElementById('error-5').textContent = '';
        this.classList.remove('correct');
        this.classList.remove('incorrect');
    }
});

email_SET.addEventListener('blur', async function(){
    if (email_SET.value){
        try {
            const response = await fetch('/isTaken', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    item: email_SET.value,
                    type: 'email'
                })
            })

            const isTaken = await response.json();
            if (isTaken && email_SET.value != startEmail){
                document.getElementById('error-6').textContent = 'Email invalid or taken';
                email_SET.classList.add('incorrect');
                email_SET.classList.remove('correct');
            } else if (isTaken && email_SET.value == startEmail){
                document.getElementById('error-6').textContent = '';
                email_SET.classList.remove('correct');
                email_SET.classList.remove('incorrect');
            } else if (!isTaken){
                document.getElementById('error-6').textContent = '';
                email_SET.classList.add('correct');
                email_SET.classList.remove('incorrect');
            } 
        } catch(err){
            console.log('Error!')
        }
    } else {
        document.getElementById('error-6').textContent = '';
        this.classList.remove('correct');
        this.classList.remove('incorrect');
    }
});

change_username.addEventListener('click', async function(){
    if (username_SET.classList.contains('correct')){
        try {
            const response = await fetch('/change', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    changeItem: 'username',
                    value: username_SET.value
                })
            })

            if (response.ok){
                location.reload();
            }
        } catch(err){
            console.log('Error!')
        }
    }
})

change_email.addEventListener('click', async function(){
    if (email_SET.classList.contains('correct')){
        try {
            const response = await fetch('/change', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    changeItem: 'email',
                    value: email_SET.value
                })
            })

            if (response.ok){
                location.reload();
            }
        } catch(err){
            console.log('Error!')
        }
    }
})

const delete_account = document.getElementById('delete_account');

delete_account.addEventListener('click', async function(){
    try {
        const response = await fetch('/delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        if (response.ok){
            location.reload();
        }
    } catch(err){
        console.log('Error!')
    }
})

async function atStart() {
    try {
        const response = await fetch('/enter');
        const isLoggedIn = await response.json();
        return isLoggedIn;
    } catch (err) {
        return false;
    }
}

atStart().then(isLoggedIn => {
    if (!isLoggedIn){
        window.location.href = 'index.html';
    }
});
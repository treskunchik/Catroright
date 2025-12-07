const titleDOM = document.getElementById('title');
const typeDOM = document.getElementById('type');
const fileDOM = document.getElementById('file');
const coverInput = document.getElementById('coverInput');
const extraInput = document.getElementById('extraInput');
const publishWork = document.getElementById('publishWork');

titleDOM.addEventListener('blur', function(){
    if (this.value !== '' && this.value.length >= 2 && this.value.length <= 24){
        this.classList.remove('incorrect');
        this.classList.add('correct');
        document.getElementById('error-5').textContent = '';
    } else {
        this.classList.remove('correct');
        this.classList.add('incorrect');
        document.getElementById('error-5').textContent = 'Invalid title format';
    }
})

typeDOM.addEventListener('change', function(){
    this.classList.remove('incorrect');
    this.classList.add('correct');
    document.getElementById('error-6').textContent = '';
})

fileDOM.addEventListener('change', function(){
    fileDOM.classList.remove('incorrect');
    fileDOM.classList.add('correct');
    document.getElementById('error-7').textContent = '';
})

coverInput.addEventListener('change', function(){
    if (document.getElementById('error-8').textContent == 'Upload an image'){
        document.getElementById('error-8').textContent = '';
    }
})

publishWork.addEventListener('click', async function(){
    if (titleDOM.value == '' || titleDOM.value.length < 2 || titleDOM.value.length >= 25){
        titleDOM.classList.remove('correct');
        titleDOM.classList.add('incorrect');
        document.getElementById('error-5').textContent = 'Invalid title format';
    } 
    if (typeDOM.value === 'null_type'){
        typeDOM.classList.remove('correct');
        typeDOM.classList.add('incorrect');
        document.getElementById('error-6').textContent = 'Select type';
    }
    if (!fileDOM.files[0]){
        fileDOM.classList.remove('correct');
        fileDOM.classList.add('incorrect');
        document.getElementById('error-7').textContent = 'Select file';
    }
    if (!coverInput.files[0]){
        document.getElementById('error-8').textContent = 'Upload an image';
    }

    if (titleDOM.classList.contains('correct') && typeDOM.classList.contains('correct') & fileDOM.classList.contains('correct') && document.getElementById('error-8').textContent !== 'Upload an image'){
        const formData = new FormData();

        formData.append('title', titleDOM.value);
        formData.append('desc', typeDOM.value ? typeDOM.value[0].toUpperCase() + typeDOM.value.slice(1) : typeDOM.value);
        formData.append('type', typeDOM.value);
        formData.append('author', 'author');
        formData.append('file', fileDOM.files[0]);

        const images = [
            coverInput.files[0], 
            extraInput.files[0]
        ].filter(file => file);

        images.forEach(file => {
            formData.append('images', file);
        })

        try {
            const response = await fetch('/works', {
                method: 'POST',
                body: formData
            })

            if (!response.ok){
                const errorResult = response.json();
                console.log(errorResult);
            }

            const result = response.json();
            console.log(result);
            window.location.href = '/';
        } catch(err) {
            console.log('error: ', err);
        }
    }
})

coverInput.addEventListener('change', function() {
    if (this.files[0]) {
        const imageUrl = URL.createObjectURL(this.files[0]);
        document.getElementById('coverBox').style.backgroundImage = `url(${imageUrl})`;
        document.getElementById('coverBox').style.backgroundSize = 'cover';
        document.getElementById('coverBox').style.backgroundPosition = 'center';
        document.getElementById('coverBox').innerHTML = '<input type="file" id="coverInput" accept="image/*" required>';
    }
});

extraInput.addEventListener('change', function(){
    if (this.files[0]) {
        const imageUrl = URL.createObjectURL(this.files[0]);
        document.getElementById('extraBox').style.backgroundImage = `url(${imageUrl})`;
        document.getElementById('extraBox').style.backgroundSize = 'cover';
        document.getElementById('extraBox').style.backgroundPosition = 'center';
        document.getElementById('extraBox').innerHTML = '<input type="file" id="extraInput" accept="image/*">'
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
        window.location.href = 'login.html';
    }
});
let currentUser = null;
let profiles = [];
let currentCardIndex = 0;

async function initApp() {
    // Загрузка данных
    const response = await fetch('profiles.json');
    profiles = await response.json();
    
    // Проверка профиля пользователя
    currentUser = JSON.parse(localStorage.getItem('userProfile'));
    if(!currentUser) showProfileCreationForm();
    
    renderCards();
}

function renderCards() {
    const container = document.getElementById('card-container');
    container.innerHTML = '';
    
    profiles.forEach((profile, index) => {
        const card = document.createElement('div');
        card.className = 'profile-card';
        card.innerHTML = `
            <img src="${profile.photo}" class="profile-img">
            <h2>${profile.name}, ${profile.age}</h2>
            <p>Доход: $${profile.income}</p>
            <p>Увлечения: ${profile.hobbies.join(', ')}</p>
            <p>Ищет: ${profile.desires.join(', ')}</p>
        `;
        
        if(index === 0) card.style.display = 'block';
        container.appendChild(card);
    });
}

// Логика свайпа
document.querySelector('.like-btn').addEventListener('click', () => {
    handleSwipe(true);
});

document.querySelector('.dislike-btn').addEventListener('click', () => {
    handleSwipe(false);
});

function handleSwipe(isLike) {
    const currentCard = document.querySelector('.profile-card');
    const animation = isLike ? 'swipeRight' : 'swipeLeft';
    
    currentCard.style.animation = `${animation} 0.5s forwards`;
    playSound('swipe.mp3');
    
    if(isLike) checkForMatch(profiles[currentCardIndex]);
    
    currentCardIndex++;
    setTimeout(() => {
        currentCard.remove();
        showNextCard();
    }, 500);
}

function checkForMatch(profile) {
    if(profile.likes.includes(currentUser.id)) {
        playSound('match.mp3');
        showMatchNotification(profile);
    }
}

// Логика создания профиля
function showProfileCreationForm() {
    // Реализация формы
}

// Вспомогательные функции
function playSound(filename) {
    const audio = new Audio(`sounds/${filename}`);
    audio.play();
}
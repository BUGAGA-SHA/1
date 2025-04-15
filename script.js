let currentUser = null;
let profiles = [];
let currentCardIndex = 0;
let currentCard = null;
let nextCard = null;

// Инициализация приложения
async function initApp() {
    // Загрузка профилей
    const response = await fetch('profiles.json');
    profiles = await response.json();
    
    // Проверка профиля пользователя
    currentUser = JSON.parse(localStorage.getItem('userProfile')) || createDefaultProfile();
    
    // Инициализация карточек
    initCards();
    setupEventListeners();
}

function createDefaultProfile() {
    return {
        id: Date.now(),
        name: "Новый пользователь",
        age: 18,
        income: 30000,
        hobbies: [],
        desires: [],
        likes: []
    };
}

// Управление карточками
function initCards() {
    const container = document.getElementById('card-container');
    container.innerHTML = '';
    
    // Создаем первые две карточки
    profiles.slice(currentCardIndex, currentCardIndex + 2).forEach((profile, index) => {
        const card = createCardElement(profile, index === 0);
        container.appendChild(card);
    });
    
    [currentCard, nextCard] = document.querySelectorAll('.profile-card');
}

function createCardElement(profile, isActive) {
    const card = document.createElement('div');
    card.className = `profile-card ${isActive ? 'active' : 'next'}`;
    card.innerHTML = `
        <img src="${profile.photo}" class="profile-img" alt="${profile.name}">
        <div class="profile-info">
            <h2>${profile.name}, ${profile.age}</h2>
            <p>💰 ${profile.income} $/год</p>
            <p>❤️ ${profile.hobbies.join(', ')}</p>
            <p>🎯 ${profile.desires.join(', ')}</p>
        </div>
    `;
    return card;
}

// Обработчики событий
function setupEventListeners() {
    // Кнопки лайков
    document.querySelector('.like-btn').addEventListener('click', () => handleSwipe(true));
    document.querySelector('.dislike-btn').addEventListener('click', () => handleSwipe(false));

    // Свайпы пальцем
    let touchStartX = 0;
    let isDragging = false;
    
    document.addEventListener('touchstart', e => {
        touchStartX = e.touches[0].clientX;
        isDragging = true;
    });

    document.addEventListener('touchmove', e => {
        if (!isDragging || !currentCard) return;
        
        const deltaX = e.touches[0].clientX - touchStartX;
        const rotate = deltaX / 15;
        currentCard.style.transform = `translateX(${deltaX}px) rotate(${rotate}deg)`;
    });

    document.addEventListener('touchend', e => {
        if (!isDragging || !currentCard) return;
        isDragging = false;

        const deltaX = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(deltaX) > 60) {
            handleSwipe(deltaX > 0);
        } else {
            currentCard.style.transform = '';
        }
    });
}

// Обработка свайпов
function handleSwipe(isLike) {
    if (!currentCard) return;

    currentCard.style.transition = 'transform 0.5s ease-out';
    currentCard.classList.add(isLike ? 'swipe-right' : 'swipe-left');
    playSound(isLike ? 'match.mp3' : 'swipe.mp3');

    if (isLike) checkForMatch(profiles[currentCardIndex]);

    setTimeout(() => {
        currentCardIndex++;
        if (currentCardIndex >= profiles.length) handleNoMoreCards();
        else updateCards();
    }, 300);
}

// Обновление карточек
function updateCards() {
    currentCard.remove();
    
    // Создаем новую следующую карточку
    if (currentCardIndex + 1 < profiles.length) {
        const newCard = createCardElement(profiles[currentCardIndex + 1], false);
        document.getElementById('card-container').appendChild(newCard);
    }
    
    [currentCard, nextCard] = document.querySelectorAll('.profile-card');
    nextCard?.classList.add('next');
    currentCard?.classList.add('active');
}

// Проверка совпадений
function checkForMatch(profile) {
    if (profile.likes.includes(currentUser.id)) {
        playSound('match.mp3');
        showMatchNotification(profile);
        saveMatch(profile);
    }
}

function saveMatch(profile) {
    const matches = JSON.parse(localStorage.getItem('matches')) || [];
    matches.push(profile);
    localStorage.setItem('matches', JSON.stringify(matches));
}

// Вспомогательные функции
function playSound(filename) {
    const audio = new Audio(`sounds/${filename}`);
    audio.play();
}

function handleNoMoreCards() {
    document.getElementById('card-container').innerHTML = `
        <div class="no-cards">
            <h2>Больше анкет нет 😢</h2>
            <button onclick="location.reload()">Попробовать снова</button>
        </div>
    `;
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', initApp);

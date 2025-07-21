import { fetchMovies } from '../api/movies.js';

const container = document.getElementById('movie-container');
const btnLeft = document.getElementById('swipe-left');
const btnRight = document.getElementById('swipe-right');
const recommendations = document.getElementById('recommendations');
const loader = document.getElementById('loader');

// Корзина
const basketBtn = document.createElement('button');
basketBtn.textContent = '🛒 Корзина';
basketBtn.className = 'basket-btn';
document.querySelector('.container').insertBefore(basketBtn, recommendations);

const basketModal = document.createElement('div');
basketModal.className = 'basket-modal hidden';
basketModal.innerHTML = `
    <div class="basket-content">
        <h2>Корзина</h2>
        <div class="basket-lists">
            <div>
                <h3>Понравилось</h3>
                <ul id="basket-liked"></ul>
            </div>
            <div>
                <h3>Не понравилось</h3>
                <ul id="basket-disliked"></ul>
            </div>
        </div>
        <button id="close-basket">Закрыть</button>
    </div>
`;
document.body.appendChild(basketModal);

let movies = [];
let currentIndex = 0;
let likedMovies = [];
let dislikedMovies = [];

// Функция перемешивания массива
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function createMovieCard(movie) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.innerHTML = `
        <img src="${movie.poster !== 'N/A' ? movie.poster : 'https://via.placeholder.com/220x320?text=No+Image'}" alt="${movie.title}">
        <h2>${movie.title}</h2>
        <p><b>Год:</b> ${movie.year}</p>
        <p><b>Жанр:</b> ${movie.genre}</p>
        <p><b>IMDb:</b> ${movie.rating}</p>
    `;
    return card;
}

function showMovie(index) {
    container.innerHTML = '';
    if (index >= movies.length) {
        showRecommendations();
        btnLeft.disabled = true;
        btnRight.disabled = true;
        return;
    }
    const card = createMovieCard(movies[index]);
    container.appendChild(card);
}

function showRecommendations() {
    container.innerHTML = '';
    recommendations.classList.remove('hidden');
    if (likedMovies.length === 0) {
        recommendations.innerHTML = `<h2>Вы не выбрали ни одного фильма 😢</h2>`;
    } else {
        recommendations.innerHTML = `
            <h2>Ваши рекомендации:</h2>
            <ul>
                ${likedMovies.map(m => `<li>${m.title} (${m.year})</li>`).join('')}
            </ul>
        `;
    }
}

function swipe(direction) {
    const card = container.querySelector('.movie-card');
    if (!card) return;
    card.classList.add(direction === 'left' ? 'swipe-left' : 'swipe-right');
    if (direction === 'right') likedMovies.push(movies[currentIndex]);
    else dislikedMovies.push(movies[currentIndex]);
    setTimeout(() => {
        currentIndex++;
        showMovie(currentIndex);
    }, 400);
}

btnLeft.addEventListener('click', () => swipe('left'));
btnRight.addEventListener('click', () => swipe('right'));

// Корзина: открыть/закрыть и заполнить списки
basketBtn.addEventListener('click', () => {
    document.getElementById('basket-liked').innerHTML = likedMovies.length
        ? likedMovies.map(m => `<li>${m.title} (${m.year})</li>`).join('')
        : '<li>Нет фильмов</li>';
    document.getElementById('basket-disliked').innerHTML = dislikedMovies.length
        ? dislikedMovies.map(m => `<li>${m.title} (${m.year})</li>`).join('')
        : '<li>Нет фильмов</li>';
    basketModal.classList.remove('hidden');
});
document.getElementById('close-basket').addEventListener('click', () => {
    basketModal.classList.add('hidden');
});

// При загрузке сразу показываем фильмы
window.addEventListener('DOMContentLoaded', async () => {
    loader.style.display = 'block';
    recommendations.classList.add('hidden');
    btnLeft.disabled = true;
    btnRight.disabled = true;
    likedMovies = [];
    dislikedMovies = [];
    currentIndex = 0;

    try {
        movies = await fetchMovies();
        movies = shuffle(movies); // Перемешиваем фильмы
        loader.style.display = 'none';
        btnLeft.disabled = false;
        btnRight.disabled = false;
        showMovie(currentIndex);
    } catch (e) {
        loader.style.display = 'none';
        container.innerHTML = `<p style="color:#f66;">Ошибка загрузки фильмов</p>`;
        btnLeft.disabled = true;
        btnRight.disabled = true;
    }
});
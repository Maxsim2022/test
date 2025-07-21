const API_KEY = 'd6fb16c6'; // бесплатный ключ OMDb

export const fetchMovies = async () => {
    let allMovies = [];
    // Меняйте ключевое слово для разнообразия, например "star", "love", "man", "girl"
    const keywords = ['star', 'love', 'man', 'girl', 'war', 'life'];
    for (let k = 0; k < keywords.length; k++) {
        for (let page = 1; page <= 2; page++) {
            const response = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&s=${keywords[k]}&type=movie&page=${page}`);
            const data = await response.json();
            if (data.Search) {
                const movies = await Promise.all(data.Search.map(async (item) => {
                    const detailsRes = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&i=${item.imdbID}`);
                    const details = await detailsRes.json();
                    return {
                        id: item.imdbID,
                        title: item.Title,
                        poster: item.Poster !== 'N/A' ? item.Poster : 'https://via.placeholder.com/220x320?text=No+Image',
                        year: item.Year || '',
                        genre: details.Genre || '',
                        rating: details.imdbRating || 'Нет оценки'
                    };
                }));
                allMovies = allMovies.concat(movies);
            }
        }
    }
    // Удаляем дубликаты по imdbID
    const unique = {};
    allMovies.forEach(m => unique[m.id] = m);
    return Object.values(unique);
};
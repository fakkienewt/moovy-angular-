const animeParser = require('./content/parse.anime');
const filmParser = require('./content/parse.film');
const serieParser = require('./content/parse.series');
const doramaParser = require('./content/parse.dorama');
const movieParser = require('./content/parse.movie');
const connect = require('./connect');

async function fillDatabase() {
    try {
        connect.initDatabase();

        console.log('заполнение базы...');

        console.log('ПАРСИМ АНИМЕ...');
        let page_anime = 1;
        while (page_anime <= 10) {
            const animeData = await animeParser.parseAnime(page_anime);
            console.log('на странице' + page_anime + ' найдено аниме:', animeData.length);
            await connect.saveAnime(animeData);
            page_anime++;
        }

        console.log('база данных с аниме заполнена!');

        console.log('ПАРСИМ ФИЛЬМЫ...');
        let page_film = 1;
        while (page_film <= 10) {
            const filmData = await filmParser.parseFilms(page_film);
            console.log('на странице:' + page_film + 'найдено фильмов:', filmData.length);
            await connect.saveFilm(filmData);
            page_film++;
        }
        console.log('база данных с фильмами заполнена!');

        console.log('ПАРСИМ СЕРИАЛЫ');
        let page_serie = 1;
        while (page_serie <= 10) {
            const serieData = await serieParser.parseSeries(page_serie);
            console.log('на странице:', page_serie, 'найдено сериалов:', serieData.length);
            await connect.saveSerie(serieData);
            page_serie++;
        }
        console.log('база данных с сериалами заполнена!');

        console.log('ПАРСИМ ДОРАМЫ');
        let page_dorama = 1;
        while (page_dorama <= 10) {
            const doramaData = await doramaParser.parseDorama(page_dorama);
            console.log('на странице:', page_dorama, 'найдено дорам:', doramaData.length);
            await connect.saveDorama(doramaData);
            page_dorama++;
        }
        console.log('база данных с дорамами заполнена!');

        console.log('ПАРСИМ НОВЫЕ ФИЛЬМЫ');
        const movieData = await movieParser.parseMovies();
        console.log('найдено новых фильмов:', movieData.length);
        await connect.saveMovie(movieData);
        console.log('база данных с новыми фильмами заполнена!')

    } catch (error) {
        console.log('ОШИБКА:', error);
        throw error;
    }
}

fillDatabase();

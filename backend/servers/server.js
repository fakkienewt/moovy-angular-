const express = require('express');
const cors = require('cors');
const cheerio = require('cheerio');
const axios = require('axios');

const app = express();
const PORT = 3500;

app.use(cors({
    origin: 'http://localhost:4200'
}));
app.use(express.json());

const axiosConfig = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ru-RU,ru;q=0.8,en-US;q=0.5,en;q=0.3',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
    }
};

function filterRussianContent(items) {
    return items.filter(item => {
        return !item.countries ||
            !item.countries.some(country =>
                country.toLowerCase().includes('россия') ||
                country.toLowerCase().includes('ссср')
            );
    });
}

async function parseNewMovies() {
    try {
        const url = 'https://w140.zona.plus/';
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        const movies = [];

        const items = $('.popularMovies .item').slice(0, 5);

        for (let i = 0; i < items.length; i++) {
            const element = items[i];
            const $el = $(element);

            const poster = $el.find('.cover').css('background-image');
            const movieUrl = $el.find('a').attr('href');
            const title = $el.find('.title').text().trim();

            const ratingText = $el.find('.rating').text().trim();
            const rating = ratingText ? parseFloat(ratingText) : 0;

            const yearText = $el.find('.year').text().trim();
            const year = yearText ? parseInt(yearText) : 2025;

            let description = '';
            let genres = [];
            let countries = [];
            let time = '';
            let premiere = '';
            let director = [];
            let actors = [];
            let author = [];

            if (movieUrl) {
                try {
                    const fullUrl = `https://w140.zona.plus${movieUrl}`;
                    const descResponse = await axios.get(fullUrl, axiosConfig);
                    const desc$ = cheerio.load(descResponse.data);

                    description = desc$('.entity-desc-description').text().trim();

                    desc$('.entity-desc-item-wrap').each((index, item) => {
                        const $item = desc$(item);
                        const label = $item.find('.entity-desc-item').text().trim();

                        if (label === 'Жанры') {
                            genres = $item.find('.entity-desc-link-u')
                                .slice(0, 3)
                                .map((i, el) => desc$(el).text().trim())
                                .get();
                        }

                        if (label === 'Страна' || label === 'Страны') {
                            countries = $item.find('.entity-desc-link-u')
                                .map((i, el) => desc$(el).text().trim())
                                .get();
                        }
                    });

                    time = desc$('.entity-desc-item:contains("Время") + .entity-desc-value time').text().trim();

                    const premiereBlock = desc$('.entity-desc-item:contains("Премьера") + .entity-desc-value');
                    if (premiereBlock.length) {
                        const worldPremiere = premiereBlock.find('span').first().text().trim();
                        premiere = worldPremiere.split('в мире')[0].trim();
                    }

                    director = [];
                    desc$('.entity-desc-item:contains("Режиссёр") + .entity-desc-value [itemprop="director"] [itemprop="name"]').each((index, el) => {
                        director.push(desc$(el).text().trim());
                    });


                    actors = [];
                    desc$('.entity-desc-item:contains("Актёры") + .entity-desc-value [itemprop="actor"] [itemprop="name"]').slice(0, 3).each((index, el) => {
                        actors.push(desc$(el).text().trim());
                    });

                    author = [];
                    desc$('.entity-desc-item:contains("Сценарий") + .entity-desc-value [itemprop="author"] [itemprop="name"]').each((index, el) => {
                        author.push(desc$(el).text().trim());
                    });

                } catch (error) {
                    console.log('Ошибка:', error.message);
                }
            }

            movies.push({
                index: i,
                poster: poster,
                url: movieUrl ? `https://w140.zona.plus${movieUrl}` : null,
                title: title,
                rating: rating,
                year: year,
                description: description,
                genres: genres,
                countries: countries,
                time: time,
                premiere: premiere,
                director: director,
                actors: actors,
                author: author
            });
        }

        return filterRussianContent(movies);

    } catch (error) {
        console.error('Ошибка:', error.message);
        throw error;
    }
}

async function parseFilms(page = 1) {
    try {
        let url = `http://w140.zona.plus/movies?page=${page}`;
        const response = await axios.get(url, axiosConfig);
        const $ = cheerio.load(response.data);
        const films = [];

        const items = $('.results-item-wrap').slice(0, 22);

        for (let i = 0; i < items.length; i++) {
            const element = items[i];
            const $el = $(element);

            const title = $el.find('.results-item-title').text().trim();
            const url = $el.find('.results-item').attr('href');

            const posterStyle = $el.find('.result-item-preview').css('background-image');
            let poster = null;

            if (posterStyle) {
                const matches = posterStyle.match(/url\(['"]?(.*?)['"]?\)/);
                if (matches && matches[1]) {
                    poster = matches[1].split(',')[0];
                }
            }

            const ratingText = $el.find('.results-item-rating span').text().trim();
            const rating = ratingText ? parseFloat(ratingText) : 0;

            const yearText = $el.find('.results-item-year').text().trim();
            const year = yearText ? parseInt(yearText) : 2025;

            let description = '';
            let genres = [];
            let countries = [];
            let time = '';
            let premiere = '';
            let director = [];
            let actors = [];
            let author = [];

            if (url) {
                try {
                    const fullUrl = `https://w140.zona.plus${url}`;
                    const descResponse = await axios.get(fullUrl, axiosConfig);
                    const desc$ = cheerio.load(descResponse.data);

                    description = desc$('.entity-desc-description').text().trim();

                    desc$('.entity-desc-item-wrap').each((index, item) => {
                        const $item = desc$(item);
                        const label = $item.find('.entity-desc-item').text().trim();

                        if (label === 'Жанры') {
                            genres = $item.find('.entity-desc-link-u')
                                .slice(0, 3)
                                .map((i, el) => desc$(el).text().trim())
                                .get();
                        }

                        if (label === 'Страна' || label === 'Страны') {
                            countries = $item.find('.entity-desc-link-u')
                                .map((i, el) => desc$(el).text().trim())
                                .get();
                        }
                    });

                    time = desc$('.entity-desc-item:contains("Время") + .entity-desc-value time').text().trim();

                    director = [];
                    desc$('.entity-desc-item:contains("Режиссёр") + .entity-desc-value [itemprop="director"] [itemprop="name"]').each((index, el) => {
                        director.push(desc$(el).text().trim());
                    });


                    actors = [];
                    desc$('.entity-desc-item:contains("Актёры") + .entity-desc-value [itemprop="actor"] [itemprop="name"]').slice(0, 3).each((index, el) => {
                        actors.push(desc$(el).text().trim());
                    });

                    author = [];
                    desc$('.entity-desc-item:contains("Сценарий") + .entity-desc-value [itemprop="author"] [itemprop="name"]').slice(0, 3).each((index, el) => {
                        author.push(desc$(el).text().trim());
                    });

                    const premiereBlock = desc$('.entity-desc-item:contains("Премьера") + .entity-desc-value');
                    if (premiereBlock.length) {
                        const worldPremiere = premiereBlock.find('span').first().text().trim();
                        premiere = worldPremiere.split('в мире')[0].trim();
                    }

                } catch (error) {
                    console.log('Ошибка:', error.message);
                }
            }

            films.push({
                index: i,
                poster: poster,
                url: url ? `https://w140.zona.plus${url}` : null,
                title: title,
                rating: rating,
                year: year,
                description: description,
                genres: genres,
                countries: countries,
                time: time,
                premiere: premiere,
                director: director,
                actors: actors,
                author: author
            });
        }
        return filterRussianContent(films);

    } catch (error) {
        console.log('Ошибка:', error.message);
        throw error;
    }
}

async function parseSeries(page = 1) {
    try {
        let url = `https://w140.zona.plus/tvseries?page=${page}`;
        const response = await axios.get(url, axiosConfig);
        const $ = cheerio.load(response.data);

        const series = [];

        const items = $('.results-item-wrap').slice(0, 21);

        for (let i = 0; i < items.length; i++) {
            const element = items[i];
            const $el = $(element);

            const title = $el.find('.results-item-title').text();
            const url = $el.find('.results-item').attr('href');

            const posterStyle = $el.find('.result-item-preview').css('background-image');
            let poster = null;

            if (posterStyle) {
                const matches = posterStyle.match(/url\(['"]?(.*?)['"]?\)/);
                if (matches && matches[1]) {
                    poster = matches[1].split(',')[0];
                }
            }

            const rating = $el.find('.results-item-rating span').text();
            const year = $el.find('.results-item-year').text();

            let description = '';
            let genres = [];
            let countries = [];
            let time = '';
            let premiere = '';
            let episodes = 0;
            let director = [];
            let actors = [];
            let author = [];

            if (url) {
                try {
                    const fullUrl = `https://w140.zona.plus${url}`;
                    const descResponse = await axios.get(fullUrl, axiosConfig);
                    const desc$ = cheerio.load(descResponse.data);

                    description = desc$('.entity-desc-description').text().trim();

                    desc$('.entity-desc-item-wrap').each((index, item) => {
                        const $item = desc$(item);
                        const label = $item.find('.entity-desc-item').text().trim();

                        if (label === 'Жанры') {
                            genres = $item.find('.entity-desc-link-u')
                                .map((i, el) => desc$(el).text().trim())
                                .get()
                                .slice(0, 4);
                        }

                        if (label === 'Страна' || label === 'Страны') {
                            countries = $item.find('.entity-desc-link-u')
                                .map((i, el) => desc$(el).text().trim())
                                .get();
                        }
                    });

                    time = desc$('.entity-desc-item:contains("Время") + .entity-desc-value time').text().trim();

                    const premiereBlock = desc$('.entity-desc-item:contains("Премьера") + .entity-desc-value');
                    if (premiereBlock.length) {
                        const worldPremiere = premiereBlock.find('span').first().text().trim();
                        premiere = worldPremiere.split('в мире')[0].trim();
                    }

                    episodes = desc$('.items.episodes.is-entity-page .item').length;

                    director = [];
                    desc$('.entity-desc-item:contains("Режиссёр") + .entity-desc-value [itemprop="director"] [itemprop="name"]').slice(0, 3).each((index, el) => {
                        director.push(desc$(el).text().trim());
                    });

                    actors = [];
                    desc$('.entity-desc-item:contains("Актёры") + .entity-desc-value [itemprop="actor"] [itemprop="name"]').slice(0, 3).each((index, el) => {
                        actors.push(desc$(el).text().trim());
                    });

                    author = [];
                    desc$('.entity-desc-item:contains("Сценарий") + .entity-desc-value [itemprop="author"] [itemprop="name"]').slice(0, 3).each((index, el) => {
                        author.push(desc$(el).text().trim());
                    });


                } catch (error) {
                    console.log('Ошибка:', error.message);
                }
            }

            series.push({
                index: i,
                poster: poster,
                url: url ? `https://w140.zona.plus${url}` : null,
                title: title,
                rating: rating,
                year: year,
                description: description,
                genres: genres,
                countries: countries,
                time: time,
                premiere: premiere,
                episodes: episodes,
                director: director,
                actors: actors,
                author: author
            });
        }

        return filterRussianContent(series);

    } catch (error) {
        console.log('Ошибка:', error.message);
        throw error;
    }
}

async function parseDorama(page = 1) {
    try {
        const baseUrl = 'https://doramy.club/serialy';
        let allitems = [];
        const maxItems = 11;

        while (allitems.length < maxItems) {
            let pageUrl = `${baseUrl}/page/${page}`;

            const response = await axios.get(pageUrl, axiosConfig);
            const $ = cheerio.load(response.data);

            const items = $('.post-list');

            for (let i = 0; i < items.length; i++) {

                const element = items[i];
                const $el = $(element);

                const title = $el.find('.img-link a').attr('title') ||
                    $el.find('.img-link span').text().trim();

                const url = $el.find('a').attr('href');
                const poster = $el.find('img').attr('src');

                const yearCountryElements = $el.find('u');
                let year = '';

                if (yearCountryElements.length >= 1) {
                    const firstUContent = yearCountryElements.first().text();
                    const parts = firstUContent.split(', ');
                    if (parts.length > 0) {
                        year = parts[parts.length - 1];
                        countries = parts.slice(0, -1);
                    }
                }

                let genres = [];
                if (yearCountryElements.length >= 2) {
                    genres = yearCountryElements.last().text().split(', ').filter(Boolean);
                }

                const episodesText = $el.find('span.i1').parent().text();
                const episodesMatch = episodesText.match(/(\d+)/);
                const episodes = episodesMatch ? parseInt(episodesMatch[1]) : 0;

                let status = '';
                let time = '';
                let description = '';
                let rating = '';
                let actors = [];

                if (url) {
                    try {
                        const fullUrl = url.startsWith('http') ? url : `https://doramy.club${url}`;
                        const descResponse = await axios.get(fullUrl, axiosConfig);
                        const desc$ = cheerio.load(descResponse.data);

                        status = desc$('.o-sratus').text().trim() || 'Вышел';

                        time = desc$('tr:contains("Время:") td:nth-child(2)').text().trim() ||
                            desc$('td:contains("Время:") + td').text().trim();

                        description = desc$('.post-singl p').first().text().trim() ||
                            desc$('.description p').first().text().trim();

                        rating = desc$('span[itemprop="ratingValue"]').text().trim() ||
                            desc$('.rating').text().trim();

                        const actorsRow = desc$('tr.person:contains("В ролях:")');
                        if (actorsRow.length) {
                            actorsRow.find('.tdlinks a').slice(0, 4).each((index, element) => {
                                let actorName = desc$(element).text().trim();
                                if (actorName.endsWith(',')) {
                                    actorName = actorName.slice(0, -1);
                                }
                                if (actorName) {
                                    actors.push(actorName);
                                }
                            });
                        }

                    } catch (error) {
                        console.log('Ошибка при парсинге страницы дорамы:', error.message);
                    }
                }

                allitems.push({
                    id: allitems.length + 1,
                    poster: poster,
                    url: url ? `https://doramy.club${url}` : '',
                    title: title,
                    rating: rating,
                    year: year,
                    description: description,
                    genres: genres,
                    status: status,
                    time: time,
                    episodes: episodes,
                    countries: countries,
                    actors: actors
                });
            }

            page++;

        }

        return allitems;

    } catch (error) {
        console.log('Ошибка:', error.message);
        throw error;
    }
}

async function parseAnime(page = 1) {
    try {
        const baseUrl = 'https://animevost.org/tip/tv/';
        let allAnime = [];
        const maxItems = 20;

        while (allAnime.length < maxItems) {
            let pageUrl = `${baseUrl}page/${page}/`;

            const response = await axios.get(pageUrl, axiosConfig);
            const $ = cheerio.load(response.data);

            const items = $('.shortstory');

            for (let i = 0; i < items.length; i++) {
                const element = items[i];
                const $el = $(element);

                const titleElement = $el.find('.shortstoryHead h2 a');
                const fullTitle = titleElement.text().trim();

                let russianTitle = fullTitle;
                if (fullTitle.includes('/')) {
                    russianTitle = fullTitle.split('/')[0].trim();
                }

                if (!russianTitle || russianTitle.length < 2) {
                    continue;
                }

                const url = titleElement.attr('href') || '';

                let poster = $el.find('.imgRadius').attr('src') || '';
                if (poster && !poster.startsWith('http')) {
                    poster = `https://animevost.org${poster}`;
                }

                const ratingText = $el.find('.current-rating').css('width');
                let rating = '0';
                if (ratingText) {
                    const widthValue = ratingText.replace('%', '');
                    const widthPercent = parseInt(widthValue);
                    if (!isNaN(widthPercent)) {
                        rating = (widthPercent / 20).toFixed(1);
                    }
                }

                let description = '';
                const descElement = $el.find('p:contains("Описание:")');
                if (descElement.length) {
                    description = descElement.nextUntil('br, p').text().trim() ||
                        descElement.parent().text().split('Описание:')[1]?.split('\n')[0]?.trim() || '';
                }

                const genres = [];
                $el.find('.shortstoryFuter a[href*="zhanr"]').each((index, el) => {
                    const genre = $(el).text().trim();
                    if (genre) genres.push(genre);
                });

                const episodesText = $el.find('p:contains("Количество серий:")').text();
                let episodes = 0;
                let status = 'Завершен';
                let director = 'Не указан';

                const directorElement = $el.find('p:contains("Режиссёр:")');
                director = directorElement.text().replace('Режиссёр:', '').trim() || 'Не указан';

                if (episodesText) {
                    const text = episodesText.replace('Количество серий:', '').trim();

                    if (text.includes('из')) {
                        const parts = text.split('из');
                        const totalEp = parts[1]?.replace('(', '').trim();

                        episodes = parseInt(totalEp) || 0;
                    }
                    else if (text.includes('+')) {
                        episodes = parseInt(text) || 0;
                        status = 'Онгоинг';
                    } else {
                        episodes = parseInt(text) || 0;
                    }
                }

                let time = '25 мин.';
                if (episodesText && episodesText.includes('мин.')) {
                    const timeMatch = episodesText.match(/\(([^)]+)\)/);
                    if (timeMatch) {
                        time = timeMatch[1];
                    }
                }

                const yearText = $el.find('p:contains("Год выхода:")').text();
                const year = yearText ? yearText.replace('Год выхода:', '').trim() : '2025';

                if (fullTitle.includes('серия') || fullTitle.includes('Онгоинг')) {
                    status = 'Онгоинг';
                }

                let id = allAnime.length + 1;

                allAnime.push({
                    id: id,
                    poster: poster,
                    url: url.startsWith('http') ? url : `https://animevost.org${url}`,
                    title: russianTitle,
                    rating: rating,
                    description: description,
                    genres: genres,
                    episodes: episodes,
                    time: time,
                    status: status,
                    year: year,
                    director: director
                });

                if (allAnime.length >= maxItems) break;
            }

            page++;

            if (page > 10) break;
        }

        return allAnime.slice(0, maxItems);

    } catch (error) {
        console.log('Ошибка:', error);
        throw error;
    }
}

app.get('/api/movies', async (req, res) => {
    try {
        const movies = await parseNewMovies();
        res.json(movies);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка' });
    }
});

app.get('/api/films', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const films = await parseFilms(page);
        res.json(films);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка' });
    }
});

app.get('/api/series', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const series = await parseSeries(page);
        res.json(series);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка' });
    }
});

app.get('/api/dorama', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const dorama = await parseDorama(page);
        res.json(dorama);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка' });
    }
});

app.get('/api/anime', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const anime = await parseAnime(page);
        res.json(anime);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка' });
    }
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
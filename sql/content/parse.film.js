const cheerio = require('cheerio');
const axios = require('axios');

const axiosConfig = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://w140.zona.plus/',
    }
};

async function parseFilms(page = 1) {
    try {
        console.log(`парсим страницу ${page}...`);

        let url = `https://w140.zona.plus/movies?page=${page}`;
        const response = await axios.get(url, axiosConfig);
        const $ = cheerio.load(response.data);
        const films = [];

        const items = $('.results-item-wrap').slice(0, 20);

        for (let i = 0; i < items.length; i++) {
            const element = items[i];
            const $el = $(element);

            const title = $el.find('.results-item-title').text().trim();
            const filmUrl = $el.find('.results-item').attr('href');

            const posterStyle = $el.find('.result-item-preview').css('background-image');
            let poster = posterStyle ? posterStyle.match(/url\(['"]?(.*?)['"]?\)/)?.[1] : null;

            const rating = parseFloat($el.find('.results-item-rating span').text().trim()) || 0;
            const year = parseInt($el.find('.results-item-year').text().trim()) || new Date().getFullYear();

            console.log(`парсим: "${title}"`);

            let filmData = {
                title: title,
                poster: poster,
                url: filmUrl ? `https://w140.zona.plus${filmUrl}` : null,
                rating: rating,
                year: year,
                description: '',
                genres: [],
                countries: [],
                director: [],
                actors: [],
                author: [],
                videoMP4: null
            };

            if (filmUrl) {
                try {
                    const fullUrl = `https://w140.zona.plus${filmUrl}`;
                    const descResponse = await axios.get(fullUrl, axiosConfig);
                    const desc$ = cheerio.load(descResponse.data);

                    filmData.description = desc$('.entity-desc-description').text().trim();

                    desc$('.entity-desc-item-wrap').each((index, item) => {
                        const $item = desc$(item);
                        const label = $item.find('.entity-desc-item').text().trim();
                        if (label === 'Жанры') {
                            filmData.genres = $item.find('.entity-desc-link-u')
                                .slice(0, 3).map((i, el) => desc$(el).text().trim()).get();
                        }
                        if (label === 'Страна' || label === 'Страны') {
                            filmData.countries = $item.find('.entity-desc-link-u')
                                .map((i, el) => desc$(el).text().trim()).get();
                        }
                    });

                    filmData.director = [];
                    desc$('.entity-desc-item:contains("Режиссёр") + .entity-desc-value [itemprop="director"] [itemprop="name"]').each((index, el) => {
                        filmData.director.push(desc$(el).text().trim());
                    });

                    filmData.actors = [];
                    desc$('.entity-desc-item:contains("Актёры") + .entity-desc-value [itemprop="actor"] [itemprop="name"]').slice(0, 3).each((index, el) => {
                        filmData.actors.push(desc$(el).text().trim());
                    });

                    filmData.author = [];
                    desc$('.entity-desc-item:contains("Сценарий") + .entity-desc-value [itemprop="author"] [itemprop="name"]').slice(0, 3).each((index, el) => {
                        filmData.author.push(desc$(el).text().trim());
                    });

                } catch (error) {
                    console.log(`ошибка: ${title}`);
                }
            }

            films.push(filmData);
            console.log(`готово: "${title}"`);
        }

        return films;

    } catch (error) {
        console.log('ошибка парсинга:', error.message);
        throw error;
    }
}

module.exports = { parseFilms };
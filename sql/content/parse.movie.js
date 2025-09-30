const cheerio = require('cheerio');
const axios = require('axios');

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

async function parseMovies() {
    try {
        const url = 'https://w140.zona.plus/';
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        const movies = [];

        const items = $('.popularMovies .item').slice(0, 4);

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

        return movies;

    } catch (error) {
        console.error('Ошибка:', error.message);
        throw error;
    }
}

module.exports = { parseMovies }
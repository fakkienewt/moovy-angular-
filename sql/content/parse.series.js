const cheerio = require('cheerio');
const axios = require('axios');

const axiosConfig = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://w140.zona.plus/',
    }
};

async function parseSeries(page = 1) {
    try {
        let url = `https://w140.zona.plus/tvseries?page=${page}`;
        const response = await axios.get(url, axiosConfig);
        const $ = cheerio.load(response.data);

        const series = [];

        const items = $('.results-item-wrap').slice(0, 24);

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
            const type = 'serie';

            let description = '';
            let genres = [];
            let countries = [];
            let premiere = '';
            let episodes = 0;
            let director = [];
            let actors = [];
            let author = [];
            let time = '';

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
                author: author, 
                type: type
            });
        }

        return series;

    } catch (error) {
        console.log('Ошибка:', error.message);
        throw error;
    }
}

module.exports = { parseSeries }
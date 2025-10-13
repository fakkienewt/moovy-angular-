const cheerio = require('cheerio');
const axios = require('axios');

const axiosConfig = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://w140.zona.plus/',
    }
};

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

                let countries = [];

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

module.exports = { parseDorama }
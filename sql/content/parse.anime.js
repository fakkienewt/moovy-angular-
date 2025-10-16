const cheerio = require('cheerio');
const axios = require('axios');

const axiosConfig = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://w140.zona.plus/',
    }
};

async function parseAnime(page = 1) {
    try {
        let pageUrl = `https://animevost.org/tip/tv/page/${page}/`;
        let allAnime = [];

        let currentPage = page;

        console.log(`Парсинг страницы: ${pageUrl}`);

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

            let genres = [];
            $el.find('.shortstoryFuter a[href*="zhanr"]').each((index, el) => {
                const genre = $(el).text().trim();
                if (genre) genres.push(genre);
            });

            const episodesText = $el.find('p:contains("Количество серий:")').text();
            let episodes = 0;
            let status = 'Завершен';
            let director = 'Не указан';
            let countries = 'Япония';
            const type = 'anime';

            const directorElement = $el.find('p:contains("Режиссёр:")');
            if (directorElement.length) {
                director = directorElement.text().replace('Режиссёр:', '').trim() || 'Не указан';
            }

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

            if (genres.length === 0) {
                genres = ['Не указан'];
            }

            const uniqueId = `page${currentPage}_item${i}`;

            allAnime.push({
                id: uniqueId,
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
                director: director,
                countries: countries, 
                type: type
            });

        }

        return allAnime;

    } catch (error) {
        console.log('Ошибка парсинга:', error);
        throw error;
    }
}


module.exports = { parseAnime };
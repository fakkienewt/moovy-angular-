const mysql = require('mysql2');

const options = {
    host: 'localhost',
    user: 'dev',
    password: '!QAZ',
    database: 'moovy_database'
};

function fetchResults(connection, query, params = []) {
    return new Promise((resolve, reject) => {
        connection.query(query, params, (error, results) => {
            if (error) {
                return reject(error);
            }
            resolve(results);
        });
    });
}

async function findAnime(page_anime = 1) {
    let connection = await mysql.createConnection(options);
    try {
        const countOnPage = 20;
        const offset = countOnPage * (page_anime - 1);
        const query = `SELECT * FROM anime LIMIT ? OFFSET ?`;
        const params = [countOnPage, offset];
        const results = await fetchResults(connection, query, params);
        return results;
    } catch (error) {
        console.error('ERRORR:', error);
    } finally {
        if (connection) {
            connection.end();
        }
    }
}

async function findFilm(page_film) {
    let connection = await mysql.createConnection(options);
    try {
        const countOnPage = 20;
        const offset = countOnPage * (page_film - 1);
        const query = `SELECT * FROM films LIMIT ? OFFSET ?`;
        const params = [countOnPage, offset];
        const results = await fetchResults(connection, query, params);
        return results;
    } catch (error) {
        console.error('ERRORR:', error);
    } finally {
        if (connection) {
            connection.end();
        }
    }
}

async function findSerie(page_serie) {
    let connection = await mysql.createConnection(options);
    try {
        const countOnPage = 20;
        const offset = countOnPage * (page_serie - 1);
        const query = `SELECT * FROM series LIMIT ? OFFSET ?`;
        const params = [countOnPage, offset];
        const results = await fetchResults(connection, query, params);
        return results;
    } catch (error) {
        console.log('ERROR:', error);
    } finally {
        if (connection) {
            connection.end();
        }
    }
}

async function findDorama(page_dorama) {
    let connection = await mysql.createConnection(options);
    try {
        const countOnPage = 20;
        const offset = countOnPage * (page_dorama - 1);
        const query = `SELECT * FROM dorama LIMIT ? OFFSET ?`;
        const params = [countOnPage, offset];
        const results = await fetchResults(connection, query, params);
        return results;
    } catch (error) {
        console.log('ERROR:', error);
    } finally {
        if (connection) {
            connection.end();
        }
    }
}

async function findMovie() {
    let connection = await mysql.createConnection(options);
    try {
        const countOnPage = 15;
        const offset = 30;
        const query = `SELECT * FROM movies LIMIT ? OFFSET ?`;
        const params = [countOnPage, offset];
        const results = await fetchResults(connection, query, params);
        return results;
    } catch (error) {
        console.log('ERROR:', error);
    } finally {
        if (connection) {
            connection.end();
        }
    }
}

async function getFiltersData() {
    let connection = await mysql.createConnection(options);
    try {
        const filtersData = {
            years: [],
            countries: [],
            genres: []
        };

        const genresQ =
            [
                'SELECT DISTINCT genres FROM anime order by genres',
                'SELECT DISTINCT genres FROM dorama order by genres',
                'SELECT DISTINCT genres FROM films order by genres',
                'SELECT DISTINCT genres FROM series order by genres',
            ];
        for (let q of genresQ) {
            const results = await fetchResults(connection, q, []);
            results.map(x => x.genres).map(genre => {
                const words = genre.split(',');
                words.forEach(w => {
                    if (!filtersData.genres.includes(w.trim().toLowerCase())) {
                        filtersData.genres.push(w.trim().toLowerCase());
                    }
                });
            });
        }

        const countriesQ =
            [
                'SELECT DISTINCT countries FROM dorama order by countries',
                'SELECT DISTINCT countries FROM films order by countries',
                'SELECT DISTINCT countries FROM series order by countries',
            ];
        for (let q of countriesQ) {
            const results = await fetchResults(connection, q, []);
            results.map(x => x.countries).map(country => {
                const words = country.split(',');
                words.forEach(w => {
                    if (!filtersData.countries.includes(w.trim().toLowerCase())) {
                        filtersData.countries.push(w.trim().toLowerCase());
                    }
                });
            });
        }

        const yearsQ =
            [
                'SELECT DISTINCT year FROM anime order by year desc',
                'SELECT DISTINCT year FROM dorama order by year desc',
                'SELECT DISTINCT year FROM films order by year desc',
                'SELECT DISTINCT year FROM series order by year desc',
            ];

        for (let q of yearsQ) {
            const results = await fetchResults(connection, q, []);
            results.map(x => x.year).map(year => {
                const y = +year;
                if (!filtersData.years.includes(y)) {
                    filtersData.years.push(y);
                }
            });
        }

        return filtersData;

    } catch (error) {
        console.log('ERROR:', error);
    } finally {
        if (connection) {
            connection.end();
        }
    }
}

async function getSearchData(searchQuery) {

    let connection = await mysql.createConnection(options);

    try {

        const searchResults = {
            anime: [],
            dorama: [],
            series: [],
            films: []
        };

        const animeQuery = `SELECT * FROM anime WHERE title LIKE ?`;
        const animeParams = [`%${searchQuery}%`];
        searchResults.anime = await fetchResults(connection, animeQuery, animeParams);

        const doramaQuery = `SELECT * FROM dorama WHERE title LIKE ?`;
        const doramaParams = [`%${searchQuery}%`];
        searchResults.dorama = await fetchResults(connection, doramaQuery, doramaParams);

        const seriesQuery = `SELECT * FROM series WHERE title LIKE ?`;
        const seriesParams = [`%${searchQuery}%`];
        searchResults.series = await fetchResults(connection, seriesQuery, seriesParams);

        const filmsQuery = `SELECT * FROM films WHERE title LIKE ?`;
        const filmsParams = [`%${searchQuery}%`];
        searchResults.films = await fetchResults(connection, filmsQuery, filmsParams);

        return searchResults;

    } catch (error) {
        console.log('ERROR:', error);
    } finally {
        if (connection) {
            connection.end();
        }
    }
}

async function getSimilarFilms(genres, type) {
    let connection = await mysql.createConnection(options);

    const safeType = (type && type !== 'undefined') ? type : 'film';

    console.log('getSimilarFilms called with:', { type, safeType, genres });

    let genresArr = genres ? genres.split(',').map(genre => genre.trim()) : [];

    try {
        const tableMap = {
            'film': 'films',
            'anime': 'anime',
            'dorama': 'dorama',
            'serie': 'series'
        };

        const tableName = tableMap[safeType] || 'films';

        console.log('Using table:', tableName);

        const query = `SELECT * FROM ${tableName} ORDER BY RAND() LIMIT 10`;
        const results = await fetchResults(connection, query, []);

        let similarResults = [];

        if (genresArr.length === 0) {
            return results.slice(0, 4);
        }

        for (let item of results) {
            if (!item.genres) continue;

            let itemGenres = item.genres.split(',').map(g => g.trim());

            for (let genre of genresArr) {
                if (itemGenres.includes(genre)) {
                    similarResults.push(item);
                    break;
                }
            }
        }

        return similarResults.slice(0, 4);

    } catch (error) {
        console.error('ERROR in getSimilarFilms:', error);
        return [];
    } finally {
        if (connection) {
            connection.end();
        }
    }
}

module.exports = {
    findDorama,
    findAnime,
    findFilm,
    findSerie,
    findMovie,
    getFiltersData,
    getSearchData,
    getSimilarFilms
};


let mysql = require('mysql2');

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
        console.error('Error:', error);
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
        console.error('Error:', error);
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


module.exports = {
    findDorama,
    findAnime,
    findFilm,
    findSerie,
    findMovie
};


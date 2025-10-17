const express = require('express');
const cors = require('cors');
const connect = require('./connect');
const mysql = require('mysql2');

const app = express();
const PORT = 3500;

app.use(cors({
    origin: 'http://localhost:4200'
}));
app.use(express.json());

const dbConfig = {
    host: 'localhost',
    user: 'dev',
    password: '!QAZ',
    database: 'moovy_database'
};

function query(sql, params = []) {
    return new Promise((resolve, reject) => {
        const connection = mysql.createConnection(dbConfig);
        connection.query(sql, params, (error, results) => {
            connection.end();
            if (error) reject(error);
            else resolve(results);
        });
    });
}

app.get('/api/movies', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const countOnPage = 20;
        const offset = countOnPage * (page - 1);

        const movie = await query('SELECT * FROM movies LIMIT ? OFFSET ?', [countOnPage, offset]);
        res.json(movie);
    } catch (error) {
        res.status(500).json({ error: 'ERRORR' });
    }
});

app.get('/api/films', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const countOnPage = 20;
        const offset = countOnPage * (page - 1);

        const films = await query('SELECT * FROM films LIMIT ? OFFSET ?', [countOnPage, offset]);
        res.json(films);
    } catch (error) {
        res.status(500).json({ error: 'ERROR' });
    }
});

app.get('/api/series', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const countOnPage = 20;
        const offset = countOnPage * (page - 1);

        const series = await query('SELECT * FROM series LIMIT ? OFFSET ?', [countOnPage, offset]);
        res.json(series);
    } catch (error) {
        res.status(500).json({ error: 'ERRORR' });
    }
});

app.get('/api/dorama', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const countOnPage = 20;
        const offset = countOnPage * (page - 1);

        const dorama = await query('SELECT * FROM dorama LIMIT ? OFFSET ?', [countOnPage, offset]);
        res.json(dorama);
    } catch (error) {
        res.status(500).json({ error: 'ERRORR' });
    }
});

app.get('/api/anime', async (req, res) => {
    try {
        const year = req.query.year;
        const page = parseInt(req.query.page) || 1;
        const countOnPage = 20;
        const offset = countOnPage * (page - 1);

        const anime = year
            ? await query('SELECT * FROM anime WHERE year=? LIMIT ? OFFSET ?', [year, countOnPage, offset])
            : await query('SELECT * FROM anime LIMIT ? OFFSET ?', [countOnPage, offset]);
        res.json(anime);
    } catch (error) {
        res.status(500).json({ error: 'ERROR' + error });
    }
});

app.get('/api/filters', async (req, res) => {
    try {
        const result = await connect.getFiltersData();
        res.json(result);
    } catch (err) {
    }
});

app.get('/api/filtered-content', async (req, res) => {
    try {
        const { type, genre, country, year, page = 1 } = req.query;
        const currentPage = parseInt(page);
        const countOnPage = 20;
        const offset = countOnPage * (currentPage - 1);

        let tableName;
        if (type === 'film') tableName = 'films';
        else if (type === 'serie') tableName = 'series';
        else if (type === 'anime') tableName = 'anime';
        else if (type === 'dorama') tableName = 'dorama';
        else {
            return res.status(400).json({ error: 'Неверный тип контента' });
        }

        let sql = `SELECT * FROM ${tableName} WHERE 1=1`;

        if (genre) {
            if (tableName === 'films' || tableName === 'series' || tableName === 'anime' || tableName === 'dorama') {
                sql += ` AND genres LIKE '%${genre}%'`;
            } else {
                sql += ` AND genre LIKE '%${genre}%'`;
            }
        }

        if (country && (tableName === 'films' || tableName === 'series' || tableName == 'anime' || tableName === 'dorama')) {
            sql += ` AND countries LIKE '%${country}%'`;
        }

        if (year) {
            sql += ` AND year = '${year}'`;
        }

        sql += ` LIMIT ${countOnPage} OFFSET ${offset}`;

        const result = await query(sql);

        res.json(result);
    } catch (err) {
        console.error('ERRORR:', err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/search', async (req, res) => {
    try {
        const searchTitle = req.query.title;
        const results = await connect.getSearchData(searchTitle);
        res.json(results);
    } catch (error) {
        console.log('ERROR:', error);
        throw error;
    }
});

app.get('/api/similar', async (req, res) => {
    try {
        const type = req.query.type;
        const genres = req.query.genres;
        const results = await connect.getSimilarFilms(genres, type);
        res.json(results);
    } catch (err) {
        console.log('ERROOR:', err);
    }
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
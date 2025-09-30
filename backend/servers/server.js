const express = require('express');
const cors = require('cors');
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

        const movie = await query('SELECT * FROM movie LIMIT ? OFFSET ?', [countOnPage, offset]);
        res.json(movie);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка получения новинок' });
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
        res.status(500).json({ error: 'Ошибка получения фильмов' });
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
        res.status(500).json({ error: 'Ошибка получения сериалов' });
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
        res.status(500).json({ error: 'Ошибка получения дорам' });
    }
});

app.get('/api/anime', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const countOnPage = 20;
        const offset = countOnPage * (page - 1);

        const anime = await query('SELECT * FROM anime LIMIT ? OFFSET ?', [countOnPage, offset]);
        res.json(anime);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка получения аниме. ' + error });
    }
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
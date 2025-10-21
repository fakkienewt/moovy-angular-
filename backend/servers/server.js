const express = require('express');
const cors = require('cors');
const connect = require('./connect');
const mysql = require('mysql2');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');

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
        const { type, genre, country, year, page = 1, sort = 'default' } = req.query;
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

        switch (sort) {
            case 'rating_desc':
                sql += ' ORDER BY rating DESC';
                break;
            case 'year_desc':
                sql += ' ORDER BY year DESC';
                break;
            case 'year_asc':
                sql += ' ORDER BY year ASC';
                break;
            case 'default':
            default:
                sql += ' ORDER BY id DESC';
                break;
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

const JWT_SECRET = 'secret-key-moovy-app';

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Токен не предоставлен'
        });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({
                success: false,
                message: 'Невалидный или просроченный токен'
            });
        }

        req.user = decoded;
        next();
    });
}

app.post('/api/registration', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'email и пароль обязательны'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'пароль должен быть не менее 6 символов'
            });
        }

        const existingUser = await query('SELECT id FROM users WHERE email = ?', [email]);

        if (existingUser.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'пользователь с таким email уже существует'
            });
        }

        const hash = await argon2.hash(password, {
            type: argon2.argon2id,
            memoryCost: 19,
            timeCost: 2,
            parallelism: 1
        });

        const insertQuery = `
            INSERT INTO users(email, password, nickname, image, favourites, watch_later, comments)
            VALUES(?, ?, '', '', '[]', '[]', '[]')
        `;

        const results = await query(insertQuery, [email, hash]);

        console.log('пользователь добавлен, ID:', results.insertId);

        const token = jwt.sign(
            {
                userId: results.insertId,
                email: email
            },
            JWT_SECRET,
            { expiresIn: '10d' }
        )

        res.json({
            success: true,
            message: 'пользователь успешно зарегистрирован',
            data: {
                id: results.insertId,
                email: email,
                token: token
            }
        });

    } catch (err) {
        console.log('ERROR:', err.message);
        res.status(500).json({
            success: false,
            message: 'Ошибка сервера при регистрации'
        });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'нет или email или пароля'
            });
        }

        const users = await query('SELECT * FROM users WHERE email = ?', [email]);

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Пользователь не найден'
            });
        }

        const user = users[0];

        const isPasswordValid = await argon2.verify(user.password, password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Неверный пароль'
            });
        }

        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email
            },
            JWT_SECRET,
            { expiresIn: '10d' }
        );

        res.json({
            success: true,
            message: 'Успешный вход',
            data: {
                id: user.id,
                email: user.email,
                token: token
            }
        });

    } catch (err) {
        console.log(err);
        throw err;
    }
});

app.get('/api/profile', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        const users = await query(
            'SELECT id, email, nickname, image, favourites, watch_later, comments FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Пользователь не найден'
            });
        }

        res.json({
            success: true,
            data: users[0]
        });

    } catch (err) {
        console.log(err);
        throw err;
    }
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
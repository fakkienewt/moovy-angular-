const mysql = require('mysql2');

const options = {
    host: 'localhost',
    user: 'dev',
    password: '!QAZ',
    database: 'moovy_database'
};

function initDatabase() {
    let connection = mysql.createConnection(options);

    let movies = `
        CREATE TABLE IF NOT EXISTS movies(
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        poster VARCHAR(500),
        rating DECIMAL(3, 1) DEFAULT 0, 
        year INT,              
        description TEXT, 
        genres TEXT,
        countries TEXT,
        director TEXT,
        actors TEXT,
        author TEXT
    )`;

    let films = `
        CREATE TABLE IF NOT EXISTS films(
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        poster VARCHAR(500),
        rating DECIMAL(3, 1) DEFAULT 0, 
        year INT,              
        description TEXT, 
        genres TEXT,
        countries TEXT,
        director TEXT,
        actors TEXT,
        author TEXT
    )`;

    let series = `
        CREATE TABLE IF NOT EXISTS series(
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        poster VARCHAR(500),
        rating DECIMAL(3, 1) DEFAULT 0, 
        year INT,              
        description TEXT, 
        episodes INT,
        genres TEXT,
        countries TEXT,
        director TEXT,
        actors TEXT,
        author TEXT
    )`;

    let anime = `
        CREATE TABLE IF NOT EXISTS anime (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        poster VARCHAR(500),
        rating DECIMAL(3, 1) DEFAULT 0, 
        year VARCHAR(100),              
        description TEXT, 
        time VARCHAR(100),
        episodes INT,
        director TEXT,
        genres TEXT,
        status TEXT, 
        countries TEXT 
    )`;

    let dorama = `
        CREATE TABLE IF NOT EXISTS dorama (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        poster VARCHAR(500),
        rating VARCHAR(100), 
        year VARCHAR(100),              
        description TEXT, 
        episodes INT,
        genres TEXT,
        countries TEXT,
        status TEXT,
        actors TEXT
    )`;

    connection.query(movies, function (err, results) {
        if (err) console.log(err);
        else console.log("таблица movies создана");
    });

    connection.query(films, function (err, results) {
        if (err) console.log(err);
        else console.log("таблица films создана");
    });

    connection.query(series, function (err, results) {
        if (err) console.log(err);
        else console.log("таблица series создана");
    });

    connection.query(anime, function (err, results) {
        if (err) console.log(err);
        else console.log("таблица anime создана");
    });

    connection.query(dorama, function (err, results) {
        if (err) console.log(err);
        else console.log("таблица dorama создана");
    });

    connection.end();
}

async function saveAnime(animeData) {
    let connection = mysql.createConnection(options);

    for (let anime of animeData) {
        const query = `
        INSERT INTO anime(title, poster, rating, year, description, time, episodes, director, genres, status, countries)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            anime.title,
            anime.poster,
            anime.rating,
            anime.year,
            anime.description,
            anime.time,
            anime.episodes,
            Array.isArray(anime.director) ? anime.director.join(', ') : anime.director,
            Array.isArray(anime.genres) ? anime.genres.join(', ') : anime.genres,
            anime.status, 
            anime.countries
        ];

        connection.execute(query, values, function (error, results) {
            if (error) console.log(error);
        });
    }
    connection.end();
    console.log(`добавлено ${animeData.length} аниме`);
}

async function saveFilm(filmData) {
    let connection = mysql.createConnection(options);
    for (let film of filmData) {
        const query = `
         INSERT INTO films(title, poster, rating, year, description, genres, author, actors, countries, director)
         VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            film.title,
            film.poster,
            film.rating,
            film.year,
            film.description,
            Array.isArray(film.genres) ? film.genres.join(', ') : film.genres,
            Array.isArray(film.author) ? film.author.join(', ') : film.author,
            Array.isArray(film.actors) ? film.actors.join(', ') : film.actors,
            Array.isArray(film.countries) ? film.countries.join(', ') : film.countries,
            Array.isArray(film.director) ? film.director.join(', ') : film.director,
        ];

        connection.execute(query, values, function (error, results) {
            if (error) {
                console.log('Ошибка при сохранении фильма:', error);
            }
        });
    }
    connection.end();
    console.log(`добавлено ${filmData.length} фильмов`);
}
async function saveSerie(serieData) {
    let connection = mysql.createConnection(options);
    for (let serie of serieData) {
        const query = `
        INSERT INTO series(title, poster, rating, year, description, genres, author, countries, director, episodes, actors)
        VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            serie.title,
            serie.poster,
            serie.rating || 0,
            serie.year,
            serie.description,
            Array.isArray(serie.genres) ? serie.genres.join(', ') : serie.genres,
            Array.isArray(serie.author) ? serie.author.join(', ') : serie.author,
            Array.isArray(serie.countries) ? serie.countries.join(', ') : serie.countries,
            Array.isArray(serie.director) ? serie.director.join(', ') : serie.director,
            serie.episodes,
            Array.isArray(serie.actors) ? serie.actors.join(', ') : serie.actors
        ];
        connection.execute(query, values, function (error, results) {
            if (error) console.log(error);
        });
    }
    connection.end();
    console.log(`добавлено ${serieData.length} сериалов`);
}

async function saveDorama(doramaData) {
    let connection = mysql.createConnection(options);
    for (let dorama of doramaData) {
        const query = `
        INSERT INTO dorama(title, poster, rating, year, description, genres, countries, episodes, actors, status)
        VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            dorama.title,
            dorama.poster,
            dorama.rating,
            dorama.year,
            dorama.description,
            Array.isArray(dorama.genres) ? dorama.genres.join(', ') : dorama.genres,
            Array.isArray(dorama.countries) ? dorama.countries.join(', ') : dorama.countries,
            dorama.episodes,
            Array.isArray(dorama.actors) ? dorama.actors.join(', ') : dorama.actors,
            dorama.status
        ];
        connection.execute(query, values, function (error, results) {
            if (error) console.log(error);
        });
    }
    connection.end();
    console.log(`добавлено ${doramaData.length} дорам`);
}

async function saveMovie(movieData) {
    let connection = mysql.createConnection(options);
    for (let movie of movieData) {
        const query = `
        INSERT INTO movies(title, poster, rating, year, description, genres, author, actors, countries, director)
        VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            movie.title,
            movie.poster,
            movie.rating,
            movie.year,
            movie.description,
            Array.isArray(movie.genres) ? movie.genres.join(', ') : movie.genres,
            Array.isArray(movie.author) ? movie.author.join(', ') : movie.author,
            Array.isArray(movie.actors) ? movie.actors.join(', ') : movie.actors,
            Array.isArray(movie.countries) ? movie.countries.join(', ') : movie.countries,
            Array.isArray(movie.director) ? movie.director.join(', ') : movie.director
        ];

        connection.execute(query, values, function (error, results) {
            if (error) {
                console.log(error);
                console.log(movieData);
            }
        });
    }
    connection.end();
    console.log(`добавлено ${movieData.length} новых фильмов`);
}

module.exports = {
    initDatabase,
    saveMovie,
    saveDorama,
    saveSerie,
    saveAnime,
    saveFilm
};


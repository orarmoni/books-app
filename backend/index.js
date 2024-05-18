const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const app = express();
app.use(cors());
const bodyParser = require('body-parser')

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())
const port = 3000;

const DBfile = 'books.db';
const booksTxtFile = 'books_list.txt';


let db = new sqlite3.Database(DBfile, (err) => {
    if (err) return console.error(err.message);
    console.log('Connected to the SQlite database.');
});

db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name='books'`, [], (err, row) => {
    if (err) return console.error(err.message);

    if (!row) {
        fs.readFile(booksTxtFile, 'utf8', (err, data) => {
            if (err) throw err;
            const books = data.split('\n').map((line, index) => ({ id: index + 1, description: line }));

            db.serialize(() => {
                db.run(`CREATE TABLE IF NOT EXISTS books (id INTEGER PRIMARY KEY, description TEXT)`, (err) => {
                    if (err) return console.error(err.message);
                });

                let stmt = db.prepare("INSERT INTO books VALUES (?, ?)");
                books.forEach(book => {
                    stmt.run([book.id, book.description], (err) => {
                        if (err) return console.error(err.message);
                    });
                });
                stmt.finalize();
            });
        });
    }
});



app.get('/books', (req, res) => {
    let query = req.query.q;
    if (!query) {
      db.all(`SELECT * FROM books`, [], (err, rows) => {
          if (err) return console.error(err.message);
          res.send(rows);
      }); }
    else {
      db.all(`SELECT * FROM books WHERE description LIKE '%' || ? || '%'`, [query], (err, rows) => {
        if (err) return console.error(err.message);
        res.send(rows); 
      }
    );}
});     

app.post('/addBooks', (req, res) => {
    const book = req.body.description;
    console.log(book);
    db.run(`INSERT INTO books (description) VALUES (?)`, [book], (err) => {
        if (err) return console.error(err.message);
        res.send('Book added');
    });
});


// Start the server add cors for local host
app.listen(port, () => {

    console.log(`Server is running on http://localhost:${port}`);
});

const express = require('express');
const app = express();
const port = 8080;
const mysql = require('mysql');
const cors = require('cors');
require('dotenv').config();

app.listen(port, () => {
    console.log(`Vous etes bien sur le port ${port}`)
})

app.use(cors());
app.use(express.json());

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

connection.connect(function(error) {
    if (error) {
        console.error('error connecting: ' + error.stack);
        return;
    }
    console.log('connected as id ' + connection.threadId);
})


app.get('/squirrels', (req, res) => {
    connection.query('SELECT * FROM squirrel', (error, result) => {
        if (error) {
            res.status(500).send('wrong request')
        } else {
            res.status(200).send(result);
        }
    })
})


app.get('/squirrels/contains/name', (req, res) => {
    const what = req.query.what;
    connection.query(`SELECT * FROM squirrel WHERE name LIKE ?`, [`%${what}%`], (error, result) => {
        if (error) {
            res.status(500).send('wrong request')
        } else {
            res.status(200).send(result);
        }
    })
})
app.get('/squirrels/startWith/name', (req, res) => {
    const what = req.query.what;
    connection.query(`SELECT * FROM squirrel WHERE name LIKE ?`, [`${what}%`], (error, result) => {
        if (error) {
            res.status(500).send('wrong request')
        } else {
            res.status(200).send(result);
        }
    })
})
app.get('/squirrels/greaterThan/birth_date', (req, res) => {
    const what = req.query.what;
    connection.query(`SELECT * FROM squirrel WHERE birth_date > ?`, [what], (error, result) => {
        if (error) {
            res.status(500).send('wrong request')
        } else {
            res.status(200).send(result);
        }
    })
})


app.get('/squirrels/order', (req, res) => {
    const order = req.query.asc;
    connection.query(`SELECT * FROM squirrel ORDER BY id ${order.toUpperCase()}`, (error, result) => {
        if (error) {
            res.status(500).send('wrong request')
        } else {
            res.status(200).send(result);
        }
    })
})



app.get('/squirrels/:field', (req, res) => {
    const field = req.params.field;
    connection.query(`SELECT ${field} FROM squirrel`, (error, result) => {
        if (error) {
            res.status(404).send('not found')
        } else {
            res.status(200).send(result);
        }
    })
})


//Méthode plus conventionnelle mais qui se répète pour assumer toute les éventualités

// app.get('/squirrels/name', (req, res) => {
//     connection.query(`SELECT name FROM squirrel`, (error, result) => {
//         if (error) {
//             res.status(500).send(error)
//         } else {
//             res.status(200).send(result);
//         }
//     })
// })
// app.get('/squirrels/vaccinated', (req, res) => {
//     connection.query(`SELECT vaccinated FROM squirrel`, (error, result) => {
//         if (error) {
//             res.status(500).send(error)
//         } else {
//             res.status(200).send(result);
//         }
//     })
// })
// app.get('/squirrels/birth_date', (req, res) => {
//     connection.query(`SELECT birth_date FROM squirrel`, (error, result) => {
//         if (error) {
//             res.status(500).send(error)
//         } else {
//             res.status(200).send(result);
//         }
//     })
// })



//Méthode d'injection de SQL n'est pas sécure!

// app.get('/squirrels/:field/:how/:what', (req, res) => {
//     const field = req.params.field;
//     const how = req.params.how;
//     const what = req.params.what;
//     console.log(field, how, what);
//     if (how === 'contains') {
//         connection.query(`SELECT * FROM squirrel WHERE ${field} LIKE '%${what}%' `, (error, result) => {
//             res.status(200).json(result);
//         })
//     } else if (how === 'starts_with') {
//         connection.query(`SELECT * FROM squirrel WHERE ${field} LIKE '${what}%' `, (error, result) => {
//             res.status(200).json(result);
//         })
//     } else if (how === 'greater_than') {
//         connection.query(`SELECT * FROM squirrel WHERE ${field} > ${what} `, (error, result) => {
//             res.status(200).json(result);
//         })
//     } else {
//         res.status(404).send('not found')
//     }
// })

app.post('/squirrel/finded', (req, res) => {
    const { id, name, birth_date, vaccinated } = req.body;
    connection.query('INSERT INTO squirrel(id, name, birth_date, vaccinated) VALUES (?,?,?,?)', [id, name, birth_date, vaccinated], (error, result) => {
        if (error) {
            console.log(error);
            res.status(500).send('Error adding squirrel');
        } else {
            res.status(200).send('User updating successfully !!');
        }
    })
})

app.put('/squirrel/:id', (req, res) => {
    const { id, name, birth_date, vaccinated } = req.body;
    connection.query('UPDATE squirrel SET (name=?, birth_date=?, vaccinated=?) WHERE id=?', [name, birth_date, vaccinated, id], (error, result) => {
        if (error) {
            console.log(error);
            res.status(500).send('Error updating squirrel');
        } else {
            res.status(200).send('User updating successfully !!');
        }
    })
})

app.put('/toggle/vaccinated/:id', (req, res) => {
    connection.query('UPDATE squirrel SET vaccinated = !vaccinated WHERE id = ?', [req.params.id], (error, result) => {
        if (error) {
            console.log(error);
            res.status(500).send('Error updating squirrel');
        } else {
            res.status(200).send('Succes !');
        }
    })
})

app.delete('/delete/aoe', (req, res) => {
    connection.query('DELETE FROM squirrel WHERE vaccinated = 0', (error, result) => {
        if (error) {
            res.status(500).send('Wrong query !')
        } else {
            res.status(200).send(`All the non vaccinated squirrels has been deleted MOUAHHAHAHA`)
        }
    })
})

app.delete('/delete/:id', (req, res) => {

    connection.query('DELETE FROM squirrel WHERE id = ?', [req.params.id], (error, result) => {
        if (error) {
            res.status(500).send('Wrong query !')
        } else {
            res.status(200).send(`the id :${req.params.id} has been deleted`)
        }
    })
})
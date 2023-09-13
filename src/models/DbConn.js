'use strict'

const mysql = require('mysql')
const db = mysql.createConnection({
    database: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_USE,
    port: process.env.DB_PORT,
    multipleStatements: true
})

db.connect( (err, result )=> {
    if ( err ) {
        throw err
    }
    console.log("Database "+ db.state)
    // console.log('connected as id ' + db.threadId);
});

module.exports = db
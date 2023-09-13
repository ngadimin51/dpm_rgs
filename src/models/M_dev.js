'use strict'

const db = require('../models/DbConn')
let sql

const dev = (req, res) => {
    const {status} = req.body
    sql = `UPDATE developer SET status = ?`
    db.query(sql,[status], (err, result) => {
        if (err) throw err
        res.send(result)
    })
}

module.exports = {
    dev
}
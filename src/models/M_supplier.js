'use strict'

const db = require('./DbConn')

let sql
let data = {
    title: 'DPM',
    pageTitle: 'DPM',
    pageTitleDesc: 'DPM'
}

const allActiveSupplier = (req, res) => {
    sql = `SELECT id, name, pic FROM supplier WHERE STATUS = 1`
    db.query(sql, (err, result) => {
        if (err) throw err
        res.send(result)
    })
}

const supplierUpdateItem = (req, res) => {
    const { products, id } = req.body
    // console.log(req.body)
    sql = `UPDATE supplier SET products = ? WHERE id = ?`
    db.query(sql, [products, id], (err, result) => {
        if (err) {
            return res.status(200).json({status: 'failed', message: 'error updating database'})
        }
        res.status(200).json({status: 'success', message: 'success updating items'})
    })
}

module.exports = {
    allActiveSupplier, supplierUpdateItem
}
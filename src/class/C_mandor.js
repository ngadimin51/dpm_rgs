'use strict'

const db = require('../models/DbConn')
let sql

class C_mandor{
    mandorActive() {
        return new Promise((resolve, reject) => {
            sql = `SELECT * FROM mandor`
            db.query(sql, (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    byId(id) {
        return new Promise((resolve, reject) => {
            sql = `SELECT * FROM mandor WHERE mandor_id = ?`
            db.query(sql, [id], (err, result) => {
                if (err) return reject(err)
                return resolve(result[0])
            })
        })
    }
    cari(key) {
        return new Promise((resolve, reject) => {
            sql = `SELECT * FROM mandor WHERE mandor_nama LIKE ? OR mandor_alamat LIKE ?`
            db.query(sql, [`%${key}%`, `%${key}%`], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    checkHpMandor(hp) {
        return new Promise((resolve, reject) => {
            sql = `SELECT * FROM mandor WHERE mandor_hp = ?`
            db.query(sql, [hp], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    insertData(mandor_name, mandor_hp, mandor_alamat) {
        return new Promise((resolve, reject) => {
            sql = `INSERT INTO mandor (mandor_nama, mandor_hp, mandor_alamat) VALUES (?, ?, ?)`
            db.query(sql, [mandor_name, mandor_hp, mandor_alamat], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    update(nama, hp, alamat, id) {
        return new Promise((resolve, reject) => {
            sql = `UPDATE mandor SET mandor_nama = ?, mandor_hp = ?, mandor_alamat = ? WHERE mandor_id = ?`
            db.query(sql, [nama, hp, alamat, id], (err, result) =>{
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
}

module.exports = C_mandor
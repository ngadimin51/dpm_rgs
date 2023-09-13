'use strict'

const db = require('../models/DbConn')
let sql

class Item{
    constructor(id) {
        this.id = id
    }
    getAllItem() {
        return new Promise((resolve, reject) =>{
            sql = `SELECT * FROM item`
            db.query(sql, (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    getItemById(id) {
        return new Promise((resolve, reject) => {
            sql = `SELECT id, name, unit, pekerjaan FROM item WHERE id = ?`
            db.query(sql, [id], (err, result) => {
                if ( err ) return reject(err)
                return resolve(result)
            })
        })
    }
    getItemForDpm(pekerjaan, name) {
        if (pekerjaan && !name) {
            sql = `SELECT id, name, unit, pekerjaan FROM item WHERE pekerjaan = ?`
        } else if (pekerjaan && name) {
            sql = `SELECT id, name, unit, pekerjaan FROM item WHERE pekerjaan = ? AND name LIKE ?`
        } else {
            return false
        }
        return new Promise((resolve, reject) => {
            db.query(sql, [pekerjaan, `%${name}%`], (err, result) => {
                if (err) return reject({status: 'failed', message: 'error',  data: err})
                return resolve({status: 'success', message: 'berhasil ambil data', data: result})
            })
        })
    }
    getItemPekerjaan(pekerjaan) {
        if (pekerjaan) {
            sql = `SELECT id, name, unit, pekerjaan FROM item WHERE pekerjaan = ?`
        } else {
            sql = `SELECT pekerjaan FROM item GROUP BY pekerjaan`
        }
        return new Promise ( (resolve, reject) => {
            db.query(sql, [pekerjaan], (err, pekerjaan) => {
                if (err) return reject(err)
                return resolve(pekerjaan)
            })
        })
    }
    getUnit() {
        return new Promise((resolve, reject) => {
            //sql = `SELECT id, unit FROM item GROUP BY unit`
            sql = `SELECT * FROM unit`
            db.query(sql, (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    updateUnit(id, unit) {
        return new Promise((resolve, reject) => {
            sql = `UPDATE unit SET name = ? WHERE id = ?`
            db.query(sql, [unit, id], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    deleteUnit(id) {
        return new Promise((resolve, reject) => {
            sql = `DELETE FROM unit WHERE id = ?`
            db.query(sql, [id], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    checkItemExist(name, pekerjaan, unit) {
        return new Promise((resolve, reject) => {
            sql = `SELECT * FROM item WHERE name = ? AND pekerjaan = ?`
            db.query(sql, [name, pekerjaan, unit], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    updateItem(name, pekerjaan, unit, id) {
        return new Promise((resolve, reject) => {
            sql = `UPDATE item SET name = ?, pekerjaan = ?, unit = ? WHERE id = ?`
            db.query(sql, [name.trim(), pekerjaan, unit, id], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    check(name, pekerjaan, unit) {
        return new Promise((resolve, reject) => {
            sql = `SELECT * FROM item WHERE name = ? AND pekerjaan = ? AND unit = ?`
            db.query(sql, [name, pekerjaan, unit], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    insert(name, pekerjaan, unit) {
        return new Promise((resolve, reject) => {
            sql = `INSERT INTO item (name, pekerjaan, unit) VALUES (?, ?, ?)`
            db.query(sql, [name, pekerjaan, unit], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    delete(id) {
        return new Promise((resolve, reject) => {
            sql = `DELETE FROM item WHERE id = ?`
            db.query(sql, [id], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
}

module.exports = Item
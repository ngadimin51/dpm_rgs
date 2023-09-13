'use strict'

const db = require('../models/DbConn')
let sql

class Supplier{
    constructor(id) {
        this.id = id
    }
    allSupplier(limit) {
        return new Promise((resolve, reject) => {
            if (limit) {
                sql = `SELECT * FROM supplier LIMIT ?`
            } else {
                sql = `SELECT * FROM supplier`
            }
            db.query(sql, [limit], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    supplierActive() {
        return new Promise((resolve, reject) => {
            sql = `SELECT * FROM supplier WHERE status = 1`
            db.query(sql, (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    getSupplierDetail(id) {
        return new Promise((resolve, reject) => {
            sql = `SELECT * FROM supplier WHERE id = ?`
            db.query(sql, [id], (err, result) => {
                if (err) return reject(err)
                if (result.length == 1) {
                    return resolve(result[0])
                } else {
                    return resolve(id)
                }
            })
        })
    }
    getSupplierData(id) {
        return new Promise((resolve, reject) => {
            sql = `SELECT name FROM supplier WHERE id = ?`
            db.query(sql, [id], (err, result) => {
                if (err) return reject(err)
                if (result.length == 1) {
                    return resolve(result[0])
                } else {
                    return resolve(id)
                }
            })
        })
    }
    cari(key) {
        return new Promise((resolve, reject) => {
            sql = `SELECT * FROM supplier WHERE name LIKE ? OR address LIKE ? OR sales1 LIKE ? OR sales2 LIKE ? OR product1 LIKE ? OR product2 LIKE ? OR note LIKE ?`
            db.query(sql, [`%${key}%`, `%${key}%`, `%${key}%`, `%${key}%`, `%${key}%`, `%${key}%`, `%${key}%`], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    checkPhone(hp) {
        return new Promise((resolve, reject) => {
            sql = `SELECT * FROM supplier WHERE phone = ?`
            db.query(sql, [hp], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    updateSupplier(id, nama, pic, hp, bank, account, an, alamat, sales1, salesphone1, sales2, salesphone2, product1, price1, product2, price2, product3, price3, note) {
        return new Promise((resolve, reject) => {
            sql = `UPDATE supplier SET name = ?, pic = ?, phone = ?, bank = ?, account = ?, atas_nama = ?, address = ?, sales1 = ?, salesphone1 = ?, sales2 = ?, salesphone2 = ?, product1 = ?, price1 = ?, product2 = ?, price2 = ?, product3 = ?, price3 = ?, note = ? WHERE id = ?`
            db.query(sql, [nama, pic, hp, bank, account, an, alamat, sales1, salesphone1, sales2, salesphone2, product1, price1, product2, price2, product3, price3, note, id], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    insertData(nama, pic, alamat, hp) {
        return new Promise((resolve, reject) => {
            sql = `INSERT INTO supplier (name, pic, address, phone, products) VALUES (?, ?, ?, ?, ?)`
            db.query(sql, [nama, pic, alamat, hp, '[[null,0]]'], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
}

module.exports = Supplier
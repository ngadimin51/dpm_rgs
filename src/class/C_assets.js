'use strict'

const db = require('../models/DbConn')
let sql

class Assets{
    constructor(id) {
        this.id = id
    }
    all() {
        return new Promise((resolve, reject) =>{
            sql = `SELECT * FROM assets GROUP BY asset_name ORDER BY asset_id LIMIT 50`
            db.query(sql, (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    allName() {
        return new Promise((resolve, reject) =>{
            sql = `SELECT asset_name FROM assets GROUP BY asset_name ORDER BY asset_name`
            db.query(sql, (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    getById(id) {
        return new Promise((resolve, reject) =>{
            sql = `SELECT * FROM assets WHERE asset_id = ?`
            db.query(sql, [id], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    getName(name) {
        return new Promise((resolve, reject) =>{
            sql = `SELECT * FROM assets WHERE asset_name = ?`
            db.query(sql, [name], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    loadMore(id, nama) {
        return new Promise((resolve, reject) =>{
            sql = `SELECT * FROM assets WHERE asset_id > ? AND asset_name != ? GROUP BY asset_name ORDER BY asset_id LIMIT 50`
            db.query(sql, [id, nama], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    pencarian(name) {
        return new Promise((resolve, reject) => {
            sql = `SELECT * FROM assets WHERE asset_name LIKE ? GROUP BY asset_name`
            db.query(sql, [`%${name}%`], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    updateReportAsset(id, namex, type, qtyx, kondisix, keteranganx) {
        return new Promise((resolve, reject) => {
            if (type == 'in') {
                sql = `UPDATE assets SET asset_name = ?, asset_qty = ?, asset_qty_out = 0, asset_kondisi = ?, asset_keterangan = ? WHERE asset_id = ?`
            } else {
                sql = `UPDATE assets SET asset_name = ?, asset_qty = 0, asset_qty_out = ?, asset_kondisi = ?, asset_keterangan = ? WHERE asset_id = ?`
            }
            db.query(sql, [namex, qtyx, kondisix, keteranganx, id], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    updateDeleteAsset(id) {
        return new Promise((resolve, reject) => {
            sql = `DELETE FROM assets WHERE asset_id = ?`
            db.query(sql, [id], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    insertRecord(namex, type, qtyx, kondisix, keteranganx) {
        return new Promise((resolve, reject) => {
            const date = new Date()
            if (type == 'in') {
                sql = `INSERT INTO assets (asset_name, asset_qty, asset_kondisi, asset_keterangan, asset_tanggal) VALUES (?, ?, ?, ?, ?)`
            } else {
                sql = `INSERT INTO assets (asset_name, asset_qty_out, asset_kondisi, asset_keterangan, asset_tanggal) VALUES (?, ?, ?, ?, ?)`
            }
            db.query(sql, [namex, qtyx, kondisix, keteranganx, date], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
}

module.exports = Assets
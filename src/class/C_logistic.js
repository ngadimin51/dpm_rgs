'use strict'

const db = require('../models/DbConn')
let sql

class Logistic {
    constructor(id) {
        this.id = id
    }
    total(project, logItem) {
        return new Promise( (resolve, reject) => {
            sql = `SELECT * FROM logistic WHERE log_project = ? AND log_item = ?`
            db.query(sql, [project, logItem], (err, result) => {
                if (err) return reject(err)
                let logIn = 0
                let logOut = 0
                for (let i = 0; i < result.length; i++) {
                    logIn += result[i].log_in
                    logOut += result[i].log_out
                }
                return resolve({logIn, logOut})
            })
        })
    }
    totalReport(project) {
        return new Promise ( (resolve, reject) => {
            sql = `SELECT log_id FROM logistic WHERE log_project = ? GROUP BY log_item`
            db.query(sql, [project], (err, rows) => {
                if (err) return reject(err)
                return resolve(rows.length)
            })
        })
    }
    getLogistic(project, pekerjaan) {
        return new Promise( (resolve, reject) => {
            sql = `SELECT log_project, log_item, item.name, item.unit FROM logistic JOIN item ON log_item = item.id WHERE log_project = ? AND item.pekerjaan = ? GROUP BY log_item`
            db.query(sql, [project, pekerjaan], async (err, result) => {
                if (err) return reject(err)
                let arrItem = []
                for (let i = 0; i < result.length; i++) {
                    let total = await this.total(project, result[i].log_item)
                    arrItem.push({
                        log_project: result[i].log_project,
                        log_item: result[i].log_item,
                        name: result[i].name,
                        unit: result[i].unit,
                        totalIn: total.logIn,
                        totalOut: total.logOut
                    })
                }
                return resolve(arrItem)
            })
        })
    }
    detilLogistic(project, item) {
        return new Promise((resolve, reject) => {
            sql = `SELECT
                log_id, log_project, log_item, log_tanggal_masuk, log_jam_masuk, log_in, log_out, log_lampiran, log_note, log_id_user, log_created, log_update,
                item.name, item.unit, item.pekerjaan,
                admin.name as petugas
            FROM logistic
            JOIN item ON item.id = logistic.log_item
            JOIN admin ON admin.id = logistic.log_id_user
            WHERE log_project = ? AND log_item = ?`
            db.query(sql, [project, item], (err, result) => {
                if (err) return reject(err)
                let totalIn = 0
                let totalOut = 0
                for (let i = 0; i < result.length; i++) {
                    totalIn += result[i].log_in
                    totalOut += result[i].log_out
                }
                return resolve(result)
            })
        })
    }
    insertNewReport(project, item, unit, type, qty, tanggal, jam, lampiran, catatan, userId) {
        return new Promise((resolve, reject) => {
            if (type == 'in') {
                sql = `INSERT INTO logistic (log_project, log_item, log_unit, log_tanggal_masuk, log_jam_masuk, log_in, log_lampiran, log_note, log_id_user) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
            } else {
                sql = `INSERT INTO logistic (log_project, log_item, log_unit, log_tanggal_masuk, log_jam_masuk, log_out, log_lampiran, log_note, log_id_user) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
            }
            db.query(sql, [project, item, unit, tanggal, jam, qty, lampiran, catatan, userId], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    updateReport(project, item, unit, type, qty, tanggal, jam, lampiran, catatan, userId, dataId) {
        return new Promise((resolve, reject) => {
            if (type == 'in') {
                sql = `UPDATE logistic SET log_project = ?, log_item = ?, log_tanggal_masuk = ?, log_jam_masuk = ?, log_in = ?, log_out = 0, log_lampiran = ?, log_note = ?, log_id_user = ? WHERE log_id = ?`
            } else {
                sql = `UPDATE logistic SET log_project = ?, log_item = ?, log_tanggal_masuk = ?, log_jam_masuk = ?, log_out = ?, log_in = 0, log_lampiran = ?, log_note = ?, log_id_user = ? WHERE log_id = ?`
            }
            db.query(sql, [project, item, tanggal, jam, qty, lampiran, catatan, userId, dataId], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
}

module.exports = Logistic
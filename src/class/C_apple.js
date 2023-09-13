'use strict'

const db = require('../models/DbConn')
let sql

class Apple{
    constructor(id) {
        this.id = id
    }
    getAppleByAppleId(id) {
        return new Promise((resolve, reject) => {
            sql = `SELECT
                apple.status,
                dpm.dpm_id, dpm.project, dpm.number, dpm.unit, dpm.code_rap, dpm.qty1, dpm.qty2, dpm.qty3, dpm.control, dpm.ho,
                item.name, item.pekerjaan, apple.id as appleId
            FROM apple
                JOIN dpm ON dpm.dpm_id = apple.dpm_id
                JOIN item ON item.id = dpm.item
            WHERE apple.id = ?`
            db.query(sql, (id), (err, result) => {
                if (err) return reject(err)
                return resolve(result[0])
            })
        })
    }
    getAppleByDpmNumberId(number, dpmId) {
        return new Promise((resolve, reject) => {
            sql = `SELECT * FROM apple WHERE number = ? AND dpm_id = ?`
            db.query(sql, [number, dpmId], (err, result) => {
                if (err) return reject(err)
                return resolve(result[0])
            })
        })
    }
    pengajuanByProject(project) {
        return new Promise((resolve, reject) => {
            sql = `SELECT dpm.dpm_id, dpm.project, dpm.number, dpm.unit, dpm.qty1, dpm.qty2, dpm.qty3, dpm.control, dpm.ho, item.name, item.pekerjaan FROM apple JOIN dpm ON dpm.dpm_id = apple.dpm_id JOIN item on item.id = dpm.item WHERE dpm.project = ? AND status = 10`
            db.query(sql, [project], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    pengajuanCostControllByProject(project) {
        return new Promise((resolve, reject) => {
            sql = `SELECT
                dpm.dpm_id, dpm.project, dpm.number, dpm.unit, dpm.qty1, dpm.qty2, dpm.qty3, dpm.control, dpm.ho, item.name, item.pekerjaan
            FROM apple
                JOIN dpm ON dpm.dpm_id = apple.dpm_id
                JOIN item on item.id = dpm.item
            WHERE status = 1 AND dir_acc > 0 AND dpm.project = ?`
            db.query(sql, [project], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    revisiByProject(project) {
        return new Promise((resolve, reject) => {
            sql = `SELECT
                dpm.dpm_id, dpm.project, dpm.number, dpm.unit, dpm.qty1, dpm.qty2, dpm.qty3, dpm.control, dpm.ho, item.name, item.pekerjaan
            FROM dpm
                JOIN apple ON apple.dpm_id = dpm.dpm_id
                JOIN item on item.id = dpm.item
            WHERE
                dpm.project = ? AND status = 0 AND dir_acc is null
            OR
                dpm.project = ? AND status = 0 AND dir_acc = 0`
            db.query(sql, [project, project], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    approveByProject(project) {
        return new Promise((resolve, reject) => {
            sql = `SELECT dpm.dpm_id, dpm.project, dpm.number, dpm.unit, dpm.qty1, dpm.qty2, dpm.qty3, dpm.control, dpm.ho, item.name, item.pekerjaan FROM apple JOIN dpm ON dpm.dpm_id = apple.dpm_id JOIN item on item.id = dpm.item WHERE dpm.project = ? AND status = 3 AND dir_acc > 0`
            db.query(sql, [project], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    updateStatusHo(id) {
        return new Promise((resolve, reject) => {
            sql = `UPDATE dpm SET ho = 3 WHERE dpm_id = ?`
            db.query(sql, [id], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    submitApple(userId, project, status, id, number, supl1, price1, payment1, note1, supl2, price2, payment2, note2, supl3, price3, payment3, note3, catatan) {
        return new Promise((resolve, reject) => {
            sql = 'INSERT INTO apple (purchasing_id, project, status, dpm_id, number, supl1, price1, payment1, note1, supl2, price2, payment2, note2, supl3, price3, payment3, note3, pur_comment) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
            db.query(sql, [userId, project, status, id, number, supl1, price1, payment1, note1, supl2, price2, payment2, note2, supl3, price3, payment3, note3, catatan], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
                /*
                if (result.affectedRows === 1) {
                    await whatsappAppleToCC(req, result.insertId, catatan)
                    res.send({status: 'success'})
                } else {
                    res.send({status: 'failed', message: 'error input db', data: result})
                }
                */
            })
        })
    }
    updateApple(userId, status, supl1, price1, payment1, note1, supl2, price2, payment2, note2, supl3, price3, payment3, note3, catatan, appleId) {
        return new Promise((resolve, reject) => {
            sql = `UPDATE apple
            SET 
                purchasing_id = ?,
                status = ?,
                supl1 = ?,
                price1 = ?,
                payment1 = ?,
                note1 = ?,
                supl2 = ?,
                price2 = ?,
                payment2 = ?,
                note2 = ?,
                supl3 = ?,
                price3 = ?,
                payment3 = ?,
                note3 = ?,
                pur_comment = ?,
                dir_acc = null
            WHERE id = ?`
            db.query(sql, [userId, 10, supl1, price1, payment1, note1, supl2, price2, payment2, note2, supl3, price3, payment3, note3, catatan, appleId], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    approveApple(userId, supl, comment, status, appleId) {
        return new Promise((resolve, reject) => {
            sql = `UPDATE apple SET dir_id = ?, dir_acc = ?, dir_comment = ?, status = ? WHERE id = ?`
            db.query(sql, [userId, supl, comment, status, appleId], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    rejectApple(userId, comment, appleId) {
        return new Promise((resolve, reject) => {
            sql = `UPDATE apple SET dir_acc = null, status = 0, dir_id = ?, dir_comment = ? WHERE id = ?`
            db.query(sql, [userId, comment, appleId], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    // untuk update apple tersedia untuk PO atau tidak
    updateStatusApple(dpmId, status) {
        // console.log(dpmId, status)
        return new Promise( (resolve, reject) => {
            sql = 'UPDATE apple SET status = ? WHERE dpm_id = ?'
            db.query(sql, [status, dpmId], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
}

module.exports = Apple
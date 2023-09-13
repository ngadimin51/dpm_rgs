'use strict'

const db = require("../models/DbConn")

let sql

class Verification{
    getAll() {
        return new Promise((resolve, reject) => {
            sql = `SELECT ver_id, ver_type, ver_number, ver_status, ver_key, ver_message_1, ver_message_2, po_id, project FROM verification JOIN po_detail ON po_detail.po_number = verification.ver_number WHERE po_detail.po_status = 0 GROUP BY po_detail.po_number`
            db.query(sql, (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    getVerById(id) {
        return new Promise((resolve, reject) => {
            sql = `SELECT
                ver_id, ver_type, ver_number, ver_status, ver_key, ver_message_1, ver_message_2,
                supplier.name as supplier,
                po_detail.project as project
            FROM verification
                JOIN po_detail
                    ON po_detail.po_number = verification.ver_number
                JOIN supplier
                    ON supplier.id = po_detail.supl
            WHERE ver_id = ?
                GROUP BY po_number`
            db.query(sql, [id], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    getVerification(type, number, key) {
        return new Promise((resolve, reject) => {
            sql = `SELECT
                ver_id, ver_type, ver_number, ver_status, ver_key, ver_message_1, ver_message_2,
                supplier.name as supplier
            FROM verification
            JOIN po_detail
                ON po_detail.po_number = verification.ver_number
            JOIN supplier
                ON supplier.id = po_detail.supl
            WHERE ver_type = ?
            AND ver_number = ?
            AND ver_key = ?
            GROUP BY po_number`
            db.query(sql, [type, number, key], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    getVerificationByPoNumber(type, number) {
        return new Promise((resolve, reject) => {
            sql = `SELECT
                ver_id, ver_type, ver_number, ver_status, ver_key, ver_message_1, ver_message_2,
                supplier.name as supplier
            FROM verification
            JOIN po_detail
                ON po_detail.po_number = verification.ver_number
            JOIN supplier
                ON supplier.id = po_detail.supl
            WHERE ver_type = ?
            AND ver_number = ?
            GROUP BY po_number`
            db.query(sql, [type, number], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    getVerificationByIdPoNumber(id, number) {
        return new Promise((resolve, reject) => {
            sql = `SELECT
                ver_id, ver_type, ver_number, ver_status, ver_key, ver_message_1, ver_message_2,
                supplier.name as supplier,
                po_detail.project as project
            FROM verification
            JOIN po_detail
                ON po_detail.po_number = verification.ver_number
            JOIN supplier
                ON supplier.id = po_detail.supl
            WHERE ver_id = ?
                AND ver_number = ?
                AND po_status = 0
                GROUP BY po_number`
            db.query(sql, [id, number], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    getApprove() {
        return new Promise((resolve, reject) => {
            sql = `SELECT
                ver_id, ver_type, ver_number, ver_status, ver_key, ver_message_1, ver_message_2, 
                po_id, po_status, project
            FROM verification
                JOIN po_detail
                    ON po_detail.po_number = verification.ver_number
            WHERE ver_status = 2
            AND  po_detail.po_status = 0
            GROUP BY ver_number`
            db.query(sql, (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    getRevisi() {
        return new Promise((resolve, reject) => {
            sql = `SELECT
                ver_id, ver_type, ver_number, ver_status, ver_key, ver_message_1, ver_message_2, 
                po_id, po_status, project
            FROM verification
                JOIN po_detail
                    ON po_detail.po_number = verification.ver_number
            WHERE ver_status = 1
            AND  po_detail.po_status = 0
            GROUP BY ver_number`
            db.query(sql, (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    getPengajuan() {
        return new Promise((resolve, reject) => {
            sql = `SELECT
                ver_id, ver_type, ver_number, ver_status, ver_key, ver_message_1, ver_message_2, 
                po_id, po_status, project
            FROM verification
                JOIN po_detail
                    ON po_detail.po_number = verification.ver_number
            WHERE ver_status = 0
            AND  po_detail.po_status = 0
            GROUP BY ver_number`
            db.query(sql, (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    update(userId, id, status, pesan) {
        let random = makeid(20)
        return new Promise((resolve, reject) => {
            if (status == 2) {
                random = random
            } else {
                random = null
            }
            sql = `UPDATE verification SET ver_id_updated = ?, ver_status = ?, ver_key = ?, ver_message_2 = ? WHERE ver_id = ?`
            db.query(sql, [userId, status, random, pesan, id], (err, result) => {
                if (err) return reject(err)
                return resolve({result, random})
            })
        })
    }
    inputNewVer( type, number, status, message1, supl, creator ) {
        return new Promise((resolve, reject) => {
            sql = `INSERT INTO verification (ver_type, ver_number, ver_status, ver_message_1, ver_supl, ver_id_created) VALUES (?, ?, ?, ?, ?, ?)`
            db.query(sql, [ type, number, status, message1, supl, creator ], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
}

function makeid(length) {
    let result                  = '';
    let characters              = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength        = characters.length;
    for ( let i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

module.exports = Verification
'use strict'

const db = require('../models/DbConn')
let sql

class Absen{
    constructor(id) {
        this.id = id
    }
    insertAbsen(userId, ipAddress, lat, lon, ket, userAgent) {
        return new Promise((resolve, reject) => {
            sql = `INSERT INTO absensi (user_id, user_ip, user_lat, user_lon, user_keterangan, user_ua) VALUES (?, ?, ?, ?, ?, ?)`
            db.query(sql, [userId, ipAddress, lat, lon, ket, userAgent], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }

    today(userId) {
        const date = new Date()
        const tahun = date.getFullYear()
        let bulan = date.getMonth() + 1
        bulan = bulan < 10 ? '0'+bulan : bulan
        let tanggal = date.getDate()
        tanggal = tanggal < 10 ? '0'+tanggal : tanggal
        const find = tahun+'-'+bulan+'-'+tanggal

        return new Promise((resolve, reject) => {
            sql = `SELECT * FROM absensi WHERE user_id = ? AND created LIKE ?`
            db.query(sql, [userId, `%${find}%`], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }

    getDay(userId, date) {
        date = new Date(date)
        const tahun = date.getFullYear()
        let bulan = date.getMonth() + 1
        bulan = bulan < 10 ? '0'+bulan : bulan
        let tanggal = date.getDate()
        tanggal = tanggal < 10 ? '0'+tanggal : tanggal
        const find = tahun+'-'+bulan+'-'+tanggal

        return new Promise((resolve, reject) => {
            sql = `SELECT * FROM absensi WHERE user_id = ? AND created LIKE ?`
            db.query(sql, [userId, `%${find}%`], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }

    download(userId, tahun, bulan) {
        return new Promise((resolve, reject) => {
            sql = `SELECT * FROM absensi WHERE created like ? AND user_id = ?`
            db.query(sql, [`%${tahun}-${bulan}%`, userId], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
        
    }

}

module.exports = Absen
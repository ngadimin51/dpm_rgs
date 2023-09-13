'use strict'

const db = require('../models/DbConn')
let sql

class Admin{
    constructor(id) {
        this.id = id
    }
    allAdmin() {
        return new Promise((resolve, reject) => {
            sql = `SELECT
                id, name, level, project, admin_status,
            CASE
                WHEN admin_status = 0 THEN 'INACTIVE'
                WHEN admin_status = 1 THEN 'ACTIVE'
                WHEN admin_status = 2 THEN 'BANNED'
                ELSE 'error'
            END as status
            FROM admin`
            db.query(sql, (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    allAdminStatus(status) {
        return new Promise((resolve, reject) => {
            sql = `SELECT * FROM admin WHERE admin_status = ? ORDER BY name`
            db.query(sql,[status], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    adminData(id) {
        return new Promise((resolve, reject) => {
            if (Number.isInteger(id * 1)) {
                sql = `SELECT * FROM admin WHERE id = ?`
                db.query(sql,[id], (err, result) => {
                    if (err) return reject(err)
                    return resolve(result[0])
                })
            } else {
                return resolve(id)
            }
        })
    }
    adminLevel(level) {
        return new Promise((resolve, reject) => {
            sql = `SELECT * FROM admin WHERE level IN (?) AND admin_status = 1`
            db.query(sql, [level], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    adminProject(key) {
        return new Promise((resolve, reject) => {
            sql = `SELECT * FROM admin WHERE project = ? AND admin_status = 1`
            db.query(sql, [key], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
}

module.exports = Admin
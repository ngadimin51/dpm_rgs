'use strict'

const db = require('../models/DbConn')
const C_project = require('./C_project')
const p = new C_project()
let sql

class Dpm {
    constructor(id) {
        this.id = id
    }
    byProject(project) {
        return new Promise(async (resolve, reject) => {
            sql = `SELECT dpm_id, project, dpm.number, dpm.unit, qty1, qty2, qty3, control, ho, item.name, item.pekerjaan FROM dpm JOIN item ON item.id=dpm.item WHERE project = ? ORDER BY dpm_id DESC LIMIT 300`
            db.query(sql, [project], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    byControlHo(control, ho, project) {
        return new Promise((resolve, reject) => {
            sql = `SELECT dpm_id, project, dpm.number, dpm.unit, qty1, qty2, qty3, control, ho, item.name, item.pekerjaan FROM dpm JOIN item on item.id = dpm.item WHERE control = ? AND ho = ? AND project = ?`
            db.query(sql, [control, ho, project], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    byNumber(number) {
        return new Promise((resolve, reject) => {
            sql = `SELECT dpm_id, project, dpm.number, dpm.unit, qty1, qty2, qty3, control, ho, item.name, item.pekerjaan FROM dpm JOIN item ON item.id=dpm.item WHERE number = ?`
            db.query(sql, [number], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    byIdItem(idItem) {
        return new Promise((resolve, reject) => {
            sql = `SELECT dpm_id, project, dpm.number, dpm.unit, qty1, qty2, qty3, control, ho, item.name, item.pekerjaan FROM dpm JOIN item ON item.id=dpm.item WHERE item = ?`
            db.query(sql, [idItem], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    byNumberId(number, dpmId) {
        return new Promise((resolve, reject) => {
            sql = `SELECT dpm_id, dpm.number, dpm.catatan, dpm.project, dpm.item, dpm.code_rap, dpm.unit, qty1, qty2, qty3, dpm.created, dpm.pm_comment, dpm.comment, dpm.site1 as pembuat, dpm.sm_modify, dpm.pm_modify, dpm.cc_modify, dpm.control, dpm.ho, dpm.date1, dpm.date2, cc_id as cc, item.name FROM dpm JOIN item ON item.id = dpm.item WHERE number = ? AND dpm_id = ?`
            db.query(sql, [number, dpmId], (err, result) => {
                if (err) return reject(err)
                return resolve(result[0])
            })
        })
    }
    byId(dpmId) {
        return new Promise((resolve, reject) => {
            sql = `SELECT * FROM dpm WHERE dpm_id = ?`
            db.query(sql, [dpmId], (err, result) => {
                if (err) return reject(err)
                return resolve(result[0])
            })
        })
    }
    search(project, item) {
        return new Promise((resolve, reject) => {
            sql = `SELECT dpm_id, dpm.number, dpm.catatan, dpm.project, dpm.item, dpm.code_rap, dpm.unit, qty1, qty2, qty3, dpm.created, dpm.pm_comment, dpm.comment, dpm.site1 as pembuat, dpm.sm_modify, dpm.pm_modify, dpm.cc_modify, dpm.control, dpm.ho, dpm.date1, dpm.date2, cc_id as cc, item.name FROM dpm JOIN item ON item.id = dpm.item WHERE dpm.project = ? AND item.name LIKE ?`
            db.query(sql, [project, `%${item}%`], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    totalDpm(project) {
        return new Promise ( (resolve, reject) => {
            sql = `SELECT dpm_id FROM dpm WHERE project = ?`
            db.query(sql, [project], (err, result) => {
                if (err) return reject(err)
                return resolve(result.length)
            })
        })
    }
    getDpmNumber(project) {
        return new Promise( (resolve, reject) => {
            sql = `SELECT number FROM dpm WHERE project = ? ORDER BY dpm_id DESC LIMIT 1`
            db.query(sql, [project], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    checkDataDpm(id, project) {
        return new Promise((resolve, reject) => {
            sql = `SELECT * FROM dpm WHERE item = ? AND project = ? AND ho < 5`
            db.query(sql, [id, project], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    checkDpmStatus(id, project) {
        return new Promise ( (resolve, reject) => {
            sql = `SELECT * FROM dpm WHERE item = ? AND project = ? AND ho < 5`
            db.query(sql, [id, project], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    getItemNameByDpmNumber(dpmNumber) {
        return new Promise((resolve, reject) => {
            sql = `SELECT qty1, dpm.unit, item.name FROM dpm JOIN item ON item.id = dpm.item WHERE number = ?`
            db.query(sql, [dpmNumber], (err, rows) => {
                if (err) return reject(err)
                return resolve(rows)
            })
        })
    }
    insertNewDpm(array) {
        return new Promise((resolve, reject) => {
            sql = `INSERT INTO dpm (number, project, item, unit, catatan, qty1, code_rap, date1, site1, control, ho, created) VALUES ?`
            db.query(sql, [array], async (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    updateQty(table,qty,ho,dpmId) {
        return new Promise((resolve, reject) => {
            sql = `UPDATE dpm SET ${table} = ?, ho = ? WHERE dpm_id = ?`
            db.query(sql, [qty, ho, dpmId], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    approvalSE(userId, dpmId) {
        return new Promise((resolve, reject) => {
            sql = `UPDATE dpm SET control = 0, site1 = ? WHERE dpm_id = ?`
            db.query(sql, [userId, dpmId], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    approvalSM(catatan, status, dpmId) {
        return new Promise((resolve, reject) => {
            sql = `UPDATE dpm SET control = ?, sm_modify = CURRENT_TIME, pm_comment = ? WHERE dpm_id = ?`
            db.query(sql, [status, catatan, dpmId], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    approvalPM(catatan, status, dpmId) {
        return new Promise((resolve, reject) => {
            sql = `UPDATE dpm SET control = ?, pm_modify = CURRENT_TIME, pm_comment = ? WHERE dpm_id = ?`
            db.query(sql, [status, catatan, dpmId], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    approvalCC(userId, dpmId, status, qty2, date2, catatan) {
        return new Promise((resolve, reject) => {
            sql = `UPDATE dpm SET control = 4, ho = ?, qty2 = ?, date2 = ?, comment = ?, cc_id = ? WHERE dpm_id = ?`
            db.query(sql, [status, qty2, date2, catatan, userId, dpmId], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    checkItem(id) {
        return new Promise((resolve, reject) => {
            sql = `SELECT * FROM dpm WHERE item = ?`
            db.query(sql, [id], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    checkDpmStatus(project, lapangan, ho, apple) {
        if (apple == 'process') {
            return new Promise((resolve, reject) => {
                sql = `SELECT *
                FROM dpm
                JOIN apple
                    ON apple.dpm_id = dpm.dpm_id
                JOIN item
                    ON item.id = dpm.item
                WHERE dpm.project = ?
                    AND control = ? AND ho = ? AND apple.status = 0
                OR dpm.project = ?
                    AND control = ? AND ho = ? AND apple.status = 1
                OR dpm.project = ?
                    AND control = ? AND ho = ? AND apple.status = 10`
                db.query(sql, [project, lapangan, ho, project, lapangan, ho, project, lapangan, ho], (err, result) => {
                    if (err) return reject(err)
                    return resolve(result)
                })
            })
        } else {
            return new Promise((resolve, reject) => {
                if (apple == 'approve') {
                    sql = `SELECT *
                    FROM dpm
                        JOIN apple ON apple.dpm_id = dpm.dpm_id
                        JOIN item ON item.id = dpm.item
                    WHERE dpm.project = ? AND control = ? AND ho = ? AND apple.status = 3
                    OR dpm.project = ? AND control = ? AND ho = ? AND apple.status = 4`
                } else {
                    sql = `SELECT * FROM dpm JOIN item ON item.id = dpm.item WHERE project = ? AND control = ? AND ho = ?`
                }
                db.query(sql, [project, lapangan, ho, project, lapangan, ho], (err, result) => {
                    if (err) return reject(err)
                    return resolve(result)
                })
            })
        }
    }
    updateDinamic(column, value, id) {
        return new Promise((resolve, reject) => {
            sql = `UPDATE dpm SET ${column} = ? WHERE dpm_id = ?`
            db.query(sql, [value, id], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    updateDpmStatusByPoApprove(array, value) {
        return new Promise((resolve, reject) => {
            sql = `UPDATE dpm SET ho = ? WHERE dpm_id IN (?)`
            db.query(sql, [value, array], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
}

module.exports = Dpm

// const d = new Date().toLocaleString('id-ID', { timeZone: "Asia/Jakarta" })
// const date = d.split('Z')[0]
// const time = d.split('Z')[0].split(' ')[1]
// console.log(date)
// console.log(time)
// console.log(date+" "+time[0]+":"+time[1]+":"+time[2])
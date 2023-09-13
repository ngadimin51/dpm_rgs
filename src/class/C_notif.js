'use strict'

const db = require('../models/DbConn')
const Verification = require('../class/C_verification')


let sql

class C_notif{
    constructor(id, level) {
        this.id = id
        this.level = level
    }
    async getNotif() {
        const Cproject = require('../class/C_project')
        const Project = new Cproject
        const penugasan = await Project.penugasan(this.id)
        const array = []
        for (let i = 0; i < penugasan.length; i++) {
            const dpmData = await this.getDpm(penugasan[i].project, this.level)
            const appleData = await this.getApple(penugasan[i].project, this.level)
            const poData = await this.getPo(penugasan[i].project, this.level)
            const qrData = await this.getQrCode(penugasan[i].project, this.level)
            if (dpmData.length > 0) {
                for (let i = 0; i < dpmData.length; i++) {
                    array.push({
                        project: dpmData[i].project,
                        dpm_id: dpmData[i].dpm_id,
                        number: dpmData[i].number,
                        name: dpmData[i].name,
                        pekerjaan: dpmData[i].code_rap,
                        type: 'DPM'
                    })
                }
            }
            if (appleData.length > 0) {
                for (let i = 0; i < appleData.length; i++) {
                    if (this.level == 'po') {
                        var nama = appleData[i].name+' | '+appleData[i].supplier
                    } else {
                        var nama = appleData[i].name
                    }
                    array.push({
                        project: appleData[i].project,
                        dpm_id: appleData[i].dpm_id,
                        number: appleData[i].number,
                        name: nama,
                        pekerjaan: appleData[i].code_rap,
                        type: 'APPLE'
                    })
                }
            }
            if (poData.length > 0) {
                for (let i = 0; i < poData.length; i++) {
                    if (poData[i].bod_approve == 1) {
                        var pekerjaan = 'Pengajuan'
                    } else if (poData[i].bod_approve == 2) {
                        var pekerjaan = 'Revisi'
                    } else if (poData[i].bod_approve == 3) {
                        var pekerjaan = 'Approve'
                    } else {
                        var pekerjaan = 'Error'
                    }
                    array.push({
                        project: poData[i].project,
                        dpm_id: poData[i].dpm_id,
                        number: poData[i].po_number,
                        name: poData[i].supl,
                        pekerjaan: pekerjaan,
                        type: 'PO'
                    })
                }
            }
            if (typeof qrData !== 'undefined' && qrData.length > 0) {
                // console.log(qrData)
                for (let i = 0; i < qrData.length; i++) {
                    // if (poData[i].bod_approve == 1) {
                    //     var pekerjaan = 'Pengajuan'
                    // } else if (poData[i].bod_approve == 2) {
                    //     var pekerjaan = 'Revisi'
                    // } else if (poData[i].bod_approve == 3) {
                    //     var pekerjaan = 'Approve'
                    // } else {
                    //     var pekerjaan = 'Error'
                    // }
                    array.push({
                        project: qrData[i].project,
                        dpm_id: qrData[i].ver_id,
                        number: qrData[i].ver_number,
                        name: qrData[i].ver_message_1,
                        pekerjaan: 'Pengajuan',
                        type: 'QR'
                    })
                }
            }
            // if (qrData.length > 0) {
            // }
        }
        return array
    }
    
    //cari notifikasi dpm berdasar level
    async getDpm(project, level) {
        return new Promise((resolve, reject) => {
            const fileds = 'dpm_id, number, project, code_rap, item.name'
            if (level == 'site engineer') {
                sql = `SELECT ${fileds}
                FROM dpm
                    JOIN item ON item.id = dpm.item
                WHERE project = ?
                    AND control <= 1`
            } else if (level == 'site manager') {
                sql = `SELECT ${fileds}
                FROM dpm
                    JOIN item ON item.id = dpm.item
                WHERE project = ?
                    AND control = 0
                OR project = ?
                    AND control = 3`
            } else if (level == 'project manager') {
                sql = `SELECT ${fileds}
                FROM dpm
                    JOIN item ON item.id = dpm.item
                WHERE project = ?
                    AND control = 2
                OR project = ?
                    AND ho = 1`
            } else if (level == 'cost controll') {
                sql = `SELECT ${fileds}
                FROM dpm
                    JOIN item ON item.id = dpm.item
                WHERE project = ?
                    AND control = 4
                    AND ho = 0`
            } else if (level == 'purchasing') {
                sql = `SELECT ${fileds}
                FROM dpm
                    JOIN item ON item.id = dpm.item
                WHERE project = ?
                    AND control = 4 AND ho = 2`
            } else if (level == 'logistic') {
                sql = `SELECT ${fileds}
                FROM dpm
                    JOIN item ON item.id = dpm.item
                WHERE project = ?
                    AND control = 4 AND ho = 5`
            } else if (level == 'site logistic') {
                sql = `SELECT ${fileds}
                FROM dpm
                    JOIN item ON item.id = dpm.item
                WHERE project = ?
                    AND control = 4 AND ho = 6`
            } else {
                sql = `SELECT * FROM dpm WHERE dpm_id = 0`
            }
            db.query(sql, [project, project, project], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    //Selesai

    //cari notifikasi apple berdasar level
    async getApple(project, level) {
        return new Promise((resolve, reject) => {
            const fields = 'dpm.dpm_id, dpm.number, dpm.project, dpm.code_rap, item.name as name'
            if (level == 'cost controll') {
                sql = `SELECT ${fields}
                FROM dpm
                    JOIN item ON item.id = dpm.item
                    JOIN apple ON apple.dpm_id = dpm.dpm_id
                WHERE dpm.project = ?
                    AND control = 4
                    AND ho = 3
                    AND status = 10`
            } else if (level == 'purchasing') {
                sql = `SELECT ${fields}
                FROM dpm
                    JOIN item ON item.id = dpm.item
                    JOIN apple ON apple.dpm_id = dpm.dpm_id
                WHERE dpm.project = ?
                    AND control = 4
                    AND ho = 3
                    AND status = 10
                    AND dir_acc > 0
                OR dpm.project = ?
                    AND control = 4
                    AND ho = 3
                    AND status = 0
                    AND dir_acc = null
                OR dpm.project = ?
                    AND control = 4
                    AND ho = 3
                    AND status = 0
                    AND dir_acc = 0`
            } else if (level == 'director') {
                sql = `SELECT ${fields}
                FROM dpm
                    JOIN item ON item.id = dpm.item
                    JOIN apple ON apple.dpm_id = dpm.dpm_id
                WHERE dpm.project = ?
                    AND control = 4
                    AND ho = 3 AND
                    status = 1`
            } else if (level == 'po') {
                sql = `SELECT dpm.dpm_id, dpm.number, dpm.project, dpm.code_rap, item.name, supplier.name as supplier
                FROM dpm
                    JOIN item ON item.id = dpm.item
                    JOIN apple ON apple.dpm_id = dpm.dpm_id
                    JOIN supplier ON supplier.id = apple.dir_acc
                WHERE dpm.project = ?
                    AND dir_acc > 0
                    AND apple.status = 3`
            } else {
                sql = `SELECT * FROM apple WHERE id = 0`
            }
            db.query(sql, [project, project, project], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    //Selesai

    //cari notifikasi po berdasar level
    async getPo(project, level) {
        return new Promise((resolve, reject) => {
            if (level == 'director' || level == 'payment') {
                sql = `SELECT
                    po_number,
                    project,
                    bod_approve,
                    supplier.name as supl
                FROM po_detail
                    JOIN supplier ON supplier.id = po_detail.supl
                WHERE po_detail.project = ?
                    AND po_status = 0
                    AND bod_approve = 1
                GROUP BY po_number`
            } else if (level == 'po') {
                sql = `SELECT
                    po_number,
                    project,
                    bod_approve,
                    supplier.name as supl
                FROM po_detail
                JOIN supplier ON supplier.id = po_detail.supl
                WHERE po_detail.project = ?
                    AND po_status = 0
                    AND bod_approve = 2
                GROUP BY po_detail.po_number`
            } else {
              sql = `SELECT * FROM dpm WHERE dpm_id = 0`
            }
            db.query(sql, [project, project, project], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
          })
    }

    //cari notifikasi qrcode berdasar level
    async getQrCode(project, level) {
        if (level === 'director') {
            return new Promise((resolve, reject) => {
                sql = `SELECT
                    ver_id, ver_type, ver_number, ver_status, ver_key, ver_message_1, ver_message_2, 
                    po_id, po_status, project
                FROM verification
                    JOIN po_detail
                        ON po_detail.po_number = verification.ver_number
                WHERE ver_status = 0
                    AND  po_detail.po_status = 0
                    AND project = ?
                    GROUP BY ver_number`
                db.query(sql, [project], (err, result) => {
                    if (err) return reject(err)
                    return resolve(result)
                })
            })
        }
    }
}

module.exports = C_notif
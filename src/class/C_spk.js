'use strict'

const db = require('../models/DbConn')
const project = require('../class/C_project')
const p = new project()

let sql

class Spk{
    constructor(id) {
        this.id = id
    }
    async getSpkByProject(key) {
        if (Number.isInteger(key * 1)) {
            var id = key
        } else {
            const dataProject = await p.dataByProject(key)
            var id = dataProject.id
        }
        return new Promise((resolve, reject) => {
            sql = `SELECT * FROM spk_transaksi JOIN mandor ON mandor.mandor_id = spk_transaksi.spk_mandor_id JOIN project ON project.id=spk_transaksi.spk_project_id WHERE spk_project_id = ? GROUP BY spk_mandor_id`
            db.query(sql, [id], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    async getSpkMandorByProject(project, mandor_id) {
        if (Number.isInteger(project * 1)) {
            var id = project
        } else {
            const dataProject = await p.dataByProject(project)
            var id = dataProject.id
        }
        return new Promise((resolve, reject) => {
            sql = `SELECT * FROM spk_transaksi JOIN mandor ON mandor.mandor_id = spk_transaksi.spk_mandor_id WHERE spk_project_id = ? AND spk_mandor_id = ? GROUP BY spk_nomor`
            db.query(sql, [id, mandor_id], async (err, result) => {
                if (err) return reject(err)
                let array = []
                for( let i = 0; i < result.length; i++) {
                    const progress = await this.getSpkByNomor(result[i].spk_nomor)
                    let total = 0
                    progress.forEach(x => {
                        total += x.spk_progress
                    })
                    result[i].spk_progress = total
                    array.push(result[i])
                }
                return resolve(array)
            })
        })
    }
    async totalNilaiSpk(project) {
        if (Number.isInteger(project * 1)) {
            var id = project
        } else {
            const dataProject = await p.dataByProject(project)
            var id = dataProject.id
        }
        return new Promise((resolve, reject) => {
            sql = `SELECT * FROM spk_transaksi WHERE spk_project_id = ? GROUP BY spk_nomor`
            db.query(sql, [id], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    async totalNilaiTerbayarSpk(project) {
        if (Number.isInteger(project * 1)) {
            var id = project
        } else {
            const dataProject = await p.dataByProject(project)
            var id = dataProject.id
        }
        return new Promise((resolve, reject) => {
            sql = `SELECT * FROM spk_transaksi WHERE spk_project_id = ?`
            db.query(sql, [id], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    updateNilaiSpk(spkNo, newVal, newJenis) {
        return new Promise((resolve, reject) => {
            sql = `UPDATE spk_transaksi SET spk_nilai = ?, spk_jenis_pekerjaan = ? WHERE spk_nomor = ?`
            db.query(sql, [newVal, newJenis, spkNo], (err, result) => {
                if (err) return reject(err);
                return resolve(result);
            })
        })
    }
    getSpkByNomor(nomor) {
        return new Promise((resolve, reject) => {
            sql = `SELECT
                spk_transaksi_id, spk_project_id, spk_mandor_id, spk_nomor, spk_jenis_pekerjaan, spk_nilai, spk_progress, spk_created, spk_progress_created, spk_tanggal_bayar, spk_verifikasi, spk_catatan,
                project.name as project, mandor_nama as mandor
            FROM spk_transaksi JOIN project ON project.id = spk_transaksi.spk_project_id JOIN mandor ON mandor.mandor_id = spk_transaksi.spk_mandor_id WHERE spk_nomor = ?`
            db.query(sql, [nomor], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    insertSpk(id, mandor, spkNomor, jenisPekerjaan, nilai, catatan, pembayaran, tanggalBayar) {
        // projectData.id, mandor, spkNomor, jenisPekerjaan, nilai, catatan, pembayaran
        // return {id, mandor, spkNomor, jenisPekerjaan, nilai, catatan, pembayaran, tanggalBayar}
        if (!tanggalBayar) {
            tanggalBayar = null;
        }
        return new Promise((resolve, reject) => {
            sql = `INSERT INTO spk_transaksi (spk_project_id, spk_mandor_id, spk_nomor, spk_jenis_pekerjaan, spk_nilai, spk_progress, spk_tanggal_bayar, spk_catatan) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
            db.query(sql, [id, mandor, spkNomor, jenisPekerjaan, nilai, pembayaran, tanggalBayar, catatan], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    byId(id) {
        return new Promise((resolve, reject) => {
            sql = `SELECT
                spk_transaksi_id, spk_project_id, spk_mandor_id, spk_nomor, spk_jenis_pekerjaan, spk_nilai, spk_progress, spk_created, spk_progress_created, spk_tanggal_bayar, spk_verifikasi, spk_catatan,
                project.name as project, mandor_nama as mandor
            FROM spk_transaksi
                JOIN project ON project.id = spk_transaksi.spk_project_id
                JOIN mandor ON mandor.mandor_id = spk_transaksi.spk_mandor_id
            WHERE spk_transaksi_id = ?`
            db.query(sql, [id], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    updateById(id, pembayaran, catatan, tanggalBayar) {
        return new Promise((resolve, reject) => {
            sql = `UPDATE spk_transaksi SET spk_progress = ?, spk_catatan = ?, spk_tanggal_bayar = ? WHERE spk_transaksi_id = ?`
            db.query(sql, [pembayaran, catatan, tanggalBayar, id], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    setVerification(value, id) {
        return new Promise((resolve, reject) => {
            sql = `UPDATE spk_transaksi SET spk_verifikasi = ? WHERE spk_transaksi_id = ?`
            db.query(sql, [value, id], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    deleteSpkTransaksi(id) {
        return new Promise((resolve, reject) => {
            sql = `DELETE FROM spk_transaksi WHERE spk_transaksi_id = ?`
            db.query(sql, [id], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
}

module.exports = Spk
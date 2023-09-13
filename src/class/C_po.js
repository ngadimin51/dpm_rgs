'use strict'

const db = require('../models/DbConn')
let sql

class Po{
    constructor(poNumber) {
        this.poNumber = poNumber
    }
    byProject(project, status, limit) {
        if (status == 'pengajuan') {
            status = 1
        } else if (status == 'revisi') {
            status = 2
        } else if (status == 'approve') {
            status = 3
        }
        if (limit) {
            sql = `SELECT
                po_detail.po_id,
                po_detail.dpm_id,
                po_detail.bod_approve,
                po_detail.po_item_update,
                po_detail.po_qty,
                po_detail.po_price,
                po_detail.po_status,
                po_detail.po_number,
                po_detail.project,
                supplier.name,
                supplier.id as suplId
            FROM po_detail
                JOIN supplier ON supplier.id = po_detail.supl
            WHERE project = ? AND bod_approve = ?
                GROUP BY po_number
                ORDER BY po_id DESC
            LIMIT ?`
        } else {
            sql = `SELECT
                po_detail.po_id,
                po_detail.dpm_id,
                po_detail.bod_approve,
                po_detail.po_item_update,
                po_detail.po_qty,
                po_detail.po_price,
                po_detail.po_status,
                po_detail.po_number,
                po_detail.project,
                supplier.name,
                supplier.id as suplId
            FROM po_detail
                JOIN supplier ON supplier.id = po_detail.supl
            WHERE project = ? AND bod_approve = ?
                GROUP BY po_number
                ORDER BY po_id DESC`
        }
        return new Promise((resolve, reject) => {
            db.query(sql, [project, status, limit], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    searchByNumber(project, search) {
        return new Promise((resolve, reject) => {
            sql = `SELECT
                po_detail.po_id,
                po_detail.dpm_id,
                po_detail.bod_approve,
                po_detail.po_item_update,
                po_detail.po_qty,
                po_detail.po_price,
                po_detail.po_status,
                po_detail.po_number,
                po_detail.project,
                supplier.name,
                supplier.id as suplId
            FROM po_detail
                JOIN supplier ON supplier.id = po_detail.supl
            WHERE po_detail.project = ? AND po_detail.po_number LIKE ?
                GROUP BY po_number
                ORDER BY po_id DESC`
            db.query(sql, [project, `%${search}%`], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    searchByItem(project, search) {
        return new Promise((resolve, reject) => {
            sql = `SELECT
                po_detail.po_id,
                po_detail.dpm_id,
                po_detail.bod_approve,
                po_detail.po_item_update,
                po_detail.po_qty,
                po_detail.po_price,
                po_detail.po_status,
                po_detail.po_number,
                po_detail.project,
                supplier.name,
                supplier.id as suplId
            FROM po_detail
                JOIN supplier ON supplier.id = po_detail.supl
                JOIN dpm ON dpm.dpm_id = po_detail.dpm_id
                JOIN item ON item.id = dpm.item
            WHERE po_detail.project = ? AND item.name LIKE ?
                GROUP BY po_number
                ORDER BY po_id DESC`
            db.query(sql, [project, `%${search}%`], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    searchBySupplier(project, search) {
        return new Promise((resolve, reject) => {
            sql = `SELECT
                po_detail.po_id,
                po_detail.dpm_id,
                po_detail.bod_approve,
                po_detail.po_item_update,
                po_detail.po_qty,
                po_detail.po_price,
                po_detail.po_status,
                po_detail.po_number,
                po_detail.project,
                supplier.name,
                supplier.id as suplId
            FROM po_detail
                JOIN supplier ON supplier.id = po_detail.supl
                JOIN dpm ON dpm.dpm_id = po_detail.dpm_id
                JOIN item ON item.id = dpm.item
            WHERE po_detail.project = ? AND supplier.name LIKE ?
                GROUP BY po_number
                ORDER BY po_id DESC`
            db.query(sql, [project, `%${search}%`], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    totalNilaiPo(project) {
        return new Promise((resolve, reject) => {
            sql = `SELECT po_qty, po_price, item.name FROM po_detail JOIN dpm ON dpm.dpm_id = po_detail.dpm_id JOIN item ON item.id = dpm.item WHERE po_detail.project = ? AND po_status = 0 AND bod_approve = 3`
            db.query(sql, [project], (err, result) => {
                if (err) return reject(err)
                let total = 0
                for(let i = 0; i < result.length; i++) {
                    total += result[i].po_qty * result[i].po_price
                }
                return resolve(total)
                //return resolve(result)
            })
        })
    }
    getItemPo(poNumber) {
        return new Promise((resolve, reject) => {
            sql = `SELECT po_qty, po_price, po_detail.dpm_id, po_detail.project, item.name FROM po_detail JOIN dpm ON dpm.dpm_id = po_detail.dpm_id JOIN item ON item.id = dpm.item WHERE po_number = ? AND po_status = 0`
            db.query(sql, [poNumber], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    getPembayaranPo(poNumber) {
        return new Promise(function(resolve, reject) {
            sql = `SELECT * FROM po_pembayaran WHERE po_bayar_number = ?`
            db.query(sql, [poNumber], function (err, result) {
                if (err) {
                    return reject(err);
                }
                return resolve(result);
            });
        });
    }
    poByNumber(project, poNumber) {
        return new Promise(function(resolve, reject) {
            sql = `SELECT
                po_qty, po_number, po_price, po_detail.project, bod_approve, bod_note, po_item_update, po_detail.project, payment, penerima, alamat, po_detail.catatan, jadwal, syarat, po_detail.note, penerima, po_detail.created,
                dpm.number, dpm.unit, dpm.catatan as catatan_lapangan, dpm.dpm_id,
                item.name as item,
                supplier.name, supplier.address, supplier.pic, supplier.phone, supplier.bank, supplier.account, supplier.atas_nama
            FROM po_detail
            JOIN dpm ON dpm.dpm_id = po_detail.dpm_id
            JOIN item ON item.id = dpm.item
            JOIN supplier ON supplier.id = po_detail.supl
            WHERE po_detail.project = ? AND po_number = ? AND po_status = 0`
            db.query(sql, [project, poNumber], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            });
        });
    }
    allPoItem(project, poNumber) {
        return new Promise(function(resolve, reject) {
            sql = `SELECT
                po_id, po_qty, po_detail.po_number, po_detail.po_status, po_item_update, po_price, po_detail.project, bod_approve, bod_note, po_detail.project, po_detail.supl, payment, penerima, alamat, po_detail.catatan, jadwal, syarat, po_detail.note, penerima, po_detail.created,
                dpm.number, dpm.unit, dpm.catatan as catatan_lapangan, dpm.dpm_id,
                item.name as item,
                apple.status as appleStatus,
                supplier.name, supplier.address, supplier.pic, supplier.phone, supplier.bank, supplier.account, supplier.atas_nama
            FROM po_detail
            JOIN apple ON apple.dpm_id = po_detail.dpm_id
            JOIN dpm ON dpm.dpm_id = po_detail.dpm_id
            JOIN item ON item.id = dpm.item
            JOIN supplier ON supplier.id = po_detail.supl
            WHERE po_detail.project = ? AND po_detail.po_number = ?`
            db.query(sql, [project, poNumber], (err, result) => {
                if (err) return reject(err)
                // console.log(result)
                return resolve(result)
            });
        });
    }
    // update status item po
    updateStatusItemPo(status, po_id) {
        return new Promise( (resolve, reject) => {
            sql = 'UPDATE po_detail SET po_status = ? WHERE po_id = ?'
            db.query(sql, [status, po_id], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    getQrcode(poNumber) {
        return new Promise( (resolve, reject) => {
            sql = `SELECT * FROM verification WHERE ver_number = ?`
            db.query(sql, [poNumber], (err, result) => {
                if (err) return reject(err)
                return resolve(result[0])
            })
        })
    }
    poSearch(filter, project, id) {
        return new Promise((resolve, reject) => {
            if (filter == 'item') {
                sql = `SELECT
                    po_detail.po_id,
                    po_detail.dpm_id,
                    po_detail.bod_approve,
                    po_detail.po_item_update,
                    po_detail.po_qty,
                    po_detail.po_price,
                    po_detail.po_status,
                    po_detail.po_number,
                    po_detail.project,
                    supplier.name,
                    supplier.id as suplId,
                    item.name as item
                FROM po_detail
                JOIN supplier ON supplier.id = po_detail.supl
                JOIN dpm ON dpm.dpm_id = po_detail.dpm_id
                JOIN item ON dpm.item = item.id
                WHERE po_detail.project = ? AND bod_approve = 3 AND po_detail.dpm_id like ? AND po_status = 0
                GROUP BY po_number
                ORDER BY po_id DESC`
            } else {
                sql = `SELECT
                    po_detail.po_id,
                    po_detail.dpm_id,
                    po_detail.bod_approve,
                    po_detail.po_item_update,
                    po_detail.po_qty,
                    po_detail.po_price,
                    po_detail.po_status,
                    po_detail.po_number,
                    po_detail.project,
                    supplier.name,
                    supplier.id as suplId,
                    item.name as item
                FROM po_detail
                JOIN supplier ON supplier.id = po_detail.supl
                JOIN dpm ON dpm.dpm_id = po_detail.dpm_id
                JOIN item ON dpm.item = item.id
                WHERE po_detail.project = ? AND bod_approve = 3 AND supl like ? AND po_status = 0
                GROUP BY po_number
                ORDER BY po_id DESC`
            }
            db.query(sql, [project, id], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    daftarItemUntukPo(project) {
        return new Promise((resolve, reject) => {
            sql = `SELECT
                apple.id as appleId, apple.status, apple.purchasing_id,
                apple.supl1, apple.supl2, apple.supl3,
                apple.payment1, apple.payment2, apple.payment3,
                apple.note1, apple.note2, apple.note3,
                apple.price1, apple.price2, apple.price3, apple.dir_comment, apple.dir_id, apple.dir_acc,
                dpm.dpm_id, dpm.project, dpm.code_rap as pekerjaan, dpm.qty3, dpm.unit, dpm.catatan, dpm.date1, dpm.date2, dpm.number,
                item.name as item,
                supplier.name as supplierName
            FROM apple
            JOIN dpm ON dpm.dpm_id = apple.dpm_id
            JOIN item ON item.id = dpm.item
            JOIN supplier ON supplier.id = apple.dir_acc
            WHERE dpm.project = ? AND apple.status = 3`
            db.query(sql, [project], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    insertPoDetail(data) {
        console.log(data)
        return new Promise((resolve, reject) => {
            sql = `INSERT INTO po_detail (dpm_id, po_item_update, po_qty, po_price, po_status, bod_approve, project, po_number, supl, payment, penerima, alamat, catatan, jadwal, syarat, created, pembuat_po)
                VALUES ?`
            db.query(sql, [data], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    updateAppleStatus(status, dpmId) {
        //return data
        return new Promise((resolve, reject) => {
            sql = `UPDATE apple SET status = ? WHERE dpm_id = ?`
            db.query(sql, [status, dpmId], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    approval(status, note, number) {
        //return {status, note, number}
        return new Promise((resolve, reject) => {
            sql = `UPDATE po_detail SET bod_approve = ?, bod_note = ? WHERE po_number = ?`
            db.query(sql, [status, note, number], (err, result) => {
                if (err) {
                    console.log(err)
                    return reject(err)
                }
                return resolve(result)
            })
        })
    }
    updatePoDetail(array) {
        return new Promise((resolve, reject) => {
            sql = `UPDATE po_detail SET bod_approve = 1, po_status = ?, payment = ?, jadwal = ?, alamat = ?, penerima = ?, syarat = ?, catatan = ?, created = ?, supl = ? WHERE po_id = ?`
            db.query(sql, array, (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    getPoByDpmId(dpmId) {
        return new Promise((resolve, reject) => {
            sql = `SELECT po_id, po_qty, po_price, bod_approve, po_number, supl, name FROM po_detail JOIN supplier ON supplier.id = po_detail.supl WHERE dpm_id = ?`
            db.query(sql, [dpmId], (err, result) => {
                if (err) return reject(err)
                return resolve(result[0])
            })
        })
    }
    updatePoDetailSatuan(detail, jumlah, unit, harga, po_id, dpm_id) {
        return new Promise( (resolve, reject) => {
            sql = 'UPDATE po_detail SET po_item_update = ?, po_qty = ?, po_price = ? WHERE po_id = ?'
            db.query(sql, [detail, jumlah, harga, po_id], async (err, result) => {
                if (err) {
                    return reject(err)
                }
                const updateUnit = await this.updateUnitDpm(unit, dpm_id)
                if (updateUnit.affectedRows === 1) {
                    // console.log(updateUnit)
                    return resolve(result)
                }
            })
        })
    }
    updateUnitDpm(unit, dpm_id) {
        return new Promise( (resolve, reject) => {
            sql = 'UPDATE dpm SET unit = ? WHERE dpm_id = ?'
            db.query(sql, [unit, dpm_id], (err, result) => {
                if (err) {
                    return reject(err)
                }
                return resolve(result)
            })
        })
    }
}

module.exports = Po
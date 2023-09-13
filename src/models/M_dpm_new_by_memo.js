'use strict'

const db = require('./DbConn')
const C_project = require('../class/C_project')
const Project = new C_project()
const C_item = require('../class/C_item')
const Item = new C_item()
const C_supplier = require('../class/C_supplier')
const Supplier = new C_supplier()
const C_dpm = require('../class/C_dpm')
const Dpm = new C_dpm()

let data = {
    title: 'DPM',
    pageTitle: 'DPM',
    pageTitleDesc: 'DPM'
}

let sql

const dpm_new_by_memo = async (req, res) => {
    /**
     * DEFAULT REQUIRED
     */
    data.pageTitle = 'DPM'
    data.pageTitleDesc = 'DPM BY MEMO'
    data.userId = req.userId
    data.userName = req.userName
    data.userLevel = req.userLevel
    data.userPicture = req.userPicture
    // data project & pekerjaan
    data.project = await Project.penugasan(req.userId)
    data.pekerjaan = await Item.getItemPekerjaan()
    data.supplier = await Supplier.supplierActive()
    // render view
    res.render('dpm/by_memo', data)
    // console.log(data)
}

const search_item = async (req, res) => {
    const { item, pekerjaan } = req.body
    const dataSearch = await getItem(item, pekerjaan)
    res.send({
        status: dataSearch.length > 0 ? 'success' : 'failed',
        message: dataSearch.length > 0 ? dataSearch.length +' items found' : 'Not Found',
        data: dataSearch})
}

const getItem = async (item, pekerjaan) => {
    return new Promise((resolve, reject) => {
        sql = 'SELECT id, name, unit, pekerjaan FROM item WHERE name LIKE ? AND pekerjaan = ?'
        db.query(sql, [`%${item}%`, pekerjaan], (err, data) => {
            if (err) return reject(err)
            return resolve(data)
        })
    })
}

const dpm_by_memo_post = async (req, res) => {

    const { project, supplier, id, name, qty, unit, pekerjaan, tanggal, price, payment, note } = req.body

    // res.send({status: 'failed', message: 'Debugging', data: { project, supplier, id, name, qty, unit, pekerjaan, tanggal, price, payment, note }})
    
    const code = await Project.dataByProject(project)
    const date = new Date()
    const arrayBulan = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII']
    const bulan = arrayBulan[date.getMonth()]

    let dpmNumber = await Dpm.getDpmNumber(project)
    if (dpmNumber.length > 0) {
        dpmNumber = dpmNumber[0].number
        const split = dpmNumber.split('/')
        dpmNumber = (split[0] * 1) + 1+'/DPM/'+code.code+'/'+bulan+'/'+date.getFullYear()
    } else {
        dpmNumber = `1/DPM/${code.code}/${bulan}/${date.getFullYear()}`
    }
    const site1 = req.userId
    const created = new Date().toLocaleString()
    const control = 4
    const ho = 4
    const insertDpm = await inputDpm(dpmNumber, project, id, unit, note, qty, pekerjaan, tanggal, site1, control, ho, created)
    // console.log(insertDpm)
    if (insertDpm.affectedRows === 1) {
        const status = 3
        const dpmId = insertDpm.insertId
        const insertApple = await inputApple(site1, project, status, dpmId, dpmNumber, supplier, price, payment, note)
        res.send({status: 'success', message: 'Success', data: { project, supplier, id, name, qty, unit, pekerjaan, tanggal, price, payment, note, dpmNumber, dpmId }})
        // console.log(insertApple)
    } else {
        res.send({status: 'failed', message: 'Debugging', data: { project, supplier, id, name, qty, unit, pekerjaan, tanggal, price, payment, note, dpmNumber, dpmId }})
    }
}

/**
 * CRUD
 */
async function inputDpm(dpmNumber, project, id, unit, note, qty, pekerjaan, tanggal, site1, control, ho, created) {
    // return {dpmNumber, project, id, unit, note, qty, pekerjaan, tanggal, site1, control, ho}
    return new Promise((resolve, reject) => {
        sql = `INSERT INTO dpm (number, project, item, unit, catatan, qty1, qty2, qty3, code_rap, date1, date2, site1, control, ho, created) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        db.query(sql, [dpmNumber, project, id, unit, note, qty, qty, qty, pekerjaan, tanggal, tanggal, site1, control, ho, created], (err, result) => {
            if (err) return reject(err)
            return resolve(result)
        })
    })
}

async function inputApple(site1, project, status, dpmId, dpmNumber, supplier, price, payment, note) {
    // return {site1, project, status, dpmId, dpmNumber, supplier, price, payment, note}
    // userId, project, status, id, number, supl1, price1, payment1, note1, supl2, price2, payment2, note2, supl3, price3, payment3, note3, catatan
    return new Promise((resolve, reject) => {
        sql = 'INSERT INTO apple (purchasing_id, project, status, dpm_id, number, supl1, price1, payment1, note1, supl2, price2, payment2, note2, supl3, price3, payment3, note3, pur_comment, dir_id, dir_comment, dir_acc) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        db.query(sql, [site1, project, status, dpmId, dpmNumber, supplier, price, payment, note, supplier, price, payment, note, supplier, price, payment, note, note, site1, note, supplier], (err, result) => {
            if (err) return reject(err)
            return resolve(result)
        })
    })
}

module.exports = {
    dpm_new_by_memo, search_item, dpm_by_memo_post
}
'use strict'

const ITEM = require('../class/C_item')
const PROJECT = require('../class/C_project')
const LOGISTIC = require('../class/C_logistic')
const DPM = require('../class/C_dpm')
const ASSETS = require('../class/C_assets')
const Logistic = new LOGISTIC()
const db = require('./DbConn')
const APPLE = require('../class/C_apple')
const PO = require('../class/C_po')

let sql
let data = {
    title: 'ITEM',
    pageTitle: 'ITEM CONTROL',
    pageTitleDesc: 'Control Item, item digunakan untuk semua project'
}

const items_control = async (req, res) => {
    const pekerjaan = req.query.pekerjaan
    
    data.userId = req.userId
    data.userName = req.userName
    data.userLevel = req.userLevel
    data.userPicture = req.userPicture

    const Item = new ITEM()

    if (pekerjaan) {

        data.item = await Item.getItemPekerjaan(pekerjaan)
        res.render('items/items_pekerjaan', data)

    } else {

        const item = await Item.getItemPekerjaan()
        const unit = await Item.getUnit()
        data.pekerjaan = item
        data.unit = unit
        data.item = []
        for(let i = 0; i < item.length; i++) {
            const itemPekerjaan = await Item.getItemPekerjaan(item[i].pekerjaan)
            data.item.push({pekerjaan: item[i].pekerjaan, jumlah: itemPekerjaan.length})
        }
        res.render('items/items_control', data)

    }
}

const itemControlCheck = async (req, res) => {
    const id = req.query.item
    const Item = new ITEM()
    const Dpm = new DPM()
    const Apple = new APPLE()
    const Po = new PO()
    const item = await Item.getItemById(id)
    const dpmData = await Dpm.byIdItem(id)
    let dpm = []
    for (let i = 0; i < dpmData.length; i++) {
        const apple = await Apple.getAppleByDpmNumberId(dpmData[i].number, dpmData[i].dpm_id)
        const po = await Po.getPoByDpmId(dpmData[i].dpm_id)
        dpm.push({
            idItem: id,
            itemName: item[0].name,
            itemPekerjaan: item[0].pekerjaan,
            itemSatuan: item[0].unit,
            dpmId: dpmData[i].dpm_id,
            dpmNumber: dpmData[i].number,
            dpmProject: dpmData[i].project,
            dpmQty1: dpmData[i].qty1,
            dpmQty2: dpmData[i].qty2,
            dpmQty3: dpmData[i].qty3,
            dpmControl: dpmData[i].control,
            dpmHo: dpmData[i].ho,
            apple: apple,
            po: po
        })
    }
    res.send({item, dpm})
}

const getItemsPekerjaan = (req, res) => {
    sql = `SELECT pekerjaan FROM item GROUP BY pekerjaan`
    db.query(sql, (err, pekerjaan) => {
        if (err) throw err
        res.send({status: 'success', data: pekerjaan})
    })
}

const getItemsUnit = async (req, res) => {
    const Item = new ITEM()
    const unit = await Item.getUnit()
    res.send(unit)
}

const updateUnit = async (req, res) => {
    const level = req.userLevel
    if (level == 'cost controll' || level == 'po' || level == 'logistic' || level == 'director' || level == 'admin') {
        const {id, unit} = req.body
        const Item = new ITEM()
        const update = await Item.updateUnit(id, unit)
        if (update.affectedRows == 1) {
            res.send({status: 'success', message: 'Berhasil update unit'})
        } else {
            res.send({status: 'failed', message: 'gagal update unit'})
        }
    } else {
        res.send({status: 'failed', message: 'Otorisasi tidak diijinkan'})
    }
}

const deleteUnit = async (req, res) => {
    const level = req.userLevel
    if (level == 'cost controll' || level == 'po' || level == 'logistic' || level == 'director' || level == 'admin') {
        const {id} = req.body
        const Item = new ITEM()
        const update = await Item.deleteUnit(id)
        if (update.affectedRows == 1) {
            res.send({status: 'success', message: 'Berhasil menghapus unit'})
        } else {
            res.send({status: 'failed', message: 'gagal hapus unit'})
        }
    } else {
        res.send({status: 'failed', message: 'Otorisasi tidak diijinkan'})
    }
}

const update = async (req, res) => {
    const {nama, pekerjaan, unit, id} = req.body
    if (nama && pekerjaan && unit && id) {
        if (req.userLevel == 'director' || req.userLevel == 'admin') {
            const Item = new ITEM()
            const check = await Item.checkItemExist(nama, pekerjaan, unit)
            if (check.length <= 1) {
                const update = await Item.updateItem(nama, pekerjaan, unit, id)
                if (update.affectedRows == 1) {
                    return res.send({status: 'success', message: 'Berhasil udpate database'})
                }
                return res.send({status: 'failed', message: 'Gagal update database'})
            }
            return res.send({status: 'failed', message: 'Gagal update database'})
        } else {
            const Dpm = new DPM()
            const dpm = await Dpm.byIdItem(id)

            //level selain director dan admin tidak dapat mengubah item jitem sudah terdaftar pada table dpm
            if (dpm.length > 0) {
                return res.send({status: 'failed', message: 'Item sudah terdaftar di DPM, tidak dapat diubah'})
            }

            const Item = new ITEM()
            const check = await Item.checkItemExist(nama, pekerjaan, unit)
            if (check.length <= 1) {
                const update = await Item.updateItem(nama, pekerjaan, unit, id)
                if (update.affectedRows == 1) {
                    return res.send({status: 'success', message: 'Berhasil udpate database'})
                }
                return res.send({status: 'failed', message: 'Gagal update database'})
            }
        }
    }
    res.send({status: 'failed', message: 'wrong parameters'})
}

const tambahItem = async (req, res) => {
    const level = req.userLevel
    if (level == 'cost controll' || level == 'po' || level == 'director' || level == 'logistic' || level == 'director' || level == 'admin') {
        const {name, pekerjaan, unit} = req.body
        const Item = new ITEM()
        const item = await Item.check(name, pekerjaan, unit)
        if (item.length > 0) {
            return res.send({status: 'failed', message: 'Item sudah tersedia'})
        }
        const insert = await Item.insert(name, pekerjaan, unit)
        if (insert.affectedRows == 1) {
            return res.send({status: 'success', message: 'Berhasil input data'})
        }
        res.send({status: 'failed', message: 'Gagal input database'})
    } else {
        res.send({status: 'failed', message: 'Otorisasi tidak diijinkan'})
    }
}

const deleteItem = async (req, res) => {
    const {id} = req.body
    const Dpm = new DPM()
    const checkDelete = await Dpm.checkItem(id)
    if (checkDelete.length > 0) {
        return res.send({status: 'failed', message: 'Item terikat dengan DPM'})
    } else {
        const Item = new ITEM()
        const delItem = await Item.delete(id)

        if (delItem.affectedRows == 1) {
            return res.send({status: 'success', message: 'Berhasil delete item'})
        }
        res.send({status: 'failed', message: 'Gagal proses database'})
    }
}

/**
 * ASSETS_CONTROL
 */
const assetsControl = async (req, res) => {

    const Assets = new ASSETS()

    data.userId = req.userId
    data.userLevel = req.userLevel
    data.userName = req.userName
    data.title= 'ASSETS',
    data.pageTitle= 'ASSETS',
    data.pageTitleDesc= 'Control Assets Perusahaan'
    const assets = await Assets.all()
    const allName = await Assets.allName()
    
    data.assets = []
    data.allName = allName
    for (let i = 0; i < assets.length; i++) {
        const x = await Assets.getName(assets[i].asset_name)
        data.assets.push({
            asset_id: assets[i].asset_id,
            asset_name: assets[i].asset_name,
            detail: x
        })
    }

    res.render('items/assets_control', data)
}

const updateLaporanAsset = async (req, res) => {
    const name = req.query.name
    
    data.userId = req.userId
    data.userLevel = req.userLevel
    data.userName = req.userName
    data.title= 'ASSETS',
    data.pageTitle= 'ASSETS',
    data.pageTitleDesc= 'Control Assets Perusahaan'

    const Assets = new ASSETS()
    data.assets = await Assets.getName(name)
    res.render('items/assets_update', data)
}

const postUpdateLaporanAsset = async (req, res) => {
    const level = req.userLevel
    if (level == 'logistic' || level == 'director' || level == 'admin') {
        const {id, namex, type, qtyx, kondisix, keteranganx} = req.body
        
        const Assets = new ASSETS()
        const update = await Assets.updateReportAsset(id, namex, type, qtyx, kondisix, keteranganx)
        if (update.affectedRows == 1) {
            const newAsset = await Assets.getById(id)
            return res.send({status: 'success', message: 'Berhasil update data', data: {id, namex, type, qtyx, kondisix, keteranganx, date: newAsset[0].asset_tanggal}})
        }
        res.send({status: 'failed', message: 'Gagal update ke database', data: null})
    } else {
        res.send({status: 'failed', message: 'Otorisasi tidak diijinkan', data: null})
    }
}

const postDeleteLaporanAsset = async (req, res) => {
    const level = req.userLevel
    if (level == 'logistic' || level == 'director' || level == 'admin') {
        const {id, name} = req.body
        const Assets = new ASSETS()
        const update = await Assets.updateDeleteAsset(id)
        if (update.affectedRows == 1) {
            const hitung = await Assets.getName(name)
            return res.send({status: 'success', message: 'Berhasil hapus data', data: hitung.length})
        }
        res.send({status: 'failed', message: 'Gagal hapus dari database', data: null})
    } else {
        res.send({status: 'failed', message: 'Otorisasi tidak diijinkan', data: null})
    }
}

const insertRecord = async (req, res) => {
    const {namex, type, qtyx, kondisix, keteranganx} = req.body
    const Asset = new ASSETS()
    const insert = await Asset.insertRecord(namex, type, qtyx, kondisix, keteranganx)
    if (insert.affectedRows == 1) {
        return res.send({status: 'success', message: 'Berhasil input data'})
    }
    res.send({status: 'failed', message: 'Gagal input data ke dala database'})
}

const loadMore = async (req, res) => {
    const {id, nama} = req.body
    const Assets = new ASSETS()
    const assets = await Assets.loadMore(id, nama)
    const arrayAssets = []
    for (let i = 0; i < assets.length; i++) {
        const x = await Assets.getName(assets[i].asset_name)
        arrayAssets.push({
            asset_id: assets[i].asset_id,
            asset_name: assets[i].asset_name,
            detail: x
        })
    }
    res.send(arrayAssets)
}

const detailAssets = async (req, res) => {
    const {name} = req.body
    const Assets = new ASSETS()
    const assets = await Assets.getName(name)
    res.send(assets)
}

const pencarian = async (req, res) => {
    const {name} = req.body
    const Assets = new ASSETS()
    const assets = await Assets.pencarian(name)
    const arrayAssets = []
    for (let i = 0; i < assets.length; i++) {
        const x = await Assets.getName(assets[i].asset_name)
        arrayAssets.push({
            asset_id: assets[i].asset_id,
            asset_name: assets[i].asset_name,
            detail: x
        })
    }
    res.send(arrayAssets)
}

/**
 * SITE_LOGISTIC
 */
const siteLogistic = async (req, res) => {

    const userId = req.userId
    const project = req.query.project
    const pekerjaan = req.query.pekerjaan
    const Project = new PROJECT()
    const Logistic = new LOGISTIC()

    data.userName = req.userName
    data.userLevel = req.userLevel
    data.userPicture = req.userPicture
    data.title = 'LOGISTIC'
    data.pageTitle = 'Control Logistic'

    if (project && !pekerjaan) {
        const Item = new ITEM()
        const pek = await Item.getItemPekerjaan()
        data.pekerjaan = []
        for (let i = 0; i < pek.length; i++) {
            //const total = await Logistic.getLogistic(project, pek[i].pekerjaan)
            data.pekerjaan.push({
                pekerjaan: pek[i].pekerjaan,
                project: project,
                //total: total.length
                //total: 0
            })
        }
        res.render('items/site_logistic_by_roject', data)
    } else if (project && pekerjaan) {
        const Item = new ITEM()
        data.pekerjaan = await Item.getItemPekerjaan()
        data.pageTitleDesc = 'Daftar Permintaan Material '+project
        data.logistic = await Logistic.getLogistic(project, pekerjaan)
        res.render('items/site_logistic_by_pekerjaan', data)
    } else {
        const daftarProject = await Project.penugasan(userId)
        data.project = []
        for (let i = 0; i < daftarProject.length; i ++) {
            data.project.push({
                id: daftarProject[i].id,
                project: daftarProject[i].project,
                description: daftarProject[i].description,
                report : await Logistic.totalReport(daftarProject[i].project)
            })
        }
        data.pageTitleDesc = 'Daftar Permintaan Material'
        res.render('items/site_logistic', data)
    }
}

const detilLogistic = async (req, res) => {
    const {project, item} = req.body
    const detail = await Logistic.detilLogistic(project, item)
    let totalIn = 0
    let totalOut = 0
    for (let i = 0; i < detail.length; i++) {
        totalIn += detail[i].log_in
        totalOut += detail[i].log_out
    }
    res.send({status: 'success', data: detail, item: detail[0].name, totalIn, totalOut, unit: detail[0].unit})
}

const submitLogistic = async (req, res) => {
    const level = req.userLevel
    if (level == 'site logistic' || level == 'logistic' || level == 'director' || level == 'admin') {
        const {project, item, type, qty, tanggal, jam, lampiran, catatan} = req.body
        const userId = req.userId
        const Item = new ITEM()
        const itm = await Item.getItemById(item)
        const insert = await Logistic.insertNewReport(project, item, itm[0].unit, type, qty, tanggal, jam, lampiran, catatan, userId)
        if (insert.affectedRows == 1) {
            return res.send({status: 'success', message: 'Berhasil input database'})
        }
        res.send({status: 'failed', message: 'Gagal insert ke database'})
    } else {
        res.send({status: 'failed', message: 'Otorisasi tidak diijinkan'})
    }
}

const submitUpdateLogistic= async (req, res) => {
    const level = req.userLevel
    if (level == 'site logistic' || level == 'logistic' || level == 'director' || level == 'admin') {
        const {project, item, type, qty, tanggal, jam, lampiran, catatan, dataId} = req.body
        const userId = req.userId
        const Item = new ITEM()
        const itm = await Item.getItemById(item)
        const update = await Logistic.updateReport(project, item, itm[0].unit, type, qty, tanggal, jam, lampiran, catatan, userId, dataId)
        if (update.affectedRows == 1) {
            return res.send({status: 'success', message: 'Berhasil input database'})
        }
        console.log(update)
        res.send({status: 'failed', message: 'Gagal insert ke database'})
    } else {
        res.send({status: 'failed', message: 'Otorisasi tidak diijinkan'})
    }
}

const getItemsByPekerjaan = async (req, res) => {
    const {pekerjaan} = req.body
    const Item = new ITEM()
    const item = await Item.getItemPekerjaan(pekerjaan)
    res.send(item)
}

module.exports = {
    items_control, itemControlCheck, tambahItem, deleteItem, update, insertRecord, getItemsPekerjaan, getItemsUnit, updateUnit, deleteUnit, assetsControl, updateLaporanAsset, postUpdateLaporanAsset, postDeleteLaporanAsset, loadMore, detailAssets, siteLogistic, detilLogistic, submitLogistic, submitUpdateLogistic, getItemsByPekerjaan, pencarian
}
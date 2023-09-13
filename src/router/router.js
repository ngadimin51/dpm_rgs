'use strict'

const express = require('express')
const router = express.Router()
const secret = process.env.SECRET_KEY
const jwt = require('jsonwebtoken')
const db = require('../models/DbConn')
let sql

/**
 * MODELS
 */
const Mdw = require('../mdw/auth')
const M_public = require('../models/M_public')
const M_project = require('../models/M_project')
const M_dpm = require('../models/M_dpm')
const M_dpm_new_by_memo = require('../models/M_dpm_new_by_memo')
const M_absen = require('../models/M_absen')
const M_user = require('../models/M_user')
const M_apple = require('../models/M_apple')
const M_po = require('../models/M_po')
const M_supplier = require('../models/M_supplier')
const M_items = require('../models/M_items')
const M_spk = require('../models/M_spk')
const M_spk_pengajuan = require('../models/M_spk_pengajuan')
const M_rekanan = require('../models/M_rekanan')
const M_chat = require('../models/M_chat')
const M_verification = require('../models/M_verification')
const M_whatsapp = require('../models/M_whatsapp')
const M_logistic = require('../models/M_logistic')
const M_dev = require('../models/M_dev')
const PROJECT = require('../class/C_project')
const WHATSAPP = require('../class/C_whatsapp')

const simpleCors = async (req, res, next) => {
    const origin = [process.env.HOST, process.env.HOST+':'+process.env.PORT]
    const reqHost = req.get('host')
    const splitReqHost = reqHost.split("/")
    const check = origin.indexOf(splitReqHost[2]) !== -1
    // const check = origin.indexOf(reqHost) !== -1
    if (process.env.APP_MODE == "PRODUCTION") {
        if (!check) {
            const html = `<body style="width: 100vw; height: 100vh; overflow: hidden; margin: 0; display: flex; flex-wrap: nowrap; justify-content: center; align-items: center; background: #bababa;  color: #595757; text-shadow: #e0e0e0 1px 1px 0;">
                <center>
                    <div style="font-size: 30vh;">&#9749;</div>
                    <div style="font-size: 5vh; font-weight: bold;">Ngopi dulu yukk...</div>
                    <hr style="margin: 40px 40px 40px 40px;">
                    <div style="font-size: 3vh; font-weight: bold; margin-top: 10px; max-width: 600px;">Daripada ngerecokin website orang</div>
                </center>
            <body>`
            res.set('Cache-Control', 'no-store')
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            return res.writeHead(401, {'Access-Control-Allow-origin': '*'}).end(html)
        }
    }
    const Project = new PROJECT()
    const debug = await Project.debug()
    const rgsToken = req.cookies.rgsToken
    // console.log(debug)
    jwt.verify(rgsToken, secret, (err, decoded) => {
        if (err) return res.redirect('/')
        checkAdmin(decoded.userId, user => {
            if (debug[0].status == 0 && user.level != 'admin') {
                const html = `<body style="width: 100vw; height: 100vh; overflow: hidden; margin: 0; display: flex; flex-wrap: nowrap; justify-content: center; align-items: center; background: #bababa;  color: #595757; text-shadow: #e0e0e0 1px 1px 0;">
                    <center>
                        <div style="font-size: 30vh;">&#9749;</div>
                        <div style="font-size: 5vh; font-weight: bold;">Ngopi dulu yukk...</div>
                        <hr style="margin: 40px 40px 40px 40px;">
                        <div style="font-size: 3vh; font-weight: bold; margin-top: 10px; max-width: 600px;">Biarkan Tofik yang lagi <span style="color: red;">DEBUG</span> jangan diganggu</div>
                    </center>
                <body>`
                res.set('Cache-Control', 'no-store')
                res.setHeader('Content-Type', 'text/html; charset=utf-8');
                res.clearCookie("rgsToken");
                return res.writeHead(401, {'Access-Control-Allow-origin': '*'}).end(html)
            }
        })
    })
    // if (debug[0].status == 0) {

    // }
    next()
}

const checkAdmin = (userId, user) => {
    sql = `SELECT * FROM admin WHERE id = ?`
    db.query(sql, [userId], (err, result) => {
        if (err) throw err
        if (result.length === 1) {
            return user(result[0])
        }
    })
}


//M_public
router.get('/', Mdw.authPublic, M_public.loginPage) //PUBLIC
router.post('/auth', Mdw.authPublic, M_public.auth) //PUBLIC
router.get('/logout', M_public.logout) //LOGOUT

//debug
// router.get('/debug', (req, res) => {

//     const db = require('../models/DbConn')
//     let sql = 'SELECT * FROM supplier'
//     db.query(sql, (err, result) => {
//         if (err) {
//             console.log(err)
//             throw(err)
//         }
//         result.forEach(x => {
//             // migration
//             x.product = [
//                 [x.product1, x.price1],
//                 [x.product2, x.price2],
//                 [x.product3, x.price3]
//             ]
//             sql = `UPDATE supplier SET products = ? WHERE id = ?`
//             db.query(sql, [JSON.stringify(x.product), x.id], (err, result) => {
//                 if (err) {
//                     console.log(err)
//                     throw err
//                 }
//             })
//             // parsing
//             // x.products = JSON.parse(x.products)
//         })
//         res.status(200).json({status: 'success', data: result})
//     })

// }) // DEBUG

// router.use(simpleCors)

//M_absen
router.get('/absen', Mdw.authLogin, M_absen.index)
router.post('/absen/submit', Mdw.authLogin, M_absen.absen) //POST ABSEN
router.get('/absen/control', Mdw.authLogin, M_absen.control) //CONTROL
router.get('/absen/download', Mdw.authLogin, M_absen.download) //DOWNLOAD

//M_dpm
router.get('/dpm_control', Mdw.authLogin, M_dpm.dpmControl) //PANTAU DPM
router.get('/dpm_control/filter', Mdw.authLogin, M_dpm.dpmControlFilter) //FILTER DATA
router.get('/dpm_control/dpm_new', Mdw.authLogin, M_dpm.dpmNew) //BUAT DPM BARU
router.post('/dpm_control/approve', Mdw.authLogin, M_dpm.approval) //APPROVAL DPM
router.post('/dpm_control/update', Mdw.authLogin, M_dpm.updateDpm) //QTY, CATATAN DLL PADA DPM
router.get('/dpm_control/pelacakan', Mdw.authLogin, M_dpm.pelacakan) //QTY, CATATAN DLL PADA DPM
router.delete('/dpm/delete', Mdw.authLogin, M_dpm.deleteDpm) // DELETE ITEM BY DPMID from table DPM and APPLE
// M_dpm_new_by_memo
router.get('/dpm_control/dpm_new_by_memo', Mdw.authLogin, M_dpm_new_by_memo.dpm_new_by_memo) // DELETE ITEM BY DPMID from table DPM and APPLE
router.post('/dpm_control/search_item', Mdw.authLogin, M_dpm_new_by_memo.search_item) // DELETE ITEM BY DPMID from table DPM and APPLE
router.post('/dpm_control/dpm_by_memo_post', Mdw.authLogin, M_dpm_new_by_memo.dpm_by_memo_post) // POST DPM BY MEMO

//M_logistic
router.put('/dpm_control/pengiriman', Mdw.authLogin, M_logistic.dpmPengiriman)

//M_project
router.get('/project', Mdw.authLogin, M_project.projectList) //LIHAT DAFTAR PROJECT DAN USER DALAM CAKUPAN PROJECT
router.post('/project/add', Mdw.authAdmin, M_project.addProject) //TAMBAH PROJECT

//M_apple
router.get('/apple_control/dpm', Mdw.authLogin, M_apple.dpmApple) //CONTROL APPLE
router.get('/apple_control/pengajuan', Mdw.authLogin, M_apple.applePengajuan) //APPLE STATUS PENGAJUAN
router.get('/apple_control/pengajuan_cost_controll', Mdw.authLogin, M_apple.applePengajuanCostControll) //USER ONLY
router.get('/apple_control/revisi', Mdw.authLogin, M_apple.appleRevisi) //PENGAJUAN LEVEL COST CONTROLL
router.get('/apple_control/approve', Mdw.authLogin, M_apple.appleApprove) //APPLE YG APPROVE
router.put('/apple_control/submit_apple', Mdw.authLogin, M_apple.submitApple) //BUAT APPLE BARU
router.put('/apple_control/approval_apple', Mdw.authLogin, M_apple.approvalApple) //PROSES APPROVAL APPLE
router.put('/apple_control/update_apple', Mdw.authLogin, M_apple.updateApple) //MENGUPDATE DATA APPLE

//M_rekanan
router.get('/rekanan/mandor', Mdw.authLogin, M_rekanan.mandor) //LIHAT MANDOR
router.post('/rekanan/mandor/search', Mdw.authLogin, M_rekanan.search) // SEARCH MANDOR
router.post('/rekanan/mandor/update', Mdw.authLogin, M_rekanan.mandorUpdate) //MENGUPDATE MANDOR
router.post('/rekanan/mandor/addData', Mdw.authLogin, M_rekanan.addData) //MENAMBAH DATA MANDOR
router.get('/rekanan/supplier', Mdw.authLogin, M_rekanan.supplier) //LIHAT SUPPLIER 
router.post('/rekanan/supplier/update', Mdw.authLogin, M_rekanan.supplierUpdate) //MENGUPDATE SUPPLIER
router.post('/rekanan/supplier/addData', Mdw.authLogin, M_rekanan.supplierAddData) //MENAMBAH DATA SUPPLIER
router.post('/rekanan/supplier/update_item', Mdw.authLogin, M_supplier.supplierUpdateItem) //MENGUPDATE SUPPLIER

//M_po
router.get('/purchase_orders', Mdw.authPo, M_po.control) //CONTROL PO
router.get('/purchase_orders/print', Mdw.authPo, M_po.print) //PRINT PDF
router.get('/purchase_orders/pengajuan', Mdw.authPo, M_po.pengajuan) //PO STATUS PENGAJUAN
router.get('/purchase_orders/revisi', Mdw.authPo, M_po.revisi) //PO STATUS REVISI
router.post('/purchase_orders/revisi', Mdw.authPo, M_po.revisi) //PO STATUS REVISI
router.put('/purchase_orders/update_status_apple', Mdw.authLogin, M_po.updateStatusKetersediaanApple) //UPDATE STATUS APPLE UNTUK KETERSEDIAAN PO
router.put('/purchase_orders/update_status_item_po', Mdw.authLogin, M_po.updateStatusItemPo) //UPDATE STATUS ITEM PO
router.put('/purchase_orders/update_satuan_po', Mdw.authLogin, M_po.updateSatuanPo) //UPDATE DETAIL PO
router.get('/purchase_orders/update', Mdw.authPo, M_po.update) //PO STATUS UPDATE
router.post('/purchase_orders/update_post', Mdw.authPo, M_po.updatePost) //PO POST UPDATE DATA (API)
router.get('/purchase_orders/po_new', Mdw.authPo, M_po.poNew) //PEMBUATAN PO BARU
router.post('/purchase_orders/submit', Mdw.authPo, M_po.poNewSubmit) //SUBMIT DATA PO (API)
router.put('/purchase_orders/submit/approval', Mdw.authPo, M_po.poApproval) //APPROVAL PO
router.post('/purchase_orders/qr_code/pengajuan', Mdw.authPo, M_po.poQrCodePengajuan) //APPROVAL PO

//M_items
router.get('/items_control', Mdw.authLogin, M_items.items_control) //CONTROL ITEM
router.get('/items_control/check', Mdw.authLogin, M_items.itemControlCheck) //CONTROL ITEM
router.post('/items_controll/update', Mdw.authLogin, M_items.update) //UPDATE ITEM
router.post('/items_control/submit_item', Mdw.authLogin, M_items.tambahItem) //TAMBAH ITEM
router.get('/items_control/assets_control', Mdw.authLogin, M_items.assetsControl) //ASSET CONTROL
router.get('/items_control/update_asset', Mdw.authLogistic, M_items.updateLaporanAsset) //UPDATE ASSET
router.post('/items_control/post_update_laporan_asset', Mdw.authLogistic, M_items.postUpdateLaporanAsset) //POST DATA UPDATE LOGISTIC
router.post('/items_control/post_delete_laporan_asset', Mdw.authLogistic, M_items.postDeleteLaporanAsset) //POST DATA DELETE LOGISTIC
router.post('/items_control/assets_control/loadMore', Mdw.authLogin, M_items.loadMore) //LOAD MORE
router.post('/items_control/assets_control_detail', Mdw.authLogin, M_items.detailAssets) //DETAIL ASSETS
router.post('/items_control/assets_control_pencarian', Mdw.authLogin, M_items.pencarian) //PENCARIAN ASSET
router.get('/items_control/site_logistic', Mdw.authLogin, M_items.siteLogistic) //SITE LOGISTIC
router.post('/items_control/site_logistic/post', Mdw.authLogin, M_items.submitLogistic) //TAMBAH CATATAN LOGISTIC
router.post('/items_control/site_logistic/update_logistic', Mdw.authLogin, M_items.submitUpdateLogistic) //UPDATE CATATAN LOGISTIC

//M_user
router.get('/list_users', Mdw.authAdmin, M_user.listUser) //ADMIN ONLY
router.get('/list_users/:id', Mdw.authAdmin, M_user.userDetail) //ADMIN ONLY
router.post('/user_list/user/add', Mdw.authAdmin, M_user.addDetail) //ADMIN ONLY
router.put('/user/update', Mdw.authAdmin, M_user.updateUserData) //ADMIN ONLY
router.put('/user/tambah_penugasan', Mdw.authAdmin, M_user.tambahPenugasan) //ADMIN ONLY

//M_user
router.get('/profile', Mdw.authLogin, M_user.profile) //USER ONLY

//M_spk
router.get('/spk_control', Mdw.authLogin, M_spk.spkControl)
router.post('/spk_control/check_spk', Mdw.authCc, M_spk.checkSpk)
router.post('/spk_control/tambah_spk', Mdw.authCc, M_spk.submitSpk)
router.post('/spk_control/check_spk_detail', Mdw.authCc, M_spk.spkById)
router.post('/spk_control/check_spk_detail/update', Mdw.authCc, M_spk.updateSpkTransaksi)
router.post('/spk_control/check_spk_detail/tambah_transansi', Mdw.authCc, M_spk.tambahSpkTransaksi)
router.put('/spk_control/check_spk_detail/update_verifikasi', Mdw.authCc, M_spk.updateVerifikasi)
router.put('/spk_control/check_spk_detail/update_spk_nilai', Mdw.authCc, M_spk.updateSpkNilai)
router.delete('/spk_control/check_spk_detail/update_spk_nilai', Mdw.authCc, M_spk.deleteSpkTransaksi)

// M_spk_pengajuan
router.get('/spk_pengajuan', Mdw.authLogin, M_spk_pengajuan.pengajuan)
router.get('/spk_pengajuan/new', Mdw.authLogin, M_spk_pengajuan.pengajuanNew)

//M_chat
router.get('/chatting/projects', Mdw.authLogin, M_chat.project)

//M_verification
router.get('/verification_control', Mdw.authAdmin, M_verification.verificationControl)
router.get('/verification_control/approve', Mdw.authAdmin, M_verification.verificationApprove)
router.get('/verification_control/revisi', Mdw.authAdmin, M_verification.verificationRevisi)
router.get('/verification_control/pengajuan', Mdw.authAdmin, M_verification.verificationReject)
router.put('/verification_control/approval', Mdw.authAdmin, M_verification.approval)
router.get('/verification', M_verification.verification)

//M_whatsapp
router.get('/whatsapp/blast', M_whatsapp.blast)

/**
 * API INTERNAL
 */
//M_dev
router.put('/API/dev', Mdw.authAdmin, M_dev.dev)

//M_dpm
router.get('/API/dpmPoApprove', Mdw.authLogin, M_dpm.dpmPoApprove)
router.post('/API/dpmItemList', Mdw.authLogin, M_dpm.dpmItemList)
router.post('/API/submitDpm', Mdw.authLogin, M_dpm.submitDpm)

//M_supplier
router.get('/API/allActiveSupplier', Mdw.authLogin, M_supplier.allActiveSupplier)
//M_items
router.put('/API/updateUnit', Mdw.authLogin, M_items.updateUnit)
router.delete('/API/deleteUnit', Mdw.authLogin, M_items.deleteUnit)
router.delete('/API/deleteItem', Mdw.authLogin, M_items.deleteItem)
router.post('/API/insertRecord', Mdw.authLogin, M_items.insertRecord)

router.get('/API/items/getItemsUnit', Mdw.authLogin, M_items.getItemsUnit)
router.get('/API/items/getItemsPekerjaan', Mdw.authLogin, M_items.getItemsPekerjaan)
router.post('/API/items/getItemsPekerjaan', Mdw.authLogin, M_items.getItemsByPekerjaan)
router.post('/API/logistic/detailReport', Mdw.authLogin, M_items.detilLogistic)
router.get('/API/getMandor', Mdw.authLogin, M_rekanan.apiMandorActive)

router.post('/webhook', async (req, res) => {
    const { m, jid, messageContent } = req.body
    // console.log({m, jid, messageContent})
    const sender = jid.split('@')[0]
    // db.query(`SELECT * FROM admin WHERE hp = ?`, [sender], (err, result) => {
    db.query(`SELECT * FROM admin WHERE hp = ? AND admin_status = 1`, [sender], (err, result) => {
        if (err) throw err
        if (result.length === 1) {
            const pesan = `Hi *${result[0].name}*.\n\nNomor ini dikelola oleh system https://dpm.rgsinergi.co.id.\n\nSilahkan hubungi web developer di https://wa.ndalu.id/contact-us untuk info lebih lanjut`
            const send = new WHATSAPP(sender, pesan)
            send.sendText()
            return res.send({status: true, message: 'Jid found, let me handled this'})
        }
        res.send({status: false, message: 'Jid Not Found'})
    })
})

/**
 * NOTFOUND
 */
router.get('*', Mdw.authLogin, (req, res) => {
    const trex = require('../class/C_trex')
    const play = new trex(req, res)
    play.run()
})

module.exports = router
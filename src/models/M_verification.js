'use strict'

const Verification = require("../class/C_verification")
const Whatsapp = require('../class/C_whatsapp')
const Po = require('../class/C_po')

let data = {
    title: 'DPM',
    pageTitle: 'DPM',
    pageTitleDesc: 'DPM'
}

const verificationControl = async (req, res) => {
    const { type, id, po_number } = req.query
    const verification = new Verification()
    const trex = require('../class/C_trex')
    const play = new trex(req, res)
    if ( type && id && po_number ) {
        data.userId = req.userId
        data.userName = req.userName
        data.userLevel = req.userLevel
        data.title = 'VERIFICATION'
        data.pageTitle = 'Verifikasi Data'
        if (type === 'QR') {
            data.pageTitleDesc = 'Kontrol Verifikasi Data PO'
            const dataQr = await verification.getVerificationByIdPoNumber(id, po_number)
            if (dataQr.length > 0) {
                const po = new Po()
                const dataPo = await po.poByNumber(dataQr[0].project, dataQr[0].ver_number)
                // console.log(dataPo)
                data.po = dataPo
                data.qr = dataQr[0]
                res.render('verification/verificationById', data)
                // res.send({ id, po_number, dataQr, qr: 'Buat approve qr', po: 'Reject Berarti reject PO dan hapus pengajuan qr', catatan: 'ada link ke lihat po' })
            } else {
                play.run()
            }
        } else {
            play.run()
        }
    } else {
        data.userId = req.userId
        data.userName = req.userName
        data.userLevel = req.userLevel
        data.title = 'VERIFICATION'
        data.pageTitle = 'Verifikasi Data'
        data.pageTitleDesc = 'Kontrol Verifikasi Data PO'
        data.ver = await verification.getAll().catch( err => {
            console.log(err)
        })
        res.render('verification/control', data)
    }
}

const verificationApprove = async (req, res) => {
    const verification = new Verification()
    data.userId = req.userId
    data.userName = req.userName
    data.userLevel = req.userLevel
    data.title = 'VERIFICATION'
    data.pageTitle = 'Verifikasi Data'
    data.pageTitleDesc = 'Kontrol Verifikasi Data PO'
    data.ver = await verification.getApprove().catch( err => {
        console.log(err)
    })
    res.render('verification/control', data)
}

const verificationRevisi = async (req, res) => {
    const verification = new Verification()
    data.userId = req.userId
    data.userName = req.userName
    data.userLevel = req.userLevel
    data.title = 'VERIFICATION'
    data.pageTitle = 'Verifikasi Data'
    data.pageTitleDesc = 'Kontrol Verifikasi Data PO'
    data.ver = await verification.getRevisi().catch( err => {
        console.log(err)
    })
    res.render('verification/control', data)
}

const verificationReject = async (req, res) => {
    const verification = new Verification()
    data.userId = req.userId
    data.userName = req.userName
    data.userLevel = req.userLevel
    data.title = 'VERIFICATION'
    data.pageTitle = 'Verifikasi Data'
    data.pageTitleDesc = 'Kontrol Verifikasi Data PO'
    data.ver = await verification.getPengajuan().catch( err => {
        console.log(err)
    })
    res.render('verification/control', data)
}

const approval = async (req, res) => {
    const {id, newStatus, pesan} = req.body
    const verification = new Verification()
    const x = await verification.update(req.userId, id, newStatus, pesan)
    if (x.result.affectedRows == 1) {

        const data = await verification.getVerById(id)

        const C_project = require('../class/C_project')
        const p = new C_project()
        const tujuan = await p.penugasanProjectLevel(data[0].project, ['purchasing', 'po', 'director'])
        for (let i = 0; i < tujuan.length; i++) {
            let date = new Date()
            date = new Date().toLocaleDateString('id-ID', {weekday: 'long', day: 'numeric', month: 'long', year:'numeric'})+' '+new Date().toLocaleTimeString('en-US')
            const delay = i * 4000
            
            if (process.env.APP_MODE == 'SANDBOX') {
                var hp = '6285640465672'
            } else {
                var hp = tujuan[i].hp
            }

            if (newStatus == 1) {
                var mStatus = 'REJECT/REVISI'
            } else if (newStatus == 2) {
                var mStatus = 'APPROVE'
            } else {
                var mStatus = 'PENDING'
            }

            setTimeout( async () => {
                var message = `Kepada: ${tujuan[i].name}\n\n*QRCODE ${mStatus}\n${data[0].project.toUpperCase()}*\nSupplier: ${data[0].supplier}\nPO Nomor: ${data[0].ver_number}\nCatatan: ${data[0].ver_message_2}\nA.n: ${req.userName}\n\n${date}`
                // console.log({hp, nama: tujuan[i].name})
                // console.log(message)
                const whatsapp = new Whatsapp(hp, message)
                whatsapp.sendText()
            }, delay)
        }
        return res.send({status: 'success', newStatus, key: x.random, pesan})
    }
    res.send({status: 'failed', message: 'Gagal update database'})
}

const verification = async (req, res) => {
    const type = req.query.type
    const number = req.query.number
    const key = req.query.key
    if (type == 'po' && number && key) {
        const verification = new Verification()
        const verificationData = await verification.getVerification(type, number, key)
        if (verificationData.length == 1) {
            data.ver = verificationData[0]
            return res.render('verification/verification_public', data)
        }
        return res.render('verification/verification_public')
    }
    res.end('Oops')
}

module.exports = {
    verificationControl, verificationApprove, verificationRevisi, verificationReject, approval, verification
}
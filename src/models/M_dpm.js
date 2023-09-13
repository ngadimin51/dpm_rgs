'use strict'

const db = require('./DbConn')
const fetch = require('node-fetch')
const C_project = require('../class/C_project')
const p = new C_project()
const C_admin = require('../class/C_admin')
const a = new C_admin()
const C_dpm = require('../class/C_dpm')
const d = new C_dpm()
const C_item = require('../class/C_item')
const itm = new C_item()
const aplClass = require('../class/C_apple')
const apl = new aplClass()
const suplClass = require('../class/C_supplier')
const cSupl = new suplClass()
const C_po = require('../class/C_po')
const cpo = new C_po
const C_ver = require('../class/C_verification')
const cver = new C_ver
const Whatsapp = require('../class/C_whatsapp')

let sql
let data = {
    title: 'DPM',
    pageTitle: 'DPM',
    pageTitleDesc: 'DPM'
}

/**
 * FOR ROUTER
 */
const dpmControl = async (req, res) => {
    const userId = req.userId
    const project = req.query.project
    const item = req.query.item
    const number = req.query.number
    const id = req.query.id
    data.userName = req.userName
    data.userLevel = req.userLevel
    data.userPicture = req.userPicture
    data.project = project
    if (project && !item) {
        data.title = 'DPM'
        data.pageTitle = 'DPM'
        data.pageTitleDesc = 'Daftar Permintaan Material '+project+'. Hanya menampilkan 300 record data terakhir.'
        data.dpm = await d.byProject(project)
        data.searchPermit = true
        res.render('dpm/by_project', data)
    } else if (project && item) {
        data.title = 'DPM'
        data.pageTitle = 'DPM'
        data.pageTitleDesc = 'Daftar Pencarian Item : <b>'+item.toUpperCase()+'</b>.Di Project '+project
        data.dpm = await d.search(project, item)
        data.searchPermit = true
        res.render('dpm/by_project', data)
    } else if (number && !id) {
        data.title = 'DPM'
        data.pageTitle = 'DPM'
        data.pageTitleDesc = 'Daftar Permintaan Material '+number
        data.dpm = await d.byNumber(number)
        res.render('dpm/by_project', data)
    } else if (number && id) {
        data.title = 'DPM'
        data.pageTitle = 'DPM'
        data.pageTitleDesc = 'Daftar Permintaan Material '+number
        data.dpm = await d.byNumberId(number, id)
        if (typeof data.dpm != 'undefined') {
            data.apple = await apl.getAppleByDpmNumberId(number, id)  //getAppleByDpmId(number, id)
            data.pembuat = await a.adminData(data.dpm.pembuat)
            data.cc = await a.adminData(data.dpm.cc)
            if (typeof data.apple != 'undefined') {
                const dataSupl1 = await cSupl.getSupplierData(data.apple.supl1)
                const dataSupl2 = await cSupl.getSupplierData(data.apple.supl2)
                const dataSupl3 = await cSupl.getSupplierData(data.apple.supl3)
                data.purName = await a.adminData(data.apple.purchasing_id)
                data.dirName = await a.adminData(data.apple.dir_id)
                data.supl1Name = dataSupl1.name
                data.supl2Name = dataSupl2.name
                data.supl3Name = dataSupl3.name
            }
            res.render('dpm/by_id', data)
        } else {
            const trex = require('../class/C_trex')
            const play = new trex(req, res)
            play.run()
        }
    } else {
        const daftarProject = await p.penugasan(userId)
        data.title = 'DPM'
        data.pageTitle = 'DPM'
        data.pageTitleDesc = 'Daftar Permintaan Material'
        let arrayDataProject = []
        for (let i = 0; i < daftarProject.length; i ++) {
            arrayDataProject.push({
                id: daftarProject[i].id,
                project: daftarProject[i].project,
                description: daftarProject[i].description,
                dpm : await d.totalDpm(daftarProject[i].project)
            })
        }
        data.project = arrayDataProject
        res.render('dpm/dpm_control', data)
    }
}

const dpmControlFilter = async (req, res) => {
    const project = req.query.project
    const lapangan = req.query.lapangan
    const ho = req.query.ho
    const apple = req.query.apple
    const dpm = await d.checkDpmStatus(project, lapangan, ho, apple)
    delete data.searchPermit
    data.userName = req.userName
    data.userLevel = req.userLevel
    data.userPicture = req.userPicture
    data.project = project
    data.title = 'DPM'
    data.pageTitle = 'DPM'
    data.pageTitleDesc = 'Daftar Permintaan Material '+project
    data.dpm = dpm
    res.render('dpm/by_project', data)
    /*
    if (dpm.length > 0) {
        data.project = project
        data.title = 'DPM'
        data.pageTitle = 'DPM'
        data.pageTitleDesc = 'Daftar Permintaan Material '+project
        data.dpm = dpm
        res.render('dpm/by_project', data)
    } else {
        const trex = require('../class/C_trex')
        const play = new trex(req, res)
        play.run()
    }
    */
}

const dpmPoApprove = (req, res) => {
    const project = req.query.project
    const item = req.query.item
    if (project && item) {
        sql = `SELECT dpm.dpm_id, dpm.number, po_detail.po_number, po_qty, po_price FROM dpm JOIN po_detail ON dpm.dpm_id=po_detail.dpm_id WHERE dpm.project = ? AND item = ?`
        db.query(sql, [project, item], (err, result) => {
            if (err) throw err
            let qty = 0
            for (let i = 0; i < result.length; i++) {
                qty += result[i].po_qty
            }
            res.send({status: 'success', project, item, qty, data: result})
        })
    } else {
        res.end('Ooopsssss')
    }
}

const dpmNew = async (req, res) => {
    data.title = 'DPM'
    data.pageTitle = 'Buat DPM Baru'
    data.pageTitleDesc = 'Pilih Project dan pekerjaan untuk pembuatan DPM baru'
    data.userId = req.userId
    data.userName = req.userName
    data.userLevel = req.userLevel
    data.userPicture = req.userPicture

    data.project = await p.penugasan(req.userId)
    data.pekerjaan = await itm.getItemPekerjaan()

    res.render('dpm/dpm_new', data)
}

const dpmItemList = async (req, res) => {
    const {pk, item} = req.body
    const data = await itm.getItemForDpm(pk, item)
    if (data == false) {
        return res.send({status: 'failed', message: 'Pilih Project && Pekerjaan',  data: null})
    }
    res.send({status: data.status, data: data.data})
}

const submitDpm = async (req, res) => {
    const {data} = req.body
    // console.log(data)
    // return res.send({status: 'failed', message: 'Wrong parameters'})
    if (data) {
        for (let i = 0; i < data.length; i++) {
            const x = data[i]
            const check = await d.checkDpmStatus(x.id, x.project)
            if (check.length > 0) {
                // console.log('check.length')
                return res.send({status: 'failed', data: check})
            }
        }
        // console.log('insert')
        insertDpm(req, res, data)
    } else {
        res.send({status: 'failed', message: 'Wrong parameters'})
    }
}

const approval = async (req, res) => {
    const userLevel = req.userLevel
    const {dpmId} = req.body
    const dpmData = await d.byId(dpmId)
    if (dpmId && userLevel == 'site engineer' && dpmData.control < 2 && dpmData.ho == 0) {
        res.send({status: 'success', message: 'Otorisasi diijinkan', level: userLevel, control: dpmData.control, ho: dpmData.ho})
    } else if (dpmId && userLevel == 'site manager' && dpmData.control < 4 && dpmData.ho == 0) {
        res.send({status: 'success', message: 'Otorisasi diijinkan', level: userLevel, control: dpmData.control, ho: dpmData.ho})
    } else if (dpmId && userLevel == 'project manager' && dpmData.ho < 2) {
        res.send({status: 'success', message: 'Otorisasi diijinkan', level: userLevel, control: dpmData.control, ho: dpmData.ho})
    } else if (dpmId && (userLevel == 'cost controll' || userLevel == 'director' || userLevel == 'admin') && dpmData.ho <= 2) {
        res.send({status: 'success', message: 'Otorisasi diijinkan', level: userLevel, control: dpmData.control, ho: dpmData.ho})
    } else if (dpmId && (userLevel == 'logistic' || userLevel == 'director' || userLevel == 'admin') && dpmData.ho >= 5) {
        res.send({status: 'success', message: 'Otorisasi diijinkan', level: userLevel, control: dpmData.control, ho: dpmData.ho})
    } else {
        res.send({status: 'failed', message: 'Otorisasi gagal, check status DPM atau reload Halaman'})
    }
}

const updateDpm = async (req, res) => {
    const url = 'https://dpm.rgsinergi.co.id'
    const userLevel = req.userLevel
    const datex = new Date()
    const time = datex.toLocaleDateString()+' '+datex.toLocaleTimeString()
    const {dpmId, status, qty2, date2, catatan} = req.body
    const dpmData = await d.byId(dpmId)
    let process = false
    if (dpmId && userLevel == 'site engineer' && dpmData.control < 2) {
        var update = await d.approvalSE(req.userId,  dpmId)
        if (update.affectedRows == 1) {
            process = true
            await notifNewDpm(url, req.userName, dpmData.project, dpmData.code_rap, dpmData.number, ['site manager','project manager'])
        }
    } else if (dpmId && userLevel == 'site manager' && dpmData.control < 4) {
        var update = await d.approvalSM(catatan, status, dpmId)
        if (update.affectedRows == 1) {
            process = true
            await notifNewDpm(url, req.userName, dpmData.project, dpmData.code_rap, dpmData.number, ['project manager'], catatan)
        }
    } else if (dpmId && userLevel == 'project manager' && dpmData.control <= 4 && dpmData.ho == 0) {
        var update = await d.approvalPM(catatan, status + 2, dpmId)
        if (update.affectedRows == 1) {
            process = true
            if (status == 2) {
                await notifNewDpm(url, req.userName, dpmData.project, dpmData.code_rap, dpmData.number, ['cost controll','purchasing'], catatan)
            } else {
                await notifNewDpm(url, req.userName, dpmData.project, dpmData.code_rap, dpmData.number, ['site engineer','site manager'], catatan)
            }
        }
    } else if ((dpmId && userLevel == 'cost controll' && dpmData.control == 4 && dpmData.ho <= 2) || ((dpmId && (userLevel == 'cost controll' || userLevel == 'admin') &&  dpmData.ho <= 2))) {
        var update = await d.approvalCC(req.userId, dpmId, status, qty2,  date2, catatan)
        if (update.affectedRows == 1) {
            process = true
            if (status == 2) {
                await notifNewDpm(url, req.userName, dpmData.project, dpmData.code_rap, dpmData.number, ['purchasing'], catatan)
            } else {
                await notifNewDpm(url, req.userName, dpmData.project, dpmData.code_rap, dpmData.number, ['project manager'], catatan)
            }
        }
    }
    if (process == true) {
        res.send({status: 'success', message: 'Otorisasi diijinkan', level: userLevel})
        req.io.emit('update-notif') //broadcast untuk update notif
        req.io.emit('update-dpm', {number: dpmData.number, dpmId: dpmData.dpm_id})
    } else {
        res.send({status: 'failed', message: 'Otorisasi Tidak Diijinkan', level: userLevel})
    }
}

const deleteDpm = async (req, res) => {
    const { dpmId, item, unit, project } = req.body
    const checkPo = await checkItemOnPo(dpmId)
    const allowed = ['cost controll', 'director', 'po', 'admin']
    if (checkPo.length === 0 && allowed.indexOf(req.userLevel) != -1) {
        // console.log(allowed.indexOf(req.userLevel))
        // return res.send({status: 'failed', message: 'Debugging'})
        const sqlDpm = 'DELETE FROM dpm WHERE dpm_id = ?'
        const sqlApple = 'DELETE FROM apple WHERE dpm_id = ?'
        db.query(sqlDpm, [dpmId], async (err, result) => {
            if (err) console.log(err)
            // console.log(result)
            db.query(sqlApple, [dpmId, dpmId], async (err, result) => {
                if (err) throw err
            })
            const tujuan = await p.penugasanProjectLevel(project, ['site engineer', 'site manager', 'project manager', 'cost control', 'purchasing', 'po'])
            tujuan.forEach((x, i) => {
                const delay = i * 2000
                let date = new Date()
                date = new Date().toLocaleDateString()+' '+new Date().toLocaleTimeString()
                if (process.env.APP_MODE == 'SANDBOX') {
                    var hp = '6285640465672'
                } else {
                    var hp = x.hp
                }
                const nama = x.name
                var pesan = `Kepada: ${nama}\n\n*DPM ITEM DIHAPUS PROJECT ${project.toUpperCase()}*\nItem: ${item}\nA.n: ${req.userName}\n\n${date}`
                setTimeout(() => {
                    // console.log(hp)
                    // console.log(pesan)
                    // console.log('------------------')
                    const whatsapp = new Whatsapp(hp, pesan)
                    whatsapp.sendText()
                }, delay)
            })
            res.send({status: 'success', message: 'Berhasil menghapus data'})
        })
    } else {
        res.send({status: 'failed', message: 'Gagal delete, item berada dalam PO Nomor : '+checkPo[0].po_number})
    }
}

/**
 * FOR FUNCTION
 */
const insertDpm = async (req, res, data) => {
    const level = req.userLevel
    const url = 'https://dpm.rgsinergi.co.id'
    const code = await p.dataByProject(data[0].project)
    const date = new Date()
    const arrayBulan = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII']
    const bulan = arrayBulan[date.getMonth()]

    //check status item
    for( let i = 0; i < data.length; i++) {
        const x = await d.checkDataDpm(data[i].id, data[i].project)
        if (x.length > 0) {
            console.log(x)
            return res.send({status: 'failed', data: x})
        }
    }

    let dpmNumber = await d.getDpmNumber(data[0].project)
    if (dpmNumber.length > 0) {
        dpmNumber = dpmNumber[0].number
        const split = dpmNumber.split('/')
        dpmNumber = (split[0] * 1) + 1+'/DPM/'+code.code+'/'+bulan+'/'+date.getFullYear()
    } else {
        dpmNumber = `1/DPM/${code.code}/${bulan}/${date.getFullYear()}`
    }

    if (level == 'site engineer' || level == 'site logistic') {
        var controlVal = 0
        var hoVal = 0
    } else if (level == 'site manager') {
        var controlVal = 2
        var hoVal = 0
    } else if (level == 'project manager' || level == 'purchasing') {
        var controlVal = 4
        var hoVal = 0
    } else if (level == 'logistic' || level == 'cost controll' || level == 'po' || level == 'director' || level == 'admin') {
        var controlVal = 4
        var hoVal = 2
    } else {
        return res.send({status: 'failed', message: 'Error while trying to insert database M_dpm'})
    }

    let array = []
    for(let i = 0; i < data.length; i++) {
        const number = dpmNumber
        const project = data[i].project
        const item = data[i].id
        const unit = data[i].unit
        const qty1 = data[i].qty
        const catatan = data[i].catatan
        const code_rap = data[i].pekerjaan
        const date1 = data[i].tanggal
        const site1 = req.userId
        const control = controlVal
        const ho = hoVal
        const created = new Date().toLocaleString()
        array.push([number, project, item, unit, catatan, qty1, code_rap, date1, site1, control, ho, created])
    }

    const result = await d.insertNewDpm(array)

    if (result.affectedRows > 0) {
        res.send({status: 'success', data: dpmNumber})
        req.io.emit('update-notif') //broadcast untuk update notif
        if (level == 'site engineer') {
            await notifNewDpm(url, req.userName, data[0].project, data[0].pekerjaan, dpmNumber, ['site engineer','site manager','project manager'])
        } else if (level == 'site manager') {
            await notifNewDpm(url, req.userName, data[0].project, data[0].pekerjaan, dpmNumber, ['site engineer','site manager','project manager'])
        } else if (level == 'project manager') {
            await notifNewDpm(url, req.userName, data[0].project, data[0].pekerjaan, dpmNumber, ['site engineer','site manager','project manager'])
        } else if (level == 'logistic' || level == 'cost controll' || level == 'po' || level == 'director' || level == 'admin') {
            await notifNewDpm(url, req.userName, data[0].project, data[0].pekerjaan, dpmNumber, ['cost controll','po','director'])
        }
    } else {
        res.send({status: 'failed', message: result})
    }
}

const notifNewDpm = async (url, userName, project, pekerjaan, number, arrayLevel, catatan) => {
    
    const tujuan = await p.penugasanProjectLevel(project, arrayLevel)

    for (let i = 0; i < tujuan.length; i++) {
        let date = new Date()
        date = new Date().toLocaleDateString()+' '+new Date().toLocaleTimeString()
        const delay = i * 2000
        
        if (process.env.APP_MODE == 'SANDBOX') {
            var hp = '6285640465672'
        } else {
            var hp = tujuan[i].hp
        }

        const nama = tujuan[i].name
        const item = await d.getItemNameByDpmNumber(number)
        let itemName = ''

        for (let i = 0; i < item.length; i++) {
            const br = (i - 1 < item.length ? '\n' : '')
            itemName += '- '+item[i].name+' :'+item[i].qty1+' '+item[i].unit+' '+br
        }

        if (catatan) {
            var pesan = `Kepada: ${nama}\n\n*DPM PROSESS PROJECT ${project.toUpperCase()}*\nPekerjaan: ${pekerjaan}\nNumber: ${number}\nItem:\n${itemName}\nCatatan: ${catatan}\nLink: ${url}/dpm_control/number=${number}\nA.n: ${userName}\n\n${date}`
        } else {
            var pesan = `Kepada: ${nama}\n\n*DPM PROSESS PROJECT ${project.toUpperCase()}*\nPekerjaan: ${pekerjaan}\nNumber: ${number}\nItem:\n${itemName}\nLink: ${url}/dpm_control/number=${number}\nA.n: ${userName}\n\n${date}`
        }
        
        setTimeout( async () => {
            //console.log(hp)
            //console.log(pesan)
            const whatsapp = new Whatsapp(hp, pesan)
            whatsapp.sendText()
        }, delay)
    }
}

const pelacakan = async (req, res) => {
    const number = req.query.number
    const dpmId = req.query.dpm_id

    data.userName = req.userName
    data.userLevel = req.userLevel
    data.userPicture = req.userPicture
    data.title = 'DPM'
    data.pageTitle = 'DPM'
    data.pageTitleDesc = 'Pelacakan Item'
    
    const dpm = await d.byId(dpmId)
    const item = await itm.getItemById(dpm.item)

    const apple = await apl.getAppleByDpmNumberId(dpm.number, dpmId)
    const supl = apple ? await cSupl.getSupplierDetail(apple.dir_acc) : 'null'

    const po = await cpo.getPoByDpmId(dpmId)

    const ver = po ? await cver.getVerificationByPoNumber('po', po.po_number) : 'null'

    const belum = `Belum dikerjakan`

    if (apple) {
        if (apple.status == 0) {
            var appleStatus = 'Apple to apple lama'
        } else if (apple.status == 1) {
            var appleStatus = 'Menunggu Approval BOD'
        } else if (apple.status == 2) {
            var appleStatus = 'error (akibat update terdahulu)'
        } else if (apple.status == 3) {
            var appleStatus = 'Item tersedia untuk dasar pembuatan PO'
        } else if (apple.status == 4) {
            var appleStatus = 'Item sudah dibuat PO'
        } else if (apple.status == 10) {
            var appleStatus = 'Menunggu Cost Controll'
        } else {
            var appleStatus = 'Error ?'
        }
    }

    if (po) {
        if (po.bod_approve == 0) {
            var poStatus = 'Error, infokan ke IT'
        } else if (po.bod_approve == 1) {
            var poStatus = 'PO Pengajuan'
        } else if (po.bod_approve == 2) {
            var poStatus = 'PO Revisi'
        } else if (po.bod_approve == 3) {
            var poStatus = 'PO Approve'
        }
    }

    if (ver.length == 1) {
        if (ver[0].ver_status == 0) {
            var qrcode = 'Pengajuan'
        } else if (ver[0].ver_status == 1) {
            var qrcode = 'Ditolak / Revisi'
        } else if (ver[0].ver_status == 2) {
            var qrcode = 'Approve'
        } else {
            var qrcode = 'Error'
        }
    }
    
    data.pelacakan = {
        dpmId, number, itemId: item[0].id, item: item[0].name, unit: dpm.unit, pekerjaan: dpm.code_rap, project: dpm.project,
        appleStatus: apple ? appleStatus : belum, appleSupplier: apple ? supl.name : belum,
        poNumber: po ? po.po_number : belum, poSupplier: po ? po.name : belum, poStatus: po ? poStatus : belum,
        qrCodePo: ver.length == 1 ? qrcode : belum
    }
    res.render('dpm/pelacakan', data)
}

const checkItemOnPo = (dpmId) => {
    const sql = 'SELECT * FROM po_detail WHERE dpm_id = ?'
    return new Promise((resolve, reject) => {
        db.query(sql, [dpmId], (err, result) => {
            if (err) return reject(err)
            return resolve(result)
        })
    })
}

module.exports = {
    dpmControl, dpmControlFilter, dpmPoApprove, dpmNew, dpmItemList, submitDpm, approval, updateDpm, pelacakan, deleteDpm
}
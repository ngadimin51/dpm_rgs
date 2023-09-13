'use strict'

const ADMIN = require('../class/C_admin')
const Admin = new ADMIN()
const DPM = require('../class/C_dpm')
const Dpm = new DPM()
const PROJECT = require('../class/C_project')
const Project = new PROJECT()
const APPLE = require('../class/C_apple')
const Apple = new APPLE()
const WHATSAPP = require('../class/C_whatsapp')
const SUPPLIER = require('../class/C_supplier')
const Supplier = new SUPPLIER()

let data = {
    title: 'DPM',
    pageTitle: 'DPM',
    pageTitleDesc: 'DPM'
}

const dpmApple = async (req, res) => {

    data.userName = req.userName
    data.userLevel = req.userLevel
    data.userPicture = req.userPicture
    data.title = 'APPLE',
    data.pageTitle = 'APPLE 2 APPLE',
    data.pageTitleDesc = 'Pilih project untuk melihat daftar dpm untuk pekerjaan apple2apple'
    
    const userId = req.userId
    const project = req.query.project
    const Dpm = new DPM()

    if (project) {
        data.project = project
        data.dpm = await Dpm.byControlHo(4, 2, project)
        res.render('dpm/by_project', data)
    } else {
        const Project = new PROJECT()
        const project = await Project.penugasan(userId)
        let arrProject = []
        for (let i = 0; i < project.length; i++) {
            const dpm = await Dpm.byControlHo(4, 2, project[i].project)
            arrProject.push({
                id: project[i].idProject,
                project: project[i].project,
                description: project[i].description,
                apple: dpm.length
            })
        }
        data.project = arrProject
        res.render('apple/apple_dpm', data)
    }

}

const applePengajuan = async (req, res) => {

    data.userName = req.userName
    data.userLevel = req.userLevel
    data.userPicture = req.userPicture
    data.title = 'APPLE',
    data.pageTitle = 'APPLE 2 APPLE',
    data.pageTitleDesc = 'Pilih project untuk melihat daftar dpm untuk pekerjaan apple2apple'
    
    const userId = req.userId
    const project = req.query.project

    if (project) {
        data.project = project
        data.dpm = await Apple.pengajuanByProject(project)
        res.render('dpm/by_project', data)
    } else {
        const project = await Project.penugasan(userId)
        let arrProject = []
        for (let i = 0; i < project.length; i++) {
            const dpm = await Apple.pengajuanByProject(project[i].project)
            arrProject.push({
                id: project[i].idProject,
                project: project[i].project,
                description: project[i].description,
                apple: dpm.length
            })
        }
        data.project = arrProject
        res.render('apple/apple_pengajuan', data)
    }

}

const applePengajuanCostControll = async (req, res) => {

    data.userName = req.userName
    data.userLevel = req.userLevel
    data.userPicture = req.userPicture
    data.title = 'APPLE',
    data.pageTitle = 'APPLE 2 APPLE',
    data.pageTitleDesc = 'Pilih project untuk melihat daftar dpm untuk pekerjaan apple2apple'
    
    const userId = req.userId
    const project = req.query.project

    if (project) {
        data.project = project
        data.dpm = await Apple.pengajuanCostControllByProject(project)
        res.render('dpm/by_project', data)
    } else {
        const project = await Project.penugasan(userId)
        let arrProject = []
        for (let i = 0; i < project.length; i++) {
            const dpm = await Apple.pengajuanCostControllByProject(project[i].project)
            arrProject.push({
                id: project[i].idProject,
                project: project[i].project,
                description: project[i].description,
                apple: dpm.length
            })
        }
        data.project = arrProject
        res.render('apple/apple_pengajuan_cost_controll', data)
    }

}

//pengajuanCostControllByProject

const appleRevisi = async (req, res) => {

    data.userName = req.userName
    data.userLevel = req.userLevel
    data.userPicture = req.userPicture
    data.title = 'APPLE',
    data.pageTitle = 'APPLE 2 APPLE',
    data.pageTitleDesc = 'Pilih project untuk melihat daftar dpm untuk pekerjaan apple2apple'
    
    const userId = req.userId
    const project = req.query.project

    if (project) {
        data.project = project
        data.dpm = await Apple.revisiByProject(project)
        res.render('dpm/by_project', data)
    } else {
        const project = await Project.penugasan(userId)
        let arrProject = []
        for (let i = 0; i < project.length; i++) {
            const dpm = await Apple.revisiByProject(project[i].project)
            arrProject.push({
                id: project[i].idProject,
                project: project[i].project,
                description: project[i].description,
                apple: dpm.length
            })
        }
        data.project = arrProject
        res.render('apple/apple_revisi', data)
    }

}

const appleApprove = async (req, res) => {

    data.userName = req.userName
    data.userLevel = req.userLevel
    data.userPicture = req.userPicture
    data.title = 'APPLE',
    data.pageTitle = 'APPLE 2 APPLE',
    data.pageTitleDesc = 'Pilih project untuk melihat daftar dpm untuk pekerjaan apple2apple'
    
    const userId = req.userId
    const project = req.query.project

    if (project) {
        data.project = project
        data.dpm = await Apple.approveByProject(project)
        res.render('dpm/by_project', data)
    } else {
        const project = await Project.penugasan(userId)
        let arrProject = []
        for (let i = 0; i < project.length; i++) {
            const dpm = await Apple.approveByProject(project[i].project)
            arrProject.push({
                id: project[i].idProject,
                project: project[i].project,
                description: project[i].description,
                apple: dpm.length
            })
        }
        data.project = arrProject
        res.render('apple/apple_approve', data)
    }

}

const submitApple = async (req, res) => {
    const userId = req.userId
    const {id, number, catatan, supplier} = req.body
    
    if (id, number, catatan, supplier) {

        const supl1 = supplier[0].supplier.split('|spacer|')[0]
        const payment1 = supplier[0].payment
        const note1 = supplier[0].note
        const price1 = supplier[0].price

        const supl2 = supplier[1].supplier.split('|spacer|')[0]
        const payment2 = supplier[1].payment
        const note2 = supplier[1].note
        const price2 = supplier[1].price

        const supl3 = supplier[2].supplier.split('|spacer|')[0]
        const payment3 = supplier[2].payment
        const note3 = supplier[2].note
        const price3 = supplier[2].price

        const dpm = await Dpm.byNumberId(number, id)
        
        const update = await Apple.updateStatusHo(id)
        
        if (update.affectedRows === 1) {
            
            const submitApple = await Apple.submitApple(userId, dpm.project, 10, id, number, supl1, price1, payment1, note1, supl2, price2, payment2, note2, supl3, price3, payment3, note3, catatan)
            /**CHECK */
            if (submitApple.affectedRows === 1) {
                const tujuan = await Project.penugasanProjectLevel(dpm.project, ['cost controll'])
    
                const url = 'https://dpm.rgsinergi.co.id'
                const date = new Date()
                const dateNow = date.toLocaleDateString()+' '+date.toLocaleTimeString()
    
                for (let i = 0; i < tujuan.length; i++) {
                    const delay = i * 1000
                    const x = tujuan[i]
                    const pesan = `Kepada: ${x.name}\n\n*APPLE2APPLE BARU ${dpm.project.toUpperCase()}*\nPekerjaan: ${dpm.code_rap}\nNumber: ${dpm.number}\nItem: ${dpm.name}\nJumlah: ${dpm.qty2} item\nLink: ${url}/dpm_control?number=${dpm.number}&id=${dpm.dpm_id}\nA.n: ${req.userName}\nCatatan: ${catatan}\n\n${dateNow}`
                    const Whatsapp = new WHATSAPP(x.hp, pesan)
                    setTimeout( () => {
                        Whatsapp.sendText().then(e => console.log(e)).catch(err => console.log(err))
                        // console.log(pesan)
                    }, delay)
                }
                res.send({status: 'success', message: 'Berhasil submit apple 2 apple'})
                req.io.emit('update-dpm', {number: dpm.number, dpmId: dpm.dpm_id})
            } else {
                res.send({status: 'failed', message: 'error input db', data: update.result})
            }

        } else {
            res.send({status: 'failed', message: 'error input db', data: update.result})
        }
    } else {
        res.send({status: 'failed', message: 'Wrong parameters'})
    }
}

//API update apple
const updateApple = async (req, res) => {
    const userId = req.userId
    let {appleId, supl1, payment1, note1, price1, supl2, payment2, note2, price2, supl3, payment3, note3, price3, catatan} = req.body
    supl1 = supl1.split('|')[0]
    supl2 = supl2.split('|')[0]
    supl3 = supl3.split('|')[0]
    const appleData = await Apple.getAppleByAppleId(appleId)

    if ( (appleData.status == 0 && appleData.dir_acc == null) || (appleData.status == 1 && appleData.dir_acc == null) || (appleData.status == 10 && appleData.dir_acc == null) ||
         (appleData.status == 0 && appleData.dir_acc == 0) || (appleData.status == 1 && appleData.dir_acc == 0) || (appleData.status == 10 && appleData.dir_acc == 0) ) {

        const update = await Apple.updateApple(userId, 10, supl1, price1, payment1, note1, supl2, price2, payment2, note2, supl3, price3, payment3, note3, catatan, appleId)
        if (update.affectedRows === 1) {

            const url = 'https://dpm.rgsinergi.co.id'
            const date = new Date()
            const dateNow = date.toLocaleDateString()+' '+date.toLocaleTimeString()

            const dpm = await Apple.getAppleByAppleId(appleId)
            const tujuan = await Project.penugasanProjectLevel(dpm.project, ['cost controll'])

            for (let i = 0; i < tujuan.length; i++) {
                const delay = i * 1000
                const x = tujuan[i]
                const pesan = `Kepada: ${x.name}\n\n*APPLE2APPLE BARU ${dpm.project.toUpperCase()}*\nPekerjaan: ${dpm.code_rap}\nNumber: ${dpm.number}\nItem: ${dpm.name}\nJumlah: ${dpm.qty2} item\nLink: ${url}/dpm_control?number=${dpm.number}&id=${dpm.dpm_id}\nA.n: ${req.userName}\nCatatan: ${catatan}\n\n${dateNow}`
                const Whatsapp = new WHATSAPP(x.hp, pesan)
                setTimeout( () => {
                    Whatsapp.sendText()
                }, delay)
            }
            res.send({status: 'success'})
            req.io.emit('update-dpm', {number: dpm.number, dpmId: dpm.dpm_id})
        } else {
            res.send({status: 'failed', message: 'error input db', data: result})
        }
    } else {
        res.send({status: 'failed', message: 'Otorisasi gagal'})
    }
}

/**
 * APPROVAL APPLE
 */
const approvalApple = async (req, res) => {
    
    const {appleId, dpmId, supl, qty, comment, status} = req.body
    // console.log({appleId, dpmId, supl, qty, comment, status})
    
    const user = await Admin.adminData(req.userId)
    const apple = await Apple.getAppleByAppleId(appleId)
    // console.log(apple)

    if (user.level == 'cost controll') {
        var appleStatus = 1
    } else {
        var appleStatus = 3
    }

    if (appleId && qty && comment && status == 1) {
        if ((user.level == 'cost controll') && (apple.status == 10 || apple.status == 0)) {
            const updateDpmQty = await Dpm.updateQty('qty2',qty,3,dpmId)
            if (updateDpmQty.affectedRows == 1) {
                const approveApple = await Apple.approveApple(req.userId, supl, comment, appleStatus, appleId)
                await sendWa(req, appleId, supl, apple.project, qty, comment, ['director'], 'APPROVE')
                return res.send({status: 'success', data: approveApple})
            }
        } else if ((user.level == 'cost controll') && apple.status != 10) {
            return res.send({status: 'failed', message: 'otorisasi gagal'})
        } else if (user.level == 'director' || user.level == 'admin') {
            const updateDpmQty = await Dpm.updateQty('qty3',qty,4,dpmId)
            if (updateDpmQty.affectedRows == 1) {
                const approveApple = await Apple.approveApple(req.userId, supl, comment, appleStatus, appleId)
                await sendWa(req, appleId, supl, apple.project, qty, comment, ['cost controll','purchasing','po','director'], 'APPROVE')
                return res.send({status: 'success', data: approveApple})
            }
        }
    } else if (appleId && qty && comment && status == 0) {
        if (user.level == 'cost controll' && apple.status == 4) {
            return res.send({status: 'failed', message: 'otorisasi gagal'})
        } else if (user.level == 'cost controll' && apple.status != 4) {
            const updateDpmQty = await Dpm.updateQty('qty2',qty,3,dpmId)
            if (updateDpmQty.affectedRows == 1) {
                const rejectApple =  await Apple.rejectApple(req.userId, comment, appleId)
                await sendWa(req, appleId, supl, apple.project, qty, comment, ['purchasing'], 'REJECT')
                return res.send({status: 'success', data: rejectApple})
            }
        } else if ((user.level == 'director' || user.level == 'admin') && apple.status == 4) {
            // console.log('here')
            // return res.send({status: 'failed', message: 'otorisasi gagal'})
            const updateDpmQty = await Dpm.updateQty('qty3',qty,0,dpmId)
            if (updateDpmQty.affectedRows == 1) {
                const rejectApple =  await Apple.rejectApple(req.userId, comment, appleId)
                await sendWa(req, appleId, supl, apple.project, qty, comment, ['cost controll','purchasing','po'], 'REJECT')
                return res.send({status: 'success', data: rejectApple})
            }
        } else if ((user.level == 'director' || user.level == 'admin') && apple.status != 4) {
            const updateDpmQty = await Dpm.updateQty('qty3',qty,3,dpmId)
            if (updateDpmQty.affectedRows == 1) {
                const rejectApple =  await Apple.rejectApple(req.userId, comment, appleId)
                await sendWa(req, appleId, supl, apple.project, qty, comment, ['cost controll','purchasing','po'], 'REJECT')
                return res.send({status: 'success', data: rejectApple})
            }
        }
    }

    res.send({status: 'failed', message: 'otorisasi gagal'})
}

async function sendWa(req, appleId, supl, project, qty, comment, levelTujuan, statusNotif) {
    const url = 'https://dpm.rgsinergi.co.id'
    const date = new Date()
    const dateNow = date.toLocaleDateString()+' '+date.toLocaleTimeString()

    const dpm = await Apple.getAppleByAppleId(appleId)
    const supplier = await Supplier.getSupplierData(supl)
    const tujuan = await Project.penugasanProjectLevel(project, levelTujuan)

    for (let i = 0; i < tujuan.length; i++) {
        const x = tujuan[i]
        const pesan = `Kepada: ${x.name}\n\n*APPLE2APPLE ${statusNotif} ${dpm.project.toUpperCase()}*\nPekerjaan: ${dpm.code_rap}\nNumber: ${dpm.number}\nItem: ${dpm.name}\nJumlah: ${qty} ${dpm.unit}\nLink: ${url}/dpm_control?number=${dpm.number}&id=${dpm.dpm_id}\nSupplier: ${supplier.name}\nComment: ${comment}\nA.n: ${req.userName}\n\n${dateNow}\n\n`

        const Whatsapp = new WHATSAPP(x.hp, pesan)
        setTimeout(() => {
            Whatsapp.sendText().then(e => console.log(e)).catch(err => console.log(err))
            // console.log(pesan)
        }, i * 2000)
    }
}

module.exports = {
    dpmApple, applePengajuan, applePengajuanCostControll, appleRevisi, appleApprove, submitApple, approvalApple, updateApple
}
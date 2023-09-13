'use strict'

const db = require('./DbConn')
const C_project = require('../class/C_project')
const C_spk = require('../class/C_spk')
const C_mandor = require('../class/C_mandor')

let data = {
    title: 'DPM',
    pageTitle: 'DPM',
    pageTitleDesc: 'DPM'
}

/*
const spkControl = async (req, res) => {
    const project = req.query.project
    const spk_nomor = req.query.spk_nomor
    const p = new C_project()
    const s = new C_spk()
    const Mandor = new C_mandor()
    data.pageTitle = 'SPK'
    data.pageTitleDesc = 'Surat Perintah Kerja'
    data.userId = req.userId
    data.userName = req.userName
    data.userLevel = req.userLevel
    data.userPicture = req.userPicture
    if (project && !spk_nomor) {
        const spk = await s.getSpkByProject(project)
        data.pageTitleDesc = 'Surat Perintah Kerja '+ project
        data.spk = []
        let totalNilaiSpk = 0
        let spkProgress = 0
        for (let i = 0; i < spk.length; i++) {

            const project = await p.dataByProject(spk[i].spk_project_id)
            const dataSpk = await s.getSpkByNomor(spk[i].spk_nomor)
            const mandor = await Mandor.byId(spk[i].spk_mandor_id)

            let terbayar = 0
            for (let i = 0; i < dataSpk.length; i++) {
                terbayar += dataSpk[i].spk_progress
            }

            totalNilaiSpk += spk[i].spk_nilai
            spkProgress += terbayar

            data.spk.push({
                id: spk[i].spk_transaksi_id,
                project: project.name,
                mandor: mandor.mandor_nama,
                spk_nomor: spk[i].spk_nomor,
                pekerjaan: spk[i].spk_jenis_pekerjaan,
                nilai: spk[i].spk_nilai,
                terbayar: terbayar,
            })
        }
        data.totalNilaiSpk = totalNilaiSpk
        data.spkProgress = spkProgress
        res.render('spk/by_project', data)
    } else if (project && spk_nomor) {
        data.pageTitleDesc = 'Surat Perintah Kerja '+ project
        data.spk = await s.getSpkByNomor(spk_nomor)
        res.render('spk/detail_pembayaran', data)
    } else {
        const project = await p.penugasan(req.userId)
        let array = []
        for (let i = 0; i < project.length; i++) {
            const spk = await s.getSpkByProject(project[i].project)
            array.push({
                idProject: project[i].idProject,
                project: project[i].project,
                description: project[i].description,
                totalSpk: spk.length
            })
        }
        data.project = array
        res.render('spk/spk_control', data)
    }
}
*/

const spkControl = async (req, res) => {
    const p = new C_project()
    const s = new C_spk()
    const Mandor = new C_mandor()
    
    data.pageTitle = 'SPK'
    data.pageTitleDesc = 'Surat Perintah Kerja'
    data.userId = req.userId
    data.userName = req.userName
    data.userLevel = req.userLevel
    data.userPicture = req.userPicture
    
    const {project, mandor_id, nomor_spk} = req.query

    const allowed = ['project manager', 'cost controll', 'director', 'payment', 'admin', 'po'] // List of allowed access by userLevel

    if (allowed.indexOf(req.userLevel) != -1) {
        if (project && !mandor_id && !nomor_spk) {
            //ubah judul halaman
            data.pageTitleDesc = 'Surat Perintah Kerja '+ project
            //kirim nilai project ke halaman
            data.project = project
            //panggil data spk by project (grouping per mandor id)
            const spkData = await s.getSpkByProject(project)
            //data spk
            const spkGroupBySpkNomor = await s.totalNilaiSpk(project)
            let totalNilaiSpk = 0
            for (let i = 0; i < spkGroupBySpkNomor.length; i++) {
                totalNilaiSpk += spkGroupBySpkNomor[i].spk_nilai
            }
            const spkTerbayarByProject = await s.totalNilaiTerbayarSpk(project)
            let totalNilaiProgress = 0
            for (let i = 0; i < spkTerbayarByProject.length; i++) {
                totalNilaiProgress += spkTerbayarByProject[i].spk_progress
            }
            data.totalNilaiSpk = totalNilaiSpk
            data.totalProgressSpk = totalNilaiProgress
            //tambahkan total spk permandor
            let spkArr = [];
            for (let i = 0; i < spkData.length; i++) {
                const spkMandor = await s.getSpkMandorByProject(project, spkData[i].spk_mandor_id)
                spkArr.push({
                    project: project,
                    mandor_nama: spkData[i].mandor_nama,
                    mandor_id: spkData[i].spk_mandor_id,
                    total_spk: spkMandor.length
                })
            }
            //reorder data spk sesuai abjad nama mandor
            spkArr.sort(function(a, b){
                if(a.mandor_nama < b.mandor_nama) { return -1; }
                if(a.mandor_nama > b.mandor_nama) { return 1; }
                return 0;
            })
            data.spk = spkArr;
            res.render('spk/by_project', data)
        } else if (project && mandor_id && !nomor_spk) {
            data.spk = await s.getSpkMandorByProject(project, mandor_id)
            data.project = project
            //res.send(data.spk);
            res.render('spk/by_mandor', data);
        } else if (project && mandor_id && nomor_spk) {
            data.pageTitleDesc = 'Surat Perintah Kerja '+ project
            data.spk = await s.getSpkByNomor(nomor_spk)
            res.render('spk/detail_pembayaran', data)
        } else {
            const project = await p.penugasan(req.userId)
            let array = []
            for (let i = 0; i < project.length; i++) {
                const spk = await s.getSpkByProject(project[i].project)
                array.push({
                    idProject: project[i].idProject,
                    project: project[i].project,
                    description: project[i].description,
                    totalSpk: spk.length
                })
            }
            data.project = array
            res.render('spk/spk_control', data)
        }
    } else {
        res.redirect('/')
    }

}

const updateSpkNilai = async (req, res) => {
    const allowed = ['cost controll', 'director', 'payment', 'admin'] // List of allowed access by userLevel
    if (allowed.indexOf(req.userLevel) != -1) {
        const {spkNo, newVal, newJenis} = req.body;
        const spk = new C_spk();
        const update = await spk.updateNilaiSpk(spkNo, newVal, newJenis);
        if (update.affectedRows > 0) {
            return res.send({status: "success", message: "Success update data"});
        }
        res.send({status: "failed", message: "error body"});
    } else {
        res.send({status: "failed", message: "Not Allowed"});
    }
}

const checkSpk = async (req, res) => {
    const {spkNomor} = req.body
    const Spk = new C_spk()
    const data = await Spk.getSpkByNomor(spkNomor)
    res.send(data)
}

const submitSpk = async (req, res) => {
    const allowed = ['cost controll', 'director', 'payment', 'admin'] // List of allowed access by userLevel
    if (allowed.indexOf(req.userLevel) != -1) {
        const { spkNomor, project, mandor, jenisPekerjaan, nilai, pembayaran, catatan } = req.body
        // console.log(req.body)
        // return res.send({status: 'failed', message: 'Berhasil input data', data: { spkNomor, project, mandor, jenisPekerjaan, nilai, pembayaran, catatan }})
        const Project = new C_project()
        const projectData = await Project.dataByProject(project)
        const Spk = new C_spk()
        const insertData = await Spk.insertSpk(projectData.id, mandor, spkNomor, jenisPekerjaan, nilai, catatan, pembayaran)
        // (id, mandor, spkNomor, jenisPekerjaan, nilai, pembayaran, tanggalBayar, catatan)
        if (insertData.affectedRows == 1) {
            return res.send({status: 'success', message: 'Berhasil input data', project, mandor, spkNomor})
        }
        res.send({status: 'failed', message: 'Gagal input database'})
    } else {
        res.send({status: "failed", message: "Not Allowed"});
    }
}

const spkById = async (req, res) => {
    const {id} = req.body
    const Spk = new C_spk()
    const dataSpk = await Spk.byId(id)
    if (dataSpk.length == 1) {
        return res.send({status: 'success', data: dataSpk[0]})
    }
    res.send({status: 'failed', message: 'Data tidak ditemukan'})

}

const updateSpkTransaksi = async (req, res) => {
    const allowed = ['cost controll', 'director', 'payment', 'admin'] // List of allowed access by userLevel
    if (allowed.indexOf(req.userLevel) != -1) {
        const {id, pembayaran, catatan, tanggalBayar} = req.body
        const Spk = new C_spk()
        const updateSpk = await Spk.updateById(id, pembayaran, catatan, tanggalBayar)
        if (updateSpk.affectedRows == 1) {
            return res.send({status: 'success', message: 'Berhasil update data'})
        }
        res.send({status: 'success', message: 'Gagal update database'})
    } else {
        res.send({status: "failed", message: "Not Allowed"});
    }
}

const deleteSpkTransaksi = async (req, res) => {
    const allowed = ['cost controll', 'director', 'payment', 'admin'] // List of allowed access by userLevel
    if (allowed.indexOf(req.userLevel) != -1) {
        const {id} = req.body
        const SPK = new C_spk()
        const deleteSpk = await SPK.deleteSpkTransaksi(id)
        if (deleteSpk.affectedRows == 1) {
            return res.send({status: 'success', message: 'Berhasil hapus data'})
        }
        return res.send({status: 'failed', message: 'Gagal'})
    } else {
        res.send({status: "failed", message: "Not Allowed"});
    }
}

const tambahSpkTransaksi = async (req, res) => {
    const allowed = ['cost controll', 'director', 'payment', 'admin'] // List of allowed access by userLevel
    if (allowed.indexOf(req.userLevel) != -1) {
        const {spkNomor, pembayaran, tanggalBayar, catatan} = req.body
        const Spk = new C_spk()
        const data = await Spk.getSpkByNomor(spkNomor)
        // console.log({spkNomor, pembayaran, tanggalBayar, catatan})
        // console.log({
        //     spk_project_id: data[0].spk_project_id,
        //     spk_mandor_id: data[0].spk_mandor_id,
        //     spkNomor,
        //     spk_jenis_pekerjaan: data[0].spk_jenis_pekerjaan,
        //     spk_nilai: data[0].spk_nilai,
        //     pembayaran,
        //     tanggalBayar,
        //     catatan
        // })
        const insertData = await Spk.insertSpk(data[0].spk_project_id, data[0].spk_mandor_id, spkNomor, data[0].spk_jenis_pekerjaan, data[0].spk_nilai, catatan, pembayaran, tanggalBayar)
        // console.log(insertData)
        // return res.send({status: 'failed', message: 'Debugging'})
        if (insertData.affectedRows == 1) {
            return res.send({status: 'success', message: 'Berhasil input data'})
        }
        res.send({status: 'failed', message: 'Gagal input database'})
    } else {
        res.send({status: "failed", message: "Not Allowed"});
    }
}

const updateVerifikasi = async (req, res) => {
    const {id, verValue} = req.body
    const Spk = new C_spk()
    const update = await Spk.setVerification(verValue, id)
    if (update.affectedRows == 1) {
        return res.send({status: 'success', message: 'success update'})
    }
    res.send({status: 'failed', message: 'failed update'})
}

module.exports = {
    spkControl, checkSpk, submitSpk, updateSpkNilai, spkById, updateSpkTransaksi, deleteSpkTransaksi, tambahSpkTransaksi, updateVerifikasi
}
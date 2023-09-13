'use strict'

const db = require('./DbConn')
let data = {
    title: 'DPM',
    pageTitle: 'DPM',
    pageTitleDesc: 'DPM'
}

const pengajuan = (req, res) => {
    data.pageTitle = 'SPK'
    data.pageTitleDesc = 'Surat Perintah Kerja'
    data.userId = req.userId
    data.userName = req.userName
    data.userLevel = req.userLevel
    data.userPicture = req.userPicture
    res.render('spk/pengajuan', data)
}

const pengajuanNew = (req, res) => {
    data.pageTitle = 'SPK'
    data.pageTitleDesc = 'Surat Perintah Kerja'
    data.userId = req.userId
    data.userName = req.userName
    data.userLevel = req.userLevel
    data.userPicture = req.userPicture
    res.render('spk/pengajuan_new', data)
}

module.exports = {
    pengajuan, pengajuanNew
}
'use strict'

const C_mandor = require('../class/C_mandor')
const C_supplier = require('../class/C_supplier')

let data = {
    title: 'DPM',
    pageTitle: 'DPM',
    pageTitleDesc: 'DPM'
}

const mandor = async (req, res) => {

    const cari = req.query.cari
    const detil = req.query.detil

    const Mandor = new C_mandor()
    
    data.pageTitle = 'SPK'
    data.pageTitleDesc = 'Surat Perintah Kerja'
    data.userId = req.userId
    data.userName = req.userName
    data.userLevel = req.userLevel
    data.userPicture = req.userPicture
    
    if (cari) {
        data.mandor = await Mandor.cari(cari)
        res.render('rekanan/daftar_mandor', data)
    } else if (detil) {
        data.mandor = await Mandor.byId(detil)
        res.render('rekanan/detil_mandor', data)
    } else {
        data.mandor = await Mandor.mandorActive()
        res.render('rekanan/daftar_mandor', data)
    }
}

const apiMandorActive = async (req, res) => {
    const Mandor = new C_mandor()
    const mandor = await Mandor.mandorActive()
    res.send(mandor)
}

const mandorUpdate = async (req, res) => {
    const level = req.userLevel
    if (level == 'cost controll' || level == 'director' || level == 'admin') {
        const {nama, hp, alamat, id, defaultHp} = req.body

        if (nama && hp && alamat && id) {
            const Mandor = new C_mandor()
            const hpUpdate = hp.substring(0,1) == 0 ? '62'+hp.substring(1, hp.length) : hp
            const check = await Mandor.checkHpMandor(hpUpdate)
            if (defaultHp == hp) {
                const update = await Mandor.update(nama, hpUpdate, alamat, id)
                if (update.affectedRows == 1) {
                    res.send({status: 'success', message: 'Success update data'})
                } else {
                    res.send({status: 'failed', message: 'error db'})
                }
            } else {
                if (check.length == 0) {
                    const update = await Mandor.update(nama, hpUpdate, alamat, id)
                    if (update.affectedRows == 1) {
                        res.send({status: 'success', message: 'Success update data'})
                    } else {
                        res.send({status: 'failed', message: 'error db'})
                    }
                } else {
                    res.send({status: 'failed', message: 'Nomor hp mandor sudah terdaftar dengan nama '+check[0].mandor_nama})
                }
            }
        } else {
            res.send({status: 'failed', message: 'error body'})
        }

    } else {
        res.send({status: 'failed', message: 'otorisasi tidak diijinkan'})
    }
}

const addData = async (req, res) => {
    const level = req.userLevel
    if (level == 'cost controll' || level == 'director' || level == 'admin') {
        const {mandor_name, mandor_hp, mandor_alamat} = req.body
        if (mandor_name && mandor_hp && mandor_alamat) {
            const Mandor = new C_mandor()
            const hpUpdate = mandor_hp.substring(0,1) == 0 ? '62'+mandor_hp.substring(1, mandor_hp.length) : mandor_hp
            const check = await Mandor.checkHpMandor(hpUpdate)
            if (check.length == 0) {
                const insert = await Mandor.insertData(mandor_name, mandor_hp, mandor_alamat)
                if (insert.affectedRows == 1) {
                    res.send({status: 'success', message: 'Berhasil input data', id: insert.insertId})
                } else {
                    res.send({status: 'failed', message: 'gagal update db'})
                }
            } else {
                res.send({status: 'failed', message: 'Nomor hp mandor sudah terdaftar dengan nama '+check[0].mandor_nama})
            }
        } else {
            res.send({status: 'failed', message: 'error body'})
        }
    } else {
        res.send({status: 'failed', message: 'otorisasi tidak diijinkan'})
    }
}

const supplier = async (req, res) => {
    const cari = req.query.cari
    const detil = req.query.detil

    const Supplier = new C_supplier()
    
    data.pageTitle = 'SPK'
    data.pageTitleDesc = 'Surat Perintah Kerja'
    data.userId = req.userId
    data.userName = req.userName
    data.userLevel = req.userLevel
    data.userPicture = req.userPicture
    
    if (cari) {
        data.supplier = await Supplier.cari(cari)
        res.render('rekanan/daftar_supplier', data)
    } else if (detil) {
        data.supplier = await Supplier.getSupplierDetail(detil)
        res.render('rekanan/detil_supplier', data)
    } else {
        data.supplier = await Supplier.allSupplier()
        res.render('rekanan/daftar_supplier', data)
    }
}

const supplierUpdate = async(req, res) => {
    const level = req.userLevel
    if (level == 'purchasing' || level == 'po' || level == 'logistic' || level == 'director' || level == 'admin') {
        const {id, nama, pic, hp, bank, an, account, sales1, sales2, salesphone1, salesphone2, product1, price1, product2, price2, product3, price3, note, alamat} = req.body
        if (id && nama && pic && hp && alamat) {
            const hpUpdate = hp.substring(0,1) == 0 ? '62'+hp.substring(1, hp.length) : hp
            const phone1 = salesphone1.substring(0,1) == 0 ? '62'+salesphone1.substring(1, salesphone1.length) : salesphone1
            const phone2 = salesphone2.substring(0,1) == 0 ? '62'+salesphone2.substring(1, salesphone2.length) : salesphone2
            const Supplier = new C_supplier()
            const update = await Supplier.updateSupplier(id, nama, pic, hpUpdate, bank, account, an, alamat, sales1, phone1, sales2, phone2, product1, price1, product2, price2, product3, price3, note)
            if (update.affectedRows == 1) {
                res.send({status: 'success', message: 'success update supplier '+nama})
            } else {
                res.send({status: 'failed', message: 'error update db'})
            }
            /*
            const check = await Supplier.checkPhone(hpUpdate)
            if (check.length == 0) {
            } else {
                res.send({status: 'failed', message: 'Nomor sudah terdaftar dengan nama '+check[0].name})
            }
            */
        } else {
            res.send({status: 'failed', message: 'Minimal form nama, pic, hp dan alamat harus diisi'})
        }
    } else {
        res.send({status: 'failed', message: 'Otorisasi tidak diijinkan'})
    }
}

const supplierAddData = async (req, res) => {
    const level = req.userLevel
    if (level == 'purchasing' || level == 'po' || level == 'logistic' || level == 'director' || level == 'admin') {
        const {nama, pic, alamat, hp} = req.body
        if (nama && pic && alamat && hp) {
            const hpUpdate = hp.substring(0,1) == 0 ? '62'+hp.substring(1, hp.length) : hp
            const Supplier = new C_supplier()
            const check = await Supplier.checkPhone(hpUpdate)
            if (check.length == 0) {
                const insert = await Supplier.insertData(nama, pic, alamat, hpUpdate)
                if (insert.affectedRows == 1) {
                    res.send({status: 'failed', message: 'Berhasil tambah data', id: insert.insertId})
                } else {
                    res.send({status: 'failed', message: 'Error insert db'})
                }
            } else {
                res.send({status: 'failed', message: 'Nomor sudah terdaftar dengan nama '+check[0].name})
            }
        } else {
            res.send({status: 'failed', message: 'Check input'})
        }
    } else {
        res.send({status: 'failed', message: 'Otorisasi tidak diijinkan'})
    }
}

const search = async (req, res) => {
    const { search } = req.body
    const Mandor = new C_mandor()
    const dataSearch = await Mandor.cari(search)
    res.send(dataSearch)
}

module.exports = {
    mandor, mandorUpdate, addData, supplier, supplierUpdate, supplierAddData, apiMandorActive, search
}
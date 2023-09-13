'use strict'

const db = require('./DbConn')
const C_project = require('../class/C_project')
const p = new C_project()
const C_po = require('../class/C_po')
const po = new C_po()
const C_admin = require('../class/C_admin')
const admin = new C_admin()
const C_dpm = require('../class/C_dpm')
const Dpm = new C_dpm()
const C_item = require('../class/C_item')
const C_apple = require('../class/C_apple')
const apple = new C_apple()
const C_supplier = require('../class/C_supplier')
const sup = new C_supplier()
const Ver = require('../class/C_verification')
const ver = new Ver()
const WHATSAPP = require('../class/C_whatsapp')

let data = {
    title: 'DPM',
    pageTitle: 'PO',
    pageTitleDesc: 'Purchase Orders'
}

const control = async (req, res) => {
    const userId = req.userId
    const project = req.query.project
    const search = req.query.search
    const poNumber = req.query.po_number
    data.userName = req.userName
    data.userLevel = req.userLevel
    data.userPicture = req.userPicture
    data.project = project
    if (project && !poNumber && !search) {
        //const url = req.protocol+'://'+req.headers.host+'/'+req.headers.referer+'?project='+project
        //console.log(url)
        data.totalNilaiPo = await po.totalNilaiPo(project)
        const dataPo = await po.byProject(project, 'approve', 50)
        const poArr = []
        for(let i = 0; i < dataPo.length; i++) {
            poArr.push({
                po_id: dataPo[i].po_id,
                dpm_id: dataPo[i].dpm_id,
                bod_approve: dataPo[i].bod_approve,
                suplId: dataPo[i].suplId,
                supplier: dataPo[i].name,
                po_item_update: dataPo[i].po_item_update,
                po_qty: dataPo[i].po_qty,
                po_price: dataPo[i].po_price,
                po_status: dataPo[i].po_status,
                po_number: dataPo[i].po_number,
                project: dataPo[i].project,
                items: await po.getItemPo(dataPo[i].po_number),
                pembayaran: await po.getPembayaranPo(dataPo[i].po_number)
            })
        }
        data.po = poArr
        res.render('po/by_project', data)
    } else if (project && poNumber && !search) {
        const dataPo = await po.allPoItem(project, poNumber)
        const dataDetail = await po.poByNumber(project, poNumber)
        if (dataPo.length > 0) {
            data.pageTitleDesc = project+', '+poNumber
            data.po = dataPo[0]
            data.poDetail = dataDetail
            data.qrcode = await po.getQrcode(poNumber)
            
            if ( data.qrcode ) {
                const user = await admin.adminData(data.qrcode.ver_id_updated)
                data.approval_name = user?.name || 'Menunggu TTD'
            } else {
                data.approval_name = 'Menunggu TTD'
            }
            res.render('po/detail_po', data)
        } else {
            const trex = require('../class/C_trex')
            const play = new trex(req, res)
            play.run()
        }
    } else if (project && search) {
        const number = await po.searchByNumber(project, search)
        const item = await po.searchByItem(project, search)
        const supplier = await po.searchBySupplier(project, search)
        const dataPo = number.concat(item).concat(supplier)
        data.totalNilaiPo = await po.totalNilaiPo(project)
        const poArr = []
        for(let i = 0; i < dataPo.length; i++) {
            poArr.push({
                po_id: dataPo[i].po_id,
                dpm_id: dataPo[i].dpm_id,
                bod_approve: dataPo[i].bod_approve,
                suplId: dataPo[i].suplId,
                supplier: dataPo[i].name,
                po_item_update: dataPo[i].po_item_update,
                po_qty: dataPo[i].po_qty,
                po_price: dataPo[i].po_price,
                po_status: dataPo[i].po_status,
                po_number: dataPo[i].po_number,
                project: dataPo[i].project,
                items: await po.getItemPo(dataPo[i].po_number),
                pembayaran: await po.getPembayaranPo(dataPo[i].po_number)
            })
        }
        data.po = poArr
        // test
        // console.log({project, search})
        // let sql = 'SELECT id FROM item WHERE name like ?'
        // await db.query(sql, [`${search}%`], async (err, result) => {
        //     if (err) console.log(err)
        //     let idItemInArray = []
        //     result.forEach(x => {
        //         idItemInArray = [...idItemInArray, x.id]
        //     })
        //     idItemInArray.length > 0 ?
        //     sql = `
        //     SELECT
        //         dpm.dpm_id, dpm.item, dpm.project, dpm.unit, item.name, bod_approve, po_number, po_qty, po_price, (po_qty * po_price) as subtotal, po_status, supplier.name as supl
        //     FROM dpm
        //         JOIN item ON item.id = dpm.item
        //         JOIN po_detail ON po_detail.dpm_id = dpm.dpm_id
        //         JOIN supplier ON supplier.id = po_detail.supl
        //     WHERE
        //         dpm.project = "Pertamina Sambu"
        //     AND dpm.item IN (?)
        //     AND po_detail.bod_approve = 3` : 
        //     sql = 'SELECT NULL'
        //     await db.query(sql, [idItemInArray], (err, result) => {
        //         if (err) console.log(err)
                // console.log(result)
        //         data.test = result
        //         res.render('po/by_project', data)
        //     })
        // })
        res.render('po/by_project', data)
    } else {
        data.title = 'PO',
        data.pageTitle = 'Purchase Orders',
        data.pageTitleDesc = 'Pilih project untuk melihat daftar PO'
        const daftarProject = await p.penugasan(userId)
        let arrayDataProject = []
        for (let i = 0; i < daftarProject.length; i ++) {
            const dataPo = await po.byProject(daftarProject[i].project, 'approve')
            arrayDataProject.push({
                id: daftarProject[i].id,
                project: daftarProject[i].project,
                description: daftarProject[i].description,
                po: dataPo.length
            })
        }
        data.project = arrayDataProject
        res.render('po/po_control', data)
    }
}

const pengajuan = async (req, res) => {
    const userId = req.userId
    const project = req.query.project
    data.project = project
    data.userName = req.userName
    data.userLevel = req.userLevel
    data.userPicture = req.userPicture
    data.pageTitleDesc = 'Pilih project untuk melihat daftar PO'
    if (project) {
        const dataPo = await po.byProject(project, 'pengajuan')
        const poArr = []
        for(let i = 0; i < dataPo.length; i++) {
            poArr.push({
                po_id: dataPo[i].po_id,
                dpm_id: dataPo[i].dpm_id,
                bod_approve: dataPo[i].bod_approve,
                suplId: dataPo[i].suplId,
                supplier: dataPo[i].name,
                po_item_update: dataPo[i].po_item_update,
                po_qty: dataPo[i].po_qty,
                po_price: dataPo[i].po_price,
                po_status: dataPo[i].po_status,
                po_number: dataPo[i].po_number,
                project: dataPo[i].project,
                items: await po.getItemPo(dataPo[i].po_number),
                pembayaran: await po.getPembayaranPo(dataPo[i].po_number)
            })
        }
        data.po = poArr
        data.totalNilaiPo = await po.totalNilaiPo(project)
        res.render('po/by_project', data)
    } else {
        const daftarProject = await p.penugasan(userId)
        let arrayDataProject = []
        for (let i = 0; i < daftarProject.length; i ++) {
            const dataPo = await po.byProject(daftarProject[i].project, 'pengajuan')
            arrayDataProject.push({
                id: daftarProject[i].id,
                project: daftarProject[i].project,
                description: daftarProject[i].description,
                po: await dataPo.length
            })
        }
        data.project = arrayDataProject
        res.render('po/po_pengajuan', data)
    }
}

const revisi = async (req, res) => {
    const userId = req.userId
    const project = req.query.project
    data.project = project
    data.userName = req.userName
    data.userLevel = req.userLevel
    data.userPicture = req.userPicture
    if (project) {
        data.pageTitleDesc = 'Daftar PO berstatus REVISI'
        const dataPo = await po.byProject(project, 'revisi')
        const poArr = []
        for(let i = 0; i < dataPo.length; i++) {
            poArr.push({
                po_id: dataPo[i].po_id,
                dpm_id: dataPo[i].dpm_id,
                bod_approve: dataPo[i].bod_approve,
                suplId: dataPo[i].suplId,
                supplier: dataPo[i].name,
                po_item_update: dataPo[i].po_item_update,
                po_qty: dataPo[i].po_qty,
                po_price: dataPo[i].po_price,
                po_status: dataPo[i].po_status,
                po_number: dataPo[i].po_number,
                project: dataPo[i].project,
                items: await po.getItemPo(dataPo[i].po_number),
                pembayaran: await po.getPembayaranPo(dataPo[i].po_number)
            })
        }
        data.po = poArr
        data.totalNilaiPo = await po.totalNilaiPo(project)
        res.render('po/by_project', data)
    } else {
        data.pageTitleDesc = 'Pilih project untuk melihat daftar PO'
        const daftarProject = await p.penugasan(userId)
        let arrayDataProject = []
        for (let i = 0; i < daftarProject.length; i ++) {
            const dataPo = await po.byProject(daftarProject[i].project, 'revisi')
            arrayDataProject.push({
                id: daftarProject[i].id,
                project: daftarProject[i].project,
                description: daftarProject[i].description,
                po: await dataPo.length
            })
        }
        data.project = arrayDataProject
        res.render('po/po_revisi', data)
    }
}

const poNew = async (req, res) => {
    const userId = req.userId
    const project = req.query.project
    data.title = 'PO',
    data.pageTitle = 'New Purchase Orders',
    data.pageTitleDesc = 'Pilih project untuk melihat daftar item untuk PO baru'
    data.userName = req.userName
    data.userLevel = req.userLevel
    data.userPicture = req.userPicture
    if (project) {
        data.dpm = await po.daftarItemUntukPo(project)
        data.supplier = await sup.supplierActive()
        res.render('po/po_new_post', data)
    } else {
        const daftarProject = await p.penugasan(userId)
        let arrayDataProject = []
        for (let i = 0; i < daftarProject.length; i ++) {
            const itemCount = await po.daftarItemUntukPo(daftarProject[i].project)
            arrayDataProject.push({
                id: daftarProject[i].id,
                project: daftarProject[i].project,
                description: daftarProject[i].description,
                dpm: itemCount.length
            })
        }
        data.project = arrayDataProject
        res.render('po/po_new', data)
    }
}

const poNewSubmit = async (req, res) => {
    const userId = req.userId
    const {poNumber, payment, penerima, alamat, catatan, jadwal, syarat, itemPo, tanggal, supl} = req.body //kurang po_number dan po_status
    const checkPoNumber = await po.getItemPo(poNumber)
    let array = []
    if (checkPoNumber.length > 0) {
        return res.send({status: 'failed', message: 'Nomor '+poNumber+' sudah terpakai', project: checkPoNumber[0].project})
    }
    for(let i = 0; i < itemPo.length; i++) {
        const x = itemPo[i]
        const dpm_id = x.dpmId
        const po_item_update = x.note
        const po_qty = x.qty
        const po_price = x.price
        const po_status = x.poAnak
        const bod_approve = 1
        const project = x.project
        const po_number = poNumber
        const pembuatPo = userId
        array.push([dpm_id, po_item_update, po_qty, po_price, po_status, bod_approve, project, po_number, supl, payment, penerima, alamat, catatan, jadwal, syarat, tanggal, pembuatPo])
    }
    // console.log({poNumber, payment, penerima, alamat, catatan, jadwal, syarat, itemPo, tanggal, supl})
    // console.log(checkPoNumber)
    // console.log(array)
    // return res.send({status: 'failed', message: 'Debugging'})
    //insert data ke table po_detail
    const insert = await po.insertPoDetail(array)
    // console.log(insert)

    
    if (insert.affectedRows > 0) {
        //ubah nilai status apple sesuai dengan data saat submit po_detail
        for(let i = 0; i < itemPo.length; i++) {
            const x = itemPo[i]
            if (x.poAnak == 0) {
                var status = 4
            } else {
                var status = 4
            }
            //belum buat log jika error !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            const updateApple = await po.updateAppleStatus(status, x.dpmId)
            // console.log(updateApple)
        }
        res.send({status: 'success', message: 'Berhasil submit PO', project: itemPo[0].project})
    } else {
        return res.send({status: 'failed', message: 'Gagal insert database PO'})
    }
}

const poApproval = async (req, res) => {
    const {status, note, number, project, supplier} = req.body
    // console.log(status)
    // return res.send({status: 'failed', message: 'Wrong parameters'})
    if (status && note && number && project) {
        // Dpm
        const dataPo = await  po.poByNumber(project, number)
        // console.log(dataPo)
        let arr = []
        dataPo.forEach( x => {
            arr.push(x.dpm_id)
        })
        const hoStatus = status == 3 ? 5 : 4
        const update = await Dpm.updateDpmStatusByPoApprove(arr, hoStatus)
        if (update.affectedRows > 0) {
            const approval = await po.approval(status, note, number)
            const url = 'https://dpm.rgsinergi.co.id'
            const date = new Date()
            const dateNow = date.toLocaleDateString()+' '+date.toLocaleTimeString()
            const tujuan = await p.penugasanProjectLevel(project, ['purchasing','cost controll','director','po','payment','logistic','admin'])
            const arrayStatus = ['error','Pengajuan','Revisi','Approve']
            for(let i = 0; i < tujuan.length; i++) {
                const x = tujuan[i]
                const pesan = `Kepada: ${x.name}\n\n*PURCHASE ORDER - ${arrayStatus[status]}\nProject: ${project}*\nNumber: ${number}\nSupplier: ${supplier}\nLink: ${url}/purchase_orders?project=${encodeURIComponent(project.toUpperCase())}&po_number=${number}\nA.n: ${req.userName}\nPesan: ${note}\n\n${dateNow}`
                const Whatsapp = new WHATSAPP(x.hp, pesan)
                setTimeout(()=>{
                    Whatsapp.sendText()
                    // console.log(pesan)
                }, i * 2000)
            }
            return res.send({status: 'success', message: 'Berhasil'})
        } else {
            return res.send({status: 'failed', message: 'error update dpm ho status ke PO'})
        }
    }
    res.send({status: 'failed', message: 'Wrong parameters'})
}

const update = async (req, res) => {

    const project = req.query.project
    const poNumber = req.query.po_number

    if (project && poNumber) {
        const dataPo = await po.allPoItem(project, poNumber)
        if (dataPo.length > 0) {
            const check = await po.allPoItem(project, poNumber)
            if ((check[0].bod_approve == 2 && req.userLevel == 'po') || (req.userLevel == 'director' || req.userLevel == 'admin')) {
                data.userName = req.userName
                data.userLevel = req.userLevel
                data.userPicture = req.userPicture
                data.title = 'PO',
                data.pageTitle = 'Purchase Orders',
                data.pageTitleDesc = project+', '+poNumber
                data.po = dataPo[0]
                data.poDetail = dataPo
                data.supplier = await sup.supplierActive()
                data.qrcode = await po.getQrcode(poNumber)
                res.render('po/detail_po_update', data)
            } else {
                const trex = require('../class/C_trex')
                const play = new trex(req, res)
                play.run()
            }
        } else {
            const trex = require('../class/C_trex')
            const play = new trex(req, res)
            play.run()
        }
    } else {
        const trex = require('../class/C_trex')
        const play = new trex(req, res)
        play.run()
    }
}

// UPDATE ketersediaan apple untuk PO
async function updateStatusKetersediaanApple(req, res) {
    // console.log(req.hostname)
    const { status, dpmId } = req.body
    const update = await apple.updateStatusApple(dpmId, status)
    // console.log(update)
    if (update.affectedRows == 1) {
        res.send({ status: 'success', message: status == 3 ? 'Item tersedia untuk PO selanjutnya' : 'Item Tidak tersedia untuk PO selanjutnya'})
    } else {
        res.send({ status: 'failed', message: 'Something error on server'})
    }
}

const updateSatuanPo = async (req, res) => {
    const {detail, jumlah, unit, harga, po_id, dpm_id} = req.body
    const result = await po.updatePoDetailSatuan(detail, jumlah, unit, harga, po_id, dpm_id)
    // console.log(result)
    if (result.affectedRows === 1) {
        return res.status(200).json({status: 'success', message: 'success update data'})
    }
    res.status(200).json({status: 'failed', message: 'failed update data, silahkan kirim link halaman ini ke admin'})
}

const updateStatusItemPo = async (req, res) => {
    const {status, po_id} = req.body
    const update = await po.updateStatusItemPo(status, po_id)
    if (update.affectedRows == 1) {
        return res.send({status: 'success', message: status == 1 ? 'Item di keluarkan dari PO' : 'Item dimasukkan ke dalam PO'})
    }
    res.send({status: 'failed', message: 'Gagal input ke dalam database'})
}

const updatePost = async (req, res) => {
    const array = req.body
    let affectedRows = 0
    for (let i = 0; i < array.length; i++) {
        const data = [array[i].status, array[i].payment, array[i].jadwal, array[i].alamat, array[i].penerima, array[i].syarat, array[i].catatan, array[i].tanggal, array[i].supplier, array[i].id]
        const update = await po.updatePoDetail(data)
        if (update.affectedRows == 1) {
            affectedRows += 1
        }
    }
    if (req.body.length == affectedRows) {
        return res.send({status: 'success', message: 'success update database'})
    }
    res.send({status: 'failed', message: 'error on submit update po'})
}

const print = async (req, res) => {

    const project = req.query.project
    const poNumber = req.query.po_number
    const kop = req.query.kop
    
    if (project && poNumber) {
        const dataPo = await po.poByNumber(project, poNumber)
        // console.log(dataPo)
        if (dataPo.length > 0) {
            const PO = dataPo[0]
            const DETAIL = dataPo
            const QRCODE = await po.getQrcode(poNumber)
            
            if ( QRCODE ) {
                if ( QRCODE.ver_status == 2 ) {
                    const user = await admin.adminData(QRCODE.ver_id_updated)
                    var approval_name = user?.name
                    var tanggal_po = 'Jakarta, '+new Date(QRCODE.ver_updated).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
                } else {
                    var approval_name = 'Menunggu TTD'
                    var tanggal_po = 'Jakarta, '+new Date(PO.created).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
                }
            } else {
                var approval_name = 'Menunggu TTD'
                var tanggal_po = 'Jakarta, '+new Date(PO.created).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
            }

            if (kop) {
                var kopSurat = {
                    style: 'noBorder',
                    table: {
                        widths: [100, '*'],
                        body: [
                            [
                                {
                                    image: './public/assets/images/icon_rgs.png',
                                    width: 100, height: 100,
                                    border: [false, false, false, false]
                                },
                                {text: 'PT. REKATAMA GLOBAL SINERGI', alignment: 'center', fontSize: 24, bold: true, border: [false, false, false, false], marginTop: 30}
                            ],
                        ]
                    }
                }
            } else {
                var kopSurat = {text: '', marginTop: 30}
            }

            if (QRCODE) {
                if ( QRCODE.ver_status == 2 ) {
                    var qrCode = {qr: 'https://dpm.rgsinergi.co.id/verification?type='+QRCODE.ver_type+'&number='+QRCODE.ver_number+'&key='+QRCODE.ver_key, fit: '120', alignment: 'center'}
                } else {
                    var qrCode = {text: '', marginTop: 60}
                }
            } else {
                var qrCode = {text: '', marginTop: 60}
            }

            // Define font files
            var fonts = {
                Roboto: {
                    normal: './public/assets/fonts/Roboto/Roboto-Regular.ttf',
                    bold: './public/assets/fonts/Roboto/Roboto-Medium.ttf',
                    italics: './public/assets/fonts/Roboto/Roboto-Italic.ttf',
                    bolditalics: './public/assets/fonts/Roboto/Roboto-MediumItalic.ttf'
                },
            };
            var PdfPrinter = require('pdfmake');
            var printer = new PdfPrinter(fonts);
            
            var docDefinition = {
                pageSize: 'A4',
                pageMargins: [ 40, 0, 20, 0 ],
                info: {
                    title: 'PO No: '+poNumber+' PT. REKATAMA GLOBAL SINERGI',
                    author: 'Tofik Nuryanto as IT DEVELOPMENT',
                    subject: 'PO Number : '+poNumber,
                    keywords: 'pt. rekatama global sinergi, purchase order, tofik, tofik nuryanto, tofiknuryanto, ndalu.id, '+poNumber,
                },
                content: [
                    kopSurat,
                    {text: poNumber, bold: true, fontSize: 8, marginBottom: 4},
                    {text: 'Kepada :', fontSize: 8, marginBottom: 2},
                    {text: PO.name, marginLeft: 20,fontSize: 8, marginBottom: 2},
                    {text: PO.address.replace(/<br\s*\/?>/g, '\n'), marginLeft: 20, fontSize: 8, marginBottom: 2},
                    {text: 'UP : '+PO.pic, marginLeft: 20, fontSize: 8, marginBottom: 2},
                    {text: 'Telp : '+PO.phone+'\n\n', marginLeft: 20, fontSize: 8, marginBottom: 2},
                    {
                        style: 'detailItem',
                        table: {
                            widths: ['*'],
                            body: [
                                [{text: 'DETAIL ITEM', alignment: 'center'}],
                            ]
                        }
                    },
                    {
                        style: 'small',
                        table: {
                            widths: ['auto','auto','auto','auto','auto','auto','*','*'],
                            body: [
                                [
                                    {text: 'No', alignment: 'center'},
                                    {text: 'Project', alignment: 'center'},
                                    {text: 'Dpm Number', alignment: 'center'},
                                    {text: 'Item', alignment: 'center'},
                                    {text: 'Detil', alignment: 'center'},
                                    {text: 'Jumlah', alignment: 'center'},
                                    {text: 'Harga', alignment: 'center'},
                                    {text: 'Sub Total', alignment: 'center'}
                                ],
                            ]
                        }
                    },
                    {
                        style: 'noBorder',
                        layout: 'noBorders',
                        table: {
                            widths: [ 150, 'auto','*' ],
                            body: [
                                [
                                    {text: '1. Cara Pembayaran'},
                                    {text: ':', alignment: 'center'},
                                    {text: PO.payment},
                                ],
                                [
                                    {text: '2. Jadwal'},
                                    {text: ':', alignment: 'center'},
                                    {text: PO.jadwal},
                                ],
                                [
                                    {text: '3. Alamat'},
                                    {text: ':', alignment: 'center'},
                                    {text: PO.alamat},
                                ],
                                [
                                    {text: '4. Penerima Material'},
                                    {text: ':', alignment: 'center'},
                                    {text: PO.penerima},
                                ],
                                [
                                    {text: '5. Syarat penagihan harus melampirkan'},
                                    {text: ':', alignment: 'center'},
                                    {text: PO.syarat},
                                ],
                                [
                                    {text: '6. Catatan'},
                                    {text: ':', alignment: 'center'},
                                    {text: PO.catatan},
                                ],
                                [
                                    {text: '7. Pelunasan'},
                                    {text: ':', alignment: 'center'},
                                    {text: PO.bank},
                                ],
                                [
                                    {},
                                    {},
                                    {text: PO.account},
                                ],
                                [
                                    {},
                                    {},
                                    {text: PO.atas_nama},
                                ],
                            ]
                        }
                    },
                    {
                        style: 'noBorder',
                        layout: 'noBorders',
                        table: {
                            widths: ['*','*', '*'],
                            body: [
                                [
                                    // {text: 'Jakarta, '+dataPo[0].created.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }), alignment: 'center', fontSize: 8},
                                    {text: tanggal_po, alignment: 'center', fontSize: 8},
                                    {},
                                    {},
                                ],
                                [
                                    qrCode,
                                    {},
                                    {text: 'Disetujui oleh,', alignment: 'center', fontSize: 8},
                                ],
                                [
                                    {text: approval_name, alignment: 'center'},
                                    {},
                                    {text: PO.pic, alignment: 'center', fontSize: 8},
                                ],
                            ]
                        }
                    }
                ],
                styles: {
                    small: {
                        fontSize: 6
                    },
                    detailItem: {
                        marginBottom: 2,
                    },
                    noBorder : {
                        fontSize: 8,
                        marginTop: 10
                    },
                }
            };

            let total = 0
            for (let i = 0; i < DETAIL.length; i++) {
                total += DETAIL[i].po_qty * DETAIL[i].po_price
                const subtotal = (DETAIL[i].po_qty * DETAIL[i].po_price).toLocaleString('id-ID', {style: 'currency', currency: 'IDR'})
                const harga = DETAIL[i].po_price.toLocaleString('id-ID', {style: 'currency', currency: 'IDR'})
                var row = [(i + 1), DETAIL[i].project, DETAIL[i].number, DETAIL[i].item, DETAIL[i].po_item_update, {text: DETAIL[i].po_qty+' '+DETAIL[i].unit, alignment: 'right'}, {text: harga, alignment: 'right'}, {text: subtotal, alignment: 'right'}]
                docDefinition.content[8].table.body.push(row)
            }
            docDefinition.content[8].table.body.push([
                {}, {}, {}, {}, {}, {}, {text: 'Grand Total', bold: true}, {text: total.toLocaleString('id-ID', {style: 'currency', currency: 'IDR'}), bold: true, alignment: 'right', fontSize: 8}
            ])
            
            var pdfDoc = printer.createPdfKitDocument(docDefinition);
            pdfDoc.end();

            res.contentType('application/pdf');
            pdfDoc.pipe(res)
            
        } else {
            const trex = require('../class/C_trex')
            const play = new trex(req, res)
            play.run()
        }
    } else {
        res.end('oaoe')
    }
  
}

const poQrCodePengajuan = async (req, res) => {
    const { poNumber, poProject, poSupplier, pesan } = req.body
    if ( poNumber && poProject && poSupplier && pesan ) {
        const checkPo = await po.poByNumber(poProject, poNumber)
        let pengajuan = false
        checkPo.map(e => {
            if (e.bod_approve === 3) {
                pengajuan = true
            }
        })
        if (pengajuan) {
            const check = await ver.getVerificationByPoNumber('po', poNumber)
            if (check.length > 0) {
                if (check[0].ver_status === 0) {
                    return res.send({status:'failed', message: 'QRCODE sudah diajukan'})
                } else if (check[0].ver_status === 2) {
                    return res.send({status:'failed', message: 'QRCODE sudah Diapprove'})
                } else {
                    var status = true
                }
            } else {
                var status = true
            }
            if (status) {
                const inputNewVer = await ver.inputNewVer('po', poNumber, 0, pesan, poSupplier, req.userId)
                if (inputNewVer.affectedRows === 1) {
                    res.send({status:'success', message: 'success mengajukan permintaan'})
                } else {
                    res.send({status:'failed', message: 'system error, failed insert database'})
                }
            } else {
                res.send({status:'failed', message: 'Gagal, periksa status approval PO'})
            }
        } else {
            res.status(401).send('Restricted')
        }
    } else {
        res.status(401).send('Restricted')
    }
}

module.exports = {
    control, updateStatusKetersediaanApple, updateSatuanPo, updateStatusItemPo, print, pengajuan, revisi, poNew, poNewSubmit, poApproval, update, updatePost, poQrCodePengajuan
}
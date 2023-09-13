'use strict'

const C_absen = require('../class/C_absen')
const C_admin = require('../class/C_admin')
const C_project = require('../class/C_project')

let data = {
    title: 'DPM',
    pageTitle: 'DPM',
    pageTitleDesc: 'DPM'
}

const index = async (req, res) => {
    data.userName = req.userName
    data.userLevel = req.userLevel
    data.userPicture = req.userPicture
    data.title = 'ABSEN',
    data.pageTitle = 'Attendance',
    data.pageTitleDesc = 'daily attendance '+req.userName
    const Absen = new C_absen()
    data.today = await Absen.today(req.userId)
    res.render('absensi/index_absen', data)
}

const absen = async (req, res) => {
    const {lat, lon, ket, userAgent} = req.body
    let ipAddress = req.ip;

    const Absen = new C_absen()
    const insertAbsen = await Absen.insertAbsen(req.userId, ipAddress, lat, lon, ket, userAgent)
    if (insertAbsen.affectedRows == 1) {
        const today = await Absen.today(req.userId)
        // console.log(today)
        return res.send({status: 'success', message: 'Berhasil absen', data: today})
    }
    res.send({status: 'failed', message: 'Gagal, terjadi kendala'})
}

const control = async (req, res) => {
    if (req.userLevel == 'payment' || req.userLevel == 'director' || req.userLevel == 'admin') {
        const project = req.query.project
        const tanggal = req.query.tanggal

        data.userName = req.userName
        data.userLevel = req.userLevel
        data.userPicture = req.userPicture
        data.title = 'ABSEN',
        data.pageTitle = 'Attendance',
        data.pageTitleDesc = 'Attendance Report'
        const Absen = new C_absen()
        const Admin = new C_admin()
        const Project = new C_project()
        data.project = await Project.allProject()

        if (project && !tanggal) {
            data.pageTitleDesc = 'Attendance Report '+project
            data.projectSelected = project
            delete data.tanggalSelected
            const admin = await Admin.adminProject(project)
            data.today = []
            for (let i = 0; i < admin.length; i++) {
                data.today.push({
                    name: admin[i].name,
                    project: admin[i].project,
                    absen: await Absen.today(admin[i].id)
                })
            }
        } else if (!project && tanggal) {
            data.pageTitleDesc = 'Attendance Report '+project
            delete data.projectSelected
            data.tanggalSelected = tanggal
            const admin = await Admin.allAdminStatus(1)
            data.today = []
            for (let i = 0; i < admin.length; i++) {
                data.today.push({
                    name: admin[i].name,
                    project: admin[i].project,
                    absen: await Absen.getDay(admin[i].id, tanggal)
                })
            }
        } else if (project && tanggal) {
            data.pageTitleDesc = 'Attendance Report '+project
            data.projectSelected = project
            data.tanggalSelected = tanggal
            const admin = await Admin.adminProject(project)
            data.today = []
            for (let i = 0; i < admin.length; i++) {
                data.today.push({
                    name: admin[i].name,
                    project: admin[i].project,
                    absen: await Absen.getDay(admin[i].id, tanggal)
                })
            }
        } else {
            const admin = await Admin.allAdminStatus(1)
            delete data.projectSelected
            delete data.tanggalSelected
            data.today = []
            for (let i = 0; i < admin.length; i++) {
                data.today.push({
                    name: admin[i].name,
                    project: admin[i].project,
                    absen: await Absen.today(admin[i].id)
                })
            }
        }
        res.render('absensi/daftar_absen', data)
    } else  {
        const trex = require('../class/C_trex')
        const play = new trex(req, res)
        play.run()
    }
}

const download = async (req, res) => {

    const project = req.query.project
    const tahun = req.query.tahun
    const bulan = req.query.bulan

    const Admin = new C_admin()
    const Absen = new C_absen()

    const admin = await Admin.adminProject(project)
    data = []
    for (let i = 0; i < admin.length; i++) {
        data.push({
            name: admin[i].name,
            project: admin[i].project,
            absen: await Absen.download(admin[i].id, tahun, bulan)
        })
    }
    
    // Require library
    var xl = require('excel4node');
    
    // Create a new instance of a Workbook class
    var wb = new xl.Workbook();
    
    // Add Worksheets to the workbook
    var ws = wb.addWorksheet('ABSEN');
    //var ws2 = wb.addWorksheet('Sheet 2');
    
    // Create a reusable style
    var style = wb.createStyle({
        font: {
            color: '#FF0800',
            size: 12,
        },
        numberFormat: '$#,##0.00; ($#,##0.00); -',
    });

    let dataExcel = []
    for (let i = 0; i < data.length; i++) {
        const absen = data[i].absen
        let row = i + 1

        for (let x = 0; x < absen.length; x++) {
            dataExcel.push({
                name: data[i].name,
                project: data[i].project,
                created: absen[x].created
            })
        }
    }

    for (let ii = 0; ii < dataExcel.length; ii++) {
        const row = ii + 1
        ws.cell(row, 1)
            .string(dataExcel[ii].name)
            //.style(style);
        ws.cell(row, 2)
            .string(dataExcel[ii].project)
            //.style(style);
        ws.cell(row, 3)
            .date(dataExcel[ii].created)
            //.style(style);
        ws.cell(row, 4)
            .date(dataExcel[ii].created)
            //.style(style);
    }

    wb.write(project+'-'+tahun+'-'+bulan+'.xlsx', res);

    /*
    // Set value of cell A1 to 100 as a number type styled with paramaters of style
    ws.cell(1, 1)
        .number(100)
        .style(style);
    
    // Set value of cell B1 to 200 as a number type styled with paramaters of style
    ws.cell(1, 2)
        .number(200)
        .style(style);
    
    // Set value of cell C1 to a formula styled with paramaters of style
    ws.cell(1, 3)
        .formula('A1 + B1')
        .style(style);
    
    // Set value of cell A2 to 'string' styled with paramaters of style
    ws.cell(2, 1)
        .string('string')
        .style(style);
    
    // Set value of cell A3 to true as a boolean type styled with paramaters of style but with an adjustment to the font size.
    ws.cell(3, 1)
        .bool(true)
        .style(style)
        .style({font: {size: 14}});

    //wb.write('Excel.xlsx');
    wb.write('ExcelFile.xlsx', res);
    //console.log(wb.write())
    */
}

module.exports = {
    index, absen, control, download
}
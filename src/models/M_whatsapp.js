'use strict'

const db = require('./DbConn')
const C_whatsapp = require('../class/C_whatsapp')

let sql

const blast = async (req, res) => {

    sql = `SELECT admin.id, admin.name, admin.hp, admin_status, project.name AS project, admin.level
    FROM admin
    JOIN user_project
        ON user_project.user_project_id_user = admin.id
    JOIN project
        ON project.id = user_project.user_project_id_project
    WHERE admin_status = 1
        AND project.name = 'Service Apartemen Antasari'`
    db.query(sql, (err, result) => {
        for (let i = 0; i < result.length; i++) {
            const date = new Date()
            const sendTime = date.toLocaleDateString('id-ID')+' '+date.toLocaleDateString('id-ID')
            const delay = 1 * 1000
            const tujuan = result[i].hp
            const namaTujuan = result[i].name
            const level = result[i].level
            const project = result[i].project
            const pesan = `*Peringatan dari management*\n\nKepada: ${namaTujuan}\nNomor Hp: ${tujuan}\nLevel: ${level} - ${project}\n\nDiwajibkan absen untuk seluruh staff menggunakan absen online. Tindakan sangsi akan diberlakukan bagi yang melanggar.\n\nttd. Management PT. Rekatama Global SInergi\n\nhttps://rgsinergi.co.id`
            setTimeout(() => {
                //const Whatsapp = new C_whatsapp(tujuan,pesan)
                //Whatsapp.sendText()
                console.log('\n'+pesan)
            }, delay)
        }
    })

    res.send('oaor')
}

module.exports = {
    blast
}
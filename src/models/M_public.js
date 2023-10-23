'use strict'

const secret = process.env.SECRET_KEY
const jwt = require('jsonwebtoken')
const db = require('./DbConn')
const bcrypt = require('bcrypt')
const WA = require('../class/C_whatsapp')
let sql

const loginPage = (req, res) => {
    res.render('login_page')
}

const auth = (req, res) => {

    const {username, password} = req.body

    if (typeof username !== 'string' || typeof password !== 'string') {
        console.log( req.body )
        res.redirect('/')
    }
    
    if (username && password) {
        checkUsername(req, res, username, password)
    } else {
        res.redirect('/')
    }
}

const checkUsername = async (req, res, username, password) => {
    const hostName = req.get('host');

    sql = `SELECT * FROM admin WHERE username = ?`
    db.query(sql, [username], async (err, result) => {
        if (err) throw err
        if (result.length === 1) {
            const phpPassword = result[0].password.replace('$2y$', '$2a$')
            if (bcrypt.compareSync(password, phpPassword) && result[0].admin_status == 1) {

                const userId = result[0].id
                const userName = result[0].name
                const userLevel = result[0].level
                const userPicture = result[0].picture

                const message = `*${userName} baru saja login di ${hostName}*\nAbaikan pesan jika ini memang Anda*`

                try {
                    whatsappNotif(userId, message).catch( err => { if (err) throw err})
                } catch (error) {
                    console.log({error, message: 'Gagal mengirim notifikasi'})
                }
                const payload = {userId, userName, userLevel, userPicture, login: true}
                const token = jwt.sign( payload, secret, {expiresIn: '1h'})
                res.cookie('rgsToken', token, { sameSite: 'strict', httpOnly: true, path: '/', secure: false });
                
                return res.send({status: 'success', message: 'Berhasil Login'})

            } else if (bcrypt.compareSync(password, phpPassword) && result[0].admin_status != 1) {
                return res.send({status: 'failed', message: 'Akun telah kadaluarsa'})
            } else {
                return res.send({status: 'failed', message: 'Password Salah'})
            }
        }
        res.send({status: 'failed', message: 'User Not Found'})
    })
    
}

const logout = (req, res) => {
    res.clearCookie("rgsToken");
    res.redirect('/')
}

const whatsappNotif = async (userId, pesan) => {
    sql = `SELECT * FROM admin WHERE id = ?`
    db.query(sql, [userId], async (err, result) => {
        if (err) throw err

        if (process.env.APP_MODE != 'PRODUCTION') {
            var tujuan = '6285640465672'
        } else {
            var tujuan = result[0].hp
        }
        const first = tujuan.substring(0,1)
        tujuan = (first == '0') ? '62'+(tujuan.substring(1, tujuan.length)) : tujuan

        const wa = new WA(tujuan, pesan)
        const sendLoginWa = await wa.sendText(tujuan, pesan)
        console.log({
            name: 'Pesan login',
            whatsappp: sendLoginWa
        })
        return sendLoginWa
    })
}

module.exports = {
    loginPage, auth, logout
}
'use strict'

const secret = process.env.SECRET_KEY
const jwt = require('jsonwebtoken')
const db = require('../models/DbConn')
let sql
let d = new Date().getTime() + (60 * 60)
let maxAgeDate = new Date(d)

const authPublic = (req, res, next) => {
    const rgsToken = req.cookies.rgsToken
    jwt.verify(rgsToken, secret, (err, decoded) => {
        if (err) {
            next()
        }
        if (decoded) {
            return res.redirect('/profile')
        }
    })
}

const authLogin = (req, res, next) => {

    const rgsToken = req.cookies.rgsToken
    jwt.verify(rgsToken, secret, (err, decoded) => {
        if (err) return res.redirect('/')
        req.userId = decoded.userId
        req.userName = decoded.userName
        req.userLevel = decoded.userLevel
        req.userPicture = decoded.userPicture
        const payload = {userId: decoded.userId, userName: decoded.userName, userLevel: decoded.userLevel, userPicture: decoded.userPicture, login: true}
        const token = jwt.sign( payload, secret, {expiresIn: '8h'})
        res.cookie('rgsToken', token, { sameSite: 'strict', httpOnly: true, path: '/', secure: true });
        // res.cookie('rgsToken', rgsToken, { httpOnly: true, secure: true });
        next()
    })
}

const authPo = (req, res, next) => {
    const rgsToken = req.cookies.rgsToken
    jwt.verify(rgsToken, secret, (err, decoded) => {
        if (err) return res.redirect('/')
        checkAdmin(decoded.userId, user => {
            if (user.level == 'purchasing' || user.level == 'cost controll' || user.level == 'po' ||  user.level == 'logistic' || user.level == 'director' ||  user.level == 'payment' || user.level == 'admin') {
                req.userId = decoded.userId
                req.userName = decoded.userName
                req.userLevel = decoded.userLevel
                req.userPicture = decoded.userPicture
                const payload = {userId: decoded.userId, userName: decoded.userName, userLevel: decoded.userLevel, userPicture: decoded.userPicture, login: true}
                const token = jwt.sign( payload, secret, {expiresIn: '8h'})
                res.cookie('rgsToken', token, { sameSite: 'strict', httpOnly: true, path: '/', secure: true });
                // res.cookie('rgsToken', rgsToken, { httpOnly: true, secure: true });
                next()
            } else {
                return res.redirect('/')
            }
        })
    })
}

const authLogistic = (req, res, next) => {
    const rgsToken = req.cookies.rgsToken
    jwt.verify(rgsToken, secret, (err, decoded) => {
        if (err) return res.redirect('/')
        checkAdmin(decoded.userId, user => {
            if (user.level == 'logistic' || user.level == 'director' || user.level == 'admin') {
                req.userId = decoded.userId
                req.userName = decoded.userName
                req.userLevel = decoded.userLevel
                req.userPicture = decoded.userPicture
                const payload = {userId: decoded.userId, userName: decoded.userName, userLevel: decoded.userLevel, userPicture: decoded.userPicture, login: true}
                const token = jwt.sign( payload, secret, {expiresIn: '8h'})
                res.cookie('rgsToken', token, { sameSite: 'strict', httpOnly: true, path: '/', secure: true });
                // res.cookie('rgsToken', rgsToken, { httpOnly: true, secure: true });
                next()
            } else {
                return res.redirect('/')
            }
        })
    })
}

const authCc = (req, res, next) => {
    const rgsToken = req.cookies.rgsToken
    jwt.verify(rgsToken, secret, (err, decoded) => {
        if (err) return res.redirect('/')
        checkAdmin(decoded.userId, user => {
            if (user.level == 'cost controll' || user.level == 'po' || user.level == 'payment' || user.level == 'director' || user.level == 'admin') {
                req.userId = decoded.userId
                req.userName = decoded.userName
                req.userLevel = decoded.userLevel
                req.userPicture = decoded.userPicture
                const payload = {userId: decoded.userId, userName: decoded.userName, userLevel: decoded.userLevel, userPicture: decoded.userPicture, login: true}
                const token = jwt.sign( payload, secret, {expiresIn: '8h'})
                res.cookie('rgsToken', token, { sameSite: 'strict', httpOnly: true, path: '/', secure: true });
                // res.cookie('rgsToken', rgsToken, { httpOnly: true, secure: true });
                next()
            } else {
                return res.redirect('/')
            }
        })
    })
}

const authAdmin = (req, res, next) => {
    const rgsToken = req.cookies.rgsToken
    jwt.verify(rgsToken, secret, (err, decoded) => {
        if (err) return res.redirect('/')
        checkAdmin(decoded.userId, user => {
            if (user.level == 'director' || user.level == 'admin') {
                req.userId = decoded.userId
                req.userName = decoded.userName
                req.userLevel = decoded.userLevel
                req.userPicture = decoded.userPicture
                const payload = {userId: decoded.userId, userName: decoded.userName, userLevel: decoded.userLevel, userPicture: decoded.userPicture, login: true}
                const token = jwt.sign( payload, secret, {expiresIn: '8h'})
                res.cookie('rgsToken', token, { sameSite: 'strict', httpOnly: true, path: '/', secure: true });
                // res.cookie('rgsToken', rgsToken, { maxAge: maxAgeDate, httpOnly: true, secure: true });
                next()
            } else {
                return res.redirect('/')
            }
        })
    })
}

const checkAdmin = (userId, user) => {
    sql = `SELECT * FROM admin WHERE id = ?`
    db.query(sql, [userId], (err, result) => {
        if (err) throw err
        if (result.length === 1) {
            return user(result[0])
        }
    })
}

module.exports = {
    authPublic, authLogin, authAdmin, authPo, authLogistic, authCc
}
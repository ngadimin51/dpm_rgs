'use strict'

const db = require('./DbConn')
const bcrypt = require('bcrypt')
const C_project = require('../class/C_project')
const C_admin = require('../class/C_admin')

let sql
let data = {
    title: 'RGS',
    pageTitle: 'Project',
    pageTitleDesc: 'Daftar Semua Project'
}

const listUser = async (req, res) => {
    const p = new C_project()
    const u = new C_admin()
    data.users = await u.allAdmin()
    data.userName = req.userName
    data.userLevel = req.userLevel
    data.userPicture = req.userPicture
    data.pageTitle = 'Daftar User'
    data.pageTitleDesc = 'Daftar Semua User'
    data.project = await p.allProjectActive()
    res.render('user/list_user', data)
}

const userDetail = async (req, res) => {
    const id = req.params.id
    const p = new C_project()
    const user = new C_admin(id)
    data.penugasan = await p.penugasan(id)
    data.project = await p.allProjectActive()
    data.user = await user.adminData(id)
    data.pageTitle = 'Detail USER'
    data.pageTitleDesc = 'Halaman Detail User '+data.user.name
    data.userName = req.userName
    data.userLevel = req.userLevel
    res.render('user/user_detail', data)
}

const addDetail = (req, res) => {
    const {name, username, email, hp, password, project, level} = req.body
    if (name, username, email, hp, password, project, level) {
        
        checkUserFields('username', username, length => {
            if (length > 0) {
                return res.send({status: 'failed', message: 'username '+username+' sudah terpakai'})
            }
            const hash = bcrypt.hashSync(password, 12)
            sql = `INSERT INTO admin (name, username, email, hp, password, project, admin_status, level) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
            db.query(sql, [name, username, email, hp, hash, project, 1, level], (err, result) => {
                if (err) throw err
                if (result.affectedRows === 1) {
                    return res.send({status: 'success', insertId: result.insertId})
                }
                res.send({status: 'failed', message: 'Gagal insert user ke Database, hubungi WEB ADMIN'})
            })
        })

    } else {
        res.send({status: 'failed', message: 'form tidak lengkap'})
    }
}

const updateUserData = (req, res) => {
    const {target, value, idUser} = req.body
    if (target && value ) {
        if (target != 'password') {
            updateUserStrict(req, res, target, value, idUser)
        } else {
            updateUserPassword(req, res, target, value, idUser)
        }
    }
}

const updateUserStrict = async (req, res, target, value, idUser) => {
    if (target == 'name' || target == 'email' || target == 'hp' || target == 'username') {
        await checkUserFields(target, value, duplicate => {
            if (duplicate == 0) {
                sql = `UPDATE admin SET ${target} = ? WHERE id = ?`
                db.query(sql, [value, idUser], (err, result) => {
                    if (err) throw err
                    if (result.affectedRows === 1) {
                        //req.io.to(idUser * 1).emit('refresh-cookies')
                        res.send({status: 'success', message: 'Berhasil update database'})
                    } else {
                        res.send({status: 'failed', message: 'Gagal update database, hubungi WEB ADMIN'})
                    }
                })
            } else {
                res.send({status: 'failed', message: 'Data sudah terpakai'})
            }
        })
    } else {
        updateUser(req, res, target, value, idUser)
    }
}

const checkUserFields = (target, value, result) => {
    sql = `SELECT * FROM admin WHERE ${target} = ?`
    db.query(sql, [value], (err, arr) => {
        if (err) throw err
        return result(arr.length)
    })
}

const updateUser = (req, res, target, value, idUser) => {
    sql = `UPDATE admin SET ${target} = ? WHERE id = ?`
    db.query(sql, [value, idUser], (err, result) => {
        if (err) throw err
        if (result.affectedRows === 1) {
            if (target == 'level') {
                req.io.to(idUser * 1).emit('refresh-cookies')
            }
            res.send({status: 'success', message: 'Berhasil update database'})
        } else {
            res.send({status: 'failed', message: 'Gagal update database, hubungi WEB ADMIN'})
        }
    })
}

const updateUserPassword = (req, res, target, value, idUser) => {
    const hashed = bcrypt.hashSync(value, 12)
    sql = `UPDATE admin SET password = ? WHERE id = ?`
    db.query(sql, [hashed, idUser], (err, result) => {
        if (err) throw err
        if (result.affectedRows === 1) {
            res.send({status: 'success', message: 'Berhasil update database'})
            req.io.to(idUser * 1).emit('update-password')
        } else {
            res.send({status: 'failed', message: 'Gagal update database, hubungi WEB ADMIN'})
        }
    })
}

const tambahPenugasan = (req, res) => {
    const {idUser, id} = req.body
    sql = `SELECT project.name as project, project.id as idProject FROM user_project JOIN project ON project.id = user_project.user_project_id_project WHERE user_project_id_user = ? AND user_project_id_project = ? ORDER BY project.name`
    db.query(sql, [idUser, id], (err, result) => {
        if (err) throw err
        if (result.length == 0) {
            addPenugasan(req, res, idUser, id)
        }
        if (result.length > 0) {
            removePenugasan(req, res, idUser, id)
        }
    })
}

const removePenugasan = (req, res, idUser, id) => {
    sql = `DELETE FROM user_project WHERE user_project_id_user = ? AND user_project_id_project = ?`
    db.query(sql, [idUser, id], (err, result) => {
        if (err) throw err
        if (result.affectedRows === 1) {
            return hasilUpdatePenugasanProject(req, res, idUser)
        }
        res.send({status: 'failed', message: 'Error Database, hubungi WEB ADMIN'})
    })
}

const addPenugasan = (req, res, idUser, id) => {
    sql = `INSERT INTO user_project (user_project_id_user, user_project_id_project) VALUES (?, ?)`
    db.query(sql, [idUser, id], (err, result) => {
        if (err) throw err
        if (result.affectedRows === 1) {
            return hasilUpdatePenugasanProject(req, res, idUser)
        }
        res.send({status: 'failed', message: 'Error Database, hubungi WEB ADMIN'})
    })
}

const hasilUpdatePenugasanProject = async (req, res, idUser) => {
    const p = new C_project()
    const data = await p.penugasan(idUser)
    res.send({status: 'success', data})
}

const profile = async (req, res) => {
    const p = new C_project()
    const user = new C_admin()

    data.user = await user.adminData(req.userId)
    data.penugasan = await p.penugasan(req.userId)
    data.pageTitle = 'PROFILE'
    data.pageTitleDesc = 'Detail Profile '+ req.userName
    data.userId = req.userId
    data.userName = req.userName
    data.userLevel = req.userLevel
    data.userPicture = req.userPicture
    
    req.io.on('connection', socket => {
        for (let i = 0; i < data.penugasan.length; i++) {
            socket.join(data.penugasan[i].project)
        }
    })

    res.render('user/profile', data)
}

module.exports = {
    listUser, userDetail, addDetail, updateUserData, tambahPenugasan, profile
}
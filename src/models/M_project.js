'use strict'

const db = require("./DbConn")
const Project = require('../class/C_project')

let sql
let data = {title: 'RGS'}

const projectList = async (req, res) => {
    const id = req.query.id
    data.userName = req.userName
    data.userLevel = req.userLevel
    data.userPicture = req.userPicture
    if (id) {
        sql = `SELECT * FROM project WHERE id = ?`
        db.query(sql, [id], (err, result) => {
            if (err) throw err
            data.title = 'PROJECT'
            data.pageTitle = 'Project'
            data.pageTitleDesc = result[0].name
            data.project = result[0]
            appendUserProject(id, array => {
                data.users = array
                res.render('project/edit_project', data)
            })
        })
    } else {
        data.developer = await getDebug()
        sql = `SELECT * FROM project`
        db.query(sql, async (err, result) => {
            if (err) throw err
            data.title = 'PROJECT'
            data.pageTitle = 'Project'
            data.pageTitleDesc = 'Daftar Semua Project'
            data.project = result
            res.render('project/list_project', data)
        })
    }
}

const addProject = async (req, res) => {
    const { name, code, desc } = req.body
    console.log({ name, code, desc })
    if ( name && code && desc ) {
        const project = new Project()
        const checkName = await project.checkName(name)
        const checkCode = await project.checkCode(code)
        if (checkName == 0) {
            if (checkCode == 0) {
                const insertP = await project.insertProject(name, code, desc)
                if (insertP.affectedRows === 1) {
                    return res.send({status: 'success', message: 'Berhasil input data'})
                }
                return res.send({status: 'failed', message: 'Gagal input data'})
            }
            return res.send({status: 'failed', message: 'Code sudah terpakai'})
        }
        res.send({status: 'failed', message: 'Nama sudah terpakai'})
        
    } else {
        res.send({status: 'failed', message: 'error body'})
    }
}

const appendUserProject = (id, array) => {
    sql = `SELECT admin.id, admin.name, admin.level, admin.hp FROM user_project JOIN admin ON user_project.user_project_id_user = admin.id WHERE user_project.user_project_id_project = ? AND admin_status = 1 ORDER BY admin.name`
    db.query(sql, [id], (err, result) => {
        if (err) throw err
        return array(result)
    })
}

function getDebug() {
    return new Promise((resolve, reject) => {
        sql = `SELECT * FROM developer`
        db.query(sql, (err, result) => {
            if (err) return reject(err)
            return resolve(result)
        })
    })
}

module.exports = {
    projectList, addProject
}
'use strict'

const db = require('../models/DbConn')
let sql

class Project{
    constructor(id) {
        this.id = id
    }
    debug() {
        return new Promise((resolve, reject) => {
            sql = `SELECT * FROM developer`
            db.query(sql, (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    allProject() {
        return new Promise((resolve, reject) => {
            sql = `SELECT * FROM project`
            db.query(sql, (err, array) => {
                if (err) return reject(err)
                return resolve(array)
            })
        })
    }
    allProjectActive() {
        return new Promise((resolve, reject) => {
            sql = `SELECT * FROM project WHERE active = 1`
            db.query(sql, (err, array) => {
                if (err) return reject(err)
                return resolve(array)
            })
        })
    }
    dataByProject(id) {
        return new Promise((resolve, reject) => {
            if (Number.isInteger(id)) {
                sql = `SELECT * FROM project WHERE id = ?`
                db.query(sql, [id], (err, array) => {
                    if (err) return reject(err)
                    return resolve(array[0])
                })
            } else {
                sql = `SELECT * FROM project WHERE name = ?`
                db.query(sql, [id], (err, array) => {
                    if (err) return reject(err)
                    return resolve(array[0])
                })
            }
        })
    }
    checkName(name) {
        return new Promise((resolve, reject) => {
            sql = `SELECT * FROM project WHERE name = ?`
            db.query(sql, [name], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    checkCode(code) {
        return new Promise((resolve, reject) => {
            sql = `SELECT * FROM project WHERE code = ?`
            db.query(sql, [code], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    insertProject(name, code, desc) {
        return new Promise((resolve, reject) => {
            sql = `INSERT INTO project (name, code, description) VALUES (?, ?, ?)`
            db.query(sql, [name, code, desc], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    penugasan(userId) {
        return new Promise((resolve, reject) => {
            sql = `SELECT project.id as idProject, project.name as project, project.description, project.picture FROM user_project JOIN project ON project.id = user_project.user_project_id_project WHERE user_project_id_user = ?`
            db.query(sql, [userId], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    penugasanProjectLevel(project, level) {
        return new Promise((resolve, reject) => {
            sql = `SELECT
                project.id as idProject,
                user_project.user_project_id_user as idUser,
                admin.hp as hp, admin.name as name
            FROM project
                JOIN user_project ON user_project.user_project_id_project=project.id
                JOIN admin ON admin.id = user_project.user_project_id_user
            WHERE project.name = ? AND level in(?) AND admin_status = 1`
            db.query(sql, [project, level], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
}

module.exports = Project
'use strict'

const PROJECT = require('../class/C_project')
let data = {
    title: 'DPM',
    pageTitle: 'DPM',
    pageTitleDesc: 'DPM'
}

const project = async (req, res) => {
    const Project = new PROJECT()
    data.title = 'CHAT',
    data.pageTitle = 'PROJECTS',
    data.pageTitleDesc = 'Chatting Global Project'
    data.userId = req.userId
    data.userName = req.userName
    data.userLevel = req.userLevel
    data.userPicture = req.userPicture
    data.project = await Project.penugasan(req.userId)
    res.render('chatting/project', data)
}

const users = async (req, res) => {
    res.render('chatting/users')
}

module.exports = {
    project, users
}
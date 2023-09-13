'use strict'

require('dotenv').config()

const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
const io = require("socket.io")(server)
const port = process.env.PORT
const bp = require('body-parser')
const cookieParser = require('cookie-parser')
const cookie = require('cookie')
const jwt = require('jsonwebtoken')
const router = require('./router/router')
const db = require('../src/models/DbConn')

let sql

app.set('trust proxy')
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(bp.urlencoded({ extended: false }))
app.use(bp.json())
app.use(cookieParser())
app.set('etag', false)
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store')
  next()
})
app.use((req, res, next) => {
  req.io = io
  next()
})
app.use(router)
server.listen(port, console.log(`Server run and listen ${port}`))

console.log('MODE '+process.env.APP_MODE)

io.on("error", e => console.log(e));
io.on("connection", async socket => {

  if (socket.handshake.headers.cookie) {
      
    const cookies = cookie.parse( socket.handshake.headers.cookie );
    const token = cookies.rgsToken
    if (token) {
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      const userId = decoded.userId
      const userName = decoded.userName
      const userLevel = decoded.userLevel
      const userPicture = decoded.userPicture

      const C_notif = require('../src/class/C_notif')
      const Notif = new C_notif(userId, userLevel)
      const notif = await Notif.getNotif()

      socket.join(userId)
      io.to(userId).emit('welcome', userId, userName)

      io.to(userId).emit('notif', notif)
      socket.on('update-notif', async () => {
        //io.to(userId).emit('notif', notif)
        io.emit('notif', notif)
        console.log('sukses emit broadcast signal to '+userName) //bisa dihapus
      })

      /**
       * CHATTING
       */
      const C_chat = require('../src/class/C_chat')
      const C_admin = require('../src/class/C_admin')
      const Chat = new C_chat()
      const Admin = new C_admin()
      socket.on('chatting', async (dataRoom, message) => {
        const date = new Date()
        const time = date.toLocaleDateString()+' '+date.toLocaleTimeString()
        const insertDb = await Chat.insertChat(userName, userId, dataRoom, message, time)
        if (insertDb.affectedRows == 1) {
          const dataChat = {
            chat_id: insertDb.insertId,
            chat_sender: userName,
            chat_sender_id: userId,
            chat_room: dataRoom,
            chat_message: message,
            chat_time: time,
            picture: userPicture
          }
          io.to(dataRoom).emit('chatting', dataChat)
        }
      })
      socket.on('getChatting', async dataRoom => {
        const getChat = await Chat.getChat(dataRoom)
        const array = []
        for (let i = 0; i < getChat.length; i++) {
          const admin = await Admin.adminData(getChat[i].chat_sender_id)
          array.push({
            chat_id: getChat[i].chat_id,
            chat_sender: getChat[i].chat_sender,
            chat_sender_id: getChat[i].chat_sender_id,
            chat_room: getChat[i].chat_room,
            chat_message: getChat[i].chat_message,
            chat_time: getChat[i].chat_time,
            picture: admin.picture
          })
        }
        io.to(userId).emit('getChat', array)
      })
      socket.on('hapus-chat', async (id, dataRoom, senderId) => {
        if (userLevel == 'director' || userLevel == 'admin') {
          const deleteChat = await Chat.delete(id)
          if (deleteChat.affectedRows == 1) {
            io.to(dataRoom).emit('hapus-chat', ({dataRoom, id}))
          } else {
            io.to(userId).emit('notif-default', 'Tidak dapat melakukan tindakan ini')
          }
        } else if ((senderId * 1) == userId) {
          const deleteChat = await Chat.delete(id)
          if (deleteChat.affectedRows == 1) {
            io.to(dataRoom).emit('hapus-chat', ({dataRoom, id}))
          } else {
            io.to(userId).emit('notif-default', 'Tidak dapat melakukan tindakan ini')
          }
        } else {
          io.to(userId).emit('notif-default', 'Tidak dapat melakukan tindakan ini')
        }
      })

      const sId = socket.id
      socket.on('userDataChange', data => {
        console.log(data)
      });
    }
  }

  //socket.emit('request', /* … */); // emit an event to the socket
  //io.emit('broadcast', /* … */); // emit an event to all connected sockets
  //socket.on('reply', () => { /* … */ }); // listen to the event
})




























/*
const getProjectList = (userId) => {
  return new Promise((resolve,reject) => {
    sql = `SELECT
      project.id, project.name, admin.level
    FROM user_project
    JOIN project ON project.id = user_project.user_project_id_project
    JOIN admin ON admin.id = user_project.user_project_id_user
    WHERE user_project.user_project_id_user = ? AND project.active = 1`
    db.query(sql, [userId], async (err, projects) => {
      if (err) return reject(err)
      let results = []
      for (let i = 0; i < projects.length; i++) {
        const dpm = await dpmCount(projects[i].name, projects[i].level)
        const apple = await appleCount(projects[i].name, projects[i].level)
        const po = await poCount(projects[i].name, projects[i].level)
        if (dpm.length > 0) {
          results.push(dpm, apple, po)
        } else {
          results.push(dpm, apple, po)
        }
      }
      console.log(results)
      return resolve(results)
    })
  })
}
*/

const dpmCount = (project, level) => {
  return new Promise((resolve, reject) => {
    if (level == 'site engineer') {
      sql = `SELECT dpm_id, number, project, item.name FROM dpm JOIN item ON item.id = dpm.item WHERE project = ? AND control <= 1`
    } else if (level == 'site manager') {
      sql = `SELECT dpm_id, number, project, item.name FROM dpm JOIN item ON item.id = dpm.item  WHERE project = ? AND control = 0 OR project = ? AND control = 3`
    } else if (level == 'project manager') {
      sql = `SELECT dpm_id, number, project, item.name FROM dpm JOIN item ON item.id = dpm.item  WHERE project = ? AND control = 2 OR project = ? AND ho = 1`
    } else if (level == 'cost controll') {
      sql = `SELECT dpm_id, number, project, item.name FROM dpm JOIN item ON item.id = dpm.item  WHERE project = ? AND control = 4 AND ho = 0`
    } else if (level == 'purchasing') {
      sql = `SELECT dpm_id, number, project, item.name FROM dpm JOIN item ON item.id = dpm.item  WHERE project = ? AND control = 4 AND ho = 2`
    } else {
      sql = `SELECT dpm_id FROM dpm WHERE ho = 100`
    }
    db.query(sql, [project, project], (err, result) => {
      if (err) return reject(err)
      let dpm = []
      for (let i = 0; i < result.length; i ++) {
        dpm.push({
          dpm_id: result[i].dpm_id,
          number: result[i].number,
          project: result[i].project,
          name: result[i].name,
          type: 'DPM'
        })
      }
      return resolve(result)
    })
  })
}

const appleCount = (project, level) => {
  return new Promise((resolve, reject) => {
    if (level == 'cost controll') {
      sql = `SELECT
        dpm.dpm_id,
        dpm.number,
        dpm.project,
        item.name
      FROM dpm
      JOIN item ON item.id = dpm.item
      JOIN apple ON apple.dpm_id = dpm.dpm_id
      WHERE dpm.project = ? AND control = 4 AND ho = 3 AND status = 10`
    } else if (level == 'purchasing') {
      sql = `SELECT
        dpm.dpm_id,
        dpm.number,
        dpm.project,
        item.name
      FROM dpm
      JOIN item ON item.id = dpm.item
      JOIN apple ON apple.dpm_id = dpm.dpm_id
      WHERE dpm.project = ? AND control = 4 AND ho = 3 AND status = 10 AND dir_acc > 0
      OR dpm.project = ? AND control = 4 AND ho = 3 AND status = 0 AND dir_acc = null
      OR dpm.project = ? AND control = 4 AND ho = 3 AND status = 0 AND dir_acc = 0`
    } else if (level == 'director') {
      sql = `SELECT
        dpm.dpm_id,
        dpm.number,
        dpm.project,
        item.name
      FROM dpm
      JOIN item ON item.id = dpm.item
      JOIN apple ON apple.dpm_id = dpm.dpm_id
      WHERE dpm.project = ? AND control = 4 AND ho = 3 AND status = 1`
    } else {
      sql = `SELECT dpm_id FROM dpm WHERE ho = 100`
    }
    db.query(sql, [project, project, project], (err, result) => {
      if (err) return reject(err)
      let dpm = []
      for (let i = 0; i < result.length; i ++) {
        dpm.push({
          dpm_id: result[i].dpm_id,
          number: result[i].number,
          project: result[i].project,
          name: result[i].name,
          type: 'APPLE'
        })
      }
      return resolve(dpm)
    })
  })
}

const poCount = (project, level) => {
  return new Promise((resolve, reject) => {
    if (level == 'director') {
      sql = `SELECT
        po_number,
        project,
        bod_approve,
        supplier.name as supl
      FROM po_detail
      JOIN supplier ON supplier.id = po_detail.supl
      WHERE po_status = 0 AND bod_approve = 1 GROUP BY po_number`
    } else {
      sql = `SELECT dpm_id FROM dpm WHERE ho = 100`
    }
    db.query(sql, [project, project, project], (err, result) => {
      if (err) return reject(err)
      let dpm = []
      for (let i = 0; i < result.length; i ++) {
        dpm.push({
          po_number: result[i].po_number,
          project: result[i].project,
          name: result[i].supl,
          type: 'PO'
        })
      }
      return resolve(dpm)
    })
  })
}
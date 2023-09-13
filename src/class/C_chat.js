'use strict'

const db = require('../models/DbConn')
let sql

class C_chat{
    insertChat(sender, senderId, room, message, time) {
        return new Promise((resolve, reject) => {
            sql = `INSERT INTO chat (chat_sender,chat_sender_id,chat_room,chat_message,chat_time) VALUES (?, ?, ?, ?, ?)`
            db.query(sql, [sender, senderId, room, message, time], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    getChat(room) {
        return new Promise((resolve, reject) => {
            sql = `SELECT * FROM chat WHERE chat_room = ?`
            db.query(sql, [room], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
    delete(id) {
        return new Promise((resolve, reject) => {
            sql = `DELETE FROM chat WHERE chat_id = ?`
            db.query(sql, [id], (err, result) => {
                if (err) return reject(err)
                return resolve(result)
            })
        })
    }
}

module.exports = C_chat
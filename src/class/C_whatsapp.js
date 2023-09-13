'use strict'

const fetch = require('node-fetch')
const token = process.env.WA_SECRET

class Whatsapp{
    constructor(tujuan, pesan) {
        const string = tujuan.toString()
        const depan = string.substring(0,1)
        const sisa = string.substring(1, tujuan.length)
        tujuan = (depan == '0') ? '62'+sisa : tujuan

        if (process.env.APP_MODE != 'PRODUCTION') {
            this.tujuan = '6285640465672'
        } else {
            this.tujuan = tujuan
        }
        this.pesan = pesan
    }    

    async sendText() {
        const Authorization = 'bearer '+new Buffer.from(token).toString('base64')
        const bodyPost = {
            type: 'text',
            body: {
                number: process.env.APP_MODE === "SANDBOX" ? "6285640465672@s.whatsapp.net" : this.tujuan+"@s.whatsapp.net",
                text: process.env.APP_MODE === "SANDBOX" ? this.pesan+"\n\nPesan ini adalah bagian testing aplikasi" : this.pesan
            }
        }
        const response = await fetch('https://wa.ndalu.id/api/whatsapp', {
            method: 'POST', headers: {
                'Content-Type': 'application/json',
                'Authorization': Authorization
            },
            body: JSON.stringify(bodyPost)
        })
        console.log({Authorization, bodyPost, response})
        try {
            return await response.json()
        } catch (error) {
            return { error: error, message: 'Class whatsapp failed hit API', status: response.status, statusText: response.statusText}
        }
    }

}

module.exports = Whatsapp
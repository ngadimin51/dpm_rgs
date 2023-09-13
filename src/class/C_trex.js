'use strict'

class Trex{
    constructor(req, res) {
        this.req = req
        this.res = res
    }
    run() {
        let data = {
            pageTitle: 'TREX',
            pageTitleDesc: 'Hay '+this.req.userName+' data yang kamu cari tidak ada, mau berlari bersamaku?',
            userId: this.req.userId,
            userName: this.req.userName,
            userLevel: this.req.userLevel,
            userPicture: this.req.userPicture
        }
        this.res.render('trex/index', data)
    }
}

module.exports = Trex
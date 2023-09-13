'use strict'

const DPM = require('../class/C_dpm')
const PO = require('../class/C_po')
const VER = require('../class/C_verification')

const dpmPengiriman = async (req, res) => {
    const {dpmId, ho} = req.body
    if (dpmId && ho) {
        const Po = new PO()
        const po = await Po.getPoByDpmId(dpmId)
        if (po.bod_approve < 3) {
            return res.send({status: 'failed', message: 'PO Belum di approve'})
        }
        const Ver = new VER()
        const ver = await Ver.getVerificationByPoNumber('po', po.po_number)
        if (ver[0].ver_status == 2) {
            const Dpm = new DPM()
            await Dpm.updateDinamic('ho', ho, dpmId).then ( e => {
                if (e.affectedRows == 1) {
                    return res.send({status: 'success', message: 'Berhasil update, halaman akan direfresh'})
                }
                return res.send({status: 'failed', message: 'gagal update database'})
            }).catch (err => {
                return res.send({status: 'failed', message: err})
            })
        } else {
            res.send({status: 'failed', message: 'PO Belum acc QRCODE'})
        }
    } else {
        res.send({status: 'failed', message: 'error body'})
    }
}

module.exports = {
    dpmPengiriman
}
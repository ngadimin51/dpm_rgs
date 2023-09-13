'use strict'

const db = require('../models/DbConn')
let sql

class dbMigrate{
    async start() {
        console.log('\n-----------------------------------\n'+process.env.APP_MODE+'\n-----------------------------------\n')
        console.log('\n-----------------------------------\nMigrate On Process\'\n-----------------------------------\n')
        await this.poDateSetTolNull()
    }
    poDateSetTolNull() {
        return new Promise((resolve, reject) => {
            sql = `UPDATE po_detail SET po_tanggal_dp = null WHERE po_tanggal_dp = '0000-00-00'`
            db.query(sql, async (err, result) => {
                if (err) return reject(err)
                console.log('\npoDateSetTolNull Complete\n')
                console.log(result)
                //return resolve(result)
                await this.collationChange()
            })
        })
    }
    collationChange() {
        return new Promise((resolve, reject) => {
            sql = "SET GLOBAL sql_mode = '';"
            sql = "SET collation_connection = 'utf8_general_ci';"
            sql += "ALTER DATABASE new_dpm CHARACTER SET utf8 COLLATE utf8_general_ci;"
            sql += "ALTER TABLE absensi CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;"
            sql += "ALTER TABLE `admin` CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;"
            sql += "ALTER TABLE apple CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;"
            sql += "ALTER TABLE assets CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;"
            sql += "ALTER TABLE chat CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;"
            sql += "ALTER TABLE developer CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;"
            sql += "ALTER TABLE dpm CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;"
            sql += "ALTER TABLE gallery CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;"
            sql += "ALTER TABLE item CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;"
            sql += "ALTER TABLE logistic CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;"
            sql += "ALTER TABLE mandor CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;"
            sql += "ALTER TABLE opname CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;"
            sql += "ALTER TABLE po_detail CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;"
            sql += "ALTER TABLE po_pembayaran CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;"
            sql += "ALTER TABLE project CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;"
            sql += "ALTER TABLE spk CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;"
            sql += "ALTER TABLE spk_data CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;"
            sql += "ALTER TABLE spk_transaksi CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;"
            sql += "ALTER TABLE supplier CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;"
            sql += "ALTER TABLE template CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;"
            sql += "ALTER TABLE test_upload CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;"
            sql += "ALTER TABLE unit CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;"
            sql += "ALTER TABLE user_project CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;"
            sql += "ALTER TABLE verification CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;"
            sql += "DELETE FROM po_detail WHERE dpm_id is NULL"
            db.query(sql, (err, result) => {
                if (err) return reject(err)
                for (let i = 0; i < result.length; i++) {
                    const delay = i * 100
                    setTimeout(() => {
                        console.log(`\n-----------------------\nProcessing : ${i + 1} FROM ${result.length}`)
                        console.log(result[i])
                        console.log(`-----------------------\nDone`)
                        if ((i + 1) == result.length) {
                            console.log('CLEAR MIGRATION')
                            process.exit()
                        }
                    }, delay)
                }
                return resolve(result)
            })
        })
    }
}

module.exports = dbMigrate
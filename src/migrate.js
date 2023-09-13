require('dotenv').config()
const migrate = require('../src/models/DBMIGRATE')
const migrasi = new migrate
migrasi.start()
const dotenv = require('dotenv');
dotenv.config();
const { Client } = require('pg')

const client = new Client({
  host: process.env.POSTGRESQL_DB_HOST,
  user: process.env.POSTGRESQL_DB_USER,
  password: process.env.POSTGRESQL_DB_PASSWORD,
  database: 'postgres', // 'gymkhana',
  port: 5432
})

if(!process.env.POSTGRESQL_DB_HOST) console.error('Error: Variables de entorno sin definir.')

client.connect()
.then(() => {
    console.log('connected')
    _db = client
})
.catch((err) => {
    console.error('Error connecting to database: %s', err.stack);
})

module.exports = client
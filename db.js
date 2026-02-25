const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '@S0L0M@KeenD@y29062010',
  database: 'myapp'
});

module.exports = pool.promise();
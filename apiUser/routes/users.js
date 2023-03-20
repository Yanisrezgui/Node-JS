var express = require('express');
var router = express.Router();
const knex = require('knex')

//connectiondb
let db = knex({
    client: 'mysql',
    connection: {
        host: process.env.MARIADB_HOST,
        port: 3308,
        user: process.env.MARIADB_USER,
        password: process.env.MARIADB_PASSWORD,
        database: process.env.MARIADB_DATABASE
    }
});

/* GET home page. */
router.get('/', function(req, res, next) {
    res.json("salut !");
});
  
module.exports = router;
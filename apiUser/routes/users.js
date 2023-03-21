var express = require('express');
var router = express.Router();
const knex = require('knex');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const randtoken = require('rand-token');

//connectiondb
let db = knex({
    client: 'mysql',
    connection: {
        host: process.env.MARIADB_HOST,
        port: 3306,
        user: process.env.MARIADB_USER,
        password: process.env.MARIADB_PASSWORD,
        database: process.env.MARIADB_DATABASE
    }
});

router.route('/signup')
    .post(async (req, res) => {
    let username = req.body.username;
    let email = req.body.email;
    let password = req.body.password;
  
    // Vérifier si l'utilisateur existe déjà
    const user = await db('client').where('mail_client', email ).first();
    if (user) {
      return res.status(409).json({ message: 'Cet utilisateur existe déjà' });
    } else {
        const refreshToken = randtoken.generate(16);

        // Insérer l'utilisateur dans la base de données
        await db('client').insert({
            nom_client: username,
            mail_client: email,
            passwd: bcrypt.hashSync(password, 10),
            refresh_token: refreshToken
        });
      
        res.status(201).json({refreshToken});
    }
});

router.route('/signin')
    .post(async (req, res) => {
        // Créer un access-token JWT
        const secret = process.env.accessToken;
    
        const payload = {
            user: username,
            role: 'user'
        }
    
        const options = {
            expiresIn: '1h'
        };
    
        const accessToken = jwt.sign(payload, secret, options);
      
        // Renvoyer l'access-token
        res.status(201).json({ 
            "access-token": accessToken,
            "refresh-token": refreshToken
        });
    })
  
module.exports = router;
var express = require('express');
var router = express.Router();
const knex = require('knex');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const randtoken = require('rand-token');

// Créer un access-token JWT
const secret = process.env.accessToken;

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
    
    const refreshToken = randtoken.generate(16);
    // Insérer l'utilisateur dans la base de données
    await db('client').insert({
        nom_client: username,
        mail_client: email,
        passwd: bcrypt.hashSync(password, 10),
        refresh_token: refreshToken
    });
    
    res.status(201).json({refreshToken});
});

router.route('/signin')
    .post(async (req, res) => {
        if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
            return res.status(401).json({ type: 'error', error: 401, message: 'no authorization header present' });
        } else {
            // Récupération des credentials dans le header Authorization
            const credentials = req.headers.authorization.split(' ')[1];
            const decodedCredentials = Buffer.from(credentials, 'base64').toString('ascii');
            const [username, password] = decodedCredentials.split(':');
    
            // Vérification des credentials avec la base de données
            const user = await db('client').where({mail_client: username.trim()}).first();

            const userPassword = bcrypt.compareSync(password, user.passwd);
            if (!userPassword) {
                return res.status(401).json({ type: 'error', error: 401, message: 'invalid credentials' });
            } else {
            
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
                    "refresh-token": user.refresh_token
                });
            }
        }
})

router.route('/validate').get((req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authorization header missing or invalid' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, secret);
        console.log(decoded)
        return res.status(200).json(decoded);
    } catch (error) {
        console.log(error)
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
});
  
module.exports = router;
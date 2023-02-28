var express = require('express');
var router = express.Router();
const knex = require('knex')


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

router.route('/')
    .get(async(req, res, next) => {
        try {
            const result = await db('commande');

            if (!result) {

                res.status(404).json({
                    "type": "error",
                    "error": 404,
                    "message": "ressource non disponible : /orders/" + req.params.id
                });
            } else {
                res.json(result);
            }
        } catch (error) {
            res.json({
                "type": "error",
                "error": 500,
                "message": "Erreur interne du serveur"
            })

        }

    })

router.route('/:id')
    .get(async(req, res, next) => {
        try {
            const result = await db('commande').where('id', req.params.id).first();

            if (!result) {

                res.status(404).json({
                    "type": "error",
                    "error": 404,
                    "message": "ressource non disponible : /orders/" + req.params.id
                });
            } else {
                res.json(result);
            }
        } catch (error) {
            res.json({
                "type": "error",
                "error": 500,
                "message": "Erreur interne du serveur"
            })

        }

    })

router.route('/modified/:id')
    .put(async(req, res, next) => {
        try {
            const result = await db('commande').where('id', req.params.id).update({ nom: req.body.nom, mail: req.body.email, livraison: new Date(req.body.livraison) });

            if (!result) {

                res.status(404).json({
                    "type": "error",
                    "error": 404,
                    "message": "ressource non disponible : /orders/" + req.params.id
                });
            } else {
                res.json(result);
            }
        } catch (error) {
            res.status(500).json({
                "type": "error",
                "error": 500,
                "message": "Erreur interne du serveur"
            })

        }

    })


router.route("*").all(async(req, res, next) => {

    res.status(405).json({
        "type": "error",
        "error": 405,
        "message": "la méthode contenue dans la requête reçue n'est pas" +
            "autorisée sur l 'uri indiquée ; cette uri est cependant valide ,"
    })
});

module.exports = router;
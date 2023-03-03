var express = require('express');
var router = express.Router();
const knex = require('knex');
const Joi = require('joi');


const nameSchema = Joi.string().alphanum().min(3).max(30).required();
const emailSchema = Joi.string().email().required();
const dateSchema = Joi.date().iso().required();
const uuidSchema = Joi.string().guid().required();





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

                let json = {
                    "type": "ressource",
                    "order": result,
                    "links": {
                        "items": "/orders/" + req.params.id + "/items",
                        "self": "/orders/" + req.params.id,
                    }
                }
                res.json(json);
            }
        } catch (error) {
            res.json({
                "type": "error",
                "error": 500,
                "message": "Erreur interne du serveur"
            })

        }

    })

router.route('/:id/items')
.get(async (req, res, next) => {
    try {
        const result = await db('item').where('command_id', req.params.id);
        if (!result) {
            res.status(404).json({
                "type": "error",
                "error": 404,
                "message": "ressource non disponible : /orders/" + req.params.id
            });
        } else {
            let jsonResult = {
                "type": "collection",
                "count": result.length,
                "items": result
            }

            res.json(jsonResult);
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

            //créer les schema de validation
            let name = nameSchema.validate(req.body.nom);
            let email = emailSchema.validate(req.body.email)
            let date = dateSchema.validate(req.body.livraison)
            let uuid = uuidSchema.validate(req.params.id)


            //regarde si les données du body sont conforme au schéma si non renvoie une erreur 404
            if (name.error != null) {
                res.status(404).json({
                    "type": "error",
                    "error": 404,
                    "message": "données non comforme : " + req.body.nom
                });
            } else if(email.error != null) {   
                res.status(404).json({
                    "type": "error",
                    "error": 404,
                    "message": "données non comforme : " + req.body.email
                });
            } else if (date.error != null){
                res.status(404).json({
                    "type": "error",
                    "error": 404,
                    "message": "données non comforme : " + req.body.livraison
                });
            // verifie l'id passé en paramètre si il est bien conforme au uuid 
            }else if (uuid.error != null){
                res.status(404).json({
                    "type": "error",
                    "error": 404,
                    "message": "ressource non disponible : /orders/" + req.params.id
                });
            } else {

                //requete put 
                const result = await db('commande').where('id', req.params.id).update({ nom: req.body.nom, mail: req.body.email, livraison: new Date(req.body.livraison) });

                //si pas de resultat erreur 404
                if (!result) {
                    res.status(404).json({
                        "type": "error",
                        "error": 404,
                        "message": "ressource non disponible : /orders/" + req.params.id
                    });
                } else {
                    res.json(result);
                }
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
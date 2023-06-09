var express = require('express');
var router = express.Router();
const knex = require('knex');
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid'); // importe la fonction uuid()

const nameSchema = Joi.string().alphanum().min(3).max(30).required();
const emailSchema = Joi.string().email().required();
const dateSchema = Joi.date().iso().greater('now').required();
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
    .get(async (req, res, next) => {
        try {
            const LIMIT = 10;
            let pageNumber = parseInt(req.query.page) || 1;
            if (pageNumber < 1) {
                pageNumber = 1;
            }
            const countResult = await db('commande').count('id as CNT').first();
            const totalCount = parseInt(countResult.CNT);
            const totalPages = Math.ceil(totalCount / LIMIT);
            if (pageNumber > totalPages) {
                pageNumber = totalPages;
            }
            const offset = (pageNumber - 1) * LIMIT;
            let query = db('commande').orderBy('livraison', 'desc').limit(LIMIT).offset(offset);
            if (req.query.c) {
                query = query.where('mail', 'like', `%${req.query.c}%`);
            }
            if (req.query.sort === 'amount') {
                query = query.orderBy('montant', 'desc');
            }
            const result = await query;
            if (!result) {
                res.status(404).json({
                    "type": "error",
                    "error": 404,
                    "message": "ressource non disponible : /orders/" + req.params.id
                });
            } else {
                const orderResult = result.map(order => {
                    return {
                        "order": {
                            "id": order.id,
                            "client_name": order.nom,
                            "order_date": order.created_at,
                            "delivery_date": order.livraison,
                            "status": order.status
                        },
                        "links": {
                            "self": { "href": "orders/" + order.id }
                        }
                    }
                });
                const jsonResult = {
                    "type": "collection",
                    "count": totalCount,
                    "size": result.length,
                    "links": {
                        "first": { "href": `/orders?page=1` },
                        "prev": pageNumber > 1 ? { "href": `/orders?page=${pageNumber - 1}` } : "aucune page disponible",
                        "next": pageNumber < totalPages ? { "href": `/orders?page=${pageNumber + 1}` } : "aucune page disponible",
                        "last": { "href": `/orders?page=${totalPages}` }
                    },
                    "orders": orderResult
                };
                res.json(jsonResult);
            }
        } catch (error) {
            res.json({
                "type": "error",
                "error": 500,
                "message": "Erreur interne du serveur"
            });
        }
    });

router.route('/:id')
    .get(async (req, res, next) => {
        try {
            const result = await db('commande').where('id', req.params.id).first();
            if (!result) {
                res.status(404).json({
                    "type": "error",
                    "error": 404,
                    "message": "ressource non disponible : /orders/" + req.params.id,
                });
            } else {
                if (req.query.embed === "items") {
                    const resultItem = await db('item').where('command_id', req.params.id);
                    result.items = resultItem;
                }

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
    .put(async (req, res, next) => {
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
            } else if (email.error != null) {
                res.status(404).json({
                    "type": "error",
                    "error": 404,
                    "message": "données non comforme : " + req.body.email
                });
            } else if (date.error != null) {
                res.status(404).json({
                    "type": "error",
                    "error": 404,
                    "message": "données non comforme : " + req.body.livraison
                });
                // verifie l'id passé en paramètre si il est bien conforme au uuid 
            } else if (uuid.error != null) {
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

router.route('/')
    .post(async (req, res, next) => {
        try {
            const id = uuidv4();
            await db('commande').insert({
                id: id,
                nom: req.body.client_name,
                mail: req.body.client_mail,
                created_at: new Date(),
                livraison: new Date(req.body.delivery.date + " " + req.body.delivery.time)
            })
            const itemData = req.body.items.map(item => {
                return {
                    uri: item.uri,
                    libelle: item.name,
                    tarif: item.price,
                    quantite: item.q,
                    command_id: id
                }
            })
            await db('item').insert(itemData)
                .then(() => {
                    let total = 0;
                    req.body.items.forEach(item => {
                        total += item.q * item.price;
                    });

                    let json = {
                        "order": {
                            "client_name": req.body.client_name,
                            "client_mail": req.body.client_mail,
                            "delivery_date": req.body.delivery.date + " " + req.body.delivery.time,
                            "id": id,
                            "total_amount": total
                        },
                    }
                    res.location('/orders/' + id)
                    res.status(201).json(json);
                }).catch((err) => {
                    res.json(err);
                })
        } catch (error) {
            res.status(500).json({
                "type": "error",
                "error": 500,
                "message": "Erreur interne du serveur"
            })
        }
    })

router.route("*").all(async (req, res, next) => {

    res.status(405).json({
        "type": "error",
        "error": 405,
        "message": "la méthode contenue dans la requête reçue n'est pas" +
            "autorisée sur l 'uri indiquée ; cette uri est cependant valide ,"
    })
});

module.exports = router;
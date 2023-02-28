const express = require('express');
const router = express.Router();
const ordersDB = require('../connection');

/* GET home page. */
router.get('/', async (req, res, next) => {
    try {
        const tasks = await ordersDB('commande');
        res.json({ data: tasks });
    } catch (error) {
        console.error(error);
        next(error);
    }
});

router.post('/', async (req, res, next) => {
    try {
        const { content, user_id } = req.body;
        await ordersDB('cammande').insert({ content, user_id });
        res.sendStatus(201);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        const commande = await ordersDB('commande').where('id', req.params.id).first()
        if (!commande) {
            res.status(404).json({
                code: '404',
                type: 'error',
                message: `Order with id : ${req.params.id} not found`
            });
        } else {
            res.json({data: commande});
        }
    } catch (error) {
        console.error(error)
        next(error);
    }
});

module.exports = router;

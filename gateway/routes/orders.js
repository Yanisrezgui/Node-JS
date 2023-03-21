var express = require('express');
var router = express.Router();
const axios = require('axios');

/* GATEWAY */

/* GET orders page. */
router.route('/')
    .get(async (req, res, next) => {
        try {
            const response = await axios.get('http://api:3000/orders');
            res.json(response.data);
        } catch (error) {
            console.error(error);
            next(error);
        }
}); 

/* GET a order by his ID. */
router.route('/:id')
    .get(async (req, res, next) => {
        try {
            const response = await axios.get('http://api:3000/orders/' + req.params.id);
            res.json(response.data);
        } catch (error) {
            console.error(error);
            next(error);
        }
}); 

/* GET all the items of an order */
router.route('/:id/items')
    .get(async (req, res, next) => {
        try {
            const response = await axios.get('http://api:3000/orders/' + req.params.id + '/items');
            res.json(response.data);
        } catch (error) {
            console.error(error);
            next(error);
        }
}); 
    
module.exports = router;

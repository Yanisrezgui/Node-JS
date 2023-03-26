var express = require('express');
var router = express.Router();
const axios = require('axios');
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid'); // importe la fonction uuid()


const nameSchema = Joi.string().alphanum().min(3).max(30).required();
const emailSchema = Joi.string().email().required();
const dateSchema = Joi.date().iso().greater('now').required();

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
    

/* POST create order */
router.post('/', async function (req, res, next) {
  // controle et validation token JWT
  try {
    const response = await fetch('http://apiUser:3000/users/validate', { headers: { 'Authorization': `${req.headers.authorization}` } });
    if (response.status == 401) {
      return res.status(401).json({
        "type": "error",
        "error": 401,
        "message": "invalid credentials"
      });
    } else {
      const data = await response.json(); // Attendre que la promesse soit résolue
      let json = { "client_mail": data.email, "client_name": data.user, "delivery": req.body.delivery, "items": req.body.items }
      const create = await fetch('http://api:3000/orders', { method: 'POST', body: JSON.stringify(json), headers: { 'Content-Type': 'application/json' } })
      if (create.status == 201 || create.status == 200) {

        const d = await create.json()
        let loc = create.headers.get('location')

        res.location(loc)
        res.status(201).json(d);
      } else {
        console.log(create)
        res.status(400).json({
          "type": "error",
          "error": 400,
          "message": "bad request"
        })
      }
    }
  } catch (error) {
    console.error(error)
    next(error)
  }
});

module.exports = router;

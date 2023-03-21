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
    



/* GET users listing. */
router.post('/', function (req, res, next) {



  // controle et validation token JWT

  fetch('http://localhost:3330/users/validate', {headers: {'Authorization': `Bearer ${req.headers.authorization}`}})
  .then(res => res.json())
  .then(data => res.json(data))


  //validation des données de la commande

  // let name = nameSchema.validate(req.body.order.name);
  // let email = emailSchema.validate(req.body.order.email);
  // let date = dateSchema.validate(req.body.order.date);
  // const id = uuidv4();


  // if (name.error != null) {
  //   res.status(404).json({
  //     "type": "error",
  //     "error": 404,
  //     "message": "données non comformes : " + req.body.order.name
  //   });
  // } else if (email.error != null) {
  //   res.status(404).json({
  //     "type": "error",
  //     "error": 404,
  //     "message": "données non comformes : " + req.body.order.email
  //   });
  // } else if (date.error != null) {
  //   res.status(404).json({
  //     "type": "error",
  //     "error": 404,
  //     "message": "données non comformes : " + req.body.order.date
  //   });
  // }

  //Faire un POST avec les données du body vsers /oders et c'est lui qui traite le système
  // let json = {
  //   "order": {
  //     "id": id,
  //     "client_name": name,
  //     "order_date": Date(),
  //     "delivery_date": date,
  //     "status": 3
  //   }, 
  //   "links": { 
  //     "self": { 
  //       "href": "orders/"+id } }
  // }
});

module.exports = router;

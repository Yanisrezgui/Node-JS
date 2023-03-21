var express = require('express');
var router = express.Router();
const axios = require('axios');

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
    
module.exports = router;

var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', (req, res, next) => {
    console.log(req.query);
    console.log(req.params);
    console.log(req.body);

    res.json([]);
});

router.post('/', (req, res, next) => {
    console.log(req.query);
    console.log(req.params);
    console.log(req.body);

    res.json(req.body);
});

module.exports = router;

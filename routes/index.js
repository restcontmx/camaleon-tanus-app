var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/favicon.ico', function(req, res) {
    res.send(204);
});

module.exports = router;

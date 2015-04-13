/**
 * Created by pin on 4/13/15.
 */
var router = require('express').Router();

/* GET home page */
router.get('/', function(req, res, next){
    res.sendfile('index.html');
});

module.exports = router;
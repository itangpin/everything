var express = require('express');
var router = express.Router();
var User = require('../models/user');

/* GET users listing. */
router.post('/register', function(req, res, next) {
    var name = req.body.name,
        email = req.body.email,
        password = req.body.password;
    // new user
    var user =  new User({email: email, name: name, password: password});
    user.save(function(err){
        if(err){
            console.log(err);
        }else{
            res.send('success');
        }
    });
});

route

module.exports = router;

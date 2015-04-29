var express = require('express');
var router = express.Router();
var User = require('../models/user');
var passport = require('passport');

/* register new user */
router.post('/', function(req, res, next) {
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

/* sign in */
router.post('/in', function(req, res, next){
    passport.authenticate('local', function(err,user,info){
        if(err){return next(err);}
        if (!user) {
            req.session.messages =  [info.message];
            console.log(info.message);
            return res.send({status: 401, message: 'wrong password'});
        }
        req.logIn(user, function(err) {
            if (err) { return next(err); }
            return res.send({status:200});
        });
    })(req, res, next);
});

router.get('/status', function(req, res, next){
    if(req.isAuthenticated()){
        res.send({status:200});
    }else{
        res.send({status:401});
    }
});

module.exports = router;

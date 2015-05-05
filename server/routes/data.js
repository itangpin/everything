/**
 * Created by pin on 5/4/15.
 */
var express = require('express')
var router = express.Router()
var Data = require('../models/data')
var passport = require('passport')

var ensureAuthenticated = function(req, res, next){
    if(req.isAuthenticated()){
        return next()
    }else{
        res.send({status:401,message:'SIGN_IN_REQUESTED'})
    }
}
router.post('/replaceall', ensureAuthenticated, function(req, res, next){
    Data.findOne({'userid':req.user.id}, function(err, data){
        if(data){
            data.data = req.body.data
            data.save(function(err){
                if(err){
                    res.send(err.message)
                }else{
                    res.send({status: 200})
                }
            })
        }else{
            var newData = new Data({userid: req.user.id, data: req.body.data})
            newData.save(function(err){
                if(err){
                    res.send(err)
                }else{
                    res.send({status:200})
                }
            })
        }
    })

})


module.exports = router

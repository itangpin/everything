var express = require('express');
var router = express.Router();
var Promise = require('bluebird');
var Mongo = require('mongodb');
Promise.promisifyAll(Mongo.MongoClient);
var MongoClient = Mongo.MongoClient;

var url = 'mongodb://localhost:27017/everything';

/* GET home page. */
router.get('/', function (req, res, next) {
    //res.send('hello');
    res.render('index', {title: 'Express'});
});
router.get('/test', function (req, res, next) {
    var connect = MongoClient.connectAsync(url);
    connect.then(function (db) {
        console.log('hello');
        var collection = db.collection('lists');
        collection.insert({
            name: 'tangpni'
        }, function (err, result) {
            res.send(result);
        });
    });
});

module.exports = router;

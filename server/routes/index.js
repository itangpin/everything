var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/everything';

/* GET home page. */
router.get('/', function(req, res, next) {
  //res.send('hello');
  res.render('index', { title: 'Express' });
});
router.get('/test', function(req, res, next){
  MongoClient.connect(url, function(err,db){
    if(err){
      res.send(err);
    }else{
      var collection = db.collection('lists');
      collection.insert({
        name:'tangpni'
      },function(err,result){
        res.send(result);
      });
      //res.send('connect success');
    }
  });
});

module.exports = router;

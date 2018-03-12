module.exports = function(){
    var express = require('express');
    var route = express.Router();
    var redis = require('redis');

    var store = redis.createClient({host:'localhost', port: 6379});

    route.post('/', function(req, res){
        var id = req.body.id;
        
        store.exists('user:'+id, function(err, results){
            console.log(results);
            if(results){
                res.send({result:true, check:'중복된 아이디입니다.'});
            }
            else {
                res.send({result:false, check:'사용 가능한 아이디입니다.'});
            }
        });

    });
    return route;
}
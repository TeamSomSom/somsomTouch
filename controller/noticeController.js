/**************************** Notice Controller ****************************/

var express = require('express'), 
    express = require('express'), 
    redis = require('redis');

var store = redis.createClient({host:'localhost', port: 6379});
var app = express();


/*********************************************************************** 
 *                             Notice Create					   
*************************************************************************/

var id = 0;
exports.create = function(req, res) {
    console.log('/notice/create 호출됨.');

    
    var notice = {
        id: ++id,
        title: req.body.title,
        content: req.body.content,
        category: req.body.notice_cate,
        date:new Date().toISOString().substring(0, 10)
    };

    console.log('title : ' + title + ', content : ' + content + ', date : ' + date + ', category : ' + category);
    store.hmset('notice:'+ notice.id, 'title', notice.title, 'content', notice.content, 'category', notice.category, 'date', notice.date);

    res.redirect('/notice');

};

/*********************************************************************** 
 *                             Notice Read					   
*************************************************************************/

exports.read = function(req, res){
    console.log('/notice/read 처리함');

    // var id = req.body.noticeId;
    var id = 1;
    store.hgetall('notice:'+ id, function(err, results) {
		if(results !=null){
			var notice = {
                id: id,
                title: results.title,
                content: results.content,
                category: results.category,
                date: new Date().toISOString().substring(0, 10)
            };
        }
        console.log('Notice Read= id: ' + notice.id + ', title: ' + notice.title + ', content: ' + notice.content + ', date: ' + notice.date + ', category: ' + notice.category);
        res.render('notice');
    });
};

/*********************************************************************** 
 *                             Notice Create					   
*************************************************************************/

var id = 0;
exports.create = function(req, res) {
    console.log('/notice/create 호출됨.');

    var notice = {
        id: ++id,
        title: req.body.title,
        content: req.body.content,
        category: req.body.notice_cate,
        date:new Date().toISOString().substring(0, 10)
    };

    console.log('title : ' + notice.title + ', content : ' + notice.content + ', date : ' + notice.date + ', category : ' + notice.category);    store.hmset('notice:'+ notice.id, 'title', notice.title, 'content', notice.content, 'category', notice.category, 'date', notice.date);
    res.redirect('/notice');
};

/*********************************************************************** 
 *                             Notice Update					   
*************************************************************************/

exports.update = function(req, res){
    console.log('/notice/update 처리함');


    var notice = {
        id: ++id,
        title: req.body.title,
        content: req.body.content,
        category: req.body.notice_cate,
        date:new Date().toISOString().substring(0, 10)
    };
    console.log('title : ' + title + ', content : ' + content + ', date : ' + date + ', category : ' + category);
    store.hmset('notice:'+ notice.id, 'title', notice.title, 'content', notice.content, 'category', notice.category, 'date', notice.date);

    res.redirect('/notice');


};


/*********************************************************************** 
 *                             Notice Delete					   
*************************************************************************/

// 자기가 쓴 글 만 지울 수 있도록 -> 생각해보니까 공지글이니까..관리자만 권한 주면 될 것 같음
exports.delete = function(req, res){
    console.log('/notice/delete 처리함');
    var userId = req.user.username;
    var postId = req.body.postId;

    store.del('notice:'+ postId, function(req, res){
        res.redirect('../notice.html');
    });
    res.redirect('/notice');
};
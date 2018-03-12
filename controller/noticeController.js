/**************************** Notice Controller ****************************/

var express = require('express'), 
    redis = require('redis');

var store = redis.createClient();


/*********************************************************************** 
 *                             Notice Create					   
*************************************************************************/

var id = 0;
exports.create = function(req, res) {
    console.log('/notice/create 호출됨.');

    var title = req.body.title;
    var content = req.body.content;
    var date = new Date().toISOString().substring(0, 10);
    var category = req.body.notice_cate;

    console.log('title : ' + title + ', content : ' + content + ', date : ' + date + ', category : ' + category);
    res.redirect('/notice.html');
};


/*********************************************************************** 
 *                             Notice Read					   
*************************************************************************/

exports.read = function(req, res){
    console.log('/notice/read 처리함');

};


/*********************************************************************** 
 *                             Notice Update					   
*************************************************************************/

exports.update = function(req, res){
    console.log('/notice/update 처리함');

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
};


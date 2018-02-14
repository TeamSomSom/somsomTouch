//server.js
var path = require('path');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));
app.use(cookieParser());

var session = require('express-session');
app.use(session({
    secret: 'secret key',
    resave: false,
    saveUninitialized: true,
}));

//##for redis connection
var expect = require('chai').expect,
    request = require('request'),
    redis = require('redis'),
    client = redis.createClient();
//##end of redis connection

app.use(express.static(path.join(__dirname, 'public')));

app.get('/',function(req, res){
    //res.sendFile(__dirname + '/client.html');
    fs.readFile('./public/lobby.html', 'utf-8', function(err, data){
        res.send(data.toString());
    });
});

app.get('/chat/:room', function(req, res){
    console.log('req.params.room=%s', req.params.room);
    res.render('client.ejs',{room: req.params.room});
});

app.get('/room',function(req, res){
    console.log('io.sockets.adapter.rooms=%j', io.sockets.adapter.rooms);
    var rooms = Object.keys(io.sockets.adapter.rooms).filter(function(item){
        return item.indexOf('/') < 0;
    });
    console.log("rooms:%s", rooms);
    res.send(rooms);
});

var count=1;

/*
io.on(이벤트, 함수)
이벤트 발생시 함수 실행 --> 이벤트 리스너
*/

//사용자가 사이트에 접속하면 socket.io에 의해 connection이벤트가 자동으로 발생
io.on('connection', function(socket){
    //id = socket.id
    console.log('user connected: ', socket.id);

    var name = "user" + count++;
    io.to(socket.id).emit('change name', name);

    socket.on('disconnect', function(){
        console.log('user disconnected: ', socket.id);
    });

    socket.on('send message', function(name, text){
        
        var msg = name+':'+text;
        console.log(msg);
        io.emit('receive message', msg);
        // public 통신
        //io.sockets.emit('receive message', msg);
        // broadcast 통신
        //socket.broadcast.emit(receive message, msg);   
        // private 통신
        //io.sockets.to(id).emit(receive message, msg);
    });

    socket.on('create_room', function (data) {
        io.sockets.emit('create_room', data.toString());
    });
});

http.listen(3030, function(){
    console.log('server is running at port number 3030');
});
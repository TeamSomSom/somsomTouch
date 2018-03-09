//모듈을 추출한다.
var socketio = require('socket.io');
var express = require('express');
var http = require('http');
var ejs = require('ejs');
var fs = require('fs');

//웹 서버를 생성
var app = express();
app.use(express.static('public')); //public 폴더 안 파일을 제공하고자 static 미들웨어 사용

//웹 서버를 실행
var server = http.createServer(app);
server.listen(52273);

//라우트 수행
//기본페이지는 lobby.html로 설정
app.get('/', function (req, res) {
    fs.readFile('./public/canvas_lobby.html', function (error, data) {
        res.send(data.toString());
    });
});
//방 번호를 가져와 그 번호를 가진 방에 사용자를 접속시킨다
app.get('/canvas/:room', function (req, res) {
    fs.readFile('./public/canvas.html', 'utf8', function (error, data) {
        res.send(ejs.render(data, { //ejs모듈을 사용해 요청 URL의 마지막에 위치하는 정보를 전달한 것
            room: req.params.room
        }));
    });
});
//room페이지는 방을 JSON파일로 제공하기 위한 페이지
app.get('/room', function (req, res) {
    var rooms = Object.keys(io.sockets.adapter.rooms).filter(function (item) {
        return item.indexOf('/') < 0;
    })
    res.send(rooms);
});




//소켓 서버를 생성
var io = socketio.listen(server);
io.on('connection', function (socket) {
    var roomId = "";
    //join : 특정한 방에 사용자를 접속하게 할 이벤트
    socket.on('join', function (data) {
        socket.join(data);
        roomId = data;
    });
    //draw : 사용자가 캔버스 위에 그림을 그릴 때 마우스 좌표를 전달할 수 있는 이벤트
    socket.on('draw', function (data) {
        io.in(roomId).emit('line', data);
    });
    //create_room : 방을 생성하는 이벤트
    socket.on('create_room', function (data) {
        io.emit('create_room', data.toString());
    });
});
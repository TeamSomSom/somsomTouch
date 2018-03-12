//server.js
var path = require('path');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var ejs = require('ejs');

//레디스 사용
var redis = require('redis');
var store = redis.createClient({host:'localhost', port: 6379});

app.set('view engine', 'ejs');

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

app.use(express.static(__dirname));

app.get('/',function(req, res){
    //res.sendFile(__dirname + '/client.html');
    fs.readFile('../public/lobby.html', 'utf-8', function(err, data){
        res.send(data.toString());
    });
});

var roomName = null;

app.get('/chat/:room', function(req, res){
    console.log('req.params.room=%s', req.params.room);
    fs.readFile('../views/chatRoom.ejs','utf8',function(err, data){
        res.send(ejs.render(data,{
            room: req.params.room
        }));
    });
});

app.get('/room',function(req, res){
    console.log('io.sockets.adapter.rooms=%j', io.sockets.adapter.rooms);
    var rooms = Object.keys(io.sockets.adapter.rooms).filter(function(item){
        return item.indexOf('/') < 0;
    });
    console.log("rooms:%s", rooms);
    res.send(rooms);
});

/*
io.on(이벤트, 함수)
이벤트 발생시 함수 실행 --> 이벤트 리스너
*/
var count = 1;
//사용자가 사이트에 접속하면 socket.io에 의해 connection이벤트가 자동으로 발생
io.on('connection', function(socket){
    //id를 설정한다
    id = socket.id
    console.log('user connected: ', id);
    //방이름을 저장할 변수
    roomName = null;

    var name = "user" + count++;
    io.to(socket.id).emit('change name', name);

    //방을 생성한다
    socket.on('create room', function(data){
        roomName = data.toString();
        io.sockets.emit('create_room', roomName);
    });

    //방을join
    socket.on('join', function(data){
        roomName = data;
        socket.join(roomName);
        console.log('socket.rooms:%j', socket.rooms);
    });

    //draw : 사용자가 캔버스 위에 그림을 그릴 때 마우스 좌표를 전달할 수 있는 이벤트
    socket.on('draw', function (data) {
        io.in(roomName).emit('line', data);
    });
<<<<<<< HEAD
});

// FUNCTIONS

// 0 
// User contructor
function User(username,peers,ip,port,socket){
    this.username = username; 
    this.peers = peers;         // peers : ['John','Ben','Mike]  (max of 4)
    this.ip = ip;               // IP address used to ban user if necessary and for P2P comm.
    this.port = port;
    this.socket = socket;   
    // this.status = status; 
    // this.banned = banned  
}

// 1
// return up to 10 of the last users to sign in in an array 
function getMostRecentUsers(){
        var newest_users = [];
          
        for (var i= online_users.length - 1; i >= 0 && i > online_users.length -12; i--){
            newest_users.push(online_users[i]); 
        }
        return newest_users;
}

// 2  
// return the first 10 online users found that match the prefix provided 

// FIXME make search case insensitive  

// TODO: with a large number of online users, a more efficient search algorithm would be:
// 1. sort array
// 2. find first and last matching element
// 3. get slice of array from first to last match
// or even fancier, store online users in a prefix tree  

function findOnlineUsers(query,user){ 
    var matching_users = []
    var string_length = query.length;
    
    for (var i=0; i < online_users.length; i++){
      
        if (online_users[i].substring(0,string_length) === query && online_users[i] !== user){
            matching_users.push(online_users[i]);
        }
        if (matching_users.length === 10) break;
    }
    return matching_users; 
}

// 3
// sets up a new, private chat between two users
function setupPrivateChat(user1,user2){
    
    // unplugg both users from their current  
    // TODO make sure that these execute asynchronously (don't go onward before their completion)
    leaveCurrentChat(user1);  
    leaveCurrentChat(user2);

    // subscribe them to each other
    dir[user1].peers = [user2];
    dir[user2].peers = [user1]; // because: user === dict[invited]
}

// 4 
// "unplugg" a user 
// --> notifies current peers that user has left their conversation
// --> unsubscribe user from each peer's list of subscribers 
// --> clear user's list of peers/subscribers

function leaveCurrentChat(username){
    
    // prepare notification message
    var msg = {};
    msg['from'] = 'SERVER';
    msg['content'] = username + ' left this conversation';
    
    var peers = dir[username].peers;

    for(var i = 0; i < peers.length; i++){
        
        // unconnect user and peer
        // note: dir[peers[i]] => user object corresponding to this peer
        var j = dir[peers[i]].peers.indexOf(username);  
        dir[peers[i]].peers.splice(j,1);
=======
>>>>>>> master

    //특정chatroom으로 보내는 message이벤트
    socket.on('send message',function(data){
        console.log('%s 채팅방으로 메세지를 전송한다.', data.rndata);
        var msg = data.name + " : " + data.message;
        console.log('메세지가 어떻게 나오나 체크해보자', msg);
        io.sockets.in(data.rndata).emit('receive message', msg);
    });

    socket.on('disconnect', function(){
        console.log('user disconnected: ', socket.id);
    });
    
});


http.listen(3030, function(){
    console.log('server is running at port number 3030');
});
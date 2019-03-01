const express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var chatLog = [];
var chatLogTime = [];

app.use(express.static('public'));

io.on('connection', function(socket){
    socket.on('chat message', function(msg){
        //TODO: identify user, if is new user
            //TODO: generate nickname
            //TODO: send nickname to the user
            //TODO: update user list
        //TODO: check msg for name changing and color changing
        if(msg.trim().length === 0) return;
        let timestamp = Date.now();  // get the timestamp when received new msg
        io.emit('chat message', timestamp, msg);
        console.log(timestamp);
        chatLog.push(msg);
        chatLogTime.push(timestamp);
    })
    socket.on('disconnect', function (){
        console.log('user disconnected');
    });
})

http.listen(3000, function(){
    console.log('listening on *:3000');
});

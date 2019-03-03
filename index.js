const express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var totalUserCount = 0;
var users = [];

app.use(express.static('public'));

io.on('connection', function(socket){

    // New User
    totalUserCount ++;
    let nickname = "User#" + totalUserCount.toString();
    let rdmcolor = "hsl(" + (totalUserCount * 47 % 360) + ",100%,50%)"
    users.push({
        username: nickname,
        color: rdmcolor,
        id: socket.id
    });
    console.log(nickname + " has connected");
    socket.emit('assign nickname', {username: nickname, color: rdmcolor});
    io.emit('update user list', users);
    //TODO: send chat log to new user

    // Server received new message from clients
    socket.on('chat message', function(data){
        //TODO: check msg for name changing and color changing
        if(data.trim().length === 0) return; // Don't send empty msg
        let timestamp = Date.now();  // get the timestamp when received new msg
        io.emit('new message', {time: timestamp, msg: data});
    })
    socket.on('disconnect', function (){
        // Loop through the user list to match socket id
        for(i=0; i<users.length; i++){
            if(users[i].id === socket.id){
                console.log(users[i].username + ' has disconnected');
                users.splice(i, 1);
                break;
            }
        }
        io.emit('update user list', users);
    });
})

http.listen(3000, function(){
    console.log('listening on *:3000');
});

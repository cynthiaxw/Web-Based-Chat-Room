const express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var totalUserCount = 0;
var users = [];
var chatLog = [];

app.use(express.static('public'));

function findUserBySocket(socketid) {
    for(i=0; i<users.length; i++){
        if(users[i].id === socketid){
            return i;
        }
    }
    return -1;
}

function isUniqueName(name) {
    for(i=0; i<users.length; i++){
        if(name === users[i].username){
            return false;
        }
    }
    return true;
}

io.on('connection', function(socket) {

    // New User
    let rdmcolor = "hsl(" + (totalUserCount * 77 % 360) + ",100%,50%)";
    totalUserCount ++;
    let nickname = "User#" + totalUserCount.toString();
    users.push({
        username: nickname,
        color: rdmcolor,
        id: socket.id
    });
    console.log(nickname + " has connected");
    socket.emit('assign nickname', {username: nickname, color: rdmcolor});
    io.emit('update user list', users);
    // Send chat log to new user
    socket.emit('new chatLog', chatLog);

    // Server received new message from clients
    socket.on('chat message', function(data){
        if(data.trim().length === 0) return; // Don't send empty msg
        let timestamp = Date.now();  // get the timestamp when received new msg
        let user_index = findUserBySocket(socket.id);
        let user = users[user_index];

        // Check if it's /nick or /nickcolor
        let command = data.split(" ");
        if(command.length === 2 && command[0] === "/nick"){
            if(command[1].trim().length === 0){ // Invalid empty name
                socket.emit('command reply', "[Error] Invalid nickname: nickname cannot be empty.");
                return;
            }
            // Check if the new name is unique
            if(!isUniqueName(command[1])){
                socket.emit('command reply', "[Error] Invalid nickname: not unique.");
                return;
            }
            // Change the name
            let oldname = users[user_index].username;
            users[user_index].username = command[1];
            socket.emit('assign nickname', {username: command[1], color: users[user_index].color});
            // Update user list
            io.emit('update user list', users);
            // Update chatLog
            for(i=0; i<chatLog.length; i++){
                if(chatLog[i].username === oldname){
                    chatLog[i].username = command[1];
                    console.log(i);
                }
            }
            io.emit('update chatLog', chatLog);
            // Emit success message
            socket.emit('command reply', "[Done] Successfully changed nickname.");
        }else if(command.length === 2 && command[0] === "/nickcolor"){
            if(parseInt("0x" + command[1]) > 0xFFFFFF){
                socket.emit('command reply', "[Error] Invalid Hex code: color should be RRGGBB.");
                return;
            }
            socket.emit('command reply', "[Done] Successfully changed color.");
        }else{
            let msgWrap = {
                time: timestamp,
                msg: data,
                username: user.username,
                color: user.color
            };
            chatLog.push(msgWrap);
            io.emit('new message', msgWrap);
        }
    });

    // User disconnected
    socket.on('disconnect', function (){
        let index = findUserBySocket(socket.id);
        if(index !== -1){
            console.log(users[i].username + ' has disconnected');
            users.splice(i, 1);
            io.emit('update user list', users);
        }
    });
});

http.listen(3000, function(){
    console.log('listening on *:3000');
});

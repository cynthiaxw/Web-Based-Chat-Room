const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var totalUserCount = 0;
var users = []; // Online users
var allUsers = [];  // All users
var chatLog = [];
var serverRestart = true;
var cookieSet = false;

app.use(express.static('public'));
app.use(cookieParser());

function findUserBySocket(socketid) {
    for(i=0; i<users.length; i++){
        if(users[i].id === socketid){
            return i;
        }
    }
    return -1;
}

function findUserByName(name) {
    for(i=0; i<users.length; i++) {
        if(users[i].username === name) {
            return i;
        }
    }
    return -1;
}

function isUniqueName(name) {
    for(i=0; i<allUsers.length; i++){
        if(name === allUsers[i].username){
            return false;
        }
    }
    return true;
}

function createNewUserOnSocket(socket){
    let new_key = Math.floor(Math.random() *10000) + 1;
    socket.emit('set cookie', new_key);

    // Assign color and name
    let rdmcolor = "hsl(" + (totalUserCount * 77 % 360) + ",100%,50%)";
    totalUserCount ++;
    let nickname = "User#" + totalUserCount.toString();
    new_user = {
        username: nickname,
        color: rdmcolor,
        id: null
    };
    userCookies.push({
        cookie: new_key,
        user: new_user
    });

    new_user.id = socket.id;
    users.push(new_user);
    console.log(new_user.username + " has connected");
    socket.emit('assign nickname', {username: new_user.username, color: new_user.color});
    io.emit('update user list', users);
}

function updateAllUserByName(oldName, newName){
    for(i=0; i<allUsers.length; i++){
        if(allUsers[i].username === oldName){
            allUsers[i].username = newName;
            return;
        }
    }
}

function updateAllUserByColor(name, newColor){
    for(i=0; i<allUsers.length; i++){
        if(allUsers[i].username = name){
            allUsers[i].color = newColor;
            return;
        }
    }
}

io.on('connection', function(socket) {  // A new connection to the server

    var new_user = {};
    socket.on('get cookie', function(username, color, fn){
        // if(serverRestart){ // if the server restarts (which means there's nothing in the
        //     // Assign color and name
        //     let rdmcolor = "hsl(" + (totalUserCount * 77 % 360) + ",100%,50%)";
        //     new_user.color = rdmcolor;
        //     totalUserCount ++;
        //     let nickname = "User#" + totalUserCount.toString();
        //     new_user.username = nickname;
        //     console.log("Server Restart");
        //     serverRestart = false;
        // }else{
            // Check the cookie from client
            if(!username){ // create a new user name
                // Assign color and name
                let rdmcolor = "hsl(" + (totalUserCount * 77 % 360) + ",100%,50%)";
                new_user.color = rdmcolor;
                totalUserCount ++;
                let nickname = "User#" + totalUserCount.toString();
                new_user.username = nickname;
                // console.log("userCookie undefined.");
            }else {
                new_user.username = username;
                new_user.color = color;
            }
        // }

        fn({n: new_user.username, c: new_user.color});
        new_user.id = socket.id;
        users.push(new_user);
        allUsers.push(new_user);
        console.log(new_user.username + " has connected");
        socket.emit('assign nickname', {username: new_user.username, color: new_user.color});
        io.emit('update user list', users);

        // Send chat log to new user
        socket.emit('new chatLog', chatLog);
    });


    // Server received new message from clients
    socket.on('chat message', function (data) {
        if (data.msg.trim().length === 0) return; // Don't send empty msg
        let timestamp = Date.now();  // get the timestamp when received new msg
        //let user_index = findUserBySocket(socket.id);
        let user_index = findUserByName(data.username);
        let user = users[user_index];

        // Check if it's /nick or /nickcolor
        let command = data.msg.split(" ");
        if (command.length === 2 && command[0] === "/nick") {
            if (command[1].trim().length === 0) { // Invalid empty name
                socket.emit('command reply', {time: timestamp, msg: "[Error] Nickname cannot be empty."});
                return;
            }
            // Check if the new name is unique
            if (!isUniqueName(command[1])) {
                socket.emit('command reply', {
                    time: timestamp,
                    msg: "[Error] Nickname \"" + command[1] + "has been taken."
                });
                return;
            }
            // Change the name
            let oldname = users[user_index].username;
            users[user_index].username = command[1];
            socket.emit('assign nickname', {username: command[1], color: users[user_index].color});
            // Update user list
            io.emit('update user list', users);
            // Update allUser[]
            updateAllUserByName(oldname, command[1]);
            // Update chatLog
            for (i = 0; i < chatLog.length; i++) {
                if (chatLog[i].username === oldname) {
                    chatLog[i].username = command[1];
                }
            }
            io.emit('update chatLog', chatLog);
            // Emit success message
            socket.emit('command reply', {time: timestamp, msg: "[Done] Successfully changed nickname."});
        } else if (command.length === 2 && command[0] === "/nickcolor") {
            if (command[1].length !== 6 || parseInt("0x" + command[1]) > 0xFFFFFF) {
                socket.emit('command reply', {
                    time: timestamp,
                    msg: "[Error] Invalid Hex code. Color should be RRGGBB."
                });
                return;
            }
            // Change the color
            let newColor = "#" + command[1];
            users[user_index].color = newColor;
            socket.emit('assign nickname', {username: user.username, color: newColor});
            // Update user list
            io.emit('update user list', users);
            // Update allUser[]
            updateAllUserByColor(user.name, newColor);
            // Update chatLog
            for (i = 0; i < chatLog.length; i++) {
                if (chatLog[i].username === user.username) {
                    chatLog[i].color = newColor;
                    console.log(i);
                }
            }
            io.emit('update chatLog', chatLog);
            // Emit success message
            socket.emit('command reply', {time: timestamp, msg: "[Done] Successfully changed color."});
        } else {   // regular message
            let msgWrap = {
                time: timestamp,
                msg: data.msg,
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
            console.log(users[index].username + ' has disconnected');
            users.splice(index, 1);
            io.emit('update user list', users);
        }
    });
});

http.listen(3000, function(){
    console.log('listening on *:3000');
});

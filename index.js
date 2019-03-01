const express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static('public'));

io.on('connection', function(socket){
    socket.on('chat message', function(msg){
        let timestamp = Date.now();  // get the timestamp when received new msg
        io.emit('chat message', timestamp, msg);
        console.log(timestamp);
    })
    socket.on('disconnect', function (){
        console.log('user disconnected');
    });
})

http.listen(3000, function(){
    console.log('listening on *:3000');
});

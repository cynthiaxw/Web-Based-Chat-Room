$(function () {
    let socket = io();
    let nickname = "default";
    let $chatHistory =  $('#chat-history');
    let $onlineUsers = $('#online-users');

    $('form').submit(function(e){
        e.preventDefault(); // prevent reloading page
        socket.emit('chat message', $('#msg-input').val());
        $('#msg-input').val('');
        return false;
    });
    socket.on('new message', function(data){
        let date = new Date(data.time);
        let date_str = date.toTimeString().split(" ");
        let display_msg = date_str[0] + " " + nickname + ": " + data.msg;
        $chatHistory.prepend("<li>" + date_str[0] + " " +
            "<a style='color: " + "red" + "'>" + nickname + "</a>" + ": " +
            data.msg + "</li>");
    });

    socket.on('assign nickname', function(data){
        nickname = data.username;
        $('#welcome-msg')[0].innerText = ("Welcome, " + nickname);
        $('#welcome-msg').css({'color': data.color});
        console.log(data.color);
    });

    socket.on('update user list', function(data){
        $('#online-users').empty();
       for(i=0; i<data.length; i++){
           $onlineUsers.prepend("<li style='color: " + data[i].color +
               "'>" + data[i].username + "</li>" );
       }
    });
});
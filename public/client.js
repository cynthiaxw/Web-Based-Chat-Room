$(function () {
    let socket = io();
    let nickname = "User1";

    $('form').submit(function(e){
        e.preventDefault(); // prevent reloading page
        socket.emit('chat message', $('#msg-input').val());
        $('#msg-input').val('');
        return false;
    });
    socket.on('chat message', function(timestamp, msg){
        let date = new Date(timestamp);
        let date_str = date.toTimeString().split(" ");
        let display_msg = date_str[0] + " " + nickname + ": " + msg;
        $('#chat-history').prepend($('<li>').text(display_msg));
    });
});
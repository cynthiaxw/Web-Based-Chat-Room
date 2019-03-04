$(function () {
    let socket = io();
    let nickname = "default";
    let $chatHistory =  $('#chat-history');
    let $onlineUsers = $('#online-users');
    let $msgInput = $('#msg-input');

    $('form').submit(function(e){
        e.preventDefault(); // prevent reloading page
        socket.emit('chat message', $msgInput.val());
        $msgInput.val('');
        return false;
    });
    socket.on('new message', function(msgWrap){
        let date = new Date(msgWrap.time);
        let date_str = date.toTimeString().split(" ");
        if(msgWrap.username !== nickname){
            $chatHistory.prepend("<li>" + date_str[0] + " " +
                "<a style='color: " + msgWrap.color + "'>" + msgWrap.username + "</a>" + ": " +
                msgWrap.msg + "</li>");
        }else{  // bold the message
            $chatHistory.prepend("<li><b>" + date_str[0] + " " +
                "<a style='color: " + msgWrap.color + "'>" + msgWrap.username + "</a>" + ": " +
                msgWrap.msg + "</b></li>");
        }

    });

    socket.on('assign nickname', function(data){
        nickname = data.username;
        $('#welcome-msg')[0].innerHTML = "Welcome, " + "<a style='color: " + data.color + "'>" +
            data.username + "</a>";
    });

    socket.on('update user list', function(data){
       $onlineUsers.empty();
       for(i=0; i<data.length; i++){
           $onlineUsers.prepend("<li style='color: " + data[i].color +
               "'>" + data[i].username + "</li>" );
       }
    });

    socket.on('new chatLog', function(chatLog){
        $chatHistory.empty();
        for(i=0; i<chatLog.length; i++){
            let date = new Date(chatLog[i].time);
            let date_str = date.toTimeString().split(" ");
            $chatHistory.prepend("<li>" + date_str[0] + " " +
                "<a style='color: " + chatLog[i].color + "'>" + chatLog[i].username + "</a>" + ": " +
                chatLog[i].msg + "</li>");
        }
    });

    socket.on('update chatLog', function(chatLog){
        $chatHistory.empty();
        for(i=0; i<chatLog.length; i++){
            let date = new Date(chatLog[i].time);
            let date_str = date.toTimeString().split(" ");
            if(chatLog[i].username !== nickname) {
                $chatHistory.prepend("<li>" + date_str[0] + " " +
                    "<a style='color: " + chatLog[i].color + "'>" + chatLog[i].username + "</a>" + ": " +
                    chatLog[i].msg + "</li>");
            }else{  // bold the message
                $chatHistory.prepend("<li><b>" + date_str[0] + " " +
                    "<a style='color: " + chatLog[i].color + "'>" + chatLog[i].username + "</a>" + ": " +
                    chatLog[i].msg + "</b></li>");
            }
        }
    });

    socket.on('command reply', function(data){
        $chatHistory.prepend("<li>Server: " + data + "</li>");
    })
});
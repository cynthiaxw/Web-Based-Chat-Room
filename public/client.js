$(function () {
    let socket = io();
    let nickname = "default";
    let $chatHistory =  $('#chat-history');
    let $onlineUsers = $('#online-users');
    let $msgInput = $('#msg-input');
    let cookie_set = false;

    function findCookieByName(name){
        let decodedCookie = decodeURIComponent(document.cookie);
        let chunks = decodedCookie.split(';');
        for(i=0; i<chunks.length; i++){
            let str = chunks[i].trim(); // trim the spaces
            if(str === name) {
                return str.substring(name.length, str.length);
            }
        }
        return "";
    }

    // get the cookie
    let myCookie = $.cookie('user_info');
    socket.on('connect', function(){
        console.log("connection");
        console.log(myCookie);
        socket.emit('get cookie', myCookie, function(data){
           $.cookie('user_info', data);
           console.log(data);
        });
    });
    // if(cookie_set){ // New connection, send cookies to the server
    //     let cookieName = findCookieByName("User_Login=");
    //     if(cookieName !== "") { // send the cookie
    //         socket.emit('send cookie', cookieName);
    //     }else {
    //         console.log("cookie has not been set");
    //     }
    // }

    $('form').submit(function(e){
        e.preventDefault(); // prevent reloading page
        socket.emit('chat message', {msg:$msgInput.val(), username:nickname});
        $msgInput.val('');
        return false;
    });

    // socket.on('set cookie', function(key){
    //     let appendCookie = "User_Login=" + key.toString();
    //     document.cookie += appendCookie;
    //     console.log(document.cookie);
    //     console.log("key received: " +  key);
    //     cookie_set = true;
    // });

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
        console.log(data);
        let date = new Date(data.time);
        let date_str = date.toTimeString().split(" ");
        $chatHistory.prepend("<li><a style='color: #000000'>" + date_str[0] + " Server: " + data.msg + "</a></li>");
    });
});
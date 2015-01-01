  var videos = [];
  var PeerConnection = window.PeerConnection
      || window.webkitPeerConnection00
      || window.webkitRTCPeerConnection
      || window.mozRTCPeerConnection
      || window.RTCPeerConnection;
  
  function getNumPerRow() {
    var len = videos.length;
    var biggest;
  
    // Ensure length is even for better division.
    if(len % 2 === 1) {
      len++;
    }
  
    biggest = Math.ceil(Math.sqrt(len));
    while(len % biggest !== 0) {
      biggest++;
    }
    return biggest;
  }
  
  function subdivideVideos() {
    var perRow = getNumPerRow();
    var numInRow = 0;
    for(var i = 0, len = videos.length; i < len; i++) {
      var video = videos[i];
      setWH(video, i);
      numInRow = (numInRow + 1) % perRow;
    }
  }
  
  function setWH(video, i) {
    var perRow = getNumPerRow();
    var perColumn = Math.ceil(videos.length / perRow);
    var width = window.innerWidth;
    var height = window.innerHeight / 2;
    //Math.floor((window.innerHeight - 190) / perColumn);
    video.width = width;
    video.height = height;
    video.style.position = "absolute";
    video.style.left = (i % perRow) * width + "px";
    video.style.top = "24px";
    //Math.floor(i / perRow) * height + "px";
    video.style.visibility = "visible";
    var dial = document.getElementById("dial");
    dial.style.top = height;
  }
  
  function cloneVideo(domId, socketId) {
    var video = document.getElementById(domId);
    var clone = video.cloneNode(false);
    clone.id = "remote" + socketId;
    document.getElementById('videos').appendChild(clone);
    videos.push(clone);
    return clone;
  }
  
  function removeVideo(socketId) {
    var video = document.getElementById('remote' + socketId);
    if(video) {
      videos.splice(videos.indexOf(video), 1);
      video.parentNode.removeChild(video);
    }
  }
  function sanitize(msg) {
    return msg.replace(/</g, '&lt;');
  }
  
  function initNewRoom() {
    var button = document.getElementById("newRoom");
  
    button.addEventListener('click', function(event) {
  
      var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
      var string_length = 8;
      var randomstring = '';
      for(var i = 0; i < string_length; i++) {
        var rnum = Math.floor(Math.random() * chars.length);
        randomstring += chars.substring(rnum, rnum + 1);
      }
  
      window.location.hash = randomstring;
      location.reload();
    })
  }
  
  function initUserId(){
    var u_id ={
      send: function(data){
        rtc._socket.send(data);
      },
        recv: function(data){
        return data;
      },
      event: 'receive_user_id'
    };
  
    //userIdをサーバからもらうように申請
    //TODO CookieResetボタンをおした時の処理がまだできていない
    waitForConnection = function(){
      console.log("waiting...");
      if(rtc._socket.readyState==1){
        if((st = document.cookie.lastIndexOf("video_chat=")) != -1){
          ed = document.cookie.length;
          console.log("cookie:" + document.cookie);
          console.log(document.cookie.indexOf("video_chat="));
          console.log("st : " + st);
          console.log("ed : " + ed);
          user_id = document.cookie.substring(st,ed);
          rtc._socket.send(JSON.stringify({
            "eventName" : "update_userId",
            "data" : { "u_id" : user_id}
          }));
        }else{
          u_id.send(JSON.stringify({
            "eventName" : "create_userId",
            "data" : {}
          }));
        }
        console.log("send!!");
      } else {
        setTimeout(function(){
          waitForConnection(); //繋がらなかったら再接続
        },500);
      }
    };
  
    waitForConnection();
    //サーバからIDを受け取る
    rtc.on(u_id.event,function(){
      var receive = u_id.recv.apply(this,arguments);
      document.getElementById("user_id").textContent="あなたの番号は" + receive.userId + "です" ;
      document.cookie="video_chat=" + receive.userId;
      window.location.href="/#" + receive.userId;
    });
  }
  
  function initTel(){
    var btn = document.getElementById("call");
    var tell ={
      send: function(data){
        rtc._socket.send(data);
      },
        recv: function(data){
        return data;
      },
      event: 'receive_tell'
    };
  
    btn.addEventListener('click', function(event) {
      //num =相手の番号, my_id=自分の番号
      var num = document.getElementById("number").value;
      var my_id = window.location.hash.slice(1);
      tell.send(JSON.stringify({
        "eventName" : "call",
        "data" : {
          "num" : num ,
          "my_id" : my_id
        }
      }));
      document.getElementById("number").value = "";
    },false);
  
    rtc.on("receive_tell",function(){
      var receive = tell.recv.apply(this,arguments);
      setTimeout(function(){
        alert(receive.room + "さんから" + receive.str);
        window.location.href='/#' + receive.room;
        },5000);
    });
  
    dis_btn = document.getElementById("disconnect");
  
    var dis_connect={
      send: function(data){
        rtc._socket.send(data);
      },
        recv: function(data){
        return data;
      },
      event: 'disconnect_tell'
    };
    
    dis_btn.addEventListener('click', function(event) {
      var room = window.location.hash.slice(1);
      console.log(room);
      dis_connect.send(JSON.stringify({
        "eventName" : "close",
        "data" : {
          "room" : room
        }
      }));
    },false);
  
    rtc.on("disconnect_tell",function(){
      location.href = "/";
    });
  }
  
  function init() {
    if(PeerConnection) {
      rtc.createStream({
        "video": {"mandatory": {}, "optional": []},
        "audio": true
      }, function(stream) {
        document.getElementById('you').src = URL.createObjectURL(stream);
        document.getElementById('you').play();
      });
    } else {
      alert('Your browser is not supported or you have to turn on flags. In chrome you go to chrome://flags and turn on Enable PeerConnection remember to restart chrome');
    }
    
    var room = window.location.hash.slice(1);
  
    if(rtc._socket)
      console.log(rtc._socket.readyState);
    console.log("rtc");
    rtc.connect("ws:" + window.location.href.substring(window.location.protocol.length).split('#')[0], room);
    if(rtc._socket)
      console.log(rtc._socket.readyState);
  
    /* socketIDは相手のソケット番号*/
    rtc.on('add remote stream', function(stream, socketId) {
      console.log("ADDING REMOTE STREAM...");
      var clone = cloneVideo('you', socketId);
      document.getElementById(clone.id).setAttribute("class", "");
      rtc.attachStream(stream, clone.id);
      subdivideVideos();
    });
    rtc.on('disconnect stream', function(data) {
      console.log('remove ' + data);
      removeVideo(data);
    });
    initNewRoom();
    initUserId();
    initTel();
  }
  
  window.onresize = function(event) {
    subdivideVideos();
  };
  
  window.onunload = function(event){
    console.log("socket is closed.");
    rtc._socket.close();
  };

/*参考ページ
 *http://www.html5rocks.com/ja/tutorials/getusermedia/intro/
 *
 *  Doing init()
 */
  var videos = [];
  var PeerConnection = window.PeerConnection || window.webkitPeerConnection00
      || window.webkitRTCPeerConnection || window.mozRTCPeerConnection || window.RTCPeerConnection;
  navigator.getUserMedia = ( navigator.getUserMedia || navigator.webkitGetUserMedia ||
                       navigator.mozGetUserMedia ||  navigator.msGetUserMedia);

  function init() {
    if(PeerConnection) {
        /**
         *getUserMedia() の最初のパラメータでは、アクセスするメディアのタイプを指定する
         *マイクとカメラの両方を使用するには、"video, audio" を指定する
         *chromeでは、webkitGetUserMediaを使う
         */
        navigator.webkitGetUserMedia(
	{
	        'video' : true,
	        'audio' : true
	},
	//success
	function(localMediaStream) {
	        var yourvideo = document.getElementById("you");
	        var myvideo  =  document.getElementById("me");
	        //作成されたウィンドウ内の document と同じ寿命を持つ、新しいオブジェクトの URL を作成
	        yourvideo.src = window.URL.createObjectURL( localMediaStream );
	        myvideo.src = window.URL.createObjectURL( localMediaStream );
	        yourvideo.play();
	        myvideo.play();
	},
	//err
	function(e) {
	        console.log('Rejection getUserMedia()', e);
	 });       
    } else {
      alert('Your browser is not supported or you have to turn on flags. In chrome you go to chrome://flags and turn on Enable PeerConnection remember to restart chrome');
    }
    
    //urlの#より後ろの値を代入(ex: 1001)
    var room = window.location.hash.slice(1);
  
    //ここでは常にFか？
    if(rtc._socket)
      console.log("rtc._socket.readyState: " + rtc._socket.readyState);
    console.log(rtc);
    //指定されているURLに接続する
    rtc.connect("ws:" + window.location.href.substring(window.location.protocol.length).split('#')[0], room);
    if(rtc._socket)
      console.log("rtc._socket.readyState: " + rtc._socket.readyState);
      
/*rtc.onの中身
    function (eventName, callback) {
        rtc._events[eventName] = rtc._events[eventName] || [];
        rtc._events[eventName].push(callback);
      }
*/ 
    //  socketIDは相手のソケット番号
    rtc.on ('add remote stream', function(stream, socketId) {        
      console.log("ADDING REMOTE STREAM...");
      var clone = cloneVideo('you', socketId);
      //無名のクラスを追加する
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
  
  function initUserId(){
    //プロトタイプ宣言
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
    waitForConnection = function(){
      console.log("waiting...");
      if(rtc._socket.readyState==1){        
        //user_idにcookieに保存された video_chat=XXXXをcookieからとりたい
        if((st = document.cookie.lastIndexOf("video_chat=")) != -1){
          user_id = $.cookie("video_chat");
          console.log("user_id on cookie:-> " + user_id );
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
          //繋がらなかったら再接続 0.5秒間隔でループする
          waitForConnection();
        },500);
      }
      console.log("waitForConnection OK");
    };
    
    waitForConnection();
    //サーバからIDを受け取る
    rtc.on(u_id.event,function(){
      //u_id.recvの返し値は、配列のようでarrayメソッドをもっていない
      //そこで、applyメソッドを使ってargumentsをwindowに与える
      //arrayは、引数を一つのみ(->callメソッド参照)
      var receive = u_id.recv.apply(this,arguments);
      
      $("#user_id").text("あなたの番号は" + receive.userId + "です");
      $.cookie("video_chat", receive.userId , { expires: 30}) ;
      window.location.href="/#" + receive.userId;
    }); 
  }	//end initUserId()
  
  function initTel(){
    var tell ={
      send: function(data){
        rtc._socket.send(data);
      },
        recv: function(data){
        return data;
      },
      event: 'receive_tell'
    };
    
    $("#call").click( function(event) {
      //num =相手の番号, my_id=自分の番号
      var num = $("#number").val();
      var my_id = window.location.hash.slice(1);
      //rtcのsocketにJSONを送る {"eventName":"call","data":{"num":"15","my_id":"video_chat=1001"}}
      tell.send(JSON.stringify({
        "eventName" : "call",
        "data" : {
          "num" : num ,
          "my_id" : my_id
        }
      }));
      document.getElementById("number").value = "";
      console.log("partner number:-> " + num);
    });
    
    rtc.on( tell.event , function(){
      var receive = tell.recv.apply(this,arguments);
      setTimeout(function(){
        alert(receive.room + "さんから" + receive.str);
        window.location.href='/#' + receive.room;
        },2000);
    });
    
    var dis_connect={
      send: function(data){
        rtc._socket.send(data);
      },
        recv: function(data){
        return data;
      },
      event: 'disconnect_tell'
    };
    
    $("#disconnect").click( function(event) {
      var room = window.location.hash.slice(1);
      console.log("room->" + room);
      dis_connect.send(JSON.stringify({
        "eventName" : "close",
        "data" : {
          "room" : room
        }
      }));
    });
    
    rtc.on("disconnect_tell",function(){
      location.href = "/";
    });
  }	//end initTell()
  
  
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
  
  
  //console.log("test:-> ");
  
  
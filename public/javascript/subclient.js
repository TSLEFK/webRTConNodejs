  
  //ビデオを表示させるタグを作る
  function cloneVideo(domId, socketId) {
 //   var clone = $("#"+domId).clone(false);
        
    var video = document.getElementById(domId);
    var clone = video.cloneNode(false);
    clone.id = "remote" + socketId;
    document.getElementById('videos').appendChild(clone);
    videos.push(clone);
    return clone;
  }
  
  

//ウィンドウの大きさが変わるときに発生
  window.onresize = function(event) {
    subdivideVideos();
  };
    
//
  function getNumPerRow() {
    var len = videos.length;
    console.log("videos -> " + videos);
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
  
  
  
  
/*
 *動作未確認
 *Id('remote' + socketId) が現状作れてない
 */
  function removeVideo(socketId) {
    var video = document.getElementById('remote' + socketId);
    if(video) {
      console.log("videos.indexOf(video): -> " +videos.indexOf(video) );
      //splice: 
      videos.splice(videos.indexOf(video), 1);
      video.parentNode.removeChild(video);
    }
  }

  
/*
 *動いていない模様
 */
//リロード、移動時に発生  
  window.onunload = function(event){
    console.log("socket is closed.");
    alert("socket is closed.");
    rtc._socket.close();
  };
  
  
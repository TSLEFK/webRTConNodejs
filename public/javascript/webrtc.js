//参考ページ
//http://slowquery.hatenablog.com/entry/2013/01/30/001310
//WebRTC Demo

$(function(){
    //端末の差異を吸収
    navigator.getMedia = (  navigator.getUserMedia ||
                            navigator.webkitGetUserMedia ||
                            navigator.mozGetUserMedia ||
                            navigator.msGetUserMedia );
    
    //端末のCameraのstreamデータを流すVideoタグ
    var video = document.getElementById('camera');

    //Videoタグ
    navigator.getMedia ({ video:true, audio:true }, function(stream) {
        video.src = window.URL.createObjectURL(stream);
    }, function(err){console.log(err);});

});
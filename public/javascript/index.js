function dial(push_dial){
        document.getElementById("number").value += push_dial;
}

function delCookie(){
        cName = "video_chat"; //削除するクッキー名
        $.cookie( cName , ' ', { expires: -1} );
}


$( function() {
        $("#clear").click( function () {
	$("#number").val("");
        } ) ;
        
        $("#switch_me").click( function(){
	$("#me").toggle();
	
	if ( $("#me").css("display") == "none" ) {
	        $("#switch_me").text("自分のカメラON");
	}else{
	        $("#switch_me").text("自分のカメラOFF");
	}
        });
        
        $("#delete").click(function(){
	var tmp = $("#number").val();
	var tmp2 = tmp.slice(0, -1);
	$("#number").val( tmp2 );
        });
        
});
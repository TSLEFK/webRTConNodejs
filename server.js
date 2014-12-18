//Expressをロードする
var express = require('express');
//ExpressのApplicationオブジェクトを作成する
var app = express();
var server = require('http').createServer(app);
var webRTC = require('webrtc.io').listen(server);

app.set('view engine', 'jade');
app.set('views', __dirname + '/views');

app.use(express.static(__dirname+'/public'));

require("./routing.js")(app);

/*ポート番号の決定*/
var port = process.env.PORT || 8081;
server.listen(port);

console.log("Server is listening on port " + port);



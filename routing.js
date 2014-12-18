/*
  ルーティング用Javascript
*/

module.exports = function(app){
    
  /*
  app.get('アクセス先'func(){
    res.render('');
  })
  */
  
  app.get('/', function (req, res){
    res.render('index', {title: 'ExpTEST Hello!!'});
  });
  
  /*テスト用*/ 
  app.get('/test', function(req, res){ 
    res.render('test', {test: 'TEST page XD'});
  });
  
   /* 
  app.get('/index.js',function(req, res){
    res.sendfile(__dirname+ '/index.js');
  });
  
  app.get('/webrtc.io.js',function(req, res){
    res.sendfile(__dirname+ '/webrtc.io.js');
  });

  app.get('/jquery.js', function(req, res){
    res.sendfile(__dirname + '/jquery-1.11.1.js');
  });
  
  app.get('/script.js', function(req, res){
    res.sendfile(__dirname + '/script.js');
  });
  */

}
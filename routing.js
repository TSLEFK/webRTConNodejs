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
  app.get('/test.html',function(req, res){ 
    res.sendfile(__dirname+ '/test.html');
  });

}

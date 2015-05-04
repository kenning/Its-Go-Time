var restify = require('restify');
var client = restify.createJsonClient({
  url: 'https://hooks.slack.com/services/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',
  version: '*'
});
var port = process.env.PORT || 1337;

var server = restify.createServer();
server.use(restify.bodyParser());

var games = {};

// var monk = require('monk');
// var mongodb = require('mongodb');
// var connectionString = process.env.CUSTOMCONNSTR_MONGOLAB_URI;
// var db = monk(connectionString);
// var users = db.get('userlist');
// urlList.findOne({Unused:true}, function(err, newImgListDoc){

    // "mongodb":"2.0.28",
    // "monk":"1.0.1"

// server.head('/hello/:name', respond);

// server.get('/hello/:name', function(req, res, next) {
//   client.post('https://hooks.slack.com/services/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',
//       { 'text': '2:22' }, function(err, req, res, obj) {
//     if(err) console.log(err);
//     console.log('%d -> %j', res.statusCode, res.headers);
//     console.log('%j', obj);
//   });
//   res.send('hello ' + req.params.name + JSON.stringify(games));
//   next();  
// });
// var lastRequest;

// server.get('/', function(req, res, next) {
//   // games[req.params.name] = req.params.message;
//   res.send('last request = ' + lastRequest);
//   next();
// });
// server.post('/', function(req, res, next) {
//   lastRequest = JSON.stringify(req);
//   var text = (req.body) ? JSON.stringify(req.body.text) : 'error parsing request.body!';
//   res.send(201, {'text': text});
// });
// server.listen(port, function() {
//   console.log('%s listening at %s', server.name, server.url);
// });

//http://www.fileformat.info/info/unicode/char/25ef/index.htm

  // var coolText = JSON.stringify(req.complete);
  // coolText += JSON.stringify(req._readableState);
  // coolText += JSON.stringify(req.context);
  // if(coolText.length > 300) coolText = coolText.slice(0, 300);
server.post('/', function(req, res, next) {
  // request.on('data', function (data) {
  //   var body += data;
  // }
  // request.on('end', function () {
    var coolText = JSON.stringify(Object.keys(req.params));
    // var bestText = req.body.user_name + req.body.text;
    res.send(201, {'text': ":black_circle:```:heart::black::mid::white:\n:black:```\n`:black:\n:black::mid::white:"});
    return next();
  // }
  // var keys = Object.keys(req);

});
server.listen(port, function() {
  console.log('%s listening at %s', server.name, server.url);
});
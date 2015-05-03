var restify = require('restify');
var client = restify.createJsonClient({
  url: 'https://hooks.slack.com/services/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',
  version: '*'
});
var port = process.env.PORT || 1337;

var server = restify.createServer();

var games = {};

// var monk = require('monk');
// var mongodb = require('mongodb');
// var connectionString = process.env.CUSTOMCONNSTR_MONGOLAB_URI;
// var db = monk(connectionString);
// var users = db.get('userlist');
// urlList.findOne({Unused:true}, function(err, newImgListDoc){

// https://github.com/kenning/hinternet/blob/master/routes/index.js

    // "mongodb":"2.0.28",
    // "monk":"1.0.1"

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
// server.head('/hello/:name', respond);
server.post('/fromslack/:message', function(req, res, next) {
  games[req.params.name] = req.params.message;
  var text = JSON.stringify(games) + '\n' + JSON.stringify(req);
  res.send(201, {'text': text});
});
server.listen(port, function() {
  console.log('%s listening at %s', server.name, server.url);
});

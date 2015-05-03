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

    // "mongodb":"2.0.28",
    // "monk":"1.0.1"

// server.head('/hello/:name', respond);

// server.get('/fromslack/:message', function(req, res, next) {
//   // games[req.params.name] = req.params.message;
//   var text = req.body.text.replace(/\s/g, '+'),
//   res.send(201, {'text': text});
// });
server.post('/fromslack/:message', function(req, res, next) {
  var text = req.body.text.replace(/\s/g, '+'),
  res.send(201, {'text': text});
});
server.listen(port, function() {
  console.log('%s listening at %s', server.name, server.url);
});

//http://www.fileformat.info/info/unicode/char/25ef/index.htm

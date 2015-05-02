var restify = require('restify');
var client = restify.createJsonClient({
  url: 'https://hooks.slack.com/services/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',
  version: '*'
});

// var monk = require('monk');
// var mongodb = require('mongodb');
// var connectionString = process.env.CUSTOMCONNSTR_MONGOLAB_URI;
// var db = monk(connectionString);
// var users = db.get('userlist');
// urlList.findOne({Unused:true}, function(err, newImgListDoc){

// https://github.com/kenning/hinternet/blob/master/routes/index.js

    // "mongodb":"2.0.28",
    // "monk":"1.0.1"

function respond(req, res, next) {
  postText('asdf');
  res.send('hello ' + req.params.name);
  next();
}

var postText = function(text) {
    client.post('https://hooks.slack.com/services/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',
      { 'text': 'azure really works' }, function(err, req, res, obj) {
    if(err) console.log(err);
    console.log('%d -> %j', res.statusCode, res.headers);
    console.log('%j', obj);
  });
}


var server = restify.createServer();
server.get('/hello/:name', respond);
server.head('/hello/:name', respond);

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});


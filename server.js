var restify = require('restify');

function respond(req, res, next) {
  res.send('hello ' + req.params.name);
  client();
  postText();
  next();
}

var server = restify.createServer();
server.get('/play/:player:', respond);
server.head('/hello/:name', respond);


server.listen(8080, function(){
  console.log('%s listening at %s', server.name, server.url);
});

var client = restify.createJsonClient({
  url: 'https://hooks.slack.com/services/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',
  version: '*'
});
var postText = client.post('/postText',
 { 'text': 'world' }, function(err, req, res, obj) {
  if(err) console.log(err);
  console.log('%d -> %j', res.statusCode, res.headers);
  console.log('%j', obj);
});

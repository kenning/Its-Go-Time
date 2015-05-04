var restify = require('restify');
var client = restify.createJsonClient({
  url: 'https://hooks.slack.com/services/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',
  version: '*'
});
var port = process.env.PORT || 1337;

var server = restify.createServer();
server.use(restify.bodyParser());

server.post('/', function(req, res, next) {
  var request = req.params.text.split(' ');
  if(request[1].length !== 1 || 
     request[2].length > 2 ||  
    !request[1].match(/[a-sA-S]/) || 
    !request[2].match(/[1-9]/)) res.send(201, {'text':'I don\'t understand. Try typing in this format: "go b 15"'});
  var row = request[1].charCodeAt(0) - 97;
  if(row < 0) row += 32;
  var column = request[2];

  // gfw.makePlay()
  request.splice(0, 1);
  res.send(201, {'text': JSON.stringify(request) });
});
server.listen(port, function() {
  console.log('%s listening at %s', server.name, server.url);
});

var GoFramework = function() {
  this.board = [];
  for(var i = 0; i < 19; i++) {
    var row = [];
    for(var j = 0; j < 19; j++) {
      row.push(0);
    }
    board.push(row);
  }
}

GoFramework.prototype.makePlay = function(row, column, color) {
  this.board
};

var gfw = new GoFramework();
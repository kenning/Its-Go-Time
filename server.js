var restify = require('restify');
var incomingHookUrl = 'https://hooks.slack.com/services/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';
var client = restify.createJsonClient({
  url: incomingHookUrl,
  version: '*'
});
var port = process.env.PORT || 1337;

var server = restify.createServer();
server.use(restify.bodyParser());

server.get('/get', function(req, res, next) {
  var getem = function() {
    console.log('hi');
    client.post(incomingHookUrl, { 'text': 'got!' }, function(err, req, res, obj) {
      if(err) console.log(err);
      res.send('hi');
    });
  }
  console.log('calledSetTimeout');
  setTimeout(getem, 7000);
});

server.post('/', function(req, res, next) {
  // if(req.params.user_name === 'rice-ball-bot')  
  var request = req.params.text.split(' ');
  if(request[1].length !== 1 || 
     request[2].length > 2 ||  
    !request[1].match(/[a-sA-S]/) || 
    !request[2].match(/[1-9]/)) res.send(201, {'text':'I don\'t understand. Try typing in this format: "go b 15"'});
  var row = request[1].charCodeAt(0) - 97;
  if(row < 0) row += 32;
  var column = request[2] - 1;

  gfw.makePlay(row, column, 1);

  var postAFifth = function() {
    fifth++;
    client.post(incomingHookUrl, { 'text': 'delay' }, function(err, req, res, obj) {
      if(err) console.log(err);
    });
  }

  if(req[1] === 4) postAFifth();

  client.post(incomingHookUrl, { 'text': 'got!' }, function(err, req, res, obj) {
      if(err) console.log(err);
  });

  var fifth = 0;
  
  setTimeout(postAFifth, 2200);
  setTimeout(postAFifth, 4400);
  setTimeout(postAFifth, 6600);
  setTimeout(postAFifth, 8800);

  res.send(201, {'text': gfw.printBoard(0) });


});
server.listen(port, function() {
  console.log('%s listening at %s', server.name, server.url);
});

var GoFramework = function() {

  //makes a blank board
  this.board = [];
  for(var i = 0; i < 19; i++) {
    var row = [];
    for(var j = 0; j < 19; j++) {
      row.push(0);
    }
    this.board.push(row);
  }
}

GoFramework.prototype.makePlay = function(row, column, color) {
  this.board[row][column] = color;
};

///Prints a fifth of the board
GoFramework.prototype.printBoard = function(fifth) {
  var result = "";
  for(var i = fifth*4; i < (fifth*4)+4; i++) {
    this.board[i].forEach(function(column) {
      if(column === 0) result += ':heavy_plus_sign:';
      else if(column === 1) result += ':black_circle:';
      else if(column === 2) result += ':white_circle:';
    });
    result += '\n';

    //can't print the 20th row, there isn't one.
    if(i === 18 || i === 3) {
      result += '  1     2     3     4     5     6     7     8     9     10  11  12  13  14  15  16  17  18  19';
      break;
    }
  }
  return result;
}

var gfw = new GoFramework();
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

  var request = req.params.text.toLowerCase().split(' ');
  if( request[1].length !== 1 ||  request[2].length > 2 ||  request[3].length !== 5 ||
      !request[1].match(/[a-s]/) || !request[2].match(/[1-9]/) || !request[3].match(/[abcehikltw]/)) {
    res.send(201, {'text':'I don\'t understand. Try typing in this format: "go b 15 black"'});
    return;
  }

  var row = request[1].charCodeAt(0) - 97;
  if(row < 0) row += 32;
  var column = request[2] - 1;

  var play = 1;
  if(request[3] === "white") play = 2;

  gfw.makePlay(row, column, play);

  var postARow = function() {
    row++;
    client.post(incomingHookUrl, { 'text': gfw.printBoard(row) }, function(err, req, res, obj) {
      if(err) console.log(err);
    });
  }

  var row = 0;

  setTimeout(postARow, 1100);
  setTimeout(postARow, 2200);
  setTimeout(postARow, 3300);
  setTimeout(postARow, 4400);
  setTimeout(postARow, 5500);
  setTimeout(postARow, 6600);
  setTimeout(postARow, 7700);
  setTimeout(postARow, 8800);
  setTimeout(postARow, 9900);
  setTimeout(postARow, 11000); //10
  setTimeout(postARow, 12200);
  setTimeout(postARow, 13300);
  setTimeout(postARow, 14400);
  setTimeout(postARow, 15500);
  setTimeout(postARow, 16600);
  setTimeout(postARow, 17700);
  setTimeout(postARow, 18800);
  setTimeout(postARow, 20000);
  setTimeout(postARow, 21100);

  // res.send(201, {'text':})
  res.send(201, {'text': request[3] + ' plays at ' + request[2] + '-' + request[1].toString() });
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
GoFramework.prototype.printBoard = function(row) {
  var result = "";
  this.board[row].forEach(function(column) {
    if(column === 0) result += ':heavy_plus_sign:  ';
    else if(column === 1) result += ':black_circle:  ';
    else if(column === 2) result += ':white_circle:  ';
  });
  result += row.toString();
  result += '\n';

    //can't print the 20th row, there isn't one.
  if(row === 18) {
    result += '  1       2      3      4      5      6      7      8      9      10 11 12 13 14 15 16 17 18 19';
  }
  return result;
}

var gfw = new GoFramework();
var restify = require('restify');
var incomingHookUrl = 'https://hooks.slack.com/services/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';
var client = restify.createJsonClient({
  url: incomingHookUrl,
  version: '*'
});
var server = restify.createServer();
server.use(restify.bodyParser());
var port = process.env.PORT || 1337;



/////////////////////////////////////////
// Post request. Handles all netcode
/////////////////////////////////////////
server.post('/', function(req, res, next) {

  //Establishes request variable with the text of the message which made the move
  var request = req.params.text.toLowerCase().split(' ');
  
  //Command to create a new board
  if(request[1] === "new" && request[2] === "board" && parseInt(request[3]) < 22 && parseInt(request[3]) > 0) {
    gfw = new GoGameModel(parseInt(request[3]));
    return;
  }
  
  //Sanitizes input
  if( request[1].length !== 1 ||  request[2].length > 2 ||  request[3].length !== 5 ||
      !request[1].match(/[a-s]/) || !request[2].match(/[1-9]/) || !request[3].match(/[abcehikltw]/)) {
    res.send(201, {'text':'I don\'t understand. Try typing in this format: "go e 15 black", "go e 15 b". To create a new board type "go new board 19"'});
    return;
  }

  //Further sanitizes input, parses letter and stone color as ints
  var row = request[1].charCodeAt(0) - 97;
  if(row < 0) row += 32;
  var column = request[2] - 1;
  var play = 1;
  if(request[3] === "white") play = 2;

  //Controller method. alters data in the GoGameModel.
  gfw.makePlay(row, column, play);

  //Row posting method
  var postARow = function() {
    client.post(incomingHookUrl, { 'text': gfw.printBoard(postingRow) }, function(err, req, res, obj) {
      if(err) console.log(err);
    });
    postingRow++;
  }

  //Posts all rows 1.1 second apart from each other
  var postingRow = 0;
  for(var i = 0; i < gfw.size; i++) {
    setTimeout(postARow, 1100*(i+1));
  }

  //Sends message confirming move
  res.send(201, {'text': request[3] + ' plays at ' + request[2] + '-' + request[1].toString() });
});



  /////////////////////////////////////////
  // Go Game Model. Handles all game logic
  /////////////////////////////////////////

var GoGameModel = function(size) {
  this.size = size;
  //makes a blank board
  this.board = [];
  for(var i = 0; i < size; i++) {
    var row = [];
    for(var j = 0; j < size; j++) {
      row.push(0);
    }
    this.board.push(row);
  }
}

//Makes play on the gameboard
GoGameModel.prototype.makePlay = function(row, column, color) {
  this.board[row][column] = color;
};

///Prints a row of the board
GoGameModel.prototype.printBoard = function(row) {
  row = row || 19;
  var result = "";
  this.board[row].forEach(function(column) {
    if(column === 0) result += ':heavy_plus_sign:  ';
    else if(column === 1) result += ':black_circle:  ';
    else if(column === 2) result += ':white_circle:  ';
  });
  result += "`" + String.fromCharCode('0'.charCodeAt(0) + 17 + row) + "`"; //places letters at the end of rows
  result += '\n';

  if(row === 18) { 
    result += '` 1  2  3  4  5  6  7  8  9  10 11 12 13 14 15 16 17 18 19`';
  }
  return result;
}

//Creates new GoGameModel
var gfw = new GoGameModel();

//Turns on server
server.listen(port, function() {
  console.log('%s listening at %s', server.name, server.url);
});
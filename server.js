var restify = require('restify');
var incomingHookUrl = 'https://hooks.slack.com/services/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';
var client = restify.createJsonClient({
  url: incomingHookUrl,
  version: '*'
});
var server = restify.createServer();
server.use(restify.bodyParser());
var port = process.env.PORT || 1337;



  /////////////////////////////////////////////
  // Post request. Handles all netcode       //
  // except for the board printing function. //
  /////////////////////////////////////////////

var printing = false;

server.post('/', function(req, res, next) {
  //prevents new input from being added before the board has finished printing
  if(printing) return;

  //Establishes request variable with the text of the message which made the move
  var request = req.params.text.toLowerCase().split(' ');
  
  //Command to create a new board
  if(request[1] === "new" && request[2] === "board" && parseInt(request[3]) < 22 && parseInt(request[3]) > 0) {
    gfw = new GoGameModel(parseInt(request[3]));
      res.send(201, {'text':'Made a new board of size ' + parseInt(request[3])});
    return;
  }
  
  //Sanitizes input
  if( request[1].length !== 1 ||  request[2].length > 2 ||  (request[3].length !== 5 && request[3].length !== 1) ||
      !request[1].match(/[a-s]/) || !request[2].match(/[1-9]/) || !request[3].match(/[abcehikltw]/)) {
      if(request[1] === 'help') {
      res.send(201, {'text':'I can make a Go board for you and play your stones on it.'+
        '\nTo create a new board type "go new board [size]." Size can be ' +
        '\nMake plays by typing in this format: "go e 15 black", or "go e 15 b". '+
        '\nI cannot count your points at the end of the game for you yet.'+
        '\nI will not enforce the コウ rule (you cannot make the same move twice).'});
    }
    return;
  }
  if(request === ["go","fuck","yourself"] || request === ["go","suck","a","dick"]) {
    res.send(201, {'text': "Right back at you." });
  }

  //Further sanitizes input, parses letter and stone color as ints. 
  //Black == 1, White == 2, blank square == 0
  var row = request[1].charCodeAt(0) - 97;
  if(row < 0) row += 32;
  var column = request[2] - 1;
  var play = 1;
  if(request[3] === "white" || request[3] === "w") play = 2;

  //Prevent players from making the same move twice in a row
  if(([column, row] === lastBlackMove && play === 1 )||([column, row] === lastWhiteMove && play === 2)) {
    res.send(201, {'text':'It is against the rule of Kou (コウ) for a player to play the same move two turns in a row.'}); 
  (play === 1) ? lastBlackMove = [column, row] : lastWhiteMove = [column, row];

  //Prevents players from playing out of turn
  if(this.lastMove === play) {
    res.send(201, {'text':'It\'s not '+request[3]+'\'s turn to play.'});
    return;
  }

  //The move succeeded
  this.lastMove = play;

  //Controller method. alters data in the GoGameModel.
  gfw.addPiece(row, column, play);

  //Row posting method
  var postingRow = 0;
    var postARow = function() {
    client.post(incomingHookUrl, { 'text': gfw.printBoard(postingRow) });
    postingRow++;
  }

  //Posts all rows 1.1 second apart from each other
  for(var i = 0; i < gfw.size+1; i++) {
    setTimeout(postARow, 1100*(i+1));
  }

  //Avoids new plays being made during printing
  var finishPrinting = function() {printing = false;}
  setTimeout(finishPrinting, 1100*(gfw.size+3));

  printing = true;
  //Sends message confirming move
  res.send(201, {'text': request[3] + ' plays at ' + request[2] + '-' + request[1].toString() });
});






//TODO
//implement kou rule
//implement passing
//count points when both players pass and reset the board

//mongo
//make it take an incoming hook url??







  ////////////////////////////////////////////
  // Go Game Model. Handles all game logic. //
  ////////////////////////////////////////////

var GoGameModel = function(size) {
  this.size = size-1 || 18;
  console.log(size);
  this.piecesToRemove = {};
  this.visitedPieces = {};
  this.checkColor = 0;
  this.blackPoints = 0;
  this.whitePoints = 0;
  this.lastMove = 2;
  this.lastBlackMove = [null, null];
  this.lastWhiteMove = [null, null];
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

//Adds a piece to the game board and checks if it creates a capture
GoGameModel.prototype.addPiece = function(row, column, color) {
  if(row === undefined || column === undefined || color === undefined) return null;
  if(this.board[row][column] === 1 || this.board[row][column] === 2) return null;
  if(color === 0) return null;

  //Marks all adjacent pieces 
  var originAdjacent = [[row, column]];
  var array = (this.adjacentSpots([row, column]));
  array.forEach(function(item) { originAdjacent.push(item); });

  this.board[row][column] = color;

  //Array of colors of each adjacent piece
  var adjColorArray = [0,0,0,0,0];
  for(var i = 0; i < originAdjacent.length; i++) {
    //sets color of this piece's group
    adjColorArray[i] = this.board[originAdjacent[i][0]][originAdjacent[i][1]];
  }

  //Checks all enemy pieces
  for(var i = 0; i < originAdjacent.length; i++) {
    if((adjColorArray[i] === 1 && color === 2) || adjColorArray[i] === 2 && color === 1) {
      this.checkColor = adjColorArray[i];
      this.checkPiece(originAdjacent[i]);
    }
  }

  this.removeDeadPieces();

  //Checks friendly pieces
  for(var i = 0; i < originAdjacent.length; i++) {
    debugger;
    if(adjColorArray[i] === color) {
      this.checkColor = adjColorArray[i];
      this.checkPiece(originAdjacent[i]);
    }
  }  

  //Remove friendly dead pieces
  this.removeDeadPieces();

  //Counts points that black and white players gain  

  this.visitedPieces = {};
  this.checkColor = 0;
} 

//Remove dead enemy pieces. Helper function for addPiece()
GoGameModel.prototype.removeDeadPieces = function() {
  for(key in this.piecesToRemove) {
    //Parses row and column
    var toRemove = this.piecesToRemove[key];
    console.log('removing at ' + JSON.stringify(toRemove));

    //Checks color and awards points
    (this.board[toRemove[0]][toRemove[1]] === 1) ? this.whitePoints++ : this.blackPoints++;
    
    //Removes piece
    this.board[toRemove[0]][toRemove[1]] = 0;
  }
  
  //Resets piecesToRemove and visitedPieces
  this.piecesToRemove = {};
}

//Returns adjacentSpots tuples
GoGameModel.prototype.adjacentSpots = function(rowColumn) {
  var result =  [[rowColumn[0], rowColumn[1]-1],
           [rowColumn[0], rowColumn[1]+1],
           [rowColumn[0]+1, rowColumn[1]],
           [rowColumn[0]-1, rowColumn[1]]];
  for(var i = result.length-1; i >= 0; i--) {
    if(this.board[result[i][0]] === undefined || this.board[result[i][0]][result[i][1]] === undefined) {
      result.splice(i, 1);
    } else if(result[i][0] < 0 || result[i][0] > this.size || result[i][1] < 0 || result[i][1] > this.size ) {
      result.splice(i, 1);
    }
  }
  return result;
}

//Returns hashkey for piecesToRemove object
GoGameModel.prototype.stringify = function(rowColumn) {
  return rowColumn[0].toString() + '-' + rowColumn[1].toString();
}

GoGameModel.prototype.isVisited = function(rowColumn) {
  return this.visitedPieces[this.stringify(rowColumn)] !== undefined;
}

//Recursive function which looks for captures
  //Overall function: finds group of same-colored pieces, 
  //marks them as visited, and captures them if necessary
GoGameModel.prototype.checkPiece = function(rowColumn) {
  
  //Prevents redundant searches
  if(this.isVisited(rowColumn)) return;

  var enemyColor = (this.checkColor === 1) ? 2 : 1;

  //Makes queue of points to test
  var testQueue = [rowColumn];

  //Holds all pieces in the current group
  var thisGroup = [rowColumn];

  //Bool flips on if the group has an empty neighbor
  var isAlive = false;

  // Checks all for empty neighbors + same colored neighbors
  while(testQueue.length > 0) {
    var shift = testQueue.shift();
    console.log('testing ' + JSON.stringify(shift));
    var checkAdjacents = this.adjacentSpots(shift);

    for(var j = 0; j < checkAdjacents.length; j++) {
      if(this.isVisited(checkAdjacents[j])) {
        continue;
      }

      //If this group has an opening, set isAlive to true
      if(this.board[checkAdjacents[j][0]][checkAdjacents[j][1]] === 0) {
        isAlive = true;
        continue;
      }

      //If this piece (the one being visited) is the same color, add it to queue and group, and mark as visited
      if(this.board[checkAdjacents[j][0]][checkAdjacents[j][1]] === this.checkColor) {
        this.visitedPieces[this.stringify(checkAdjacents[j])] = checkAdjacents[j];
        testQueue.push(checkAdjacents[j]);
        thisGroup.push(checkAdjacents[j]);
        continue;
      }

      if(this.board[checkAdjacents[j][0]][checkAdjacents[j][1]] === enemyColor) {
        continue;
      }
      
      console.log('Big error!');
      throw 'Big error in recursion!';
    }
  }
  

  if(!isAlive) {
    for(var i = 0; i < thisGroup.length; i++) {
      this.piecesToRemove[this.stringify(thisGroup[i])] = thisGroup[i];
    }
  }
}

  ////////////////////////////
  // Board printing method. //
  ////////////////////////////

GoGameModel.prototype.printBoard = function(row) {
  if(row === undefined) return 'Row not defined!';

  var result = "";
  this.board[row].forEach(function(column) {
    if(column === 0) result += ':heavy_plus_sign:  ';
    else if(column === 1) result += ':black_circle:  ';
    else if(column === 2) result += ':white_circle:  ';
  });
  result += "`" + String.fromCharCode('0'.charCodeAt(0) + 17 + row) + "`"; //places letters at the end of rows

  if(row === this.size) { 
    // result += ' \n` 1  2  3  4  5  6  7  8  9  10 11 12 13 14 15 16 17 18 19`';
    result += '\nBlack: ' + this.blackPoints + " capture points"
    result += '\nWhite: ' + this.whitePoints + " capture points";
  }
  return result;
}

//Creates new GoGameModel
var gfw = new GoGameModel(9);

GoGameModel.prototype.testPrint = function() {
  for(var i =0; i < this.size+1; i++) {
    console.log(this.printBoard(i));
  }
}

//Counts points for each color at the end of the game
GoGameModel.prototype.countPoints = function() {
  var emptySquares = {};

  for(var i = 0; i < this.size+1; i++) {
    for(var j = 0; j < this.size+1; j++) {
      if(this.board[i][j] === 0) {
        var stringified = this.stringify([i, j]);
        emptySquares[stringified] = stringified;
      }
    }
  }

  for(key in emptySquares) {
    if(emptySquares[key] === undefined || emptySquares[key] === null) continue;



    emptySquares[key] = null;
  }
}

//Helper function for countPoints()
GoGameModel.prototype.findEmptySquareGroup = function(row, column) {


}





//Turns on server
server.listen(port, function() {
  console.log('%s listening at %s', server.name, server.url);
  gfw.addPiece(0,1,2);
  gfw.addPiece(1,0,2);
  gfw.addPiece(0,0,1);
  console.log(gfw.printBoard(0));
});
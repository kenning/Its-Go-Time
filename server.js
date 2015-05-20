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
  // except for the board printing function  //
  /////////////////////////////////////////////

var printing = false;

server.post('/', function(req, res, next) {

  //Command 1: Interrupted
  //prevents new input from being added before the board has finished printing
  if(printing) {
    return;
  }

  //Establishes request variable with the text of the message which made the move
  var request = req.params.text.toLowerCase().split(' ');
  
  //Command 2: Make a new board
  //Command to create a new board
  if(request[1] === "new" && request[2] === "board" && parseInt(request[3]) < 22 && parseInt(request[3]) > 0) {
    ggm = new GoGameModel(parseInt(request[3]));
    ggm.lastMove = 2;

    res.send(201, {'text':'Made a new board of size ' + parseInt(request[3])});
    return;
  }

  //Command 3: End game
  //Counts up points in the game, announces winner, and makes a new board
  if(request[1] === ['finish']) {
    ggm.countPoints();
    var message = "Black wins!"
    if(ggm.blackPoints === ggm.whitePoints) {
      message = "Tie game!";
    } else if (ggm.whitePoints > ggm.blackPoints) {
      message = "White wins!";
    }
    message += "\nBlack points: " + ggm.blackPoints + "\nWhite points: " + ggm.whitePoints;

    ggm = new GoGameModel(19);
    ggm.lastMove = 2;

    res.send(201, {text: message});
  }

  //Command 4: Pass
  //switches whose turn it is, and sets the last move of the passing player to null
  if(request[1] === ['pass']) {
    if(this.lastMove === 1) {
      this.lastMove = 2;
      ggm.lastBlackMove = [null, null];
    } else {
      this.lastMove = 1;
      ggm.lastWhiteMove = [null, null];
    }
    var whoPassed = this.lastMove === 1 ? 'white' : 'black';
    res.send(201, {text: whoPassed + ' passed their turn.'})
  }

  //Command 5: Help
  if(request[1] === ['help']) {
    res.send(201, {'text':'I can make a Go board for you a friend to play on.'+
    '\nTo create a new board type "go new board [size]." Size can range from 1 to 21.' +
    '\nMake plays by typing in this format: "go e 15 [black | white]", or "go e 15 [b | w]". '+
    '\nTo display the board without making a move, type "go display".'+
    '\nTo skip your turn, type "go pass".'+
    '\nTo finish the game, type "go finish". I will count up the points for you.'});
  }
  
  //Command 7: Joke requests
  if(request === ["go","take","a","hike"] || request === ["go","jump","off","a","bridge"] || 
     request === ["go","to","hell"] || request === ["go","away"] || request === ["go","fuck","yourself"] || 
     request === ["go","suck","a","dick"]) {
    res.send(201, {'text': "Right back at you." });
  }

  //Incorrect input 1: Catches incorrect commands
  if( request[1].length !== 1 ||  request[2].length > 2 ||  (request[3].length !== 5 && request[3].length !== 1) ||
      !request[1].match(/[a-s]/) || !request[2].match(/[1-9]/) || !request[3].match(/[abcehikltw]/)) {
    res.send(201, {'text': "I didn't understand that. For help type \"go help\"." });
  }

  //Further sanitizes input, parses letter and stone color as ints. 
  //Black == 1, White == 2, blank square == 0
  var row = request[1].charCodeAt(0) - 97;
  if(row < 0) row += 32;
  var column = request[2] - 1;

  var play = 1;
  if(request[3] === "black" || request[3] === "b") {
    request[3] = "black";
  } else if(request[3] === "white" || request[3] === "w") {
    request[3] = "white";
    play = 2;
  }

  //Prevents players from playing outside of the board
  if(row > ggm.size) row = ggm.size;
  if(column > ggm.size) column = ggm.size;

  //Incorrect input 2: Play on top of placed stone
  if(ggm.board[column][row] !== 0) {
    res.send(201, {'text':'There is already a stone at that spot.'})
    return;
  }

  //Incorrect input 3: Play (kou error)
  //Prevent players from making the same move twice in a row
  if(([column, row] === ggm.lastBlackMove && play === 1 )||([column, row] === ggm.lastWhiteMove && play === 2)) {
    res.send(201, {'text':'It is against the rule of Kou (コウ) for a player to play the same move two turns in a row.'}); 
    return;
  }

  //Incorrect input 4: Play (out of turn error)
  //Prevents players from playing out of turn
  if(this.lastMove === play) {
    res.send(201, {'text':'It\'s not '+request[3]+'\'s turn to play.'});
    return;
  }

  //The move succeeded!!!

  this.lastMove = play;

  if(play === 1){
    ggm.lastBlackMove = [column, row];
  } else {
    ggm.lastWhiteMove = [column, row];
  } 
  console.log(JSON.stringify(column));
  console.log("lbm: " + this.lastBlackMove);

  //Controller method. alters data in the GoGameModel.
  ggm.addPiece(row, column, play);

  //Row posting method
  var postingRow = 0;
  
  var postARow = function() {
    client.post(incomingHookUrl, { 'text': ggm.printBoard(postingRow) });
    postingRow++;
  }

  //Posts all rows 1.1 second apart from each other
  for(var i = 0; i < ggm.size+1; i++) {
    setTimeout(postARow, 1100*(i+1));
  }

  //Avoids new plays being made during printing
  var finishPrinting = function() {printing = false;}
  setTimeout(finishPrinting, 1100*(ggm.size+3));

  printing = true;
 
  //Final outcome: Play (success)
  //Sends message confirming move
                
  res.send(201, {'text': request[3] + ' plays at ' + request[2] + '-' + request[1]});
});

  //TODO
  //make it modular / take an incoming hook url to initialize the application, so it's possible
    //to run it after dling from github








  ////////////////////////////////////////////
  // Go Game Model: Handles all game logic  //
  ////////////////////////////////////////////

var GoGameModel = function(size) {
  this.size = size-1 || 18;
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
  if(row === undefined || column === undefined || color === undefined) throw 'error!';
  if(this.board[row][column] === 1 || this.board[row][column] === 2) throw 'error!';
  if(color === 0) throw 'error!';

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
      
      //The function should not get here, because all possible moves have continue statements
      throw 'Big error in recursion!';
    }
  }
  
  //If this group is dead, add the pieces to piecestoremove object in board closure
  if(!isAlive) {
    for(var i = 0; i < thisGroup.length; i++) {
      this.piecesToRemove[this.stringify(thisGroup[i])] = thisGroup[i];
    }
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

  //runs for loop once and breaks, and continues to run the loop once while there are more empty squares
  while(Object.keys(emptySquares).length > 1) {
    for(key in emptySquares) {
      
      var rowColumn = emptySquares[key].split('-');
      
      var emptySquaresInfo = this.findEmptySquareGroup(rowColumn[0], rowColumn[1]);

      var pointsGoTo = 0;
      if(emptySquaresInfo[0] === false && emptySquaresInfo[1] === false) {
        //this should not be possible unless on an empty board
        throw 'This group didn\'t touch anything';
      }
      else if(emptySquaresInfo[0] && !emptySquaresInfo[1]) pointsGoTo = 1;
      else if(!emptySquaresInfo[0] && emptySquaresInfo[1]) pointsGoTo = 2;
      
      if(pointsGoTo === 1) this.blackPoints += emptySquaresInfo[2].length;
      else if(pointsGoTo === 2) this.whitePoints += emptySquaresInfo[2].length;

      for(var i = 0; i < emptySquaresInfo[2].length; i++) {
        delete emptySquares[emptySquaresInfo[2][i]];
      }

      break;
    }
  }
}

//Helper function for countPoints()
GoGameModel.prototype.findEmptySquareGroup = function(row, column) {
  var thisGroup = {};
  var thereIsABlackAdjacent = false;
  var thereIsAWhiteAdjacent = false;

  var recurse = function(row, column) {
    if(thereIsAWhiteAdjacent && thereIsABlackAdjacent) return;

    var key = this.stringify([row, column]);
    if(thisGroup[key]) return;

    thisGroup[key] = [row, column];
    
    var adjSpots = this.adjacentSpots([row, column]);

    for(var i = 0; i < adjSpots.length; i++) {
      if(this.board[adjSpots[i][0]][adjSpots[i][1]] === 1) {
        thereIsABlackAdjacent = true;
      } else if(this.board[adjSpots[i][0]][adjSpots[i][1]] === 2) {
        thereIsAWhiteAdjacent = true;
      } else if(this.board[adjSpots[i][0]][adjSpots[i][1]] === 0) {
        recurse(adjSpots[i][0], adjSpots[i][1]);
      }
    }
  }

  recurse.call(this, row, column);

  var thisGroupArray = Object.keys(thisGroup);

  return [thereIsABlackAdjacent, thereIsAWhiteAdjacent, thisGroupArray];
}








  ////////////////////////////
  // Board printing method  //
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
    numberText = '1   2   3   4   5   6   7  8   9  10  11  12  13  14  15  16  17  18 19  20  21  22';
    result += '\n`' + numberText.slice(0, numberText.indexOf(this.size+1)+2) + '`';
    result += '\nBlack: ' + this.blackPoints + " capture points";
    result += ' | White: ' + this.whitePoints + " capture points ";
    whoseTurn = this.lastMove === 1 ? 'white' : 'black';
    result += "| It is " + whoseTurn + "'s turn.";
    result += "\nLast black move : " + ggm.lastBlackMove;
    result += "\nLast white move : " + ggm.lastWhiteMove;
  }
  return result;
}








  ////////////////////////////
  // Initial server setup   //
  ////////////////////////////

                //Creates new GoGameModel
                  //size 5 for testing
                var ggm = new GoGameModel(5);
                ggm.crappyTest = 0;

                server.get('/', function(req, res) {
                  if(ggm.crappyTest === 0) {
                    ggm.addPiece(0,1,2);
                  } else if(ggm.crappyTest === 1) {
                    ggm.addPiece(1,0,2);      
                  } else if(ggm.crappyTest === 2) {
                    ggm.addPiece(1,1,1);      
                  } else if(ggm.crappyTest === 3) {
                    ggm.addPiece(2,0,1);      
                  } else if(ggm.crappyTest === 4) {
                    ggm.addPiece(0,0,1);      
                  } else if(ggm.crappyTest === 5) {
                    ggm.addPiece(0,1,2);      
                  }

                  console.log(ggm.printBoard(0));
                  console.log(ggm.printBoard(1));

                  ggm.crappyTest++;
                  
                  console.log('lbm: ' + JSON.stringify(ggm.lastBlackMove) + ", lwm: " + ggm.lastWhiteMove + ", ct: " +ggm.crappyTest);

                  res.send(201, {'text': 'lbm: ' + ggm.lastBlackMove + ", lwm: " + ggm.lastWhiteMove});
                })

//Turns on server
server.listen(port, function() {
  console.log('%s listening at %s', server.name, server.url);
});

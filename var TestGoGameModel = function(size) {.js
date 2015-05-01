var GoGameModel = function(size) {
  this.size = size-1 || 18;
  this.size;
  this.piecesToRemove = {};
  this.visitedPieces = {};
  this.thisColor = 0;
  this.blackPoints = 0;
  this.whitePoints = 0;
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

  for(var i = 0; i < originAdjacent.length; i++) {
    //sets color of this group
    //debugger;
    this.thisColor = this.board[originAdjacent[i][0]][originAdjacent[i][1]];
    //ABOUT TO STEP INTO HELL
    if(this.thisColor>0) {
      this.checkPiece(originAdjacent[i]);
    }
  }

  //debugger;

  //Counts points that black and white players gain
  
  for(key in this.piecesToRemove) {
    //debugger;
    debugger;
    //Parses row and column
    var toRemove = this.piecesToRemove[key];
    console.log('removing at ' + JSON.stringify(toRemove));

    //Checks color and awards points
    (this.board[toRemove[0]][toRemove[1]] === 1) ? this.whitePoints++ : this.blackPoints++;
    
    //Removes piece
    this.board[toRemove[0]][toRemove[1]] = 0;
    //debugger;
  }

  //debugger;
  //RESET EVERYTHING! CHECK IF IT EVEN WORKS

  //Resets piecesToRemove and visitedPieces
  this.piecesToRemove = {};
  this.visitedPieces = {};
  this.thisColor = 0;
  this.testPrint();
} 

//returns adjacentSpots tuples
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
  console.log(result);
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
  //YOU HAVE NOW ENTERED HELL
  //debugger;
  //Prevents redundant searches
  if(this.isVisited(rowColumn)) return;

  var enemyColor = (this.thisColor === 1) ? 2 : 1;

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
    var currentAdjacents = this.adjacentSpots(shift);

    for(var j = 0; j < currentAdjacents.length; j++) {
      if(this.isVisited(currentAdjacents[j])) {
        continue;
      }

      //If this group has an opening, set isAlive to true
      if(this.board[currentAdjacents[j][0]][currentAdjacents[j][1]] === 0) {
        isAlive = true;
        continue;
      }

      //If this piece (the one being visited) is the same color, add it to queue and group, and mark as visited
      if(this.board[currentAdjacents[j][0]][currentAdjacents[j][1]] === this.thisColor) {
        this.visitedPieces[this.stringify(currentAdjacents[j])] = currentAdjacents[j];
        testQueue.push(currentAdjacents[j]);
        thisGroup.push(currentAdjacents[j]);
        continue;
      }

      if(this.board[currentAdjacents[j][0]][currentAdjacents[j][1]] === enemyColor) {
        continue;
      }
      //debugger;
      console.log('Big error!');
      throw 'Big error in recursion!';
    }
  }
  //debugger;

  if(!isAlive) {
    for(var i = 0; i < thisGroup.length; i++) {
      this.piecesToRemove[this.stringify(thisGroup[i])] = thisGroup[i];
    }
  }
}

var test = new GoGameModel(5);



GoGameModel.prototype.testPrint = function() {
  var print = "";
  for(var i = 0; i < this.board.length; i++) {
    for(var j = 0; j < this.board.length; j++) {
      print += this.board[i][j] + ' ';
    }
    print += '\n';
  }
  console.log(print);
}
pragma solidity ^0.6.2;

contract Squaragon {

	address public owner;
    address public player1;
    address public player2;
    address public player3; 
    address public player4;

	uint256 board;
	uint256 gameState;
	/*
	bits	| description
	---------------------
	23-0	| location of 4 to 1, row and collumn
	28-26	| number of players
	32-29	| board size
	36-33	| is player 4 to 1 blocked
	38-37	| winner
	39		| is game active
	55-63	| turn
	*/

    constructor () public {
        owner = msg.sender;
		gameState = 0;
    }

	function move(uint8 direction) public {
		require(gameState & (1<<39));
		address addr = 0;
		uint8 turn = (gameState >> 55) & 3;
		if(turn == 0) {
			addr = player1;
		} else if(turn == 1){
			addr = player2;
		} else if(turn == 2){
			addr = player3;
		} else if(turn == 3){
			addr = player4;
		} 
		uint8 offset = 6*turn;
		uint8 row = (gameState >> (offset+3)) & 7;
		uint8 col = (gameState >> (offset)) & 7;
		require(addr = msg.sender);
		if(direction == 0) { //up
			require(isOpen(--row,col));
		} else if(direction == 1) {//right
			require(isOpen(row,++col));
		} else if(direction == 2) {//down
			require(isOpen(++row,col));
		} else if(direction == 3) {//left
			require(isOpen(--row,col));
		}
		uint8 position = (row << 3) + col;
		gameState = gameState & ~(63<<offset) | (position<<offset);
		uint8 boardSize = (gameState >> 29) & 7;
		uint8 location = (row*boardSize + col)<<3;
		board = board & ~(15 << location) | (1<<(turn+location));
		if(isBlocked(turn++)) {
			if(isBlocked(turn++)) {
				if(isBlocked(turn++)) {
					gameState = (turn & 3) << 37;
				}
			}			
		}
		gameState = gameState & ~(3<<55) | (turn<<55);
	}



	function isBlocked(uint8 player) private returns (bool){
		if((gameState & (1<< (33+player))) != 0) {
			return true;
		}
		player = player & 3;
		uint8 row = (gameState >> (6*player+3)) & 7;
		uint8 col = (gameState >> (6*player)) & 7;
		bool result = ~(isOpen(row, col+1) & isOpen(row, col-1) & isOpen(row+1, col)& isOpen(row-1, col));
		if(result) {
			gameState = gameState | (1<< (33+player));
		}
		return result;
	}

    function start(uint8 gameSize) public {
		require(msg.sender == owner);
		require(gameSize-3<=5);
		require((gameState>>26 && 7) == 4);
        board = 0;
		gameState = (1<<39)+ (gameSize<<29) + (4 << 26) + ((gameSize-1) << 21) + ((gameSize-1) << 18) + ((gameSize-1) << 15) + ((gameSize-1) << 9);
    }

    function reset() public {
        require(msg.sender == owner);
		gameState = 0;
    }

    function isOpen(uint8 row, uint8 col) private returns (bool){
		uint8 boardSize = (gameState >> 29) & 7;
		if(row> boardSize || col > boardSize) {
			return false;
		}
        return  (board >> ((row * boardSize + col)<<3)) == 0;
    }

    function join() public returns (uint8){
		require(gameState & (7 << 37) == 0);
		uint8 numOfPlayers = (gameState >> 26) & 7;
		require(numOfPlayers<4);
		if(numOfPlayers == 0){
            player1 = msg.sender;
        } else if(numOfPlayers == 1){
            player2 = msg.sender;
        } else if(numOfPlayers == 2){
            player3 = msg.sender;
        } else if(numOfPlayers == 3){
            player4 = msg.sender;
        }
		numOfPlayers++;
		gameState = gameState & ~(7<<26) | (numOfPlayers<<26);
    }

}
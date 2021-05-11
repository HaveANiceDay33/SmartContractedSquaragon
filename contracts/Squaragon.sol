pragma solidity ^0.7.0;

contract Squaragon {

	address public owner;
    address public player1;
    address public player2;
    address public player3; 
    address public player4;

	uint256 public board;
	/* board initial state:
	1     2
	3     4
	*/
	
	uint256 public gameState;
	/*
	bits	| description
	---------------------
	23-0	| location of 4 to 1, row and collumn
	28-26	| number of players
	32-29	| board size
	36-33	| is player 4 to 1 blocked
	38-37	| winner
	39		| is game active
	63-55	| turn
	*/

    constructor () public {
        owner = msg.sender;
		gameState = 0;
    }

	function move(uint256 direction) public {
		require(gameState & (1<<39) != 0);
		address addr;
		uint256 turn = (gameState >> 55) & 3;
		if(turn == 0) {
			addr = player1;
		} else if(turn == 1){
			addr = player2;
		} else if(turn == 2){
			addr = player3;
		} else if(turn == 3){
			addr = player4;
		} 
		uint256 offset = 6*turn;
		uint256 row =(gameState >> (offset+3)) & 7;
		uint256 col =(gameState >> (offset)) & 7;
		require(addr == msg.sender);
		if(direction == 0) { //up
			require(isOpen(--row,col));
		} else if(direction == 1) {//right
			require(isOpen(row,++col));
		} else if(direction == 2) {//down
			require(isOpen(++row,col));
		} else if(direction == 3) {//left
			require(isOpen(row,--col));
		}
		uint256 position = (row << 3) + col;
		gameState = gameState & ~(63<<offset) | (position<<offset);
		uint256 boardSize = (gameState >> 29) & 7;
		uint256 location = (row*boardSize + col)*4;
		board = board & ~(15 << location) | (1<<(turn+location));
		if(isBlocked(++turn)) {
			if(isBlocked(++turn)) {
				if(isBlocked(++turn)) {
				    turn++;
					gameState = (turn & 3) << 37;
				}
			}			
		}
		gameState = gameState & ((uint256) (~(3<<55))) | (turn <<55);
	}



	function isBlocked(uint256 player) private returns (bool){
		if((gameState & (1<< (33+player))) != 0) {
			return true;
		}
		player = player & 3;
		uint256 row = (gameState >> (6*player+3)) & 7;
		uint256 col = (gameState >> (6*player)) & 7;
		bool result = !(isOpen(row, col+1) || isOpen(row, col-1) || isOpen(row+1, col) || isOpen(row-1, col));
		if(result) {
			gameState = gameState | (1<< (33+player));
		}
		return result;
	}

    function start(uint256 gameSize) public {
		require(msg.sender == owner);
		require(gameSize-3<=5);
		require((gameState>>26 & 7) == 4);
        board = 1 + (2<<(4*(gameSize-1))) +  (4<<(4*(gameSize-1)*gameSize))+ (8<<(4*((gameSize-1)*gameSize+(gameSize-1))));
		gameState = (1<<39)+ (gameSize<<29) + (4 << 26) + ((gameSize-1) << 21) + ((gameSize-1) << 18) + ((gameSize-1) << 15) + ((gameSize-1) << 6);
    }

    function reset() public {
        require(msg.sender == owner);
		gameState = 0;
    }

    function isOpen(uint256 row, uint256 col) view private returns (bool){
		uint256 boardSize = (gameState >> 29) & 7;
		if(row>= boardSize || col >= boardSize) {
			return false;
		}
        return  (board & (15<<((row * boardSize + col)*4))) == 0;
    }

    function join() public{
		require(gameState & (7 << 37) == 0);
		uint256 numOfPlayers = (gameState >> 26) & 7;
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
		gameState = gameState & ((uint256) (~(7<<26))) | (numOfPlayers<<26);
    }

}
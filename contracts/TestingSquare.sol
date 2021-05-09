pragma solidity ^0.7.0;

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
		
	}

	function isBlocked(uint8 player) private returns (bool){
		return false;
	}

    function start(uint8 gameSize) public {
		
    }

    function reset() public {
        
    }

    function isOpen(uint8 row, uint8 col) private returns (bool){
		
		return true;
    }

    function join() public returns (uint8){
		
		return 1;
    }

}
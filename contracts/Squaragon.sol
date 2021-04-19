pragma solidity ^0.6.2;

contract Squaragon {
    address public player1;
    address public player2;
    address public player3; 
    address public player4;

    uint p1R; 
    uint p2R;
    uint p3R; 
    uint p4R; 
    uint p1C; 
    uint p2C; 
    uint p3C; 
    uint p4C;

    uint gameSize;

    uint256 gameBoard = 0;
    uint players = 0;

    constructor () public {
        player1 = msg.sender;
        players++;
    }

    function movePlayer(uint curRow, uint curCol, uint row, uint col) private returns (bool){
        if(row > gameSize || col > gameSize || occupied(row, col) || 
        (row - curRow) > 1 || (curRow-row) > 1 || (col-curCol) > 1 || (curCol-col > 1)){
            return false;
        }
        return true;
    }

    function move(uint row, uint col) public {
        //need to manipulate gameboard after move
        if(msg.sender == player1){
            if(movePlayer(p1R, p1C, row, col)){
                p1R = row;
                p1C = col;
                gameBoard = (1 << (3*(gameSize*row+col))) | gameBoard;
            } 
        } else if(msg.sender == player2){
            if(movePlayer(p2R, p2C, row, col)){
                p2R = row;
                p2C = col;
                gameBoard = (2 << (3*(gameSize*row+col))) | gameBoard;

            } 
        } else if(msg.sender == player3){
            if(movePlayer(p3R, p3C, row, col)){
                p3R = row;
                p3C = col;
                gameBoard = (3 << (3*(gameSize*row+col))) | gameBoard;
            } 
        } else if(msg.sender == player4){
            if(movePlayer(p4R, p4C, row, col) == true){
                p4R = row;
                p4C = col;
                gameBoard = (4 << (3*(gameSize*row+col))) | gameBoard;
            } 
        }
    }

    function start(uint gameSize_arg) internal {
        gameSize = gameSize_arg;
        
    }

    function reset() public {
        gameSize = 6;
        //give $$ back
    }

    function payout(address winningPlayer) private {

    }

    function occupied (uint row, uint col) private returns (bool){
    
        return (7 & (gameBoard >> (3 * (gameSize * row) + col))) != 0;
    }

    function addPlayer() public {
        if(players == 1){
            player2 = msg.sender;
            players++;
        }
        if(players == 2){
            player3 = msg.sender;
            players++;
        }
        if(players == 3){
            player4 = msg.sender;
            players++;
        }
    }

}
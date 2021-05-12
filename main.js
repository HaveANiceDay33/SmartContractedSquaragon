// load web3 when page starts (or fail)
window.addEventListener('load', function() {
    if (typeof window.ethereum !== 'undefined') {
        console.log('window.ethereum detected!')
        window.web3 = new Web3(window.ethereum);
        window.ethereum
            .request({
                method: 'eth_requestAccounts'
            })
            .then((accounts) => {
                console.log("Connected to account id " + accounts[0]);
                window.Squaragon.address = accounts[0];
            });
    } else {
        console.log('No window.ethereum detected.  :(')
    }

    getBoard();
})

// This is a global data structure that models the game state.
// Try inspecting it in the web console!
window.Squaragon = {
    "p1row": 0,
    "p1col": 0,
    "p2row": 0,
    "p2col": 0,
    "p3row": 0,
    "p3col": 0,
    "p4row": 0,
    "p4col": 0,

    "numPlayers": 0,
    "size": 0,
    "p1blocked": 0,
    "p2blocked": 0,
    "p3blocked": 0,
    "p4blocked": 0,

    "winner": 0,
    "active": 0,
    "turn": 0,
    "over": 0,
    "p1": 0,
    "p2": 0,
    "p3": 0,
    "p4": 0
};

window.Board = {
    "squares": [],
};

function subToIndex(row, col, size) {
    return row * size + col;
}

async function move(direction) {
    try {
        let contract = new web3.eth.Contract(squaragon_abi, squaragon_addr);
        const move_method = dir => promisifySend(contract.methods.move(dir));
        let actualMove = await (move_method(direction));
        console.log("You moved in direction " + actualMove);
    } catch (err) {
        console.error(err);
    }
}

async function getBoard() {
    await getGameState();

    if (Squaragon.over == true) {
        document.querySelector("#winner").innerHTML = `Player ${Squaragon.winner + 1} Wins!`;
        document.querySelector("#winner").style.display = "block";
    } else {
        document.querySelector("#winner").style.display = "hidden";
    }
    try {
        let contract = new web3.eth.Contract(squaragon_abi, squaragon_addr);
        const board_funct = () => promisify(contract.methods.board());
        let board = await (board_funct());
        let boardBig = BigInt(board);
        let bitString = boardBig.toString(2).padStart(256, "0");

        console.log("Board: " + bitString);
        window.Board.squares = bitString.match(/.{1,4}/g).reverse();

        let styleString = "";
        const newList = htmlToElement('<div id="play-area"></div>');
        for (let i = 0; i < Squaragon.size * Squaragon.size; i++) {
            let state = Board.squares[i];
            let newBlock = _createSquare(i, state);

            let p1I = subToIndex(Squaragon.p1row, Squaragon.p1col, Squaragon.size);
            let p2I = subToIndex(Squaragon.p2row, Squaragon.p2col, Squaragon.size);
            let p3I = subToIndex(Squaragon.p3row, Squaragon.p3col, Squaragon.size);
            let p4I = subToIndex(Squaragon.p4row, Squaragon.p4col, Squaragon.size);

            if (state == "0001") {
                newBlock.style.backgroundColor = "green";
            } else if (state == "0010") {
                newBlock.style.backgroundColor = "blue";
            } else if (state == "0100") {
                newBlock.style.backgroundColor = "red";
            } else if (state == "1000") {
                newBlock.style.backgroundColor = "orange";
            }

            if (i == p1I) {
                newBlock.style.boxShadow = "0px 0px 40px 10px lawnGreen";
            } else if (i == p2I) {
                newBlock.style.boxShadow = "0px 0px 40px 10px indigo";
            } else if (i == p3I) {
                newBlock.style.boxShadow = "0px 0px 40px 10px Maroon";
            } else if (i == p4I) {
                newBlock.style.boxShadow = "0px 0px 40px 10px goldenRod";
            }
            newList.appendChild(newBlock);

        }

        for (let i = 0; i < Squaragon.size; i++) {
            styleString += "auto ";
        }
        const oldList = document.querySelector("#play-area");
        oldList.removeAttribute("id");
        oldList.hidden = true;

        oldList.parentElement.appendChild(newList);

        document.querySelector("#play-area").style['grid-template-columns'] = styleString;

    } catch (err) {
        console.error(err);
    }

}

async function getGameState() {
    try {
        let contract = new web3.eth.Contract(squaragon_abi, squaragon_addr);
        const state_funct = () => promisify(contract.methods.gameState());
        const game_over_funct = () => promisify(contract.methods.gameOver());
        const p1_funct = () => promisify(contract.methods.player1());
        const p2_funct = () => promisify(contract.methods.player2());
        const p3_funct = () => promisify(contract.methods.player3());
        const p4_funct = () => promisify(contract.methods.player4());
        let p1 = await p1_funct();
        let p2 = await p2_funct();
        let p3 = await p3_funct();
        let p4 = await p4_funct();
        let state = await (state_funct());
        let winState = await (game_over_funct());
        let stateBig = BigInt(state);

        let bitString = stateBig.toString(2).padStart(64, "0");

        console.log("State: " + bitString);

        window.Squaragon.p1col = parseInt(bitString.substring(61, 64), 2);
        window.Squaragon.p1row = parseInt(bitString.substring(58, 61), 2);
        window.Squaragon.p2col = parseInt(bitString.substring(55, 58), 2);
        window.Squaragon.p2row = parseInt(bitString.substring(52, 55), 2);
        window.Squaragon.p3col = parseInt(bitString.substring(49, 52), 2);
        window.Squaragon.p3row = parseInt(bitString.substring(46, 49), 2);
        window.Squaragon.p4col = parseInt(bitString.substring(43, 46), 2);
        window.Squaragon.p4row = parseInt(bitString.substring(40, 43), 2);

        window.Squaragon.numPlayers = parseInt(bitString.substring(35, 38), 2);
        window.Squaragon.size = parseInt(bitString.substring(31, 35), 2);
        window.Squaragon.p1blocked = parseInt(bitString.substring(30, 31), 2);
        window.Squaragon.p2blocked = parseInt(bitString.substring(29, 30), 2);
        window.Squaragon.p3blocked = parseInt(bitString.substring(28, 29), 2);
        window.Squaragon.p4blocked = parseInt(bitString.substring(27, 28), 2);

        window.Squaragon.winner = parseInt(bitString.substring(25, 27), 2);
        window.Squaragon.active = parseInt(bitString.substring(24, 25), 2);
        window.Squaragon.turn = parseInt(bitString.substring(0, 9), 2);

        window.Squaragon.over = winState;

        window.Squaragon.p1 = p1;
        window.Squaragon.p2 = p2;
        window.Squaragon.p3 = p3;
        window.Squaragon.p4 = p4;

        document.querySelector("#p1").innerHTML = "Player 1: " + p1;
        document.querySelector("#p2").innerHTML = "Player 2: " + p2;
        document.querySelector("#p3").innerHTML = "Player 3: " + p3;
        document.querySelector("#p4").innerHTML = "Player 4: " + p4;

        document.querySelector("#turn").innerHTML = `It is Player ${(Squaragon.turn % 4) + 1}'s turn.`;


    } catch (err) {
        console.error(err);
    }
}

//from stackoverflow
function htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim();
    template.innerHTML = html;
    return template.content.firstChild;
}



function _createSquare(num, value) {
    return htmlToElement(`<div id = block_${num} class="square"></div>`);
}

/*<div class="card-body">
<p class="card-title">${num} - ${value}</p>
</div>
*/
// This is a helper function that generates a promise-generating function.
// It's used to convert from the async .call() web3 functions to promises.
const promisify = (method) =>
    new Promise((resolve, reject) =>
        method.call({
            from: window.Squaragon.address
        }, (err, res) => {
            if (err) {
                reject(err);
            } else {
                resolve(res);
            }
        })
    );

const promisifySend = (method) =>
    new Promise((resolve, reject) =>
        method.send({
            from: window.Squaragon.address
        }, (err, res) => {
            if (err) {
                reject(err);
            } else {
                resolve(res);
            }
        })
    );

document.querySelector("#md").onclick = async function() {
    await move(2);
    getBoard();
}

document.querySelector("#mu").onclick = async function() {
    await move(0);
    getBoard();
}

document.querySelector("#mr").onclick = async function() {
    await move(1);
    getBoard();
}

document.querySelector("#ml").onclick = async function() {
    await move(3);
    getBoard();
}

document.querySelector("#reset").onclick = async function() {

    try {
        let contract = new web3.eth.Contract(squaragon_abi, squaragon_addr);
        const reset_method = () => promisifySend(contract.methods.reset());
        let actualReset = await (reset_method());
    } catch (err) {
        console.error(err);
    }

    getBoard();

}

document.querySelector("#start").onclick = async function() {
    let size = document.querySelector("#size").value;
    try {
        let contract = new web3.eth.Contract(squaragon_abi, squaragon_addr);
        const start_method = dir => promisifySend(contract.methods.start(dir));
        let actualStart = await (start_method(size));
    } catch (err) {
        console.error(err);
    }
    getBoard();
}

document.querySelector("#join").onclick = async function() {
    try {
        let contract = new web3.eth.Contract(squaragon_abi, squaragon_addr);
        const start_method = () => promisifySend(contract.methods.join());
        let actualJoin = await (start_method(join));
    } catch (err) {
        console.error(err);
    }
    getBoard();
}

document.querySelector("#refresh").onclick = async function() {
    getBoard();
}
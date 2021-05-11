// load web3 when page starts (or fail)
window.addEventListener('load', function () {
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
})

async function move(direction) {
    try {
        let contract = new web3.eth.Contract(squaragon_abi, squaragon_addr);
        const move_method = dir => promisify(contract.methods.move(dir));
        let actualMove = await (move_method(direction));
        console.log("You moved in direction " + actualMove);
    } catch (err) {
        console.error(err);
    }
}

async function getBoard() {
    try {
        let contract = new web3.eth.Contract(squaragon_abi, squaragon_addr);
        const board_funct = () => promisify(contract.methods.board());
        let board = await (board_funct());
        let boardBig = BigInt(board);
        let bitString = boardBig.toString(2).padStart(256, "0");
        
        console.log("Board: "+bitString);
        window.Board = bitString.match(/.{1,4}/g).reverse();

    } catch (err) {
        console.error(err);
    }
}

async function getGameState() {
    try {
        let contract = new web3.eth.Contract(squaragon_abi, squaragon_addr);
        const state_funct = () => promisify(contract.methods.gameState());
        let state = await (state_funct());

        const statebits = x => (x >>> 0).toString(2).padStart(64, "0");

        const bitString = statebits(state);

        console.log("State: " + bitString);

        window.Squaragon.p1col = parseInt(bitString.substring(61,64), 2);
        window.Squaragon.p1row = parseInt(bitString.substring(58,61), 2);
        window.Squaragon.p2col = parseInt(bitString.substring(55,58), 2);
        window.Squaragon.p2row = parseInt(bitString.substring(52,55),2);
        window.Squaragon.p3col = parseInt(bitString.substring(49,52), 2);
        window.Squaragon.p3row = parseInt(bitString.substring(46,49), 2);
        window.Squaragon.p4col = parseInt(bitString.substring(43,46), 2);
        window.Squaragon.p4row = parseInt(bitString.substring(40,43), 2);

        window.Squaragon.numPlayers = parseInt(bitString.substring(35,38), 2);
        window.Squaragon.size = parseInt(bitString.substring(31,35),2 );
        window.Squaragon.p1blocked = parseInt(bitString.substring(30,31), 2);
        window.Squaragon.p2blocked = parseInt(bitString.substring(29,30), 2);
        window.Squaragon.p3blocked = parseInt(bitString.substring(28,29),2 );
        window.Squaragon.p4blocked = parseInt(bitString.substring(27,28),2 );
        
        window.Squaragon.winner = parseInt(bitString.substring(25,27),2);
        window.Squaragon.active = parseInt(bitString.substring(24,25),2);
        window.Squaragon.turn = parseInt(bitString.substring(0,9),2);

       

    } catch (err) {
        console.error(err);
    }
}

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
};

window.Board = {
    "squares" : [],
}

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

document.querySelector("#md").onclick = () => {
    getBoard();
}

document.querySelector("#mu").onclick = () => {
    getGameState();
}
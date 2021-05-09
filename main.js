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
        let actualMove = await(move_method(direction));
        console.log("You moved in direction "+ actualMove);
    } catch (err) {
        console.error(err);
    }
}

// This is a global data structure that models tokens.
// Try inspecting it in the web console!
window.Squaragon = {
    "address": 0,
};

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

document.querySelector("#mr").onclick = (event) => {
    move(0);
}
document.querySelector("#ml").onclick = (event) => {
    move(1);
}
document.querySelector("#mu").onclick = (event) => {
    move(2);
}
document.querySelector("#md").onclick = (event) => {
    move(3);
}
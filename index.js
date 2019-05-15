require('dotenv').config()
const request = require('request');
var RpcClient = require('bitcoind-rpc-client');
var config = {
    protocol: 'http',
    user: process.env.rpcuser,
    pass: process.env.rpcpassword,
    host: '127.0.0.1',
    port: process.env.rpcport
};
var client = new RpcClient(config);
//Set RPC connection stuff
//END RPC Setup

//Start API Vars
function showNewTransactions(addr, value) {
    client.cmd(addr, value).then(function(result) {
        // if (err) {
        //     console.error(err);
        //     return setTimeout(showNewTransactions, 10000);
        // }


    }.catch(onFailure))
}

/* Variables for the TX Queue */
var txQueue = []

/*
  A TX in the txQueue is formed like this:

  {
    addr: (string),
    amt: (numerical-8)
  }
*/

/* Check for queued TX'es at a regular interval, to prevent overloading the wallet */
function checkTxQueue () {
  if (txQueue.length > 0) { // Don't check the queue if it's empty
    console.log("TX Queue: Sending TX " + txQueue.length)
    if (!txQueue[0].addr || !txQueue[0].amt) return // Make sure a TX isn't malformed
    client.cmd('sendtoaddress', txQueue[0].addr, txQueue[0].amt).then(function(result) {
      console.log(result)
    }).catch(onFailure)
  }
}

/* Start the queue interval, 10 second interval */
setInterval(checkTxQueue, 10000)

function doswap() {
    var apiurl = process.env.explorerapi;
    var addrdata;
    //getalladdrs
    var i, j;
    request(apiurl + 'api/alladdrs', { json: true }, (err, res, body) => {
        if (err) { return console.log(err); }
        addrdata = body;

        var badaddrs = ["DU3xQ2uX6BmmWzAHsqENoyJA8SLVpQQjk8", "DT9LxyfGn91gAWhXedSf81B7ATLseSxuVv",
            "DJM1uEdrCiSzZRk9hwpaFi1DmYNFh2gpxL", "DBHP5rx1dyhgyo6Chpt4mqe5ZXYBc7zpHb",
            "DRaaCkzhk9zM76rwcgBmgf5UfemS7bCRBC", "DAYyhPf9iijgjWU9nf52BveccLdgWp5DLw",
            "DU3xQ2uX6BmmWzAHsqENoyJA8SLVpQQjk8", "DNEmMeB8FbQesnk6zRtPcznwPxDXADUXAg"
        ];
        if (addrdata != null) {
            for (i = 0; i < addrdata.length; i++) {
                for (j = 0; j < badaddrs.length; j++) {
                    if (addrdata[i].address == (badaddrs[j])) {
                        //addrdata.splice(i, 1);
                    } else {
                        console.log("TX Queue: Pushing new TX into queue")
                        txQueue.push({
                          addr: addrdata[i].address,
                          amt: addrdata[i].value
                        })
                    }

                }

            }
            // client.cmd('getinfo').then(function(result) {
            //     console.log(result);
            // }).catch(onFailure)
        }
    });
}
// setTimeout(doswap, 2000);


doswap();

function onFailure(err) {

    console.log(err)
}

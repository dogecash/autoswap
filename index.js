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
var txcount =0;
//Start API Vars

var badaddrs = ["DAekFXfYfJxesti27B9dyiNwB1G7BZeiX1","DU3xQ2uX6BmmWzAHsqENoyJA8SLVpQQjk8", "DT9LxyfGn91gAWhXedSf81B7ATLseSxuVv",
"DJM1uEdrCiSzZRk9hwpaFi1DmYNFh2gpxL", "DBHP5rx1dyhgyo6Chpt4mqe5ZXYBc7zpHb",
"DRaaCkzhk9zM76rwcgBmgf5UfemS7bCRBC", "DAYyhPf9iijgjWU9nf52BveccLdgWp5DLw",
"DU3xQ2uX6BmmWzAHsqENoyJA8SLVpQQjk8", "DNEmMeB8FbQesnk6zRtPcznwPxDXADUXAg"
];
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
  if (txQueue.length > 0 && txcount < txQueue.length) { // Don't check the queue if it's empty
    console.log("TX Queue: Sending TX " + txQueue.length)
    
    if (!txQueue[txcount].addr || !txQueue[txcount].amt) return // Make sure a TX isn't malformed
    console.log("Sending to adddr :" + txQueue[txcount].addr +" Val:" + txQueue[txcount].amt);
    txcount = txcount + 1;
    console.log(txcount + "TXCOUNT")

    client.cmd('sendtoaddress', txQueue[txcount].addr, txQueue[txcount].amt).then(function(result) {
      console.log(result)
    }).catch(onFailure)
  }
 else{
   process.exit(0)
 }
}
process.on('exit', function(code) {  
  return console.log(`Done with code ${code}\n Total TX tried :${txcount} \n ` );
});
/* Start the queue interval, 10 second interval */

/* Validate an address, if it's good it gets pushed into the Queue, else it gets ignored */
function validateAddr (tx) {
	if (badaddrs.toString().includes(tx.addr)) return console.error("Rejecting bad address")
	txQueue.push(tx)
}

function doswap() {
    var apiurl = process.env.explorerapi;
    var addrdata;
    //getalladdrs
    var i;
    request(apiurl + 'api/alladdrs', { json: true }, (err, res, body) => {
        if (err) { return console.log(err); }
        addrdata = body;
        if (addrdata != null) {
            for (i = 0; i < addrdata.length; i++) {
              console.log("TX Queue: Pushing new TX into queue")
                validateAddr({
                  addr: addrdata[i].address,
                  amt: addrdata[i].value
                })
            }
            setInterval(checkTxQueue, 110)

        }
    });
}
// setTimeout(doswap, 2000);


doswap();

function onFailure(err) {

    console.error(err)
}

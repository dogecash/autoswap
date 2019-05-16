require('dotenv').config()
const request = require('request')
var RpcClient = require('bitcoind-rpc-client')
var config = {
    protocol: 'http',
    user: process.env.rpcuser,
    pass: process.env.rpcpassword,
    host: '127.0.0.1',
    port: process.env.rpcport
}
var client = new RpcClient(config)
    //Set RPC connection stuff
    //END RPC Setup
    //Start API Vars

var badaddrs = [
    "DAekFXfYfJxesti27B9dyiNwB1G7BZeiX1", "DU3xQ2uX6BmmWzAHsqENoyJA8SLVpQQjk8",
    "DT9LxyfGn91gAWhXedSf81B7ATLseSxuVv", "DJM1uEdrCiSzZRk9hwpaFi1DmYNFh2gpxL",
    "DBHP5rx1dyhgyo6Chpt4mqe5ZXYBc7zpHb", "DRaaCkzhk9zM76rwcgBmgf5UfemS7bCRBC",
    "DAYyhPf9iijgjWU9nf52BveccLdgWp5DLw", "DU3xQ2uX6BmmWzAHsqENoyJA8SLVpQQjk8",
    "DNEmMeB8FbQesnk6zRtPcznwPxDXADUXAg"
]

/* Variables for the TX Queue */
var txQueue = []

/* The amount of TX'es to send in bulk per-queue-round */
var bulkAmt = 10
    /*
      A TX in the txQueue is formed like this:

      {
        addr: (string),
        amt: (numerical-8)
      }
    */

/* Check for queued TX'es at a regular interval, to prevent overloading the wallet */
function checkTxQueue() {
    if (txQueue.length > 0 && txQueue[0]) { // Don't check the queue if it's empty
        console.log("TX Queue: Sending TX " + txQueue.length)

        if (!txQueue[0].addr || !txQueue[0].amt) return // Make sure a TX isn't malformed
        console.log("Sending to Addr:" + txQueue[0].addr + ", Val:" + txQueue[0].amt)

        var i, len = bulkAmt,
            rawTx = '{' // Open the JSON object of TX'es
        if (txQueue[bulkAmt]) {
            console.log("Over " + bulkAmt + " TX'es in the queue, sending " + bulkAmt + " in bulk")
            for (i = 0; i < len; i++) { // Add each TX into the raw sendmany command
                if (txQueue[0]) {
                    rawTx += formTx(txQueue[0].addr, txQueue[0].amt, len)
                    txQueue.shift() // Flush TX from the queue after loading raw TX into sendmany command
                } // Don't exit, it's safe to continue
            }
        } else {
            console.log("Less than " + bulkAmt + " TX'es in the queue, sending " + txQueue.length + " in bulk")
            len = txQueue.length
            for (i = 0; i < len; i++) { // Add each TX into the raw sendmany command
                if (txQueue[0]) {
                    rawTx += formTx(txQueue[0].addr, txQueue[0].amt, len)
                    txQueue.shift() // Flush TX from the queue after loading raw TX into sendmany command
                } // Don't exit, it's safe to continue
            }
        }

		rawTx = rawTx.slice(0, -1) + ''
        rawTx += '}' // Close the JSON object of TX'es
            //  console.log(rawTx)
        client.cmd('sendmany', "\"\"" /* <-- Replace with account if needed */ , JSON.parse(rawTx)).then(function(result) {
            console.log("Sendmany complete: \n" + result)
        }).catch(onFailure)
    } else {
        console.log("Swap complete, exiting...")
        process.exit(0)
    }
}
process.on('exit', function(code) {
    return console.log(`Done with code ${code}`)
})

/* Validate an address, if it's good it gets pushed into the Queue, else it gets ignored */
function validateAddr(tx) {
    if (badaddrs.toString().includes(tx.addr)) return console.error("Rejecting bad address")
    txQueue.push(tx)
}

/* Form a raw sendmany transaction using the Addr and Amt */
function formTx(addr, amt, len) {
    return '"' + addr + '": ' + amt + ((len > 24) ? ',' : '')
}

function doswap() {
    var apiurl = process.env.explorerapi
        //getalladdrs
    var i, addrdata, len
    request(apiurl + 'api/alladdrs', { json: true }, (err, res, body) => {
        if (err) return console.log(err)
        addrdata = body
        len = addrdata.length;
        if (addrdata != null) {
            for (i = 0; i < len; i++) {
                validateAddr({
                    addr: addrdata[i].address,
                    amt: addrdata[i].value
                })
            }
            setInterval(checkTxQueue, 5000) // {bulkAmt} TX'es every 5 seconds
        }
    })
}
// setTimeout(doswap, 2000)


doswap()

function onFailure(err) {
    console.error(err)
}
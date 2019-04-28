require('dotenv').config()
const request = require('request');
var publicIp = require("public-ip");

// var RpcClient = require('bitcoind-rpc-client');
// var config = {
//     protocol: 'http',
//     user: process.env.rpcuser,
//     pass: process.env.rpcpassword,
//     host: '127.0.0.1',
//     port: process.env.rpcport
// };
// var client = new RpcClient(config);
//Set RPC connection stuff
//END RPC Setup

//Start API Vars

var apiurl = process.env.explorerapi;
var addrdata;


//getalladdrs
request(apiurl + 'api/alladdrs', { json: true }, (err, res, body) => {
    if (err) { return console.log(err); }
    addrdata = body;
    var i,j;
    var totalsupply=0;
    var badaddrs = [ "DU3xQ2uX6BmmWzAHsqENoyJA8SLVpQQjk8",  "DT9LxyfGn91gAWhXedSf81B7ATLseSxuVv",
    "DJM1uEdrCiSzZRk9hwpaFi1DmYNFh2gpxL", "DBHP5rx1dyhgyo6Chpt4mqe5ZXYBc7zpHb",
    "DRaaCkzhk9zM76rwcgBmgf5UfemS7bCRBC", "DAYyhPf9iijgjWU9nf52BveccLdgWp5DLw",
    "DU3xQ2uX6BmmWzAHsqENoyJA8SLVpQQjk8", "DNEmMeB8FbQesnk6zRtPcznwPxDXADUXAg"];
    var totalexploitedamt = 0;
   // console.log(addrdata.length);
    // if(addrdata != null){
console.log("Calculating blacklisted total amount... Please wait")
for(i=0;i < addrdata.length;i++){
    totalsupply = totalsupply + addrdata[i].value;
   for (j=0;j < badaddrs.length;j++){
    if(addrdata[i].address == (badaddrs[j])){
        totalexploitedamt= totalexploitedamt + addrdata[i].value;
    }
  
   }
}
console.log("Caclulation Complete")
console.log("Total Addresses on Chain: " +addrdata.length);
console.log("Total Supply: " +totalsupply);
console.log("Total Blacklisted DOGEC : " +totalexploitedamt);
//console.log(totalexploitedamt);
   // }
  });
function onFailure(err) {

    console.log(err)
  }





require('dotenv').config()
const request = require('request');
var publicIp = require("public-ip");

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

var apiurl = process.env.explorerapi;
var addrdata;


//getalladdrs
request(apiurl + 'api/alladdrs', { json: false }, (err, res, body) => {
    if (err) { return console.log(err); }
    addrdata = body;
    var i;
    if(addrdata != null){
for(i=0;i < addrdata.length;i++){
    client.cmd('sendtoaddress',addrdata[i].address,addrdata[i].value).then(function (result) {
    console.log(result);
    }).catch(onFailure)
      }
    }
  });
function onFailure(err) {

    console.log(err)
  }





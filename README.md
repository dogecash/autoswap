# AutoSwap
Swap coins from 1 chain to another using explorer api call [Only suitable for Dogecash explorer,unless the explorer has a getalladdrs call implemented]

# Prerequisites
- getalladdrs call which is top100 call but with no limit
- old daemon and new daemon to swap to
- New daemon balance should match current supply to be swapped
- nodejs & npm

# How to use
- First do npm install
- setup env vars in .env file
- run node blacklisttotal.js to get blacklist amount and other info if needed
- run node index.js to swap coins from old chain to new chain via rpc

const WebSocket = require('ws');
const Admin = require('../admin');
// const P2P_PORT = process.env.P2P_PORT || 5001;
// const peers = process.env.PEERS ? process.env.PEERS.split(','):[];
const MESSAGE_TYPES = {
    chain : "CHAIN",
    transaction : "TRANSACTION",
    clear_transactions : "CLEAR_TRANSACTIONS", 
    remove_token : "REMOVE_TOKEN"
};

class P2pServer{

    P2P_PORT = process.env.P2P_PORT || 5001;
    peers = process.env.PEERS ? process.env.PEERS.split(','):[];
    constructor(blockchain, transactionPool){
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;
        this.sockets = [];
    }

    listen(){
        const server = new WebSocket.Server({ port:this.P2P_PORT });
        server.on('connection', socket => this.connectSocket(socket));
        this.connectToPeers()
        console.log(`Listening for p2p connections on ${this.P2P_PORT}`);
    }

    connectToPeers(){
        this.peers.forEach(peer => {
            const socket = new WebSocket(peer);
            socket.on('open', ()=> this.connectSocket(socket));
            
        });
    }

    connectSocket(socket){
        this.sockets.push(socket);
        console.log('Socket connected');

        this.messageHandler(socket);
        this.sendChain(socket);
       
    }

    sendChain(socket){
        socket.send(JSON.stringify({
            type: MESSAGE_TYPES.chain,
            chain: this.blockchain.chain}));
    }

    sendTransaction(socket,transaction){ 
        socket.send(JSON.stringify({
            type :MESSAGE_TYPES.transaction,
            transaction}));
    }

    sendTokenToRemove(socket,token){
        socket.send(JSON.stringify({
            type:MESSAGE_TYPES.remove_token,
            token
            }));
    }

    messageHandler(socket){
        socket.on('message', message=>{
            const data = JSON.parse(message);

            switch(data.type){
                case MESSAGE_TYPES.chain:
                    this.blockchain.replaceChain(data.chain);
                    break;
                case MESSAGE_TYPES.transaction:
                    this.transactionPool.updateOrAddTransactions(data.transaction);
                    break; 
                case MESSAGE_TYPES.clear_transactions :
                    this.transactionPool.clear();
                    break;
                case  MESSAGE_TYPES.remove_token:
                    Admin.removeTokens(data.token);
            }
        });
    }

    syncChain(){
        this.sockets.forEach(socket => {
            this.sendChain(socket);
        });
    }

    broadcastTransaction(transaction){
        this.sockets.forEach(socket =>{
            this.sendTransaction(socket,transaction);
        });
    }

    broadcastClearTransactions(){
        this.sockets.forEach(socket =>{
            socket.send(JSON.stringify({
                type: MESSAGE_TYPES.clear_transactions
            }));
        });
    }

    broadcastRemoveToken(token){
        this.sockets.forEach(socket =>{
            this.sendTokenToRemove(socket,token);
        });
    }
}

module.exports = P2pServer;
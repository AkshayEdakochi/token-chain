class Admin{
    //remove wallet fromconstructore not needed here
    constructor(blockchain, transactionPool, wallet, p2pServer){
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;
        this.wallet = wallet;
        this.p2pServer = p2pServer;
    }

    static marketPlace = [{
        name : 'Green Energy',
        code : 'GEN',
        unitPrice : 10,
        quantity : 500 
    },
    {
        name : 'Solar Futures',
        code : 'SFE',
        unitPrice : 12,
        quantity : 800 
    },{
        name : 'Powering Life',
        code : 'PWL',
        unitPrice : 20,
        quantity : 1000 
    }];

    settle(){
        const validTransactions = this.transactionPool.validTransactions();
        //create block consisting data as validTransactions
        const block = this.blockchain.addBlock(validTransactions);
        //sync p2p chains
        this.p2pServer.syncChain();
        //clear tp
        this.transactionPool.clear();
        //broadcast to clear tp to all nodes;
        this.p2pServer.broadcastClearTransactions();
        // ?? does every node actually need to have a  TP? as  only Admin settles transactions
        return block;
    }

    static issueNewToken(newToken){
        let added = false;
        this.marketPlace.forEach(token => {
            if(token.code === newToken.code){
                token.quantity += newToken.quantity;
                token.unitPrice = newToken.unitPrice;
                console.log('token  details updated in market place');
                added = true;
            }
        });
        if(!added){
            console.log("new token issued in market place");
            this.marketPlace.push(newToken);
        }
        return;
    }

    static showMarketPlace(){
        return this.marketPlace;
    }

}

module.exports = Admin;
const ChainUtil = require('../chain-util');
const {INITIAL_BALANCE} = require('../config');
const { newTransaction } = require('./transaction');
const Transaction = require('./transaction');
class Wallet{
    constructor(){
        this.balance = INITIAL_BALANCE;
        this.keyPair = ChainUtil.genKeyPair();
        this.publicKey = this.keyPair.getPublic().encode('hex');
        this.holdings = [];
    }

    toString(){
        return ` Wallet -
        Balance : ${this.balance}
        Public Key : ${this.publicKey}
        Holdings : ${this.holdings}`
    }

    sign(dataHash){
        return this.keyPair.sign(dataHash);
    }

    createTransaction(seller, token, blockchain, transactionPool){
        this.balance = this.calculateBalance(blockchain);
        this.holdings = this.getHoldings(blockchain);
        const cost = token.quantity * token.unitPrice;

        if(cost > this.balance){
            console.log(`Amount in wallet ${this.balance} insufficient to buy tokens worth ${cost}`);
            return
        }

        let transaction = transactionPool.existingTransaction(this.publicKey);

        if(transaction){
            transaction.update(this,seller,token);
        }else{
            transaction = Transaction.newTransaction(this,seller,token);
            transactionPool.updateOrAddTransactions(transaction);
        }
        return transaction;
    }

    calculateBalance(blockchain){
        let balance = this.balance;
        let transactions=[];
        blockchain.chain.forEach(block => block.data.forEach(transaction => {
            transactions.push(transaction);
        }));

        const walletInputTs = transactions
        .filter(transaction => transaction.input.address === this.publicKey);

        let startTime =0;

        if(walletInputTs.length >0){

            const recentInputTs = walletInputTs.reduce(
            (prev,current) => prev.input.timestamp > current.input.timestamp? prev: current
            );
            
            balance = recentInputTs.outputs.find(output =>
                output.address === this.publicKey).amount;
            startTime = recentInputTs.input.timestamp;
        }

        transactions.forEach(transaction =>{
            if(transaction.input.timestamp > startTime){
                transaction.outputs.find(output=>{
                    if(output.address === this.publicKey){
                        balance += output.amount;
                    }
                });
            }
        });

        return balance;

    }

    //tets this tomorrow
    getHoldings(blockchain){
        let holdings = this.holdings;
        let transactions = [];

        blockchain.chain.forEach(block => block.data.forEach(transaction =>transactions.push(transaction)));

        const buyingTransactions = transactions
        .filter(transaction => transaction.input.address === this.publicKey);

        let startTime =0;
        
        if(buyingTransactions.length >0){

            const recentbuyingT = buyingTransactions.reduce(
                (prev,current) =>prev.input.timestamp > current.input.timestamp?prev:current
            );
            startTime = recentbuyingT.input.timestamp;

            holdings = recentbuyingT.outputs.find(output=> output.address === this.publicKey).tokens;
        //    for(let i=0; i<newTokens.length; i++){
        //        console.log("In loop");
        //        let found = false;
        //        for(let j=0; j<holdings.length; j++){
        //            if(newTokens[i].code === holdings[j].code){
        //                holdings[j].quantity += newTokens[i].quantity;
        //                found = true;
        //            }
                   
        //        }
        //        if(!found) holdings.push(newTokens[i]);
        //    }
        //    startTime = recentbuyingT.input.timestamp;
        }

        transactions.forEach(transaction =>{
            if(transaction.input.timestamp>startTime){
                transaction.outputs.find(output =>{
                    if(output.address === this.publicKey){
                        holdings.find(holding=>holding.code === output.tokens.code).quantity -= output.tokens.quantity;
                    }
                });
            }
        });

        return holdings;

    }
}

module.exports = Wallet;
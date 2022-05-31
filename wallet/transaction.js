const ChainUtil = require("../chain-util");

class Transaction{
    constructor(){
        this.id = ChainUtil.id();
        this.input = null;
        this.outputs = [];
    }

    //this function is executed by the wallet that buys tokens
    static newTransaction (buyerWallet, seller, token){ //tokens is an object {name,code,unitPrice,quantity}
        const transaction = new this();
        const cost = token.quantity * token.unitPrice;

        if(buyerWallet.balance < cost){
            console.log(`Token cost exceeds balance ${buyerWallet.balance}`);
            return;
        }
        //updatings the tokens for output to add in output array of transaction
        let tokens = buyerWallet.holdings;
        let found = false;
        for(let i=0; i<tokens.length; i++){
            if(token.code === tokens[i].code){
                tokens[i].quantity += token.quantity;
                found = true;
            }
        }
        if(!found) {
            tokens.push(token);
        }

        transaction.outputs.push(...[
            {address:buyerWallet.publicKey, amount: buyerWallet.balance - cost, tokens},
            {address : seller, amount : cost,tokens:token}
        ]);
        Transaction.signTransaction(transaction,buyerWallet);
        return transaction;
    }

    update(buyerWallet, seller, token){
        const buyerOutput = this.outputs.find(output => output.address === buyerWallet.publicKey);
        const cost = token.quantity * token.unitPrice;
        if(cost > buyerOutput.amount){
            console.log(`Insufficient amount ${buyerOutput.amount} in wallet to buy selected  tokens`);
            return;
        }
        buyerOutput.amount = buyerOutput.amount-cost;
        buyerOutput.tokens.push(token);
        this.outputs.push({address:seller, amount:cost, token});

        Transaction.signTransaction(this,buyerWallet);
        return this;
    } 

    static signTransaction(transaction, buyerWallet){
        transaction.input = {
            timestamp : Date.now(),
            amount : buyerWallet.balance,
            address : buyerWallet.publicKey,
            signature : buyerWallet.sign(ChainUtil.hash(transaction.outputs))
        };
    }

    static verifyTransaction(transaction){
        return ChainUtil.verifySignature(
            transaction.input.address,
            transaction.input.signature,
            ChainUtil.hash(transaction.outputs)
        );
    }
}

module.exports = Transaction;
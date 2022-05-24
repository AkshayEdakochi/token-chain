const TransactionPool = require('./transaction-pool');
const Transaction  =require('./transaction');
const Wallet = require('./index');
const Blockchain = require('../blockchain');

describe('TransactionPool', ()=>{
    let tp, buyerWallet, bc, transaction, token ={
        name : 'Blue Water',
        code : 'BWR',
        unitPrice : 20,
        quantity : 10 
    };

    beforeEach( ()=>{
        tp = new TransactionPool();
        buyerWallet = new Wallet();
        bc = new Blockchain();
        transaction = buyerWallet.createTransaction('r4nd0m-53113r',token,bc, tp);
        
    });

    it('adds transaction to transaction pool', ()=>{
        expect(tp.transactions.find(t => t.id === transaction.id))
        .toEqual(transaction);
    });

    it('updates a transaction in transaction pool', ()=>{
        const oldTransaction = JSON.stringify(transaction);
        newToken = {
            name : 'Wind Power',
            code : 'WPW',
            unitPrice : 32,
            quantity : 5 
        };
        transaction.update(buyerWallet,'n3w-53113r',newToken);
        tp.updateOrAddTransactions(transaction);

        expect(JSON.stringify(tp.transactions.find(t => t.id === transaction.id)))
        .not.toEqual(oldTransaction);
    });

    it('clears transactions', ()=>{
        tp.clear();
        expect(tp.transactions).toEqual([]);
    });

    describe('mixing valid and corrupt transactions', () => {
        let validTransactions;
        beforeEach( () => {
            validTransactions = [...tp.transactions];
            for(let i=0; i<6; i++){
                buyerWallet = new Wallet();
                transaction = buyerWallet.createTransaction('seller',token,bc,tp);
                if(i%2 == 0){
                    transaction.input.amount =9999;
                } else {
                    validTransactions.push(transaction);
                }   
            }
        });

        it('differntiates between valid and corrupt transactions', () =>{
            expect(JSON.stringify(tp.transactions))
            .not.toEqual(JSON.stringify(validTransactions));
        });

        it('grabs valid transactions', ()=>{
            expect(tp.validTransactions()).toEqual(validTransactions);
        });
    });
});
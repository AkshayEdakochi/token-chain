const Wallet = require('.');
const Transaction = require('./transaction');
describe('Transaction', () => {
    let buyerWallet, transaction, seller, tokens;
    beforeEach( () => {
        buyerWallet = new Wallet();
        seller = '5e11er';
        tokens = {
            name : 'Green Energy',
            code : 'GEN',
            unitPrice : 10,
            quantity : 5 
        };
        transaction = Transaction.newTransaction(buyerWallet,seller,tokens)
    });

    it('subtracts price of tokens from buyerWallet', ()=>{
        expect(transaction.outputs.find(output => output.address === buyerWallet.publicKey).amount)
        .toEqual(buyerWallet.balance - tokens.unitPrice* tokens.quantity);
    });

    it('it outputs the amount sent to seller', ()=>{
        expect(transaction.outputs.find(output => output.address === seller).amount)
        .toEqual(tokens.unitPrice * tokens.quantity);
    });

    it('inputs the buyerWallet amount', ()=>{
        expect(transaction.input.amount).toEqual(buyerWallet.balance);
    });

    it('validates a valid transaction', ()=> {
        console.log(transaction);
        expect(Transaction.verifyTransaction(transaction)).toBe(true);
    });

    it('invalidaets invalid transaction', () => {
        transaction.outputs[0].amount = 10000;
        expect(Transaction.verifyTransaction(transaction)).toBe(false);
    });


    describe('Price of tokens exceeds the buyerWallet balalnce', () => {
        beforeEach( ()=> {
            tokens.quantity = 5000;
            transaction = Transaction.newTransaction(buyerWallet,seller,tokens)
        });

        it('does not create transaction when no enough balance to buy token', ()=>{
            expect(transaction).toEqual(undefined);
        });
    });

    describe('Updating tranactions', ()=>{
        let nextSeller, nextToken;
        beforeEach( ()=>{
            nextSeller = 'n3xt-5311er';
            nextToken ={
                name : 'Blue Water',
                code : 'BWR',
                unitPrice : 20,
                quantity : 10 
            };
            transaction.update(buyerWallet,nextSeller,nextToken);
        });

        it('updates buyerWallet balance', () =>{
            expect(transaction.outputs.find(output => output.address === buyerWallet.publicKey).amount)
            .toEqual(buyerWallet.balance-tokens.unitPrice* tokens.quantity-nextToken.unitPrice*nextToken.quantity);
        });

        it('adds new output', ()=>{
            console.log(transaction);
            expect(transaction.outputs.find(output => output.address === nextSeller).amount)
            .toEqual(nextToken.unitPrice*nextToken.quantity);
        });

        it('updates tokens array of first output', ()=>{
            // console.log(transaction.outputs.find(output=>output.address==buyerWallet.publicKey).tokens);
            expect(transaction.outputs.find(output=>output.address==buyerWallet.publicKey).tokens.length).toEqual(2);
        });

    });


})
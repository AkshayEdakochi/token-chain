const Blockchain = require('../blockchain');
const Wallet = require('./index');
const TransactionPool = require('./transaction-pool');
const {INITIAL_BALANCE} = require('../config');
const P2pServer = require('../app/p2p-server');
const Admin = require('../admin');

describe('Wallet',()=>{
    let wallet, tp, bc, token, p2pServer;
    beforeEach( ()=>{
        wallet = new Wallet();
        tp = new TransactionPool();
        bc = new Blockchain();
        p2pServer = new P2pServer(bc,tp);    
    });
    describe('Creating a transaction', ()=>{
        let transaction, token, seller;

        beforeEach( ()=>{
            token = {
                name : 'Tidal Plant',
                code : 'TPL',
                unitPrice : 2,
                quantity : 30 
            };
            seller = 'r4nd0m-53113r';
            transaction = wallet.createTransaction(seller,token,bc,tp);
            
        });

        describe('and doing the same again', ()=>{
            
            beforeEach(()=>{
                wallet.createTransaction(seller,token,bc,tp);
            });

            it('subtracts cost of tokens twice from balance', ()=>{
                const cost = token.quantity*token.unitPrice;
                expect(transaction.outputs.find(t=> t.address === wallet.publicKey).amount)
                .toEqual(wallet.balance - 2*cost);
            });

            it('has 2 outputs for the same seller, tokens', ()=>{
                const cost = token.quantity*token.unitPrice;
               expect(transaction.outputs.filter(t => t.address === seller)
               .map(output => output.amount)).toEqual([cost,cost]); 
            });
        });

        
    });

    describe('calculating balance', () =>{
        let token, repeatAdd, buyerWallet;

        beforeEach( ()=>{
            token ={
                name : 'Blue Water',
                code : 'BWR',
                unitPrice : 10,
                quantity : 10 
            };
            repeatAdd = 3;
            buyerWallet = new Wallet();
            // bc = new Blockchain();

            for(let i=0; i<repeatAdd; i++){
                buyerWallet.createTransaction(wallet.publicKey,token,bc,tp);
            }
            bc.addBlock(tp.transactions);
        });

        it('calculates balance for seller', () => {
            expect(wallet.calculateBalance(bc)).toEqual(INITIAL_BALANCE + (token.quantity*token.unitPrice) * repeatAdd);
        });

        it('calculates balance of buyer wallet', () => {
            expect(buyerWallet.calculateBalance(bc)).toEqual(INITIAL_BALANCE - (token.quantity*token.unitPrice) *repeatAdd);
        });
        

        // describe('and the seller conducts a transaction', () => {
        //     let newtoken, sellerBalance;

        //     beforeEach( ()=> {
        //         tp.clear();
        //         newtoken ={
        //             name : 'Green Water',
        //             code : 'GWR',
        //             unitPrice : 3,
        //             quantity : 20 
        //         };
        //         sellerBalance = wallet.calculateBalance(bc);
        //         wallet.createTransaction(buyerWallet.publicKey,newtoken,tp,bc);
        //         bc.addBlock(tp.transactions);
        //     });

        //     // describe('and the buyer sends another transaction to recipient', () => {
        //     //     let bc;
        //     //     beforeEach( ()=> {
        //     //         tp.clear();
        //     //         bc = new Blockchain();
        //     //         buyerWallet.createTransaction(wallet.publicKey,token,bc,tp);
        //     //         bc.addBlock(tp.transactions);
        //     //     });

        //     //     it('calculates seller ballance using the most recent transaction', ()=> {
        //     //         expect(wallet.calculateBalance(bc)).toEqual(sellerBalance - (newtoken.quantity*newtoken.unitPrice) + token.quantity*token.unitPrice);
        //     //     });
    
        //     // });
        // });
        
    });


    describe('gets the holdings of the caller', () =>{
        let buyerWallet,admin,transaction;

        beforeEach(()=>{
            token = {
                name : 'Tidal Plant',
                code : 'TPL',
                unitPrice : 2,
                quantity : 30 
            };
            buyerWallet = new Wallet();
            transaction = buyerWallet.createTransaction(wallet.publicKey,token,bc,tp);
            admin = new Admin(bc,tp,buyerWallet,p2pServer);
            admin.settle();

        });

        it('reflects the token bought bu buyer in the buyers wallet', ()=>{
            expect(buyerWallet.getHoldings(bc)).toEqual(transaction.outputs[0].tokens);
        });

        describe('buyer buys one same tokens again', ()=>{

            beforeEach(()=>{
               transaction =  buyerWallet.createTransaction(wallet.publicKey,token,bc,tp);
               admin.settle();
            });

            it('shows the updated holding, adding to previous token entry', ()=>{
                expect(buyerWallet.getHoldings(bc).length).toEqual(1);
                updatedToken = {
                    name : 'Tidal Plant',
                    code : 'TPL',
                    unitPrice : 2,
                    quantity : 60 
                };
                expect(buyerWallet.getHoldings(bc)).toEqual([updatedToken]);
            });
        });


    });
});
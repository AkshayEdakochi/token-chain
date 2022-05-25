const express = require('express');
const Blockchain = require('../blockchain');
const bodyParser = require('body-parser');
const P2pServer = require('./p2p-server');
const HTTP_PORT = process.env.HTTP_PORT || '3001';
const TransactionPool = require('../wallet/transaction-pool');
const Wallet = require('../wallet');
const Admin = require('../admin');
const  cors = require('cors');

const app = express();
app.use(cors());
const bc = new Blockchain();
const tp = new TransactionPool();
const p2p = new P2pServer(bc,tp);
const buyerWallet = new Wallet();
const admin = new Admin(bc,tp,buyerWallet,p2p);



app.use(bodyParser.json()); 

//will give the blocks in the blockchain
app.get('/blocks', (req,res) => {
    res.json(bc.chain);
});

//will add a block to the blockchain with the given data (req.body.data)
app.post('/mine', (req,res) => {
    const block = bc.addBlock(req.body.data);
    console.log(`New block added: ${block.toString()}`);
    p2p.syncChain();

    res.redirect('/blocks');
});

//will retrun the transactions in the transaction pool
app.get('/transactions', (req,res) =>{
    res.json(tp.transactions);
});

//will add a new transaction to the transaction pool, buy a token from market place
app.post('/buy', (req,res) => {
    const {seller, token} = req.body;
    // console.log("HAHA " , token.unitPrice);
    const transaction = buyerWallet.createTransaction(seller,token,bc,tp);
    p2p.broadcastTransaction(transaction);
    res.redirect('/transactions');
});

app.get('/public-key', (req,res) =>{
    res.json({publicKey : buyerWallet.publicKey});
});

app.get('/balance', (req, res) => {
    res.json(buyerWallet.calculateBalance(bc));
});

app.get('/holdings', (req,res) =>{
    res.json(buyerWallet.getHoldings(bc));
});

app.get('/market-place', (req,res) => {
    res.json(Admin.showMarketPlace());
});

app.get('/http-port', (req,res) => {
    console.log(HTTP_PORT);
    res.json(HTTP_PORT);
});

app.get('/p2p-port', (req,res) => {
    console.log(p2p.peers);
    res.json(p2p.P2P_PORT);
});
//endpoint only accessible to Admin
app.get('/settle', (req,res) =>{
    const block = admin.settle();
    console.log(`New block added : ${block.toString()}`);
    res.redirect('/blocks');
});

app.post('/issue-token', (req,res) =>{
    Admin.issueNewToken(req.body);
    res.redirect('/market-place');
});


app.listen(HTTP_PORT, ()=>{
    console.log(`Listening at port ${HTTP_PORT}`);
});
p2p.listen();


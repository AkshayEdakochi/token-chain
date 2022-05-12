const express = require('express');
const Blockchain = require('../blockchain');
const bodyParser = require('body-parser');
const P2pServer = require('./p2p-server');
const HTTP_PORT = process.env.HTTP_PORT || '3001';

const app = express();
const bc = new Blockchain();
const p2p = new P2pServer(bc);

app.use(bodyParser.json());

app.get('/blocks', (req,res) => {
    res.json(bc.chain);
});

app.post('/mine', (req,res) => {
    const block = bc.addBlock(req.body.data);
    console.log(`New block added: ${block.toString()}`);

    res.redirect('/blocks');
});

app.listen(HTTP_PORT, ()=>{
    console.log(`Listening at port ${HTTP_PORT}`);
});
p2p.listen();


const Block = require("./block");
const Blockchain = require("./index");

describe('Blockchain', ()=> {
    let bc,bc2;
    beforeEach( () => {
        bc = new Blockchain();
        bc2 = new Blockchain();
        
    });

    it('has first block as genesis block', ()=>{    
       expect(bc.chain[0]).toEqual(Block.genesis());
    });

    it('adds a new block', ()=>{
        bc.addBlock('foo');
        expect(bc.chain[1].data).toEqual('foo');
    });

    it('validates a valid chain', () => {
        expect(bc.isValidChain(bc2.chain)).toBe(true);
    });

    it('invalidates chain with corrupt genesis block', ()=>{
        bc2.chain[0].data = 'bad genesis';
        expect(bc.isValidChain(bc2.chain)).toBe(false);
    });

    it('invalidates chain with bad hash blocks', () => {
        bc2.addBlock('foo');
        bc2.chain[1].data = 'bad data';
        expect(bc.isValidChain(bc2.chain)).toBe(false);
    });

    it('replace with valid chain', () => {
        bc2.addBlock('foo');
        bc.replaceChain(bc2.chain);
        expect(bc.chain).toEqual(bc2.chain);
    });

    it('does not replace with smaller chain', () => {
        bc.addBlock('bar');
        bc.replaceChain(bc2.chain);
        expect(bc.chain).not.toEqual(bc2.chain);
    });

    it('does not repalce with invalid chain', () => {
        bc2.addBlock('bar');
        bc2.chain[1].data = "not-bar";
        bc.replaceChain(bc2.chain);
        expect(bc.chain).not.toEqual(bc2.chain);
    });
});

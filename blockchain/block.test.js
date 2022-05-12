const Block = require('./block');

describe('Block', ()=>{
    let data, block, lastBlock;
    beforeEach(()=>{
        data = 'bar';
        lastBlock = Block.genesis()
        block = Block.mineBlock(lastBlock,data);
    });

    it('sets data to the input', ()=> {
        expect(block.data).toEqual(data);
    });
    
    it('sets lastHash to hash of lastBlock', () => {
        expect(block.lastHash).toEqual(lastBlock.hash);
    });
});
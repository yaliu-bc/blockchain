//import js-sha256
var sha256 = require('js-sha256');

//Block
class Block{
    // the block constructor
    constructor(transactionTime, blockData){
        this.transactionTime = transactionTime;
        this.blockData = blockData;

        //the previous block hash
        this.previousHash = "";
        //the current block hash
        this.currentHash = "";
    }

    //calculate the current block hash
    calculateCurrentBlockHash(){
        return sha256(this.transactionTime + this.blockData + this.previousHash);
    }
}

//Block Chain
class BlockChain{
    constructor(){
        //add the genesis block to the chain
        this.blockchain = [new Block("Wed Dec 16 2020 11:41:10", "the genesis block")];
        //update the block hash for the genesis block
        this.blockchain[0].currentHash = this.blockchain[0].calculateCurrentBlockHash();
    }

    addNewBlock(block){
        //update the previous hash by getting the hash of the last block on the chain
        block.previousHash = this.blockchain[this.blockchain.length-1].currentHash;
        //update the current hash
        block.currentHash = block.calculateCurrentBlockHash();
        //add the new block to the chain
        this.blockchain.push(block);
    }

    isValid(){
        for(var i=1; i<this.blockchain.length; i++){
            var previousBlock = this.blockchain[i-1];
            var currentBlock = this.blockchain[i];

            //validate the hash!!!
            if(currentBlock.currentHash !== currentBlock.calculateCurrentBlockHash()||
               previousBlock.currentHash !== currentBlock.previousHash){
                return false;
            }
        }
        return true;
    }
}

//create a blockchain instance
var myBlockChain = new BlockChain();
//add a new block
myBlockChain.addNewBlock(new Block("Wed Dec 16 2020 11:41:30", "a new block"));
//add one more block
myBlockChain.addNewBlock(new Block("Wed Dec 16 2020 11:41:31", "one more new block"));

//output the blockchain
console.log(JSON.stringify(myBlockChain, null, 4));

//validate the blockchain
console.log("Is the blockchain valid: " + myBlockChain.isValid());

//tamper a block data and validate the chain again
var myBlock = myBlockChain.blockchain[1];
myBlock.blockData = "some new data";
console.log("Some block data were tampered!!! Please validate the chain again");
console.log("Is the blockchain valid now: " + myBlockChain.isValid());

//tamper the hash too
myBlock.currentHash = myBlock.calculateCurrentBlockHash();
console.log("The hash got also tampered!!! Please validate the chain again");
console.log("Is the blockchain valid: " + myBlockChain.isValid());
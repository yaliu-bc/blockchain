//import js-sha256
var sha256 = require('js-sha256');

//DIFFICULTY
const DIFFICULTY = 3;

//Block
class Block{
    // the block constructor
    constructor(transactionTime, blockData){
        this.transactionTime = transactionTime;
        this.blockData = blockData;

        //the previous block hash
        this.previousHash = "";
        //the current block hash
        this.currentHash = this.calculateCurrentBlockHash();
        //nonce
        this.nonce = 0;
    }

    //calculate the current block hash
    calculateCurrentBlockHash(){
        return sha256(this.transactionTime + JSON.stringify(this.blockData) + this.previousHash + this.nonce);
    }

    //mine a new block
    mineBlock(){
        //make sure the difficulty is met
        while(this.currentHash.substr(0, DIFFICULTY).indexOf(('').padStart(DIFFICULTY,'0'))!=0){
            this.nonce++;
            //update the hash with the updated nonce
            this.currentHash = this.calculateCurrentBlockHash();
        }  
    }
}

//Block Chain
class BlockChain{
    constructor(){
        //add the genesis block to the chain
        this.blockchain = [new Block("Wed Dec 16 2020 11:41:11", "the genesis block")];
    }

    addNewBlock(block){
        //update the previous hash by getting the hash of the last block on the chain
        block.previousHash = this.blockchain[this.blockchain.length-1].currentHash;
        //mine a new block
        block.mineBlock();
        //add the new block to the chain
        this.blockchain.push(block);
    }
}

//create a blockchain instance
var myBlockChain = new BlockChain();
//add a new block
myBlockChain.addNewBlock(new Block("Wed Dec 16 2020 11:41:30", "mine a new block"));
//add one more block
myBlockChain.addNewBlock(new Block("Wed Dec 16 2020 11:41:31", "mine one more new block"));

//output the blockchain
console.log(JSON.stringify(myBlockChain, null, 4));
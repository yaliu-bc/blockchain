//import js-sha256
var sha256 = require('js-sha256');

//DIFFICULTY
const DIFFICULTY = 2;

//MININGREWARD
const MININGREWARD = 1;

//Block
class Block{
    // the block constructor
    constructor(timeStamp, transactions){
        this.timeStamp = timeStamp;
        this.transactions = transactions;

        //the previous block hash
        this.previousHash = "";
        //the current block hash
        this.currentHash = this.calculateCurrentBlockHash();
        //nonce
        this.nonce = 0;
    }

    //calculate the current block hash
    calculateCurrentBlockHash(){
        return sha256(this.timeStamp + JSON.stringify(this.transactions) + this.previousHash + this.nonce);
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

//Transaction
class Transaction{
    //from address, to address, and the amount
    constructor(transactionTime, fromAddr, toAddr, amount){
        this.transactionTime = transactionTime;
        this.fromAddr = fromAddr;
        this.toAddr = toAddr;
        this.amount = amount;
    }
}

//Block Chain
class BlockChain{
    constructor(){
        //add the genesis block to the chain
        this.blockchain = [new Block("Wed Dec 16 2020 11:41:11", "the genesis block")];
        //pending transactions to be mined to the next block(s)
        this.pendingTransactions = [];
    }
    addTransaction(transaction){
        this.pendingTransactions.push(transaction);
    }

    mineTransactions(miningRewardAddr){
        //add a transaction to get reward
        this.pendingTransactions.push(new Transaction(Date.now().toString(), null, miningRewardAddr, MININGREWARD));
        //mine all pending transactions including the rewarding transaction
        var block = new Block(Date.now().toString(), this.pendingTransactions);
        block.previousHash = this.blockchain[this.blockchain.length-1].currentHash;
        block.mineBlock();
        this.blockchain.push(block);

        //clear all pending transactions
        this.pendingTransactions = [];
    }

    //check balance for a given address
    checkBalance(address){
        var balance = 0;
        //loop through all transactions in all blocks
        for(var block of this.blockchain){
            for(var transaction of block.transactions){
                if(transaction.fromAddr == address){
                    balance -= transaction.amount;
                }
                if(transaction.toAddr == address){
                    balance += transaction.amount;
                }
            }
        }
        return balance;
    }
}

//create a blockchain instance
var myBlockChain = new BlockChain();

//create a transaction
myBlockChain.addTransaction(new Transaction("Wed Dec 16 2020 11:41:12", "address_0_public_key", "address_1_public_key", 10))
//create another transaction
myBlockChain.addTransaction(new Transaction("Wed Dec 16 2020 11:41:13", "address_1_public_key", "address_2_public_key", 3));
//mine all transactions
myBlockChain.mineTransactions("myRewardAddr_public_key");

//output the blockchain
console.log(JSON.stringify(myBlockChain, null, 4));

//check balance
console.log("The balance of address_0: " + myBlockChain.checkBalance("address_0_public_key"));
console.log("The balance of address_1: " + myBlockChain.checkBalance("address_1_public_key"));
console.log("The balance of address_2: " + myBlockChain.checkBalance("address_2_public_key"));
console.log("The balance of myRewardAddr: " + myBlockChain.checkBalance("myRewardAddr_public_key"));


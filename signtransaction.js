//import js-sha256
var sha256 = require('js-sha256');

//import elliptic
var EC = require('elliptic').ec;

//DIFFICULTY
const DIFFICULTY = 2;

//MININGREWARD
const MININGREWARD = 1;

//create and initialize EC context
var ec = new EC('secp256k1');
//generate keys
//var key = ec.genKeyPair();
//const publicKey = key.getPublic('hex');
//const privateKey = key.getPrivate('hex');
const publicKey_1 = "04bdacb626c34f68427f3403540651b9d04c336e5e5dd87589366472faf6ee111e5a8c22dd1e9877da2212fd57664cc3814a5b559b81e5c620d6511c073bb5df8e"
const privateKey_1 = "85023130f6bd0c81aabb1b613d7ba7b15e6a44df6379e63e3b7f0b1ee8ca04c5";
const publicKey_2 = "0484dd0d835239427ef1a7d64bc33d72f035ec56057735df66de71eba7953e4d4e26390a15468bbda3dc68ad779b3a8b7912031e1c29726447e84c408a502f45dd";
const privateKey_2 = "c2904f47049926a3c55256d637829ccda2a62d9c2f81acc38f937b1ae841105f";

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

    CheckAllTransactions(){
        for(var tx of this.transactions){
            if(!tx.isTransactionValid()){
                return false;
            }
        }
        return true;
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
    //Transaction constructor
    constructor(transactionTime, fromAddr, toAddr, amount){
        this.transactionTime = transactionTime;
        this.fromAddr = fromAddr;
        this.toAddr = toAddr;
        this.amount = amount;
        this.signature = '';
        this.isMiningReward = false;
    }

    getTransactionHash(){
        return sha256(this.transactinTime + this.fromAddr + this.toAddr + this.amount);
    }

    signTransaction(key){
        //check if the key has the rights to do the transaction 
        if(key.getPublic('hex') != this.fromAddr){
            throw new Error("the key does not match the public address");
        }

        //sign the transaction with the private key, and save the signature
        this.signature = key.sign(this.getTransactionHash(), 'base64').toDER('hex');
    }

    isTransactionValid(){
        //for mining reward transaction that allows no from address 
        if(this.fromAddr == null && this.isMiningReward){
            return true;
        }

        //check if there is a signature in the transaction
        if(!this.signature || this.signature.length == 0){
            throw new Error('the transaction does not have any signature');
        }

        //retrieve the public key
        const publicKey = ec.keyFromPublic(this.fromAddr, 'hex');
        //verify if the transaction is properly signed
        return publicKey.verify(this.getTransactionHash(), this.signature);
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
        //transactions must have proper addresses
        if((!transaction.fromAddr && !transaction.isMiningReward)|| !transaction.toAddr){
            throw new Error("error on address(es)");
        }

        //the transaction must be properly signed or valid
        if(!transaction.isTransactionValid()){
            throw new Error('invalid transaction');
        }

        //add to the pending transactions to be processed
        this.pendingTransactions.push(transaction);
    }

    mineTransactions(miningRewardAddr){
        //add a transaction to get reward
        var miningTransaction = new Transaction(Date().toString(), null, miningRewardAddr, MININGREWARD);
        miningTransaction.isMiningReward = true;
        this.addTransaction(miningTransaction);
        //mine all pending transactions including the rewarding transaction
        var block = new Block(Date().toString(), this.pendingTransactions);
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

    isChainValid(){
        for(var i=1; i<this.blockchain.length; i++){
            var previousBlock = this.blockchain[i-1];
            var currentBlock = this.blockchain[i];

            //validate the block hash!!!
            if(currentBlock.currentHash !== currentBlock.calculateCurrentBlockHash()||
               previousBlock.currentHash !== currentBlock.previousHash){
                return false;
            }

            //validate transactions in each block
            if(!currentBlock.CheckAllTransactions()){
                return false;
            }
        }
        return true;
    }
}

//get the key(s)
const myKey_1 = ec.keyFromPrivate(privateKey_1);
const myKey_2 = ec.keyFromPrivate(privateKey_2);
const mypublicKey_1 = myKey_1.getPublic('hex');
const myPublicKey_2 = myKey_2.getPublic('hex');

//create a blockchain instance
var myBlockChain = new BlockChain();
//create a transaction
var tx_1 = new Transaction(Date().toString(), mypublicKey_1, myPublicKey_2, 10);
tx_1.signTransaction(myKey_1);
myBlockChain.addTransaction(tx_1);
//create another transaction
var tx_2 = new Transaction(Date().toString(), myPublicKey_2, mypublicKey_1, 3);
tx_2.signTransaction(myKey_2);
myBlockChain.addTransaction(tx_2);
//mine all transactions
myBlockChain.mineTransactions(myPublicKey_2);

//output the blockchain
console.log(JSON.stringify(myBlockChain, null, 4));

//check balance
console.log("The balance of mypublicKey_1: " + myBlockChain.checkBalance(publicKey_1));
console.log("The balance of mypublicKey_2: " + myBlockChain.checkBalance(publicKey_2));

//validate the chain
console.log('Is chain valid: ' + myBlockChain.isChainValid());

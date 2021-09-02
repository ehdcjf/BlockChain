// const block = {
//   Headers:{
//     version:'1.0.0',
//     HashPrevBlock:0x00000000000,
//     HashMerkleRoot:'SHA256',
//     timestampe:'시간', //
//     bits:'작업증명 난이도'
//      Nonce:'난수' //index
//   }
// }


const fs = require('fs')
const merkle = require('merkle')
const CryptoJs = require('crypto-js')

/*
merkle("sha26").sync(['macarena','makdarlena])// 트리구조로 만들어줌. 

ex)
const tree = merkle("sha26").sync([])
tree.root();
*/




function getVersion() {
  // const package = fs.readFileSync("../package.json");
  return JSON.parse(fs.readFileSync("../package.json")).version
}

function getCurrentTime() {
  return Math.ceil(new Date().getTime() / 1000)
}






//제네시스 블럭 만들기. class

class BlockHeader {
  constructor(version, index, previousHash, time, merkleRoot) {
    this.version = version;
    this.index = index;
    this.previousHash = previousHash;
    this.time = time;
    this.merkleRoot = merkleRoot
  }

}

// const header = new BlockHeader(1,2,3,4,5);
// console.log(header)

class Block {
  constructor(header, body) {
    this.header = header;
    this.body = body;
  }
}

// const blockchain = new Block(new BlockHeader(1,2,3,4,5),['Hello']);
// console.log(blockchain)

let Blocks = [createGenesisBlock()]




function getBlock(){
  return Blocks;
}

function getLastBlock(){
  return Blocks[Blocks.length-1];
}

function createGenesisBlock() {
  const version = getVersion() //1.0.0
  const index = 0;
  const time = getCurrentTime();
  const previousHash = '0'.repeat(64);
  const body = ['Hello BlockChain']
  const tree = merkle('sha256').sync(body);
  const root = tree.root() || '0'.repeat(64);

  const header = new BlockHeader(version, index, previousHash, time, root)
  return new Block(header, body)
}

function createHash(block){
  return CryptoJs.SHA256(Object.entries(block.header).reduce((r,v)=>{return r+v[1]},'')).toString()
}


// function createHash2(block){
//   const {version,index,previousHash,time,merkleRoot} = block.header;
//   const blockString = version+index+previousHash+time+merkleRoot;
//   const Hash = CryptoJs.SHA256(blockString).toString();
//   return Hash;
// }

// const block = createGenesisBlock()
// console.log(block);

// function addBlock(data){
  
//   const lastHeader = getLastBlock().header
  
//   const version = getVersion() //1.0.0
//   const index = lastHeader.index+1;
//   const time = getCurrentTime();
//   const start = new Date()
//   const previousHash = CryptoJs.SHA256(lastHeader.version + lastHeader.index + lastHeader.previousHash + lastHeader.time + lastHeader.merkleRoot).toString();
//   const end = new Date()
  
//   const body = data; 
//   const tree = merkle('sha256').sync(body);
//   const root = tree.root() || '0'.repeat(64);
  
//   const header = new BlockHeader(version, index, previousHash, time, root)
//   const newBlock = new Block(header, body)
//   Blocks.push(newBlock)
//   console.log(end-start)
// }


// function addBlock2(data){
//   const lastHeader = getLastBlock().header
//   const version = getVersion() //1.0.0
//   const index = lastHeader.index+1;
//   const time = getCurrentTime();
//   const previousHash = CryptoJs.SHA256(Object.entries(lastHeader).reduce((r,v)=>{return r+v[1]},'')).toString()
//   const body = data; 
//   const tree = merkle('sha256').sync(body);
//   const root = tree.root() || '0'.repeat(64);
  
//   const header = new BlockHeader(version, index, previousHash, time, root)
//   const newBlock = new Block(header, body)
//   Blocks.push(newBlock)
// }






function createBlock(data){
  const prevBlock = getLastBlock(); 
  const version = getVersion(); 
  const index = prevBlock.header.index+1;
  const time = getCurrentTime();
  const merkleTree = merkle('sha256').sync(data);
  const merkleRoot = merkleTree.root() || '0'.repeat(64);
  const previousHash = createHash(prevBlock);
  const header = new BlockHeader(version, index, previousHash, time, merkleRoot)
  return new Block(header, data);
}


function addBlock(data){
  const newBlock = createBlock(data);
  if(isVaildNewBlock(newBlock,getLastBlock())){
    Blocks.push(newBlock);
    return true;
  }
  return false;
}


function isVaildNewBlock(currentBlock,previousBlock){ 
  // 1.타입검사:
  isVaildType(currentBlock)
  return true
  
  // 2.


}

function isVaildType(block){
  console.log(block)
  return true; 
}


addBlock(['hi'])
addBlock(['holla'])
addBlock(['aloha'])
console.log(Blocks); 


// 21228f4bf1
// 04c87c690d
// 92fbb4435d
// 8646b89f78
// 5f973eeea9
// 2de7f2685a
// 5204
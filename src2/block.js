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




function getBlocks() {
  return Blocks;
}

function getLastBlock() {
  return Blocks[Blocks.length - 1];
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

function createHash(block) {
  return CryptoJs.SHA256(Object.entries(block.header).reduce((r, v) => { return r + v[1] }, '')).toString()
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






function createBlock(data) {
  const prevBlock = getLastBlock();
  const version = getVersion();
  const index = prevBlock.header.index + 1;
  const time = getCurrentTime();
  const merkleTree = merkle('sha256').sync(data);
  const merkleRoot = merkleTree.root() || '0'.repeat(64);
  const previousHash = createHash(prevBlock);
  const header = new BlockHeader(version, index, previousHash, time, merkleRoot)
  return new Block(header, data);
}


function addBlock(data) {

  const newBlock = createBlock(data);
  if (isVaildNewBlock(newBlock, getLastBlock())) {
    Blocks.push(newBlock);
    return newBlock;
  }
  return false;
}


function isVaildNewBlock(currentBlock, previousBlock) {
  // 1.Check {Header Datatype, Body Datatype} of currentBlock :
  if (!isVaildType(currentBlock)) {
    console.log(`Invaild block structure ${JSON.stringify(currentBlock)}`)
    return false;
  }

  // 2. Check index
  if (previousBlock.header.index + 1 !== currentBlock.header.index) {
    console.log('invaild index')
    return false
  }

  // 3. Check previousHash
  if (createHash(previousBlock) !== currentBlock.header.previousHash) {
    console.log('invaild previousBlock')
    return false
  }

  // 4. Check Body
  /*
    currentBlock.header.merkleRoot = > body [array]


    current.body -> merkelTree, merkleRoot -> result != current.header.merkleRoot
    

    body should be not null
    => current.body.length !==0
    
  */
  if (currentBlock.body.length === 0 || (merkle('sha256').sync(currentBlock.body).root() !== currentBlock.header.merkleRoot)) {
    console.log('invaild merkleRoot')
    return false;
  }

  // if (!isVaildBlock()) {
  //   return false
  // }
  return true
}

function isVaildType(block) {
  return (
    typeof (block.header.version) == 'string' &&
    typeof (block.header.index) == 'number' &&
    typeof (block.header.previousHash) == 'string' &&
    typeof (block.header.time) == 'number' &&
    typeof (block.header.version) == 'string' &&
    typeof (block.body) == 'object'
  )
}


// addBlock(['hi'])
// addBlock(['holla'])
// addBlock(['aloha'])

//제네시스 블럭이 유효한지? 데이터가 바뀐 적이 없는지.
// blocks 모든 배열을 검사.

function isVaildBlock() {
  const Blocks = [...getBlocks()];
  if (JSON.stringify(Blocks[0]) !== JSON.stringify(createGenesisBlock())) {
    console.log('Genesis error')
    return false;
  }

  let tempBlocks = [Blocks[0]]
  for (let i = 1; i < Blocks.length; i++) {
    if (isVaildNewBlock(Blocks[i], tempBlocks[i - 1])) {
      tempBlocks.push(Blocks[i])
    } else {
      return false;
    }
  }

  return true

}


module.exports = {
  getBlocks,
  getLastBlock,
  addBlock,
  getVersion,
}

/*



*/
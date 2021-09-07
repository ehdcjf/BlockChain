const fs = require('fs');
const merkle = require('merkle');
const CryptoJs = require('crypto-js')
const random = require('random');



let Blocks = [createGenesisBlock()];



class BlockHeader {
  constructor(version,index,previousHash,time,merkleRoot){
    this.version = version;
    this.index = index;
    this.previousHash = previousHash;
    this.time = time;
    this.merkleRoot = merkleRoot;
  }
}

class Block {
  constructor(header,body){
    this.header = header;
    this.body = body;
  }
}

function getVersion(){
    return JSON.parse(fs.readFileSync("../package.json"))
}

function getCurrentTime(){
  return Math.ceil(new Date().getTime()/1000);
}


function getBlocks(){
  return Blocks;
}

function getLastBlock(){
  return Blocks[Blocks.length -1];
}

////===== Create Genesis Block
function createGenesisBlock(){
  const version = '1.0.0';
  const index = 1;
  const time = 1600000000;
  const previousHash = '0'.repeat(64);
  const body = [`Arun Na'ar Adan.`]

  const tree = merkle('sha256').sync(body);
  const root = tree.root() || '0'.repeat(64);

  const header = new BlockHeader(version,index,previousHash,time,root);
  return new Block(header,body);
}

////==== Create Hash
function createHash(block){
  return CryptoJs.SHA256(Object.entries(block.header).reduce((r, v) => { return r + v[1] }, '')).toString();
}

////==== Create New Block
function createBlock(data){
  const prevBlock = getLastBlock();
  const version = getVersion();
  const index = prevBlock.header.index+1;
  const previousHash = createHash(prevBlock);
  const time = getCurrentTime();

  const merkelTree = merkle('sha256').sync(data);
  const merkleRoot = merkelTree.root() || '0'.repeat(64);

  const header = new BlockHeader(version,index,previousHash,time,merkleRoot)
}

////==== Push the Block into the Blocks(Array)
function addBlock(newBlock){
  
  if(isVaildNewBlock(newBlock,getLastBlock())){
    Blocks.push(newBlock);
    return true;
  }
  return false;
}


////==== Mine Block
function mineBlock(blockData){
  const newBlock = createBlock(blockData);
  if(addBlock(newBlock)){
    ////==== nw import
  }else{
    return null; 
  }
}



////==== Check Block
function isVaildNewBlock(currentBlock,previousBlock){
  ////==== Check Type
  if(!isVaildType(currentBlock)){
    conssole.log(`Invaild Block Structure ${JSON.stringify(currentBlock)}`)
    return false;
  }

  ////==== CheckIndex
  if(previousBlock.header.index+1 !== currentBlock.header.index){
    console.log('Invaild Index')
    return false;
  }

  ////====Check PreviousHash
  if(createHash(previousBlock) !== currentBlock.header.previousHash){
    console.log(`invaild previousBlock`)
    return false
  }

  ////====Check Body
  if (currentBlock.body.length === 0) {
    console.log(`invaild body`)
    return false
  }

  ////==== Check MerkleRoot
  if (merkle("sha256").sync(currentBlock.body).root() !== currentBlock.header.merkleRoot) {
    console.log(`invalid merkleRoot`)
    return false
  }

  return true
}

////====Check Type
function isVaildType(block){
  return (
    typeof(block.header.version) === "string" &&  // stirng
    typeof(block.header.index) === "number" && // number
    typeof(block.header.previousHash) === "string" && // stirng
    typeof(block.header.time) === "number" && // number
    typeof(block.header.merkleRoot) === "string" && // string
    typeof(block.body) === "object" // object
  )
}

////==== Check Blocks
function isVaildBlock(Blocks){
  if(JSON.stringify(Blocks[0]) !== JSON.stringify(createGenesisBlock())){
    console.log( 'Genesis error');
    return false;
  } 

  let tempBlocks = [Blocks[0]];
  for(let i =1; i<Blocks.length; i++){
    if(isVaildNewBlock(Blocks[i],tempBlocks[i-1])){
      tempBlocks.push(Blocks[i])
    }else{
      return false;
    }
  }
  return false;
}


////====Replace Block
function replaceBlock(newBlocks){
  if(isVaildBlock(newBlocks) && newBlocks.length>Blocks.length && random.boolean()){
    console.log("Replace Blocks with newBlocks" )
    //== nw import
  }else{
    console.log('Invaild NewBlock')
  }
}


module.exports = {
  getBlocks,
  getLastBlock,
  addBlock,
  getVersion,
  mineBlock,
  createHash,
  replaceBlock,
}






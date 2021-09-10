const fs = require('fs');
const merkle = require('merkle');
const CryptoJs = require('crypto-js');
const random = require('random');
const {hexToBinary} = require('./utils')
const BLOCK_GENERATION_INTERVAL=10; //초 
const BLOCK_ADJUSTIMENT_INTERVAL = 10;

class BlockHeader {
  constructor(version,index,previousHash,time,merkleRoot,difficulty,nonce){
    this.version = version;
    this.index = index;
    this.previousHash = previousHash;
    this.time = time;
    this. merkleRoot =merkleRoot;
    this.difficulty = difficulty;
    this.nonce = nonce;
  }
}

class Block {
  constructor(header,body){
    this.header = header;
    this.body = body;
  }
}

let Blocks = [createGenesisBlock()];

function getBlocks(){
  return Blocks;
}

function getLastBlock(){
  return Blocks[Blocks.length-1];
}

function getVersion(){
  return JSON.parse(fs.readFileSync("../package.json")).version;
}

function getCurrentTime(){
  return Math.ceil(new Date().getTime()/1000); 
}

function getDifficulty(blocks){
  const lastBlock = blocks[blocks.length-1];
  if(lastBlock.header.index%BLOCK_ADJUSTIMENT_INTERVAL===0
    && lastBlock.header.index !==0
    ){
      return getAdjustedDifficulty(lastBlock,blocks);
    }
    return lastBlock.header.difficulty;
}

function getAdjustedDifficulty(lastBlock,blocks){
  const prevAdjustmentBlock = blocks[blocks.length - BLOCK_ADJUSTIMENT_INTERVAL]
  const timeToken = lastBlock.header.time-prevAdjustmentBlock.header.time;
  const timeExpected = BLOCK_ADJUSTIMENT_INTERVAL*BLOCK_GENERATION_INTERVAL;
  if(timeToken<timeExpected/2){
    return prevAdjustmentBlock.header.difficulty+1;
  }else if(timeToken>timeExpected*2){
    return prevAdjustmentBlock.header.difficulty-1;
  }else{
    return prevAdjustmentBlock.header.difficulty
  }
}


function createGenesisBlock(){
  const version = '1.0.0';
  const index = 1;
  const time = 1600000000; 
  const previousHash = '0'.repeat(64);
  const tree = merkle('sha256').sync(body);
  const root = tree.root() || '0'.repeat(64);
  const difficulty = 4;
  const nonce = 0;
  
  const header = new BlockHeader(version,index,previousHash,time,root,difficulty,nonce);
  const body = ['Adun Toridas'];
  return new Block(header,body);
}

function createBlock(data){
  const prevBlock = getLastBlock();
  const version = getVersion();
  const index = prevBlock.header.index+1;
  const previousHash = createHash(prevBlock);
  const time = getCurrentTime();
  const difficulty = getDifficulty(Blocks);
  const merkleTree = merkel('sha256').sync(data);
  const merkleRoot = merkleTree.root() || '0'.repeat(64);

  const header = findBlock(version,index,previousHash,time,merkleRoot,difficulty)
  return new Block(header,data);
}

function createHash(block){
  return CryptoJs.SHA256(Object.entries(block.header).reduce((r,v)=>{return r+v[1]},'')).toString();
}

function createHeaderHash(version,index,previousHash,time,merkleRoot,difficulty,nonce){
  let txt = version+index+previousHash+time+merkleRoot+difficulty+nonce;
  return CryptoJs.SHA256(txt).toString().toUpperCase();
}


function findBlock(version,index,previousHash,time,merkleRoot,difficulty){
  let nonce = 0;
  while(true){
    let hash = createHeaderHash(version,index,previousHash,time,merkleRoot,difficulty,nonce);
    if(hasMatchDifficulty(hash,difficulty)){
      return new BlockHeader(version,index,previousHash,time,merkleRoot,difficulty,nonce)
    }
    nonce++;
  }
}

function addBlock(newBlock){
  if(isVaildNewBlock(newBlock,getLastBlick())){
    Blocks.push(newBlock);
    return true;
  }
  return false;
}

function hashMatchDifficulty(hash,difficulty){
  const hashBinary = hexToBinary(hash);
  const prefix = '0'.repeat(difficulty);
  return hashBinary.startsWith(prefix);
}

function mineBlock(blockData){
  const newBlock = createBlock(blockData);
  if(addBlock(newblock)){
    const nw = require('./network');
    nw.broadcast(nw.responseLastMsg())
    return newBlock
  }else{
    return null;
  }
}

function isVaildNewBlock(currentBlock,previousBlock){
  if(!isVaildType(currentBlock)){
    console.log(`Invaild Block Structure ${JSON.stringify(currentBlock)}`)
    return false;
  }

  if(previousBlock.header.index+1 !== currentBlock.header.index){
    console.log('Invaild Index')
    return false;
  }

  if(createHash(previousBlock) !== currentBlock.header.previousHash){
    console.log(`Invaild PreviousBlock`); 
    return false;
  }

  if(currentBlock.body.length ===0){
    console.log('Invaild Body')
    return false;
  }

  if(merkle('sha256').sync(currentBlock.body).root() !== currentBlock.header.merkleRoot){
    console.log(`Invaild merKleRoot`);
    return false;
  }
}

function isVaildType(block){
  return(
    typeof(block.header.version)==='string' && 
    typeof(block.header.index) ==='number' &&
    typeof(block.header.previousHash) ==='string' &&
    typeof(block.header.time) === 'number' &&
    typeof(block.header.merkleRoot) === 'string' &&
    typeof(block.body) ==='object'
  )
}

function isVaildBlock(Blocks){
  if(JSON.stringify(Blocks[0]) !==JSON.stringify(createGenesisBlock())){
    console.log('Genesis Error');
    return false;
  }

  let tempBlocks = [Blocks[0]];
  for(let i =1; i<Blocks[i]; i++){
    if(isVaildNewBlock(Blocks[i],tempBlocks[i-1])){
      tempBlocks.push(Blocks[i])
    }else{
      return false; 
    }
  }
  return false;
}

function replaceBlock(newBlocks){
  if(isVaildBlock(newBlocks) && newBlocks.length>Blocks.length && random.boolean()){
    console.log("Replace Blocks with newBlocks");
    const nw = require('./network');
    Blocks = newBlocks;
    nw.broadcast(nw.responseLastMsg())
  }else{
    console.log('Invaild New Block')
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
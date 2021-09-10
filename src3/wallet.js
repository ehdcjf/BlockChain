//secp256k1 암호화 알고리즘
const fs = require('fs')
const ecdsa = require('elliptic');
const ec = ecdsa.ec('secp256k1');



const privateKeyLocation = 'wallet/'+((process.env.PRIVATE_KEY) || 'default');
const privateFile = `${privateKeyLocation}/private_key`

//랜덤 키값
// Generate Private Key
function generatorPrivateKey(){
  const KeyPair = ec.genKeyPair();
  const privateKey = KeyPair.getPrivate();
  return privateKey.toString(16).toUpperCase(); 
}

//node.server.js
//http://localhost:3000/address
//keyfile 읽어서 보여줌.
// node server.js가 실행되면 특정 폴더에 결과물이 나올 수 있도록 한다. 
// keyfile


/*

특정 폴더 wallet/ 이 있는지 확인하고 
있다면  wallet/ 폴더생성을 안하고. 
없으면  wallet/ 폴더를 생성한다. 

 */

function initWallet(){

  if(!fs.existsSync('wallet/')){
    fs.mkdirSync('wallet/')
  }
  if(!fs.existsSync(privateKeyLocation)){
    fs.mkdirSync(privateKeyLocation)
  }

  if(!fs.existsSync(privateFile)){
    console.log(`주소값 키값을 생성중입니다.`)
    const newPrivateKey = generatorPrivateKey();
    fs.writeFileSync(privateFile,newPrivateKey)
    console.log(`개인키 생성이 완료되었습니다.`)
  }

}

initWallet()


function getPrivateFromWallet(){
  const buffer = fs.readFileSync(privateFile)
  return buffer.toString();
}


function getPublicFromWallet(){
  const privateKey = getPrivateFromWallet(); 
  const key = ec.keyFromPrivate(privateKey,'hex')
  return key.getPublic().encode('hex')
}


module.exports={
  initWallet,
  getPublicFromWallet,
}
// getPrivateFromWallet(); 
// getPublicFromWallet(); 
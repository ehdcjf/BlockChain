// npm install merkletreejs
// npm install crypto-js

const { MerkleTree} = require('merkletreejs');
const SHA256 = require('crypto-js/sha256');

const testSet=['a','b','c'].map(v=>SHA256(v))
const tree = new MerkleTree(testSet,SHA256)
const root = tree.getRoot().toString('hex');

const testRoot = 'a'
const leaf = SHA256(testRoot);
const proof= tree.getProof(leaf) // getProof(찾을 값)
console.log(tree.verify(proof,leaf,root));  //verify(proof, 찾을 값, 루트값.)
// console.log(proof)
// console.log(root)
console.log(tree.toString())//트리 구성을 볼 수 있음. 



// console.log(SHA256("ehdcjf").toString());

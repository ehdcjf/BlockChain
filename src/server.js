const express = require('express');
const app = express();
const bodyParser = require('body-parser')
const port = process.env.PORT || 3000
const bc = require('./block.js')
const ws = require('./network.js')

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/blocks', (req, res) => {
  res.send(bc.getBlocks())
})

ws.wsInit();
app.get('/version', (req, res) => {
  res.send(bc.getVersion())
})

//
//curl http://localhost:3000/mineBlock -X POST -H "Content-Type:application/json" -d "{\"data\":[\"Hello Wolrd\"]}"
//curl -X POST -H "Content-Type:application/json" -d "{\"data\":[\"Hello Wolrd\"]}"

app.post('/mineBlock', (req, res) => {
  console.log(req.body)
  const data = req.body.data;
  const result = bc.addBlock(data);
  if (result == false) {
    res.send('mineBlock failed')
  } else {
    res.send(result)
  }
})

//peer -> 현재 가지고 있는 소켓리스트 getSockets GET
app.get('/peers', (req, res) => {
  res.send(ws.getSockets().map(socket => {
    return `${socket._socket.remoteAddress}:${socket._socket.remotePort}`
  }))
})



//addPeers -> 내가 보낼 주소값에 소켓을 생성하는 작업. connectToPeers POST
//curl -X POST -H "Content-Type:application/json" -d "{\"peers\":[\"ws://localhost:7001\",\"ws://localhost:7002\"]}" http://localhost:3000/addPeers


app.post('/addPeers', (req, res) => {
  const peers = req.body.peers || [];
  ws.connectionToPeers(peers);
  res.send('success')
})




app.get("/stop", (req, res) => {
  res.send("Server Stop");
  process.exit(0)
})


app.listen(port, () => {
  console.log(`server start port ${port}`);
})




/*
set 변수명=값
set 변수명

export 변수명=값

*/

//curl http://localhost:3000/blocks -X POST | python3 -m json.tool
//curl http://localhost:3000/blocks -X GET

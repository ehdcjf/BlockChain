const WebSocket = require('ws');
const wsPORT = process.env.Ws_PORT || 6005

let sockets = []
function getSockets() { return sockets }

//최초실행
function wsInit() {
  const server = new WebSocket.Server({ port: wsPORT })
  server.on("connection", (ws) => {
    console.log(ws);
    init(ws)
  })
}

function write(ws, message) {
  ws.send(JSON.stringify(message))
}

function broadcast(message) {
  sockets.forEach(socket => {
    write(socket, message)

  })
}

function connectionToPeers(newPeers) {//(array);
  newPeers.forEach(peer => { // string 주소. ws://localhost:3000

    const ws = new WebSocket(peer)
    ws.on('open', () => { init(ws) })
    ws.on('error', () => { console.log('connection failed') })


  })

}

function init(ws) {
  sockets.push(ws);
}



module.exports = {
  wsInit,
  getSockets,
  broadcast,
  connectionToPeers,
}
const webSocketsServerPort = 8000;
const webSocketServer = require('websocket').server;
const http = require('http');
require('dotenv').config()
const server = http.createServer();
server.listen(webSocketsServerPort);
console.log('listening on port 8000');
async function main() {

    try {
        const wsServer = new webSocketServer({
            httpServer: server
        });
        const clients = {};
        const getUniqueID = () => {
            const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
            return s4() + s4() + '-' + s4();
        }
        wsServer.on('request', async function (request) {
            var userID = getUniqueID();
            console.log((new Date()) + 'Received a new connection from origin ' + request.origin + '.');
            const connection = request.accept(null, request.origin);
            clients[userID] = connection;
            console.log('connected: ' + userID + ' in ' + Object.getOwnPropertyNames(clients));
            connection.on('message', async function (message) {
                if (message.type === 'utf8') {
                    const input = JSON.parse(message.utf8Data);
                    for (key in clients) {
                        if (clients[key].state === "open") {
                            const retorno = {
                                "day": input["day"],
                                "type": "update",
                            }
                            clients[key].send(JSON.stringify(retorno))
                        }
                        else {
                            delete clients[key]
                        }
                    }
                    /*
                    if (input["type"] == "update") {
                        await axios.post(`${process.env.BACKEND_URL}/${input["day"]}/addMovement`)
                            .then(res => res.data)
                            .catch(err => console.log(err))
                    }*/
                }
            })
        });
    } catch (e) {
        console.error(e);
    }
}
main().catch(console.error);
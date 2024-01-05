console.log("Server started");
var WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({ port: 8010 });

var clients = []; // 연결된 클라이언트를 저장하는 배열

wss.on('connection', function (ws) {
    clients.push(ws); // 연결된 클라이언트를 배열에 추가

    const ip = req.socket.remoteAddress;

    // 연결된 클라이언트에 이전 메시지를 보내기
    // messages.forEach(function (message) {
    //     ws.send('Server: ' + message);
    // });

    ws.on('message', function (message) {
        // console.log('Received from client: %s', message);
        // 받은 메시지를 배열에 저장
        messages.push(message);

        // 연결된 모든 클라이언트에게 메시지 브로드캐스트
        wss.clients.forEach(function (client) {
            client.send('Server received from client: ' + message);
            // client.send(ip + ' : ' + message);
        });

        // 개별 클라이언트에게 메시지 보내기
        clients.forEach(function (client) {
            client.send('Server received from client: ' + message);
            // client.send(ip + ' : ' + message);
        });
    });
});


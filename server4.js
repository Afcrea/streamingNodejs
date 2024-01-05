
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8010 });

// 연결된 클라이언트를 저장하는 맵
const clients = new Map();

wss.on('connection', function (ws) {
    ws.on('message', function (message) {
        // 클라이언트로부터 받은 메시지를 모든 클라이언트에게 브로드캐스트
        wss.clients.forEach(function (client) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                // 현재 클라이언트가 보낸 메시지를 다른 클라이언트에게 전송
                client.send('Server received from client: ' + message);
            }
        });

        // 클라이언트의 WebSocket 객체를 맵에 저장
        clients.set(ws, true);
    });
});

// 클라이언트에게 메시지를 보내는 함수
function sendMessageToClient(client, message) {
    if (clients.has(client) && client.readyState === WebSocket.OPEN) {
        client.send(message);
    }
}

// 사용 예시
// 연결된 클라이언트 중 하나에게 메시지 보내기
wss.clients.forEach(function (client) {
    // 클라이언트에게 보낼 메시지
    const message = 'Hello, Client!';
    
    // sendMessageToClient 함수를 사용하여 메시지를 해당 클라이언트에게 보냄
    sendMessageToClient(client, message);
});

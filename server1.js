const WebSocket = require('ws');
const http = require('http');

const server = http.createServer((req, res) => {
  // 서버의 기본 HTTP 요청 처리 로직
});

const wss = new WebSocket.Server({ server });

// 저장된 연결 및 채널 정보를 담을 맵
const connections = new Map();

wss.on('connection', (ws) => {
  // 클라이언트와 연결이 이루어질 때 실행되는 로직
  ws.on('message', (message) => {
    // 클라이언트로부터 메시지를 받았을 때 실행되는 로직

    try {
      const data = JSON.parse(message);

      // 채널 정보를 가져오거나 새로 생성
      const channel = data.channel || 'default';

      // 해당 채널의 연결 맵이 없으면 생성
      if (!connections.has(channel)) {
        connections.set(channel, new Set());
      }

      // 클라이언트를 채널에 추가
      connections.get(channel).add(ws);

      // 클라이언트가 속한 채널에 메시지 브로드캐스트
      connections.get(channel).forEach((client) => {
        // if (client !== ws && client.readyState === WebSocket.OPEN) {
        //   client.send(JSON.stringify({ text: data.text, sender: data.sender }));
        // }
        if (!pingMessage(data.text)) {
            // 웹 소켓이 클라이언트가 아님 즉 내가 아님
            if (client !== ws) {
                client.send(`${data.sender}: ${data.text}`);
            }
            // 웹 소켓이 나임
            else {
                client.send("내가 보낸 메시지 : " + data.text);
            }
        }
      });
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  ws.on('close', () => {
    // 클라이언트와의 연결이 닫혔을 때 실행되는 로직
    connections.forEach((clients, channel) => {
      clients.delete(ws);
      if (clients.size === 0) {
        // 채널에 더 이상 클라이언트가 없으면 채널 맵에서 제거
        connections.delete(channel);
      }
    });
  });
});

const PORT = process.env.PORT || 8010;

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

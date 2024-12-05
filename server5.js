const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8010 });

// IP 주소별로 연속적인 채팅 횟수를 저장하는 맵
const chatCountMap = new Map();

// IP 주소별로 제한 상태를 저장하는 맵
const isRestrictedMap = new Map();

wss.on('connection', (ws, req) => {
  const ip = req.headers['x-forwarded-for'].split(',')[0].trim();

  ws.on('message', (message) => {
    // 연속적인 채팅 횟수를 확인하고 제한 여부를 결정
    if (isChatLimitExceeded(ip)) {
      ws.send('Chat limit exceeded. Please try again later.');
      ws.close();
      return;
    }

    // 연속적인 채팅 횟수를 증가시키고 제한 상태를 초기화
    incrementChatCount(ip);
    resetRestriction(ip);

    console.log(`Received message from ${ip}: ${message}`);
    
    if(message != "ping") {
      // 연결된 모든 클라이언트에게 메시지 브로드캐스트
      wss.clients.forEach((client) => {
        if (client !== ws) {
          client.send(`${ip}: ${message}`);
        }
      });
    }
  });

  ws.on('close', () => {
    // 연결이 종료되면 제한 상태를 초기화
    resetRestriction(ip);
  });
});

function isChatLimitExceeded(ip) {
  const maxConsecutiveChats = 5; // 연속적인 채팅 횟수 제한
  const restrictionDuration = 60 * 1000; // 제한 기간 (60초)

  // IP 주소의 연속적인 채팅 횟수가 제한을 초과하면서 아직 제한 중이 아닌 경우
  if ((chatCountMap.get(ip) || 0) >= maxConsecutiveChats && !isRestrictedMap.get(ip)) {
    // 해당 IP 주소를 제한 상태로 설정하고 제한 기간 동안 막음
    isRestrictedMap.set(ip, true);
    setTimeout(() => {
      resetRestriction(ip);
    }, restrictionDuration);
    return true;
  }

  return false;
}

function incrementChatCount(ip) {
  chatCountMap.set(ip, (chatCountMap.get(ip) || 0) + 1);
}

function resetRestriction(ip) {
  chatCountMap.set(ip, 0);
  isRestrictedMap.set(ip, false);
}

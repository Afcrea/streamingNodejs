console.log("Server started");
var WebSocketServer = require('ws').Server;
const port = [8010];
var wss = new WebSocketServer({ port: port[0] });

const interval = 10 * 100; // 제한 간격 (1초)
let chatLimitMap = new Map(); // 채팅 제한 체크 
let blockUserMap = new Map(); // 제한된 유저
const clients = new Set(); // 연결된 클라이언트, IP 
const connections = new Map(); // 채널별로 연결된 clients

// const startMonitoring = require('./monitoring.js');
//startMonitoring(clients, blockUserMap);

wss.on('connection', function (ws, req) {
    // const ip = req.socket.remoteAddress;
    const ip = req.headers['x-forwarded-for'].split(',')[0].trim();
    // const ip = "10.200.50.82";

    const clientObject = { ws, ip };

    clients.add(clientObject);

    chatLimitMap.set(ip, {
        chatCount: 0,
        lastChatTime: Date.now(),
        connectTime : Date.now(),
    });

    if (blockUserMap.has(ip) && blockUserMap.get(ip).isBlock){
        ws.send('접속 차단');
        ws.close();
    }
    else{
        ws.on('message', function (message) {
            // console.log('Message:', message, typeof message);
            const data = JSON.parse(message.toString('utf8'));
            // console.log('Parsed Data:', data);
            // console.log('Data Type:', typeof data);
            // console.log('Data.text:', data.text);
        
            // 차단 유저 해제 명령어 enable 해제할 유저 IP
            accessUser(data.text, blockUserMap);

            const channel = data.channel;

            if (!connections.has(channel)) {
                connections.set(channel, new Set());
            }

            // 클라이언트를 채널에 추가
            connections.get(channel).add(ws);

            // 도배 체크
            incrementChatCount(ip);
            // 채팅 제한 유저가 아님
            if(!isChatLimitExceeded(ip)) {
                connections.get(channel).forEach((client) => {
                    if (!pingMessage(data.text)) {
                        // 웹 소켓이 클라이언트가 아님 즉 내가 아님
                        if (client !== ws) {
                            client.send(`${data.sender} : ${data.text}`);
                        }
                        // 웹 소켓이 나임
                        else {
                            client.send(data.sender + "(나) : " + data.text); // 하지말기 클라에서 하기
                        }
                    }
                });
            }
            // 채팅 제한 유저가 1000번 동안 그러면 접속 해제 후 차단
            else {
                if (chatLimitMap.get(ip).chatCount > 1000 && ip !== '112.185.196.94'){
                    ws.close();
                    blockUserMap.set(ip, {
                        isBlock : true
                    });
                }
            }
        });
    }
    ws.on('close', () => {
        clients.delete(clientObject);
    });
});
// 해당 IP 클라이언트 5초간 연결 차단
// function blockConnection(ip) {
//     const blockDuration = 5000; // 차단 기간 (5초)
    
//     // 클라이언트의 연결 상태를 false로 설정
//     chatLimitMap.get(ip).connected = false;

//     // 일정 시간 후에 연결 차단 해제
//     setTimeout(() => {
//         // 클라이언트의 연결 상태를 true로 설정
//         chatLimitMap.get(ip).connected = true;
//     }, blockDuration);
// }


// 시간 기반 제한 체크 함수
function isChatLimitExceeded(ip) {
    const limit = 5; // 허용되는 채팅 횟수

    // 사용자 정보가 없거나, 제한 간격을 초과하면 false를 반환하여 제한 허용
    if (!chatLimitMap.has(ip) || Date.now() - chatLimitMap.get(ip).lastChatTime > interval) {
      return false;
    }
  
    // 제한 간격 내에 채팅 횟수가 제한을 초과하면 true를 반환하여 제한 거부
    return chatLimitMap.get(ip).chatCount >= limit;
}

// 채팅 횟수 증가 및 시간 기록 함수
function incrementChatCount(ip) {
    // 제한 간격 내에 채팅이 이루어지면 횟수 증가 및 시간 갱신
    if (Date.now() - chatLimitMap.get(ip).lastChatTime <= interval) {
    chatLimitMap.get(ip).chatCount++;
    } else {
    chatLimitMap.get(ip).chatCount = 1;
    }
    chatLimitMap.get(ip).lastChatTime = Date.now();
    // console.log(`${chatLimitMap.get(ip).lastChatTime} : ${chatLimitMap.get(ip).chatCount} / ${chatLimitMap.get(ip).connectBlock}`);
}
  

// 채팅이 ping 인지 체크
function pingMessage(Message) {
    if(Message === 'ping') {
        return true;
    }
    return false;
}

function accessUser(Message, blockUserMap) {
    if(Message.split(' ')[0] === 'enable' && blockUserMap.has(Message.split(' ')[1])) {
        blockUserMap.get(Message.split(' ')[1]).isBlock = false;
    }
}

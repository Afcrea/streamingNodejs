// monitoring.js

const os = require('os');
const process = require('process');

// 서버 정보 모니터링 간격 
const monitoringInterval = 5 * 100;

function startMonitoring(clients, blockUserMap) {
  setInterval(() => {
    console.clear();
    // 현재 메모리 사용량 및 사용 가능한 메모리 표시
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    console.log(`\n\n\n\n\n\n\n\n메모리 사용량: ${usedMemory / 1024 / 1024} MB / ${totalMemory / 1024 / 1024} MB\n\n`);

    // 현재 CPU 사용량 표시
    const cpuUsage = process.cpuUsage();
    console.log(`CPU 사용량: ${cpuUsage.user / 1000000} 초\n\n`);

    // 현재 연결된 클라이언트 수 표시
    console.log(`현재 연결된 클라이언트 수: ${clients.size}`);
    for (const client of clients) {
        console.log(`  ${client.ip}`);
    }

    // 현재 블록된 사용자 목록 표시
    console.log('\n블록된 사용자 목록:');
    for (const [ip, data] of blockUserMap.entries()) {
      console.log(`  ${ip}: ${data.isBlock}`);
    }
    console.log('\n\n');
  }, monitoringInterval);
}

module.exports = startMonitoring;

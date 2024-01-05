const NodeMediaServer = require('node-media-server');

const config = {
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 60,
    ping_timeout: 30
  },
  http: {
    port: 8000,
    mediaRoot: './flv',
    allow_origin: '*'
  },
  relay: {
    ffmpeg: '/usr/bin/ffmpeg',
    tasks: [
      {
        app: 'flv',
        name: 'qwe',
        mode: 'push',
        edge: 'rtmp://10.200.50.82:1935/live5',
      }
    ]
  },
};

const nms = new NodeMediaServer(config);

// prePublish 이벤트에서 StreamPath 변경
nms.on('prePublish', (id, StreamPath, args) => {
  // 새로운 StreamPath 생성 (원하는 로직에 따라 수정)
  const newStreamPath = generateNewStreamPath(StreamPath);
  
  // StreamPath 변경
  args.streamPath = newStreamPath;

  // 수정된 StreamPath 로그로 출력
  console.log(`[NodeMediaServer] [prePublish] Modified StreamPath: ${newStreamPath}`);
});

// StreamPath 변경 로직 (원하는 대로 수정)
function generateNewStreamPath(oldStreamPath) {
  // 예시: 현재 시간을 이용한 새로운 경로 생성
  const timestamp = new Date().getTime();
  return `/flv/${timestamp}`;
}

nms.run();

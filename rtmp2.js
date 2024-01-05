const NodeMediaServer = require('node-media-server');
const { spawn } = require('child_process');

const config = {
  logType: 3,
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 60,
    ping_timeout: 30
  },
  // http: {
  //   port: 8000,
  //   mediaRoot: './flv',
  //   allow_origin: '*'
  // },
  // relay: {
  //   ffmpeg: '/usr/bin/ffmpeg',
  //   tasks: [
  //       {
  //         app: 'flv',
  //         name: 'qwe',
  //         mode: 'push',
  //         edge: 'rtmp://10.200.50.82:1935/live5',
  //       }
  //   ]
  // },
};

const nms = new NodeMediaServer(config);

nms.on('preConnect', (id, args) => {
    console.log(`[NodeMediaServer] RTMP connection attempt. id=${id} args=${JSON.stringify(args)}`);
});

nms.on('prePublish', (id, StreamPath, args) => {
  // 스트림이 publish 되기 전에 수행할 작업을 여기에 추가할 수 있습니다.
  // console.log('[NodeMediaServer] prePublish', id, StreamPath, args);
  // 예: 특정 조건에 따라 퍼미션을 확인하거나 로깅을 수행할 수 있습니다.
  // if (someCondition) {
  //   nms.reject(id);
  //   console.log('[NodeMediaServer] Rejected. Some condition not met.');
  // }
  console.log(`[NodeMediaServer] Data transmission started. id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
});

nms.on('donePublish', (id, StreamPath, args) => {
  // 스트림이 publish 완료된 후에 수행할 작업을 여기에 추가할 수 있습니다.
  console.log('[NodeMediaServer] donePublish', id, StreamPath, args);
});

nms.on('postPublish', (id, StreamPath, args) => {
  const name = StreamPath.split('/')[2].trim();
  const encryptedName = name + "encrypted";
  const exec_ffmpeg = spawn('/usr/bin/ffmpeg', ['-i', `rtmp://localhost:1935/live/${name}`, '-c', 'copy', '-f', 'flv', `rtmp://10.200.50.82:1935/live5/${encryptedName}`]);

  // exec_ffmpeg.stdout.on('data', (data) => {
  //   console.log(`stdout: ${data}`);
  // });
  
  // exec_ffmpeg.stderr.on('data', (data) => {
  //   console.error(`stderr: ${data}`);
  // });
  
  // exec_ffmpeg.on('close', (code) => {
  //   console.log(`child process exited with code ${code}`);
  // });
});

nms.run();

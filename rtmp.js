const NodeMediaServer = require('node-media-server');
const crypto = require('crypto');
const algorithm = 'aes-256-cbc';
const secretKey = generateRandomKey();
const fs = require('fs');

const config = {
  rtmp: {
    port: 1935,
    chunk_size: 4096,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60
  },
  http: {
    port: 8000,
    allow_origin: '*'
  }
};

const nms = new NodeMediaServer(config);

nms.run();

nms.on('postPublish', async (id, StreamPath, args) => {
  console.log("\n\n");
  console.log("StreamPath : ", StreamPath);
  console.log("\n\n");
  console.log("args : ", args);
  console.log("\n\n");
  const fileName = StreamPath.split('/').pop(); // Extract file name from the stream path
  const encryptedFileName = encryptFileName(fileName);
  const newPath = `./flv/encrypted${encryptedFileName}.flv`; // Modify the path accordingly
  const rtmpServerURL = 'rtmp://10.200.50.82/live5';
  try {
    await renameFile(`${fileName}`, newPath);
    console.log(`Renamed ${fileName} to ${encryptedFileName}.flv and pushed to rtmp://10.200.50.82/live5`);
    ffmpeg()
      .input(newPath)
      .inputFormat('flv')
      .on('end', () => {
        console.log('Finished pushing to RTMP server');
        process.exit();
      })
      .on('error', (err) => {
        console.error('Error:', err);
        process.exit(1);
      })
      .output(rtmpServerURL)
      .run();

  } catch (error) {
    console.error(`Error renaming or pushing the file: ${error.message}`);
  }
});

function encryptFileName(fileName) {
  const key = Buffer.from(secretKey, 'hex');
  const iv = Buffer.alloc(16, 0);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(fileName, 'utf-8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

function generateRandomKey() {
  return crypto.randomBytes(32).toString('hex');
}

function renameFile(oldPath, newPath) {
  return new Promise((resolve, reject) => {
    fs.rename(oldPath, newPath, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}



const ffmpeg = require('fluent-ffmpeg');
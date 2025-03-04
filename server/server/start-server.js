const { exec } = require('child_process');
const server = exec('node index.js');

server.stdout.on('data', (data) => {
  console.log(data);
});

server.stderr.on('data', (data) => {
  console.error(data);
}); 
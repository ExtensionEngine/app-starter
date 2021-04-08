import http from 'http';
import { port } from '../config/server';

const requestListener = (req, res) => {
  res.writeHead(200);
  res.end('Hello world!');
}

const server = http.createServer(requestListener);
server.listen(port, () => {
  console.log(`App is running on port ${port} 🚀 `);
});

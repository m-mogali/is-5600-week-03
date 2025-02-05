const express = require('express');
const path = require('path');
const EventEmitter = require('events');

const chatEmitter = new EventEmitter();

const port = process.env.PORT || 3000;

function respondText(req, res) {
    res.end('hi');
  }

function respondJson(req, res) {
    res.json({
        text: 'hi',
        numbers: [1, 2, 3],
      });
}

function respondNotFound(req, res) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }

function respondEcho(req, res) {
    const { input = '' } = req.query;

  // here we make use of res.json to send a json response with less code
  res.json({
    normal: input,
    shouty: input.toUpperCase(),
    charCount: input.length,
    backwards: input.split('').reverse().join(''),
  });
}

function chatApp(req, res) {
    res.sendFile(path.join(__dirname, '/chat.html'));
}

function respondChat (req, res) {
    const { message } = req.query;
  
    chatEmitter.emit('message', message);
    res.end();
  }
  
function respondSSE (req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
  });

  const onMessage = message => res.write(`data: ${message}\n\n`); // use res.write to keep the connection open, so the client is listening for new messages
  chatEmitter.on('message', onMessage);

  res.on('close', () => {
    chatEmitter.off('message', onMessage);
  });
}

const app = express();
app.get('/', chatApp);
app.use(express.static(__dirname + '/public'));
app.get('/chat', respondChat);
app.get('/sse', respondSSE);

app.listen(port, function() {
  console.log(`Server is listening on port ${port}`);
})
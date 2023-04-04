console.log("Starting LexV2 Voice and Messaging Demo")
require('dotenv').config();
const Vonage = require("@vonage/server-sdk");
const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const app = express();
const fs = require('fs');
const https = require('https');
var request = require('request');
const voice_handler = require('./voice-handler');
const { v4: uuidv4 } = require('uuid');
const WebSocketServer = require('ws').Server;
const server = require('http').createServer();

const lex = require('./lexV2connect')

const port = process.env.PORT;
const url = process.env.URL;
const Vonage_API_KEY = process.env.API_KEY;
const Vonage_API_SECRET = process.env.API_SECRET;
const Vonage_APPLICATION_ID = process.env.APPLICATION_ID;
const Vonage_PRIVATE_KEY = process.env.PRIVATE_KEY;

app.use(logger('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var wss = new WebSocketServer({ server: server });
wss.on('connection', function connection(ws) {
  sessid=uuidv4();
  lex.recognizeTextUtterance("hi",sessid,(data)=>{
    console.log(data)
  },{responseType:'audio/pcm',audioCallback:voice_handler.stream_audio, wsocket:ws});
  
  voice_handler.process_audio(ws, sessid, intentHandler, lex)
  ws.send('something');

  ws.on('close', (data)=>{
    console.log("close")
    console.log(data)
  }
  )
});

function intentHandler(data) {
  console.log("IntentHandler")
  console.log(data);
}

function textIntentHandler(data) {
  console.log("IntentHandler")
  console.log(data);
}

const ncco = [
  {
    "action": "connect",
    "from": "NexmoTest",
    "endpoint": [
      {
        "type": "websocket",
        "uri": "wss://bjtestvonage01.loca.lt",
        "content-type": "audio/l16;rate=16000",
      }
    ],
  },
]

app.get('/', (req, res) => {
  res.json(200);
});

app.get('/webhooks/inbound-call', (req, res) => {
  res.json(ncco);
});

app.post('/webhooks/inbound-messaging', (req, res) => {
  // console.log(req)
  lex.recognizeTextUtterance(req.body.text,req.body.from,(data)=>{
    console.log(data[0])
    console.log('contentType' in data[0]);
    if('contentType' in data[0]){
      if(data[0]['contentType']==='PlainText'){
        console.log(data[0]['content'])

      var headers = {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
      };
      
      var dataString = {
          from: "14157386102",
          to: req.body.from,
          message_type: "text",
          text:data[0]['content'],
          channel: "whatsapp"
        };
      console.log(dataString);
      var options = {
          url: 'https://messages-sandbox.nexmo.com/v1/messages',
          method: 'POST',
          headers: headers,
          body: JSON.stringify(dataString),
          auth: {
              'user': '',
              'pass': ''
          }
      };
      
      function callback(error, response, body) {
          if (!error && response.statusCode == 200) {
              console.log(body);
          }
      }
      
      request(options, callback);
      }

    }
  });
  res.json("done")
});

app.get('/webhooks/call-events', (req, res) => {
  //console.log(req)
  res.json("events");
});

app.post('/webhooks/messaging-events', (req, res) => {
  res.json("events");
});
server.on('request', app)

server.listen(port, () => {
  console.log(`LevV2 Voice and Messaging Demo app listening on port ${port}`)
  console.log(``)
});

// const localtunnel = require('localtunnel');
// (async () => {
//   const tunnel = await localtunnel({
//     subdomain: "bjtestvonage01",
//     port: 3000
//   });
//   console.log(`App available at: ${tunnel.url}`);
// })();

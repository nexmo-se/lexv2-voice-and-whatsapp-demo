var AWS = require('aws-sdk');
require('dotenv').config();
const zlib = require('zlib');
const { v4: uuidv4 } = require('uuid');
var fs = require('fs');
var hello = Buffer.alloc(23000);
fs.open('hello.wav', 'r', function(status, fd) {
  if (status) {
      console.log(status.message);
  }
  
  fs.read(fd, hello, 0, 23000, 0, function(err, num) {
      console.log("Hello Audio Loaded");
  });
});

AWS.config.loadFromPath('./aws-config.json');

AWS.config.getCredentials(function(err) {
  if (err) console.log(err.stack);
  // credentials not loaded
  else {
    console.log("Loaded AWS Credentials");
  }
});

var lexruntimev2 = new AWS.LexRuntimeV2();

var defParams = {
  botAliasId: process.env.LEX_BOT_ALIAS, /* required */
  botId: process.env.LEX_BOT_ID, /* required */
  localeId: process.env.LEX_LOCALE_ID, /* required */
  requestAttributes: '',
  sessionState: ''
};

function recognizeUtterance(websocket, params, intentCallback, audioCallback){
  lexruntimev2.recognizeUtterance(params, function(err, data) {
    if(err){
      console.log(err)
      intentCallback(err);
      return;
    }
    console.log(data);
    if (data==null){
      intentCallback({error:"Nothing to process"});
      return;
    }
    let gzippedData = Buffer.from(data.interpretations, 'base64');
    zlib.gunzip(gzippedData, (err, ungz) => {
      intentCallback(JSON.parse(ungz.toString()));
    });
    if(data.messages)
    {
      gzippedData = Buffer.from(data.messages, 'base64');
      zlib.gunzip(gzippedData, (err, ungz) => {
        intentCallback(JSON.parse(ungz.toString()));
      });
    }
    //only send
    console.log('Check Nullness')
    console.log(audioCallback!=null&&websocket!=null)
    try{ 
      if(audioCallback!=null&&websocket!=null){
        audioCallback(websocket,data.audioStream);
      }

    }catch(error){
      console.log("++++")
      console.log(error)
    }
  });
}

module.exports = {
  recognizeSpeechUtterance: (buffer, session_id, intentCallback, audioCallback, websocket, options={sessionState:''})=>{
    var sessionState = options.sessionState || ''
    console.log(session_id)
    params = defParams;
    params["requestContentType"]='audio/l16; rate=16000; channels=1'; /* required */
    params["sessionId"]=session_id;
    params["inputStream"]=buffer;
    params["sessionState"]=sessionState;
    params['responseContentType']='audio/pcm';
    recognizeUtterance(websocket,  params, intentCallback, audioCallback)
  },

  recognizeTextUtterance: (text, session_id, intentCallback, options={})=>{
    if(!text){
      intentCallback({error:"Nothing to process"});
      return;
    }
    var sessionState = options.sessionState || ''
    var responseType = options.responseType || 'text/plain; charset=utf-8'
    var audioCallback= options.audioCallback || null
    var wsocket = options.wsocket || null
    console.log(session_id)
    console.log(text)
    console.log(responseType)
    params = defParams;
    params["requestContentType"]='text/plain; charset=utf-8';
    params["sessionId"]=session_id;
    params["inputStream"]=text;
    params["sessionState"]=sessionState;
    params['responseContentType']=responseType;
    recognizeUtterance(wsocket, params, intentCallback, audioCallback=audioCallback)

  }
}

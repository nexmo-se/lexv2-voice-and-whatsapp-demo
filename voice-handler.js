var fs = require('fs');
let name = "audio_processor"
SAMPLE_RATE = 16000
CHUNK_SIZE = 640
Threshold = 15
TIMEOUT_LENGTH = 0.5 // timeout when no one is speaking to send audio
SHORT_NORMALIZE = (1.0 / 32768.0)
swidth = 2
//load ding binary o buffer
var ding = Buffer.alloc(23000);
fs.open('ding.wav', 'r', function (status, fd) {
  if (status) {
    console.log(status.message);
  }

  fs.read(fd, ding, 0, 23000, 0, function (err, num) {
    console.log("Ding Audio Loaded");
  });
});

function rms(frame) { //Root mean Square: a function to check if the audio is silent. Commonly used in Audio stuff
  count = frame.byteLength / swidth
  //unpack a frame into individual Decimal Value
  shorts = new Int16Array(frame.buffer, frame.byteOffset, frame.length / Int16Array.BYTES_PER_ELEMENT)
  sum_squares = 0.0
  for (const sample of shorts) {
    n = sample * SHORT_NORMALIZE //get the level of a sample and normalize it a bit (increase levels)
    sum_squares += n * n //get square of level
  }
  rms_val = Math.pow(sum_squares / count, 0.5) //summ all levels and get mean
  //console.log(rms_val*10);
  return rms_val * 1000 //raise value a bit so it's easy to read 
}

function stream_audio(ws, audio) {
  //When Devs can't name variables
  i = 0
  //send Ding
  //Chunk out the output audio in 640 bytes and send to socket

  while (i <= audio.length) {
    console.log("sending Audio")
    try{
      chunk = audio.slice(i, i + CHUNK_SIZE);
      ws.send(chunk)
      i += CHUNK_SIZE
    }catch(error){
      console.log("error")
      console.log(error)
    }
    
  }
}

module.exports = {
  stream_audio: stream_audio,
  process_audio: (ws, session_id, intentHandler, processor) => {
    var rec = [];
    var current = 1;
    var end = 0;

    ws.on('message', function message(audio) {
      if (audio.toString().includes("event")) { // skip the first event header message
        return;
      }
      if (Object.prototype.toString.call(audio)) rms_val = 0;
      rms_val = rms(audio);

      if (rms_val > Threshold && !(current <= end)) {
        console.log("Heard Something")
        current = (Date.now() / 1000);
        end = (Date.now() / 1000) + TIMEOUT_LENGTH

      }

      if (current <= end) {
        if (rms_val >= Threshold) end = (Date.now() / 1000) + TIMEOUT_LENGTH
        current = (Date.now() / 1000);
        rec.push(audio);
      }
      else {
        if (rec.length > 0) {
          console.log("Audio Processing")
          stream_audio(ws, ding);
          utterance = Buffer.concat(rec);
          processor.recognizeSpeechUtterance(utterance, session_id, intentHandler, stream_audio, ws);
          rec = [];
        }
      }
    });
  }

};

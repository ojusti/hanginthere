var Client = require('hangupsjs');
var open = require("open");

var pomodoro = 50;
var startDate = new Date();
console.log("Now: " + startDate);
var nextPause = computeNextPause(startDate, pomodoro);
console.log("Next pause: " + nextPause);

var client = new Client();
// client.loglevel('debug');
connect();
client.on('chat_message', onChatMessage);
client.on('hangout_event', onHangoutEvent);

setTimeout(makeNoiseAndExit, pomodoro * 60 * 1000);

function computeNextPause(start, delay) {
  date = new Date(start);
  date.setMinutes(date.getMinutes() + delay);
  minutes = date.getMinutes();
  if(minutes < 10) {
    minutes = "0" + minutes;
  }
  return date.getHours() + "h" + minutes;
}

function connect() {
  // callback to get promise for creds using stdin. this in turn
  // means the user must fire up their browser and get the
  // requested token.
  var creds = function() {
    return {
      auth: Client.authStdin
    };
  };
  client.connect(creds).then(function() {
    return console.log('connected');
  }).done();
}


function onChatMessage(ev) {
  if(amIReceiving(ev)) {
    if(isUrgent(ev.chat_message)) {
      return client.getentitybyid([ev.sender_id.chat_id]).then(function(response) {
          return response.entities[0].properties.display_name;
      }).then(makeNoiseAndExit);
    }
    return iAmBusy(ev.conversation_id.id);
  }
}
function isUrgent(chat_message) {
  return chat_message.message_content.segment[0].text == 'URGENT';
}

function onHangoutEvent(ev) {
  if(amIReceiving(ev)) {
    if(isStart(ev.hangout_event)) {
      return iAmBusy(ev.conversation_id.id);
    }
  }
}
function isStart(hangout_event) {
  return hangout_event.event_type == 'START_HANGOUT';
}

function amIReceiving(ev) {
  var me = JSON.stringify(ev.self_event_state.user_id);
  var you = JSON.stringify(ev.sender_id);
  return me != you;
}

function iAmBusy(conversation_id) {
  return client.sendchatmessage(conversation_id, [[0,
    "Ceci est une reponse automatique. " +
    "Je ne souhaite pas etre interrompu en ce moment. " +
    "Mais si le probleme est urgent, pour que je sois informe, vous devez envoyer un nouveau message contennant que le mot URGENT en majuscules. " +
    "Sinon, je lirai votre message initial vers " + nextPause + "." ]]);
}

function makeNoiseAndExit(reason) {
  open('sound.ogg');
  console.log('Working time: ' + parseInt((new Date() - startDate) / 1000 / 60) + " minutes");
  if(typeof reason !== 'undefined') {
    console.log('Interruption reason: ' + reason);
  }
  process.exit(0);
}

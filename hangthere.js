var Client = require('hangupsjs');
// var Q = require('q');
var open = require("open");

// callback to get promise for creds using stdin. this in turn
// means the user must fire up their browser and get the
// requested token.
var creds = function() {
  return {
    auth: Client.authStdin
  };
};

var client = new Client();

// set more verbose logging
// client.loglevel('debug');

// receive chat message events
client.on('chat_message', function(ev) {
  var me = JSON.stringify(ev.self_event_state.user_id);
  var you = JSON.stringify(ev.sender_id);
  if(me != you) {
    if(ev.chat_message.message_content.segment[0].text == 'URGENT') {
      return open('sound.ogg');
    }
    return client.sendchatmessage(ev.conversation_id.id, [[0, "Je ne suis pas dispo. Si le probleme est urgent, merci d'envoyer un message contenant que le mot URGENT en majuscules. Sinon, je lirai votre message a 10h" ]]);
  }
});

client.connect(creds);

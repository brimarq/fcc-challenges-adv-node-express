$( document ).ready(function() {
  /*global io*/
  const socket = io();

  socket.on('user', function(data) {
    $('#num-users').text(data.currentUsers + ' users online');
    let message = data.name;
    if(data.connected) {
      message += ' has joined the chat.';
    } else {
      message += ' has left the chat.';
    }
    $('#messages').append($('<li>').html('<b>'+ message +'<\/b>'));
  });

  socket.on('chat message', function(message) {
    $('#messages').append($('<li>').html('<b>'+ message.name + ': <\/b>' + message.message ));
  });
   
  // Form submittion with new message in field with id 'm'
  $('form').submit(function(){
    let messageToSend = $('#m').val();
    // Send message to server unless a blank message was submitted
    if (messageToSend) socket.emit('chat message', messageToSend);
    // clear message input form field
    $('#m').val('');
    return false; // prevent form submit from refreshing page
  });
  
  
  
});

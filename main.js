
var upload = document.getElementById('video-upload');
var video = document.getElementById('video');
var otherVid = document.getElementById('other-video');
var pullerVid = document.getElementById('puller-video');
var pullerEl = document.getElementById('puller-el');
var initiatorEl = document.getElementById('initiator-el');
var localStream = null;

function socketInit(socket, initiator, id, nickname) {
  var users = {};

  if (initiator) initiatorEl.setAttribute('class', '');

  upload.addEventListener('change', function () {
    if (upload.files[0]) video.src = URL.createObjectURL(upload.files[0]);
  });

  // get video/voice stream
  video.addEventListener('canplay', function () {
    if (!localStream) 
      localStream = video.mozCaptureStream ? video.mozCaptureStream() : video.captureStream();
  });

  var peer;
  var other;
  if (!initiator) {
    peer = new SimplePeer();
    peer.on('stream', function(stream) {
      pullerEl.setAttribute('class', '');
      pullerVid.src = window.URL.createObjectURL(stream);
      pullerVid.play();
    })
    peer.on('signal', function(data) {
      socket.emit('msg', { type: 'signal', signal: data, user: other });
    });
    socket.emit('msg', { type: 'pull' });
  }

  socket.emit('msg', { type: 'whois' });
  socket.on('msg', function (data) {
    console.log('msg', data);
    var remote = users[data.from] = users[data.from] || {};
    if (data.type === 'pull' && initiator) {
      if (localStream === null) return socket.emit('msg', { type: 'nostream', user: data.from })
      remote.peer = new SimplePeer({ initiator: true, stream: localStream });
      remote.peer.on('signal', function(signalData) {
        socket.emit('msg', { type: 'signal', user: data.from, signal: signalData });
      });
    }
    else if (data.type === 'signal' && data.user === nickname) {
      if (initiator) remote.peer.signal(data.signal);
      else {
        other = data.from;
        peer.signal(data.signal);
      } 
    }
    else if (data.type === 'whois') socket.emit('msg', { type: 'iam' });
  });
  socket.on('disconnect', function (data) {
    console.log(data, 'disconnected');
    delete users[data.from];
  });
}

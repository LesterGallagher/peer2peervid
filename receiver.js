
var googleCastConf = {
    applicationId: '1E47F841',
    namespace: 'urn:x-cast:foobar'
}

function initializeCast() {
    cast.receiver.logger.setLevelValue(cast.receiver.LoggerLevel.DEBUG);
    castReceiverManager = cast.receiver.CastReceiverManager.getInstance();
    castReceiverManager.onReady = function (evt) {
        log('onReady / data: ' + JSON.stringify(evt.data));
        window.castReceiverManager.setApplicationState('application status: onready');
    }
    castReceiverManager.onSenderConnected = function (evt) {
        log('onSenderConnected / data: ' + JSON.stringify(evt.data) + ' / userAgent: ' + window.castReceiverManager.getSender(evt.data).userAgent);
    }
    castReceiverManager.onSenderDisconnected = function (evt) {
        log('onSenderDisconnected / data: ' + JSON.stringify(evt.data));
        if (window.castReceiverManager.getSenders().length == 0) {
            log('close window.');
            window.close();
        }
    }
    castReceiverManager.onSystemVolumeChanged = function (evt) {
        log('onSystemVolumeChanged / data: ' + JSON.stringify(evt.data));
    }
    messageBus = window.castReceiverManager.getCastMessageBus(googleCastConf.namespace);
    messageBus.onMessage = function (evt) {
        log('onMessage / from: ' + evt.senderId + ' / data: ' + JSON.stringify(evt.data));
        receiveMessage(evt.senderId, evt.data);
    }
    log('receiver manager started.');
    window.castReceiverManager.start({ statusText: 'application status: starting' });
}


function socketInitReceiver(socket) {
    var users = {};

    var peer = new SimplePeer();
    peer.on('stream', function (stream) {
        var video = document.createElement('video');
        video.src = URL.createObjectURL(stream);
        video.play();
        var parent = document.getElementById('remotes');
        parent.appendChild(video);
    })
    peer.on('signal', function (data) {
        socket.emit('msg', { type: 'signal', signal: data, user: other });
    });
    socket.emit('msg', { type: 'pull' });
    socket.emit('msg', { type: 'whois' });
    socket.on('msg', function (data) {
        log('msg', data);
        var remote = users[data.from] = users[data.from] || {};
        if (data.type === 'signal' && data.user === nickname) {
            other = data.from;
            peer.signal(data.signal);
        }
        else if (data.type === 'whois') socket.emit('msg', { type: 'iam' });
    });
    socket.on('disconnect', function (data) {
        log(data, 'disconnected');
        delete users[data.from];
    });
}

window.addEventListener('load', initializeCast);

function receiveMessage(id, data) {
    log('receive message', id, data);
    if (data.type === 'room') {
        connectSocketReceiver(data.room);
    }
}

function sendMessage(id, data) {
    messageBus.send(id, data);
}


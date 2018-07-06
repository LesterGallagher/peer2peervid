var url = 'https://ess-server.herokuapp.com/api/peer2peer-vid/no-persist-open-chat';

function connectSocketReceiver(room) {
    var socket = io(url);
    socket.on('connect', function () {
        var nickname = Math.random().toString(36);
        socket.emit('init', {
            nickname: nickname,
            room: room
        }, function () { socketInitReceiver(socket, false, room, nickname) });
    });
}

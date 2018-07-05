var url = 'https://ess-server.herokuapp.com/api/peer2peer-vid/no-persist-open-chat';

var socket = io(url);
socket.on('connect', function () {
    var hash = location.hash.replace('#', '');
    var initiator = !hash;
    var id = initiator ?  location.hash = Math.floor(Math.random() * 2176782335).toString(36) : hash;
    var nickname = Math.random().toString(36);
    socket.emit('init', {
        nickname: nickname,
        room: id
    }, function () { socketInit(socket, initiator, id, nickname) });
});


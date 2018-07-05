
function initializeCastApi() {

    var id = '1E47F841' || chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID;
    cast.framework.CastContext.getInstance()
        .setOptions({
            receiverApplicationId: id,
            autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
        });

    cast.framework.CastContext.getInstance()
        .addEventListener(cast.framework.CastContextEventType.CAST_STATE_CHANGED,
            function (castStateEventData) {
                console.log('castStateEvent', castStateEventData);
                var castSession = cast.framework.CastContext
                    .getInstance().getCurrentSession();

                if (castSession) connected(castSession);
            });
    cast.framework.CastContext.getInstance()
        .addEventListener(cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
            function (sessionStateEventData) {
                console.log('sessionStateEvent', sessionStateEventData);
            });

    function connected(castSession) {
        castSession.addEventListener(cast.framework.SessionEventType.APPLICATION_STATUS_CHANGED,
            function (applicationStatusEventData) {
                // Application status has changed
                console.log('Application Status Event', applicationStatusEventData);
            });

        var url = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
        var mediaInfo = new chrome.cast.media.MediaInfo(
            url, 'video/mp4');
        var request = new chrome.cast.media.LoadRequest(mediaInfo);

        castSession.loadMedia(request)
            .then(function () {
                console.log('Load succeed');
            }, function (errorCode) {
                console.log('Error code: ' + errorCode);
            });

        var player = new cast.framework.RemotePlayer();

        var playerController = new cast.framework.RemotePlayerController(player);

        playerController.playOrPause();
        playerController.stop();
        playerController.seek();

        playerController.addEventListener(cast.framework.RemotePlayerEventType.MEDIA_INFO_CHANGED,
            function () {
                var newMediaInfo = player.mediaInfo;
                console.log('new Media Info', newMediaInfo);
            });

        playerController.addEventListener(cast.framework.RemotePlayerEventType.IS_CONNECTED_CHANGED,
            function () {
                if (!player.isConnected) {
                    console.log('player not connected');
                }
            })
    }

}

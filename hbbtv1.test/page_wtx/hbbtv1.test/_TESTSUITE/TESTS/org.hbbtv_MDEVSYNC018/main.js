/* global HbbTVTestAPI: false */
/* jslint sloppy: true, maxerr: 1000, vars: true, browser: true */

var testAPI;
var mediaSync;
var csManager;
var avControl;
var timeout;
var interDevSyncUrl;

var tsUrl = null;
var gotTsUrl = false;

// Keep track of errors fired by MediaSynchroniser.onError() here:
var mediaSyncErrors = [];
var mpdUpdated = false;
var timelineUnavailableMsgReceived = false;
var testEnded = false;


function tearDown() {
    testEnded = true;
    clearTimeout(timeout);

    try { sendRequest("mpdserve.php?action=reset"); } catch (ignore) {}
    try { mediaSync.onError = null; } catch (ignore) {}
    try {
        avControl.removeEventListener('PlayStateChange',
                                      playStateChangeHandler,
                                      false);
    } catch (ignore) {}
}


function sendRequest(url, callback) {
    //
    // For making requests to PHP scripts.
    //
    var req = new XMLHttpRequest();
    if (!req) {
        testAPI.reportMessage("Failed to create an XMLHttpRequest.");
        return;
    }
    req.open("GET", url, true);

    req.onreadystatechange = function () {
        if (req.readyState !== 4) {
            return;
        }
        if (req.status !== 200 && req.status !== 304) {
            testAPI.reportMessage('HTTP error ' + req.status);
            return;
        }
        if (callback !== undefined) {
            callback(req);
        }
    };
    req.send();
}


window.onload = function () {
    var appMan, app;

    testAPI = new HbbTVTestAPI();
    testAPI.init();

    appMan = document.getElementById("app-man");

    try {
        app = appMan.getOwnerApplication(document);
    } catch (err) {
        testAPI.reportStepResult(0, false, "Exception when getting the " +
            "owner Application object. Error: " + err.message);
        return;
    }

    try {
        app.show();
    } catch (err) {
        testAPI.reportStepResult(0, false, "Exception when calling show() " +
            "on the owner Application object. Error: " + err.message);
        return;
    }

    testAPI.reportStepResult(0, true, "Application initialised");

    testAPI.reportMessage("Resetting the PHP session");

    // Reset the PHP session.
    sendRequest("mpdserve.php?action=reset", startMedia);
};


function startMedia(req) {
    testAPI.reportMessage("PHP session reset");

    try {
        mediaSync = document.getElementById("media-sync");
    } catch (ex) {
        testAPI.reportStepResult(1, false, "Exception when getting a " +
            "reference to the MediaSynchroniser: " + ex.message);
        return;
    }

    if (mediaSync === null || mediaSync === undefined) {
        testAPI.reportStepResult(1, false, "The reference to the " +
            "MediaSynchroniser object is " + mediaSync);
        return;
    }

    testAPI.reportStepResult(1, true, "A reference to the " +
        "MediaSynchroniser object was obtained.");

    try {
        avControl = document.getElementById("video");
    } catch (ex) {
        testAPI.reportStepResult(2, false, "Exception when getting a " +
            "reference to the A/V Control object: " + ex.message);
        return;
    }

    if (avControl === null || avControl === undefined) {
        testAPI.reportStepResult(2, false, "The reference to the " +
            "A/V Control object is " + avControl);
        return;
    }

    testAPI.reportStepResult(2, true, "A reference to the " +
        "A/V Control object was obtained.");

    try {
        avControl.addEventListener('PlayStateChange', playStateChangeHandler,
                                   false);
    } catch (ex) {
        testAPI.reportStepResult(3, false, "Exception when adding an event " +
            "listener on the A/V Control object: " + ex.message);
        return;
    }

    timeout = setTimeout(didNotPlay, 20000);

    try {
        var playResult = avControl.play(1);
    } catch (ex) {
        testAPI.reportStepResult(3, false, "Exception when calling play(1)" +
            "on the A/V Control object: " + ex.message);
        tearDown();
        return;
    }

    if (playResult !== true) {
        testAPI.reportStepResult(3, false, "The call to play(1) on the " +
            "A/V Control object did not return true. Got: " + playResult);
        tearDown();
        return;
    }

    testAPI.reportStepResult(3, true,  "The call to play(1) on the " +
        "A/V Control object returned true.");
}


function didNotPlay() {
    testAPI.reportStepResult(4, false, "The A/V Control object did not " +
        "start presenting media within 20 seconds.");
    tearDown();
}


function playStateChangeHandler() {
    if (avControl.playState === 6) {
        testAPI.reportStepResult(4, false, "The A/V Control object reports " +
            "that an error occurred. Error: " + avControl.error);
        tearDown();
        return;
    }

    if (avControl.playState === 1 && avControl.error === undefined) {
        testAPI.reportStepResult(4, true, "The A/V Control object reported " +
            "a PlayState of 1 (PLAYING)");

        clearTimeout(timeout);

        try {
            avControl.removeEventListener('PlayStateChange',
                                          playStateChangeHandler);
        } catch (ex) {
            testAPI.reportStepResult(5, false, "Exception when removing the " +
                "PlayStateChange handler from the A/V Control object: " +
                ex.message);
            return;
        }

        beginMediaSync();
    }
}


function errorsToString(errorsArray) {
    //
    // Return a string detailing all of the errors pushed into errorsArray.
    //
    var i;
    var errorCode;
    var reason;
    var errorString = '';

    for (i = 0; i < errorsArray.length; ++i) {
        errorCode = errorsArray[i][0];
        reason = errorsArray[i][1];
        errorString += ('[' + (i + 1) + ']: Code: ' + errorCode + ', ' +
                        'Source: ' + reason + '; ');
    }

    return errorString;
}


function beginMediaSync() {
    //
    // The A/V Control object is now playing, so pass it into the synchroniser.
    //
    try {
        // First, set up the 'onError' event listener on the MediaSynchroniser.
        mediaSync.onError = function (lastError, lastErrorSource) {
            // We'll append errors to a global list which we'll check later so
            // we can fail the test cleanly.
            mediaSyncErrors.push([lastError, lastErrorSource]);
        };
    } catch (ex) {
        testAPI.reportStepResult(5, false, "Exception when setting the " +
            "MediaSynchroniser's 'Error' handler: " + ex.message);
        tearDown();
        return;
    }

    testAPI.reportStepResult(5, true,
        "An 'Error' listener was attached to the MediaSynchroniser");

    try {
        mediaSync.initMediaSynchroniser(
            avControl,
            'urn:dvb:css:timeline:mpd:period:rel:1000:first');
    } catch (ex) {
        testAPI.reportStepResult(6, false, "Exception when calling " +
            "initMediaSynchroniser(): " + ex.message);
        tearDown();
        return;
    }

    // Fail if we have any MediaSynchroniser errors.
    var errors = errorsToString(mediaSyncErrors);

    if (errors) {
        testAPI.reportStepResult(6, false, "The MediaSynchroniser reported " +
            "the following errors: " + errors);
        tearDown();
        return;
    }

    testAPI.reportStepResult(6, true, "initMediaSynchroniser() was called");

    try {
        mediaSync.enableInterDeviceSync(onSyncEnabled);
    } catch (ex) {
        testAPI.reportStepResult(7, false, "Exception when calling " +
            "enableInterDeviceSync(): " + ex.message);
        tearDown();
        return;
    }

    testAPI.reportStepResult(7, true, "enableInterDeviceSync() was called");
}


function onSyncEnabled() {
    //
    // Callback passed to enableInterDeviceSync.
    //

    // Fail if we have any MediaSynchroniser errors.
    var errors = errorsToString(mediaSyncErrors);

    if (errors) {
        testAPI.reportStepResult(8, false, "The MediaSynchroniser reported " +
            "the following errors: " + errors);
        tearDown();
        return;
    }

    testAPI.reportStepResult(8, true, "The enableInterDeviceSync() callback " +
        "was called");

    try {
        csManager = document.getElementById("cs-man");
    } catch (ex) {
        testAPI.reportStepResult(9, false, "Exception when getting a " +
            "reference to the HbbTVCSManager: " + ex.message);
        return;
    }

    if (csManager === null || csManager === undefined) {
        testAPI.reportStepResult(9, false, "The reference to the " +
            "HbbTVCSManager object is " + csManager);
        return;
    }

    testAPI.reportStepResult(9, true, "A reference to the " +
        "HbbTVCSManager object was obtained.");

    try {
        interDevSyncUrl = csManager.getInterDevSyncURL();
    } catch (ex) {
        testAPI.reportStepResult(10, false, "Exception when calling " +
            "getInterDevSyncURL(): " + ex.message);
        tearDown();
        return;
    }

    if (interDevSyncUrl === null || interDevSyncUrl === undefined) {
        testAPI.reportStepResult(10, false, "getInterDevSyncURL() returned " +
            interDevSyncUrl);
        tearDown();
        return;
    }

    testAPI.reportStepResult(10, true, "getInterDevSyncURL() returned " +
        interDevSyncUrl);

    connectToCssCii();
}


function connectToCssCii() {
    //
    // The test harness pretends to be a CSA connecting to the CSS-CII endpoint.
    // The 'onX' callbacks are defined below this function where they are non-
    // trivial.
    //
    testAPI.reportMessage("Attempting to connect to the terminal's CSS-CII " +
                          "endpoint...");

    // Fail the test if the websocket connection takes longer than 10 seconds to
    // complete.
    timeout = setTimeout(
        function () {
            testAPI.reportStepResult(11, false, "The Websocket connection to " +
                "the CSS-CII endpoint did not complete within 10 seconds");
            tearDown();
        },
        10000);

    testAPI.openWebsocket(
        interDevSyncUrl,
        // onConnect
        onCIIConnect,
        // onMessage
        onCIIMessage,
        // onPong - safe to ignore in this test
        null,
        // onClose - ignore. We'll let the harness close it.
        null,
        // onFail,
        onCIIFail,
        // callback object. Not required.
        undefined,
        // originHeader. Not required.
        null,
        // websocketsExtensionHeader. Not required.
        null);
}


function onCIIFail(cbObj, statusCode, reason, wsClient) {
    //
    // Passed into CSS-CII openWebsocket() as the 'onFail' callback.
    //
    // Fails the test as soon as it is called.
    testAPI.reportStepResult(11, false, "The CSS-CII endpoint connection " +
        " was unsuccessful: status code: " + statusCode + ", reason: " +
        reason);
    tearDown();
}


function onCIIConnect(cbObj, extHeader, wsClient) {
    //
    // Passed into openWebsocket() as the *first* 'onConnect' callback.
    //
    clearTimeout(timeout);

    testAPI.reportMessage("The harness indicates that the connection to the" +
        "CSS-CII endpoint was successful.");

    testAPI.reportMessage("Awaiting a CSS-CII message from the terminal...");

    // Set a time limit on receiving the first CII message
    timeout = setTimeout(
        function () {
            testAPI.reportStepResult(11, false, "A CII message was not " +
                "received within 10 seconds of the connection to the " +
                "CSS-CII endpoint being established");
            tearDown();
        },
        10000);
}


function onCIIMessage(cbObj, data, binary, wsClient) {
    //
    // Passed into openWebsocket() as the 'onMessage' callback to handle
    // the initial CSS-CII message.
    //
    var decodedJson;

    if (testEnded === true) {
        return;
    }

    if (gotTsUrl === true) {
        // We've already got the tsUrl - we can ignore other CSS-CII messages.
        return;
    }

    clearTimeout(timeout);

    if (binary !== false) {
        // We don't expect *any* binary messages.
        testAPI.reportStepResult(11, false, "The 'binary' argument passed to " +
            "passed to WebsocketClient.onMessage is not false. Got: " +
            binary);
        tearDown();
        return;
    }

    try {
        decodedJson = JSON.parse(data);
    } catch (ex) {
        testAPI.reportStepResult(11, false, "Exception when decoding the " +
            "CSS-CII JSON message: " + ex.message);
        tearDown();
        return;
    }

    tsUrl = decodedJson['tsUrl'];

    if (tsUrl === null || tsUrl === undefined) {
        testAPI.reportStepResult(11, false, "The 'tsUrl' property of the " +
            "CSS-CII JSON message is " + tsUrl);
        tearDown();
        return;
    }

    if (tsUrl.indexOf('ws://') !== 0) {
        testAPI.reportStepResult(11, false, "The 'tsUrl' property of the " +
            "CSS-CII JSON message does not start with the WebSocket protocol:" +
            tsUrl);
        tearDown();
        return;
    }

    gotTsUrl = true;

    testAPI.reportStepResult(11, true, "The 'tsUrl' property was retrieved " +
        "from the CSS-CII message");

    connectToCssTs();
}


function connectToCssTs() {
    testAPI.reportMessage("Attempting to connect to the CSS-TS endpoint...");

    // Fail the test if the websocket connection takes longer than 10 seconds to
    // complete.
    timeout = setTimeout(
        function () {
            testAPI.reportStepResult(12, false, "The Websocket connection to " +
                "the CSS-TS endpoint did not complete within 10 seconds");
            tearDown();
        },
        10000);

    testAPI.openWebsocket(
        tsUrl,
        onTSConnect,
        onTSMessageUnavailable,
        // onPong - not required
        null,
        // onClose - we'll let the harness close it.
        null,
        // onFail
        onTSFail,
        // callback object. Not required.
        undefined,
        // originHeader. Not required.
        null,
        // websocketsExtensionHeader. Not required.
        null);

}

function onTSFail(cbObj, reason, wsClientTs, statusCode) {
    //
    // Passed into CSS-TS openWebsocket() as the 'onFail' callback.
    //
    // Fails the test as soon as it is called.
    testAPI.reportStepResult(12, false, "The CSS-TS endpoint connection " +
        " was unsuccessful: status code: " + statusCode + ", reason: " +
        reason);
    tearDown();
}


function onTSConnect(cbObj, websocketsExtensionHeader, wsClientTs) {
    //
    // 'onConnect' callback for the CSS-TS websocket.
    //
    var timelineSelector = 'urn:dvb:css:timeline:mpd:period:rel:1000:second';
    var data = {'contentIdStem': '',
                'timelineSelector': timelineSelector};
    var binary = false;

    if (testEnded === true) {
        return;
    }

    clearTimeout(timeout);

    testAPI.reportStepResult(12, true, "The connection to the CSS-TS " +
        "endpoint was successful");

    testAPI.reportMessage("Sending timeline request...");


    // Make a setup-data request.
    // NOTE: 13.8.3.1 - we should get a response within 5 seconds of sending
    // this setup-data message
    timeout = setTimeout(
        function () {
            testAPI.reportStepResult(13, false, "A response to the CSS-TS " +
                "setup-data message was not received within 5 seconds");
            tearDown();
        },
        5000);

    wsClientTs.sendMessage(JSON.stringify(data), binary);
}


function onTSMessageUnavailable(cbObj, data, binary, wsClientTs) {
    //
    // 'onMessage' callback for the CSS-TS websocket. This is the initial
    // handler, which checks that the requested timeline is unavailable.
    //
    var decodedJson;
    var contentTime;
    var wallClockTimeString;
    var wallClockTimeInt;
    var timelineSpeedMultiplier;

    if (testEnded === true || timelineUnavailableMsgReceived === true) {
        return;
    }

    clearTimeout(timeout);

    if (binary !== false) {
        // We don't expect *any* binary messages.
        testAPI.reportStepResult(13, false, "The 'binary' argument passed to " +
            "passed to WebsocketClient.onMessage is not false. Got: " +
            binary);
        tearDown();
        return;
    }

    try {
        decodedJson = JSON.parse(data);
    } catch (ex) {
        testAPI.reportStepResult(13, false, "Exception when decoding the " +
            "CSS-TS JSON message: " + ex.message);
        tearDown();
        return;
    }

    testAPI.reportStepResult(13, true, "A CSS-TS message has been received");

    contentTime = decodedJson['contentTime'];

    if (contentTime !== null) {
        testAPI.reportStepResult(14, false, "The 'contentTime' property of " +
            "the CSS-TS message is not null. Got: " + contentTime);
        tearDown();
        return;
    }

    // The wall clock property must always be non-null, even if the timeline
    // is unavailable.
    wallClockTimeString = decodedJson['wallClockTime'];
    wallClockTimeInt = parseInt(wallClockTimeString, 10);

    if (isNaN(wallClockTimeInt)) {
        testAPI.reportStepResult(14, false, "The 'wallClockTime' of the " +
            "CSS-TS message could not be converted to an integer. Got: " +
            wallClockTimeString);
        tearDown();
        return;
    }

    timelineSpeedMultiplier = decodedJson['timelineSpeedMultiplier'];

    if (timelineSpeedMultiplier !== null) {
        testAPI.reportStepResult(14, false, "The 'timelineSpeedMultiplier' " +
            "property of the CSS-TS message is not null. Got: " +
            timelineSpeedMultiplier);
        tearDown();
        return;
    }

    testAPI.reportStepResult(14, true, "The CSS-TS message correctly " +
        "indicated that the requested timeline is unavailable");

    // Set the flag to ensure these steps are not repeated.
    timelineUnavailableMsgReceived = true;

    // Set the WebsocketClient's 'onMessage' callback to a new, suitable
    // function and update the MPD being served.
    wsClientTs.onMessage = onTsMessageMpdUpdated;

    triggerMpdUpdate();
}


function triggerMpdUpdate() {
    // Request that the MPD server switches to the MPD containing Period with id
    // 'second'.
    // When the callback is actioned, that means the MPD has been updated.
    // We need to keep track of this so we can check that the CSS-TS message
    // response is received *after* the MPD is updated.
    sendRequest(
        "mpdserve.php?action=change_mpd&mpd_index=2",
        function (req) {
            testAPI.reportMessage("The MPD has been updated");
            mpdUpdated = true;

            // Now that the MPD has been updated, the terminal should start
            // sending CSS-TS messages indicating the timeline is available.
            // We'll check we get the correct response within 10 seconds of the
            // MPD being updated (note that we might get a few messages that
            // reflect the old MPD before the terminal actions the new one).
            timeout = setTimeout(
                function () {
                    testAPI.reportStepResult(15, false, "A CSS-TS message " +
                        "indicating that the requested timeline is available " +
                        "was not received within 10 seconds of updating the " +
                        "MPD.");
                    tearDown();
                },
                10000);
        });
}

function onTsMessageMpdUpdated(cbObj, data, binary, wsClientTs) {
    //
    // Callback that replaces onTSMessageUnavailable() on the CSS-TS
    // WebsocketClient after the timeline-unavailable message has been received
    // and the MPD update has been requested.
    //
    var decodedJson;
    var contentTimeString;
    var contentTimeInt;
    var wallClockTimeString;
    var wallClockTimeInt;
    var timelineSpeedMultiplier;

    if (testEnded === true) {
        return;
    }

    if (mpdUpdated === false) {
        // Don't check any details until the MPD has been updated.
        return;
    }

    if (binary !== false) {
        // We don't expect *any* binary messages.
        testAPI.reportStepResult(15, false, "The 'binary' argument passed to " +
            "passed to WebsocketClient.onMessage is not false. Got: " +
            binary);
        tearDown();
        return;
    }

    try {
        decodedJson = JSON.parse(data);
    } catch (ex) {
        testAPI.reportStepResult(15, false, "Exception when decoding the " +
            "CSS-TS JSON message: " + ex.message);
        tearDown();
        return;
    }

    contentTimeString = decodedJson['contentTime'];

    if (contentTimeString === null) {
        // The new MPD has not been processed yet, so the requested timeline
        // is still unavailable, and so 'contentTime' is still null, so we
        // return and wait for the right message, or until the timeout is hit.
        return;
    } else {
        contentTimeInt = parseInt(contentTimeString, 10);

        if (isNaN(contentTimeInt)) {
            testAPI.reportStepResult(15, false, "The 'contentTime' property " +
                "of the CSS-TS message is not null, nor is it an integer " +
                "encoded as a string. Got: " + contentTimeString);
            tearDown();
            return;
        }
    }

    // The wall clock property shall always be non-null, even if the timeline
    // is unavailable.
    wallClockTimeString = decodedJson['wallClockTime'];
    wallClockTimeInt = parseInt(wallClockTimeString, 10);

    if (isNaN(wallClockTimeInt)) {
        testAPI.reportStepResult(15, false, "The 'wallClockTime' of the " +
            "CSS-TS message could not be converted to an integer. Got: " +
            wallClockTimeString);
        tearDown();
        return;
    }

    timelineSpeedMultiplier = decodedJson['timelineSpeedMultiplier'];

    if (timelineSpeedMultiplier !== 1) {
        testAPI.reportStepResult(15, false, "The 'timelineSpeedMultiplier' " +
            "property of the CSS-TS message is not 1. Got: " +
            timelineSpeedMultiplier);
        tearDown();
        return;
    }

    testAPI.reportStepResult(15, true, "A CSS-TS message indicating " +
        "that the requested timeline is available was received");

    testAPI.endTest();
    tearDown();
}
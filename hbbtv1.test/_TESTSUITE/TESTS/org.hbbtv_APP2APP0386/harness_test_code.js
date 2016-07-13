/* global HbbTVTestAPI: false */
/* jslint sloppy: true, maxerr: 1000, vars: true, browser: true */

var testAPI;
var pathToAitXml = "org.hbbtv_APP2APP0386.ait.xml";
var appEndPoint = "myapp.mychannel.org/org.hbbtv_APP2APP0386";
var pairingCompleted = false;
var confirmedPairingCompleted = false;
var _applicationUrl = '';
var timeout;

function tearDown() {
    clearTimeout(timeout);
}

testAPI = new HbbTVTestAPI();
testAPI.init();

testAPI.reportStepResult(0, true, "Application initialised");
testAPI.reportMessage("Performing M-SEARCH...");
testAPI.dial.doMSearch(searchCallback);


function searchCallback(callbackObject, locationHeader) {
    testAPI.reportStepResult(1, true, "The M-SEARCH callback was called");
    testAPI.reportMessage("Obtaining device description data...");

    testAPI.dial.getDeviceDescription(locationHeader, null,
        descriptionCallback);
}


function descriptionCallback(callbackObject, applicationUrl, didRedirect, allowOrigin) {
    testAPI.reportStepResult(2, true, "The device description callback has " +
                                      "been reached.");

    testAPI.reportMessage("Attempting to start the HbbTV app...");

    timeout = setTimeout(startAppTimeoutCallback, 60000);

    // Append "/HbbTV" to the application URL
    if (applicationUrl.substr(-1) !== '/') {
        applicationUrl += '/';
    }
    applicationUrl += "HbbTV";

    // Save for later
    _applicationUrl = applicationUrl;

    try {
        // Start application
        testAPI.dial.startHbbtvApp(_applicationUrl, pathToAitXml, null,
                                   startAppCallback);
    } catch (e) {
        testAPI.reportStepResult(3, false, "Exception whilst launching" +
            "HbbTV application: " + e.message);
        tearDown();
    }
}


function startAppCallback(callbackObject, returnCode, contentType, body, allowOrigin) {
    if (returnCode !== 201) {
        testAPI.reportStepResult(3, false, "returnCode was not equal to 201 " +
        "(was equal to " + returnCode + ")");
        return;
    }

    clearTimeout(timeout);

    testAPI.reportStepResult(3, true, "HbbTV app started successfully");

    // Get app2app remote base URL
    testAPI.dial.getHbbtvAppDescription(_applicationUrl, false, null,
        getAppDescriptionCallback);
}


function getAppDescriptionCallback(callbackObject, app2appUrl) {
    testAPI.reportStepResult(4, true, "Get App Description callback called");

    try {
        // Append slash (if needed) and app endpoint
        if (app2appUrl.substr(-1) !== '/') {
            app2appUrl += '/';
        }
        app2appUrl += appEndPoint;

        openRemoteWebSocket(app2appUrl);
    } catch (e) {
        testAPI.reportStepResult(5, false, "Exception whilst opening" +
            "remote Websocket: " + e.message);
        tearDown();
    }
}


function openRemoteWebSocket(url) {
    var messageCount = 0;

    timeout = setTimeout(remoteSocketPairingTimoutCallback, 10000);

    var onConnect = function (callbackObj, wsExtHeader, wsClient) {
        testAPI.reportMessage("Opened remote websocket");
    };

    var onMessage = function (callbackObj, data, binary, wsClient) {
        testAPI.reportMessage("Remote websocket received message");

        if (data === "pairingcompleted") {
            pairingCompleted = true;

            testAPI.reportMessage("Remote websocket received 'pairingcompleted'");

            if (messageCount === 0) {
                clearTimeout(timeout);
                socketPaired();
            } else {
                testAPI.reportStepResult(5, false, "Pairing message was not " +
                    "first message received on remote websocket");
                return;
            }
        } else {
            throw new Error("Remote Web Socket received invalid message");
        }

        messageCount++;
    };

    var onPong = function (callbackObj, data, wsClient) {
        /* We don't care about this */
    };

    var onClose = remoteWebSocketClose;

    var onFail = function (callbackObj, statusCode, reason, wsClient) {
        testAPI.reportStepResult(5, false, "Remote websocket failed to connect");
        tearDown();
    };

    testAPI.reportMessage("Attempting to open remote Websocket");

    // Open remote web socket
    testAPI.openWebsocket(url, onConnect, onMessage, onPong, onClose, onFail,
        null, null, null);
}


function socketPaired() {
    testAPI.reportStepResult(5, true, "Pairing message message received " +
        "on remote websocket");

    testAPI.analyzeScreenExtended(6, "Check that the HbbTV app indicates " +
        "that it is paired", "Check that the Websocket Paired indicator is " +
        "green, indicating that the local and remote Websockets are paired",
        confirmPairing);

    // Change channel to service 12
    testAPI.reportMessage('Changing channel to service 12...');

    timeout = setTimeout(channelChangeTimeoutCallback, 30000);

    testAPI.selectServiceByRemoteControl('ATE Test 12', channelChangedCallback);
}


function channelChangedCallback() {
    clearTimeout(timeout);

    testAPI.reportMessage('Waiting for web socket to close...');

    // Remote socket close should be called within when channel is changed
    timeout = setTimeout(function () {
        testAPI.reportStepResult(7, false, "Remote Websocket did not close");
    }, 30000);
}


function confirmPairing() {
    // We now need to wait for the remote web socket to be closed by the
    // channel change. This happens in remoteWebSocketClose below.
    confirmedPairingCompleted = true;
}


function remoteWebSocketClose(callbackObj, statusCode, reason, wsClient) {
    clearTimeout(timeout);

    testAPI.reportMessage("Remote web socket closed");

    if (!(pairingCompleted && confirmedPairingCompleted)) {
        testAPI.reportStepResult(7, false, "Remote web socket was closed " +
            "before pairing was completed");
        return;
    }

    testAPI.reportStepResult(7, true, "Remote web socket closed");
    testAPI.endTest();
}


function startAppTimeoutCallback() {
    testAPI.reportStepResult(5, false, "The HbbTV app did not launch within " +
        "60 seconds of the call to startHbbtvApp()");
}


function remoteSocketPairingTimoutCallback() {
    testAPI.reportStepResult(5, false, "The remote web socket did not " +
        " receive the 'pairingcompleted' message");
}


function channelChangeTimeoutCallback() {
    testAPI.reportStepResult(7, false, "The channel change callback was not " +
        "called");
}

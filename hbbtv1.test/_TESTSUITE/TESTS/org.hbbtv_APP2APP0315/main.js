/* global HbbTVTestAPI: false */
/* jslint sloppy: true, maxerr: 1000, vars: true, browser: true */

var testAPI;
var csManager;
var localWebSocket, remoteWebSocket;
var localWebSocketURL, remoteWebSocketURL;
var appEndPoint = "myapp.mychannel.org";
var localWebSocketTimeout;
var remoteWebSocketTimeout;
var webSocketsPairingTimeout;
var localSocketPaired = false;
var remoteSocketPaired = false;
var pairingCompleted = false;
var openedRemoteSockets = 0;

testAPI = new HbbTVTestAPI();
testAPI.init();

function tearDown() {
    clearTimeout(localWebSocketTimeout);
    clearTimeout(remoteWebSocketTimeout);
    clearTimeout(webSocketsPairingTimeout);

    if (localWebSocket) {
        localWebSocket.close();
    }

    if (remoteWebSocket) {
        remoteWebSocket.close();
    }

    testAPI.endTest();
}

window.onload = function () {
    var appMan, app, localURL, remoteURL;

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

    try {
        csManager = document.getElementById("cs-man");
    } catch (ex) {
        testAPI.reportStepResult(1, false, "Exception when getting a " +
            "reference to the HbbTVCSManager: " + ex.message);
        return;
    }

    if (csManager === null || csManager === undefined) {
        testAPI.reportStepResult(1, false, "The reference to the " +
            "HbbTVCSManager is " + csManager);
        return;
    }

    testAPI.reportStepResult(1, true, "A reference to the HbbTVCSManager " +
        "embedded object was obtained.");

    try {
        localURL = csManager.getApp2AppLocalBaseURL();
    } catch (ex) {
        testAPI.reportStepResult(2, false, "Exception when calling " +
            "getApp2AppLocalBaseURL: " + ex.message);
        return;
    }

    try {
        remoteURL = csManager.getApp2AppRemoteBaseURL();
    } catch (ex) {
        testAPI.reportStepResult(2, false, "Exception when calling " +
            "getApp2AppRemoteBaseURL: " + ex.message);
        return;
    }

    testAPI.reportStepResult(2, true, "Obtained local and remote App2App URLs");

    initApp2AppComms(localURL, remoteURL);
};


function initApp2AppComms(localURL, remoteURL) {
    localWebSocketURL = localURL + appEndPoint;
    remoteWebSocketURL = remoteURL + appEndPoint;

    testAPI.reportMessage("Attempting to open local web socket...");

    try {
        localWebSocket = openLocalWebSocket(localWebSocketURL);
    } catch (ex) {
        testAPI.reportStepResult(3, false, "Exception when opening local " +
            "websocket: " + ex.message);
        tearDown();
        return;
    }
}


function openLocalWebSocket(url) {
    var onopen, onmessage, onclose, websocket;

    onopen = function (event) {
        var msg = "not-to-be-relayed";

        clearTimeout(localWebSocketTimeout);
        testAPI.reportMessage("Opened local web socket");

        try {
            websocket.send(msg);
        } catch (ex) {
            testAPI.reportStepResult(3, false, "Exception when attempting " +
            "to send message '" + msg + "': " + ex.message);
            tearDown();
            return;
        }
        onLocalWebSocketOpened();
    };

    onmessage = function (event) {
        testAPI.reportMessage("Local websocket received message");

        if (event.data === 'pairingcompleted') {
            if(localSocketPaired === true) {
                testAPI.reportStepResult(3, false, "Local web socket " +
                    "received 'pairingcompleted' message when already paired");
                tearDown();
                return;
            }

            localSocketPaired = true;

            if(localSocketPaired && remoteSocketPaired) {
                clearTimeout(webSocketsPairingTimeout);

                testAPI.reportMessage("Pairing Complete message received, waiting " +
                    "10 seconds to ensure no further messages are received");

                setTimeout(onLocalAndRemoteWebSocketsPaired, 10000);
            }
        }
        else {
            testAPI.reportStepResult(3, false, "Local web socket " +
                "received message: " + event.data);
            tearDown();
            return;
        }
    };

    onclose = function (event) {
        testAPI.reportMessage("Local web socket closed");
    };

    websocket = new WebSocket(url);

    if (websocket === null || websocket === undefined) {
        testAPI.reportStepResult(3, false, "Error while creating local " +
            "web socket object. Returned: " + websocket);
        tearDown();
        return;
    }

    websocket.onopen = onopen;
    websocket.onclose = onclose;
    websocket.onmessage = onmessage;

    return websocket;
}


function onLocalWebSocketOpened() {
    testAPI.reportMessage("Attempting to open remote web socket...");

    remoteWebSocketTimeout = setTimeout(onRemoteWebSocketOpenedTimeout, 5000);
    try {
        openRemoteWebSocket(remoteWebSocketURL);
    } catch (ex) {
        testAPI.reportStepResult(3, false, "Exception when opening remote " +
            "websocket: " + ex.message);
        tearDown();
        return;
    }
}


function openRemoteWebSocket(url) {
    var onConnect, onMessage, onClose, onFail, onPong, callbackObject;

    onConnect = function (callbackObj, wsExtHeader, wsClient) {
        clearTimeout(remoteWebSocketTimeout);
        remoteWebSocket = wsClient;
        testAPI.reportMessage("Opened remote websocket");
        webSocketsPairingTimeout = setTimeout(onWebSocketsPairingTimeout,
            10000);
    };

    onMessage = function (callbackObj, data, binary, wsClient) {
        testAPI.reportMessage("Remote websocket received message");

        if (data !== 'pairingcompleted') {
            testAPI.reportMessage(3, false, "Remote websocket received " +
                "message : " + data);
            tearDown();
        } else {
            if(remoteSocketPaired === true) {
                testAPI.reportStepResult(3, false, "Remote websocket " +
                    "received 'pairingcompleted' message when already " +
                    "paired.");
                tearDown();
                return;
            }

            remoteSocketPaired = true;

            if(localSocketPaired && remoteSocketPaired) {
                clearTimeout(webSocketsPairingTimeout);

                testAPI.reportMessage("Pairing Complete message received, waiting " +
                    "10 seconds to ensure no further messages are received");

                setTimeout(onLocalAndRemoteWebSocketsPaired, 10000);
            }
        }
    };

    onFail = function (callbackObj, statusCode, reason, wsClient) {
        testAPI.reportStepResult(3, false, "Remote websocket failed to connect");
        tearDown();
    };

    onPong = function (callbackObj, data, wsClient) {
        /* We don't care about this */
    };

    onClose = function (callbackObj, statusCode, reason, wsClient) {
        /* We don't care about this */
    };

    testAPI.openWebsocket(url, onConnect, onMessage, onPong, onClose, onFail,
        callbackObject, null, null);
}


function onLocalAndRemoteWebSocketsPaired() {
    pairingCompleted = true;

    testAPI.reportStepResult(3, true, "No messages other than the Pairing " +
        "Completed messages have been received");
    tearDown();
}


function onLocalWebSocketOpenedTimeout() {
    testAPI.reportStepResult(3, false, "Timeout opening local web socket");
    tearDown();
}


function onRemoteWebSocketOpenedTimeout() {
    testAPI.reportStepResult(3, false, "Timeout opening remote websocket");
    tearDown();
}


function onWebSocketsPairingTimeout() {
    testAPI.reportStepResult(3, false, "Timeout pairing local and remote " +
        "websockets");
    tearDown();
}

/* global HbbTVTestAPI: false */
/* jslint sloppy: true, maxerr: 1000, vars: true, browser: true */

var testAPI;
var csManager;
var localWebSocket;
var remoteWebSocket;
var localWebSocketURL;
var remoteWebSocketURL;
var pairingTimeout;
var localSocketPaired;
var remoteSocketPaired;
var pairingCompleted;
var timeout;
var appEndPoint = "myapp.mychannel.org";

testAPI = new HbbTVTestAPI();
testAPI.init();

function tearDown() {
    clearTimeout(pairingTimeout);
    clearTimeout(timeout);

    if (localWebSocket) {
        localWebSocket.close();
    }
}


window.onload = function () {
    var appMan, app;

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
        // csManager = document.getElementById("cs-man");
        csManager = new HbbTVCSManager();
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

    var localURL, remoteURL;

    try {
        localURL = csManager.getApp2AppLocalBaseURL();
    } catch (ex) {
        testAPI.reportStepResult(2, false, "Exception when calling " +
            " getApp2AppLocalBaseURL: " + ex.message);
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
    // Generate the websocket URLs
    localWebSocketURL = localURL + appEndPoint;
    remoteWebSocketURL = remoteURL + appEndPoint;

    // Fail the test if the sockets haven't paired within 10 seconds
    pairingTimeout = setTimeout(pairingTimeoutCallback, 10000);

    testAPI.reportMessage("Attempting to open local web socket...");
    try {
        localWebSocket = openLocalWebSocket(localWebSocketURL);
    } catch (ex) {
        testAPI.reportStepResult(3, false, "Exception when opening local " +
            " websocket: " + ex.message);
        tearDown();
    }

    // Open the remote socket
    testAPI.reportMessage("Attempting to open remote web socket...");
    try {
        openRemoteWebSocket(remoteWebSocketURL);
    } catch (ex) {
        testAPI.reportStepResult(3, false, "Exception when opening remote " +
            " websocket: " + ex.message);
        tearDown();
    }
}


function openLocalWebSocket(url) {
    var onOpen, onMessage, onClose, websocket;
    var messageCount = 0;
    var timeout = setTimeout(function () {
        throw new Error("Local web socket did not open");
    }, 5000);

    // Define web socket callbacks
    onOpen = function (event) {
        testAPI.reportMessage("Opened local web socket");
        clearTimeout(timeout);
    };

    onMessage = function (event) {
        if (event.data === "pairingcompleted") {
            if(localSocketPaired === true) {
                testAPI.reportStepResult(3, false, "Local web socket " +
                    "received 'pairingcompleted' message when already paired");
                tearDown();
                return;
            }

            if (messageCount === 0) {
                testAPI.reportMessage("Local websocket received " +
                    "'pairingcompleted' message");

                localSocketPaired = true;

                if (localSocketPaired && remoteSocketPaired && !pairingCompleted) {
                    onLocalAndRemoteWebSocketsPaired();
                }
            } else {
                throw new Error("Pairing message was not first message " +
                    "received on local websocket");
            }
        }

        messageCount++;
    };

    onClose = function (event) {
        if (pairedSocketCount == 2) {
            testAPI.reportStepResult(5, true, "onClose event was fired on " +
                "the local websocket after closing remote connection");
            tearDown();
            testAPI.endTest();
        } else {
            throw new Error("onClose event was fired on local websocket " +
                "before connections were paired");
        }
    };

    // Try to open the web socket
    websocket = new WebSocket(url);

    if (websocket === null || websocket === undefined) {
        throw new Error("Unable to create WebSocket object");
    }

    if (websocket) {
        websocket.onopen = onOpen;
        websocket.onclose = onClose;
        websocket.onmessage = onMessage;
    } else {
        throw new Error("Error creating local web socket object, got " +
            websocket);
    }

    return websocket;
}


function openRemoteWebSocket(url) {
    var onConnect, onMessage, onClose, onFail, onPong, callbackObject;
    var messageCount = 0;
    var timeout = setTimeout(function () {
        throw new Error("Remote web socket did not open");
    }, 5000);

    onConnect = function (callbackObj, wsExtHeader, wsClient) {
        clearTimeout(timeout);

        testAPI.reportMessage("Opened remote websocket");
        remoteWebSocket = wsClient;
    };

    onMessage = function (callbackObj, data, binary, wsClient) {
        if (data === "pairingcompleted") {

            if(remoteSocketPaired === true) {
                testAPI.reportStepResult(3, false, "Remote websocket " +
                    "received 'pairingcompleted' message when already " +
                    "paired.");
                return;
            }

            if (messageCount === 0) {
                testAPI.reportMessage("Remote websocket received " +
                    "'pairingcompleted' message");

                remoteSocketPaired = true;
                if (localSocketPaired && remoteSocketPaired && !pairingCompleted) {
                    onLocalAndRemoteWebSocketsPaired();
                }
            } else {
                clearTimeouts();
                throw new Error("Pairing message was not first message " +
                    "received on local websocket");
            }
        }

        messageCount++;
    };

    onPong = function (callbackObj, data, wsClient) {
        /* We don't care about this */
    };

    onClose = function (callbackObj, statusCode, reason, wsClient) {
        testAPI.reportStepResult(4, false, "Remote websocket recieved " +
            "unexpected close frame");
    };

    onFail = function (callbackObj, statusCode, reason, wsClient) {
        testAPI.reportStepResult(4, false, "Remote websocket failed to " +
            "connect");
        tearDown();
    };

    // Open remote web socket
    testAPI.openWebsocket(url, onConnect, onMessage, onPong, onClose, onFail,
        callbackObject, null, null);
}


function onLocalAndRemoteWebSocketsPaired() {
    pairingCompleted = true;

    testAPI.reportStepResult(3, true, "Successfully paired local and remote " +
        "websockets");
    clearTimeout(pairingTimeout);

    timeout = setTimeout(expectOnCloseEventTimeoutCallback, 5000);
    remoteWebSocket.tcpClose(remoteSocketClosedCallback, undefined);
}


function remoteSocketClosedCallback(callbackObject) {
    testAPI.reportStepResult(4, true, "Remote websocket closed");
}


function pairingTimeoutCallback() {
    testAPI.reportStepResult(3, false, "Failed to pair local and remote " +
        " websockets");
    tearDown();
}


function expectOnCloseEventTimeoutCallback() {
    testAPI.reportStepResult(4, false, "onClose event was not fired on local" +
        " websocket after closing remote connection");
    tearDown();
}

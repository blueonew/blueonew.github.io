/* global HbbTVTestAPI: false */
/* jslint sloppy: true, maxerr: 1000, vars: true, browser: true */

var testAPI;
var csManager;
var localWebSocket;
var remoteWebSocket;
var localWebSocketURL;
var remoteWebSocketURL;
var localWebSocketTimeout;
var remoteWebSocketTimeout;
var socketsNotPairedTimeout;
var sendMessageTimeout;
var remoteSocketPaired = false;
var localSocketPaired = false;
var pairingCompleted = false;
var messageLength = 131072;
var messageSentCount = 0;
var messageReceivedCount = 0;
var messagePayload = createPayload(messageLength);
var appEndPoint = "myapp.mychannel.org";

testAPI = new HbbTVTestAPI();
testAPI.init();

function tearDown() {
    clearTimeout(localWebSocketTimeout);
    clearTimeout(remoteWebSocketTimeout);
    clearTimeout(socketsNotPairedTimeout);
    clearTimeout(sendMessageTimeout);

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

    localWebSocketTimeout = setTimeout(onLocalWebsocketTimeout, 5000);
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
        clearTimeout(localWebSocketTimeout);

        testAPI.reportMessage("Opened local web socket");
        remoteWebSocketTimeout = setTimeout(onRemoteWebsocketTimeout, 5000);

        try {
            openRemoteWebSocket(remoteWebSocketURL);
        } catch (ex) {
            testAPI.reportStepResult(3, false, "Exception when opening remote " +
                "websocket: " + ex.message);
            tearDown();
            return;
        }
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

            clearTimeout(socketsNotPairedTimeout);
            localSocketPaired = true;

            if (localSocketPaired && remoteSocketPaired && !pairingCompleted) {
                onLocalAndRemoteWebSocketsPaired();
            }
        } else if (event.data.length === messageLength) {
            clearTimeout(sendMessageTimeout);
            if (event.data === messagePayload) {
                testAPI.reportStepResult(4, true, "Local websocket received " +
                    "text message of length " + event.data.length +
                    " matching message payload sent from remote web socket");
                tearDown();
            }
            testAPI.reportStepResult(4, false, "Local websocket received " +
                "text message of length " + event.data.length +
                " but the received message payload does not match " +
                "the message payload sent from remote web socket");
            tearDown();
        } else {
            testAPI.reportStepResult(4, false, "Local websocket received " +
                "text message of length " + event.data.length +
                " but the length of the received message does not match the " +
                "message length sent from remote web socket. " +
                "Expected length: " + messageLength);
            tearDown();
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


function openRemoteWebSocket(url) {
    var onConnect, onMessage, onClose, onFail, onPong, callbackObject;

    testAPI.reportMessage("Attempting to open remote web socket...");

    onConnect = function (callbackObj, wsExtHeader, wsClient) {
        clearTimeout(remoteWebSocketTimeout);
        testAPI.reportMessage("Opened remote web socket");
        socketsNotPairedTimeout = setTimeout(onSocketsNotPairedTimeout, 5000);
        remoteWebSocket = wsClient;
    };

    onMessage = function (callbackObj, data, binary, wsClient) {
        testAPI.reportMessage("Remote websocket received message");

        if (data === 'pairingcompleted') {
            if(remoteSocketPaired === true) {
                testAPI.reportStepResult(3, false, "Remote websocket " +
                    "received 'pairingcompleted' message when already " +
                    "paired.");
                return;
            }

            remoteSocketPaired = true;
            if (localSocketPaired && remoteSocketPaired && !pairingCompleted) {
                onLocalAndRemoteWebSocketsPaired();
            }
        }
    };

    onPong = function (callbackObj, data, wsClient) {
        /* We don't care about this */
        return null;
    };

    onClose = function (callbackObj, statusCode, reason, wsClient) {
        testAPI.reportMessage("Remote web socket closed");
    };

    onFail = function (callbackObj, statusCode, reason, wsClient) {
        testAPI.reportStepResult(3, false, "Remote websocket failed to connect");
        tearDown();
    };

    testAPI.openWebsocket(url, onConnect, onMessage, onPong, onClose, onFail,
        callbackObject, null, null);
}

function onLocalAndRemoteWebSocketsPaired() {
    pairingCompleted = true;

    var fragments = [];
    testAPI.reportStepResult(3, true, "Pairing completed messages received");
    testAPI.reportMessage("Sending message payload to websockets...");

    sendMessageTimeout = setTimeout(onSendMessageTimeout, 10000);

    fragments = fillArray(1024, 127);
    fragments.push(1);
    fragments.push(1023);

    remoteWebSocket.sendMessage(messagePayload, false, fragments);
}

function onLocalWebsocketTimeout() {
    testAPI.reportStepResult(3, false, "Timeout opening local web socket");
    tearDown();
}

function onRemoteWebsocketTimeout() {
    testAPI.reportStepResult(3, false, "Timeout opening remote web socket");
    tearDown();
}

function onSocketsNotPairedTimeout() {
    testAPI.reportStepResult(3, false, "Timeout pairing web sockets");
    tearDown();
}

function onSendMessageTimeout() {
    testAPI.reportStepResult(4, false, "Timeout sending message to local web socket");
    tearDown();
}

function createPayload(count) {
    var count2 = count / 2;
    var result = '0123456789ABCDEF';

    if(count < result.length) {
        result = result.substring(0, count);
    }
    else {
        while (result.length <= count2) {
            result += result;
        }

        result += result.substring(0, count - result.length);
    }

    return result;
}

function fillArray(value, len) {
    var arr = [];

    for (var i = 0; i < len; i++) {
        arr.push(value);
    }

    return arr;
}

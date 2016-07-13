/* global HbbTVTestAPI: false */
/* jslint sloppy: true, maxerr: 1000, vars: true, browser: true */

var testAPI;
var csManager;
var localWebSocket;
var remoteWebSocket;
var localWebSocketURL = '';
var remoteWebSocketURL = '';
var localWebSocketTimeout;
var remoteWebSocketTimeout;
var noMessageReceivedTimeout;
var localSocketPaired;
var remoteSocketPaired;
var pairingCompleted;

testAPI = new HbbTVTestAPI();
testAPI.init();

function tearDown() {
    clearTimeout(localWebSocketTimeout);
    clearTimeout(remoteWebSocketTimeout);
    clearTimeout(noMessageReceivedTimeout);

    if (localWebSocket) {
        localWebSocket.close();
    }

    if(remoteWebSocket) {
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
    var appEndPoint = "myapp.mychannel.org";
    var queryString = '?parameter=value';
    appEndPoint += '.';
    appEndPoint = padURLString(appEndPoint, 1000 - queryString.length);
    appEndPoint += queryString;

    // Generate the websocket URLs
    localWebSocketURL = localURL + appEndPoint;
    remoteWebSocketURL = remoteURL + appEndPoint;

    // Open the local socket
    localWebSocketTimeout = setTimeout(localWebsocketTimeoutCallback, 5000);

    testAPI.reportMessage("Attempting to open local web socket...");
    try {
        localWebSocket = openLocalWebSocket(localWebSocketURL);
    } catch (ex) {
        testAPI.reportStepResult(3, false, "Exception when opening local " +
            " websocket: " + ex.message);
        tearDown();
    }

    // Open the remote socket
    remoteWebSocketTimeout = setTimeout(remoteWebsocketTimeoutCallback, 5000);

    testAPI.reportMessage("Attempting to open remote web socket...");

    try {
        openRemoteWebSocket(remoteWebSocketURL);
    }
    catch (ex) {
        testAPI.reportStepResult(3, false, "Exception when opening remote " +
            " websocket: " + ex.message);
        tearDown();
    }

    // Timeout if no messages are received, set to ten seconds so opening
    // the websockets will timeout first
    noMessageReceivedTimeout = setTimeout(noMessageReceivedTimeoutCallback,
        10000);
}

function openLocalWebSocket(url) {
    // Define web socket callbacks
    var onOpen = function (event) {
        testAPI.reportMessage("Opened local web socket");
        clearTimeout(localWebSocketTimeout);
    };

    var onMessage = function (event) {
        testAPI.reportMessage("Local websocket received message");

        if (event.data === 'pairingcompleted') {
            if(localSocketPaired === true) {
                testAPI.reportStepResult(3, false, "Local web socket " +
                    "received 'pairingcompleted' message when already paired");
                tearDown();
                return;
            }

            localSocketPaired = true;

            if (localSocketPaired && remoteSocketPaired && !pairingCompleted) {
                onLocalAndRemoteWebSocketsPaired();
            }
        }
    };

    var onClose = function (event) {
        testAPI.reportMessage("Local web socket closed");
    };

    // Open web socket
    var webSocket = new WebSocket(url);

    if (webSocket) {
        webSocket.onopen = onOpen;
        webSocket.onclose = onClose;
        webSocket.onmessage = onMessage;
    }
    else {
        testAPI.reportStepResult(3, false, "Error, creating web socket " +
            "object returned: " + webSocket);
        tearDown();
        return;
    }

    return webSocket;
}


function openRemoteWebSocket(url) {
    // Define web socket callbacks
    var onConnect = function (callbackObject, websocketExtensionHeader, webSocket) {
        testAPI.reportMessage("Opened remote web socket");

        clearTimeout(remoteWebSocketTimeout);
        remoteWebSocket = webSocket;
    };

    var onMessage = function (callbackObject, message) {
        if (message === 'pairingcompleted') {
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
        else {
            testAPI.reportStepResult(3, false, "Invalid message received on " +
                "remote web socket");
        }
    };

    var onClose = function (callbackObject, statusCode, reason, client) {
        testAPI.reportMessage("Remote web socket closed");
    };

    var onFail = function (callbackObject, statusCode, reason, client) {
        testAPI.reportStepResult(3, false, "Web socket onFail was called");
        tearDown();
    };

    var onPong = function (callbackObj, data, wsClient) {
        /* We don't care about this */
    };

    // Open web socket
    testAPI.reportMessage("openWebsocket main.js");
    testAPI.openWebsocket(url, onConnect, onMessage, onPong, onClose, onFail,
        null, null, null);
}

function noMessageReceivedTimeoutCallback() {
    testAPI.reportStepResult(3, false, "No messages were received on either " +
        "websocket");
    tearDown();
}

function localWebsocketTimeoutCallback() {
    testAPI.reportStepResult(3, false, "Timeout opening local web socket");
    tearDown();
}

function remoteWebsocketTimeoutCallback() {
    testAPI.reportStepResult(3, false, "Timeout opening remote web socket");
    tearDown();
}

function padURLString(string, length) {
    var remainingLength = length - string.length;

    var i, c = 0;
    var useCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
                        "abcdefghijklmnopqrstuvwxyz" +
                        "0123456789+!$+-_~=@";

    for (i = 0; i < remainingLength; i++) {
        string += useCharacters[c++];
        if(c === useCharacters.length) {
            c = 0;
        }
    }

    return string;
}

function onLocalAndRemoteWebSocketsPaired() {
    pairingCompleted = true;

    testAPI.reportStepResult(3, true, "Pairing completed messages received " +
        "on both web sockets");
    tearDown();
}

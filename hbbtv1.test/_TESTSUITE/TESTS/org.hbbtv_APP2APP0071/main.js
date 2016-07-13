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
var openedSockets = 0;

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
    var queryString1 = '?parameter=value1';
    var queryString2 = '?parameter=value2';
    appEndPoint += '.';
    var appEndPoint1 = padURLString(appEndPoint, 1000 - queryString1.length);
    var appEndPoint2 = padURLString(appEndPoint, 1000 - queryString2.length);
    appEndPoint1 += queryString1;
    appEndPoint2 += queryString2;

    // Generate the websocket URLs
    localWebSocketURL = localURL + appEndPoint1;
    remoteWebSocketURL = remoteURL + appEndPoint2;

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
    } catch (ex) {
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

        openedSockets++;
        if (openedSockets === 2) {
            noMessageReceivedTimeout = setTimeout(noMessageReceivedTimeoutCallback, 5000);
        }
    };

    var onMessage = function (event) {
        // No messages should be received on either socket
        testAPI.reportStepResult(3, false, "Local websocket received message");
        tearDown();
        return;
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
    } else {
        testAPI.reportStepResult(3, false, "Error, creating web socket " +
            "object returned: " + webSocket);
        tearDown();
        return;
    }

    return webSocket;
}

function openRemoteWebSocket(url) {
    // Define web socket callbacks
    var onConnect = function (callbackObj, wsExtHeader, wsClient) {
        testAPI.reportMessage("Opened remote web socket");
        clearTimeout(remoteWebSocketTimeout);

        openedSockets++;
        if (openedSockets === 2) {
            noMessageReceivedTimeout = setTimeout(noMessageReceivedTimeoutCallback, 5000);
        }

        remoteWebSocket = wsClient;
    };

    var onMessage = function (callbackObj, data, binary, wsClient) {
        // No messages should be received on either socket
        throw new Error("Local websocket received message");
    };

    var onClose = function (callbackObj, statusCode, reason, wsClient) {
        testAPI.reportMessage("Closed remote web socket with url " + url);
    };

    var onFail = function (callbackObj, statusCode, reason, wsClient) {
        testAPI.reportStepResult(4, false, "Remote websocket failed to connect");
        tearDown();
    };

    var onPong = function (callbackObj, data, wsClient) {
        /* We don"t care about this */
    };

    // Open remote web socket
    testAPI.openWebsocket(url, onConnect, onMessage, onPong, onClose, onFail,
        null, null, null);
}

function noMessageReceivedTimeoutCallback() {
    testAPI.reportStepResult(3, true, "No messages were received on either " +
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
        if (c === useCharacters.length) {
            c = 0;
        }
    }

    return string;
}

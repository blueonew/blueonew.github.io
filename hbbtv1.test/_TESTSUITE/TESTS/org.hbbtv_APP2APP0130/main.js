/* global HbbTVTestAPI: false */
/* jslint sloppy: true, maxerr: 1000, vars: true, browser: true */

var testAPI;
var csManager;
var localWebSocketURL, remoteWebSocketURL;
var remoteWebSocketsTimeout;
var pairingTimeout;
var appEndPoint = "myapp.mychannel.org/?pairing";
var currentPairedSocketId = 0;
var openedRemoteSockets = 0;
var numberOfSocketsToOpen = 10;
var localWebSockets = [];
var remoteWebSockets = [];
var localSocketsPaired = new Array(numberOfSocketsToOpen);
var remoteSocketsPaired = new Array(numberOfSocketsToOpen);
var pairingCompleted = false;

testAPI = new HbbTVTestAPI();
testAPI.init();

function tearDown() {
    var i, localws, remotews;

    clearTimeout(remoteWebSocketsTimeout);
    clearTimeout(pairingTimeout);

    for (i = 0; i < localWebSockets.length; i++) {
        localws = localWebSockets[i];
        localws.close();
    }

    for (i = 0; i < remoteWebSockets.length; i++) {
        remotews = remoteWebSockets[i];
        remotews.close();
    }
}


function allSocketsPaired() {
    for(i = 0; i < numberOfSocketsToOpen; i++) {
        if(localSocketsPaired[i] === false || remoteSocketsPaired[i] === false) {
            return false;
        }
    }

    return true;
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
    var i = 0;
    localWebSocketURL = localURL + appEndPoint;
    remoteWebSocketURL = remoteURL + appEndPoint;

    for(i = 0; i < numberOfSocketsToOpen; i++) {
        localSocketsPaired[i] = false;
        remoteSocketsPaired[i] = false;
    }

    remoteWebSocketsTimeout = setTimeout(onRemoteWebSocketsOpenedTimeout, 20000);

    try {
        for (i = 0; i < numberOfSocketsToOpen; i++) {
            new openRemoteWebSocket(remoteWebSocketURL, i);
        }
    } catch (ex) {
        testAPI.reportStepResult(3, false, "Exception when opening remote " +
            "websocket " + i + ": " + ex.message);
        tearDown();
        return;
    }
}


function openRemoteWebSocket(url, websocketId) {
    var onConnect, onMessage, onClose, onFail, onPong, callbackObject;

    onConnect = function (callbackObj, wsExtHeader, wsClient) {
        testAPI.reportMessage("Opened remote websocket " + websocketId);

        remoteWebSockets.push(wsClient);
        if (remoteWebSockets.length === numberOfSocketsToOpen) {
            clearTimeout(remoteWebSocketsTimeout);
            onRemoteSocketsOpened();
        }
    };

    onMessage = function (callbackObj, data, binary, wsClient) {
        testAPI.reportMessage("Remote websocket " + websocketId +
            " received message");

        if (data === 'pairingcompleted') {
            if(localSocketsPaired[websocketId] === true) {
                testAPI.reportStepResult(3, false, "Local web socket " +
                    "received 'pairingcompleted' message when already paired");
                tearDown();
                return;
            }

            localSocketsPaired[websocketId] = true;

            if(allSocketsPaired() && !pairingCompleted) {
                clearTimeout(pairingTimeout);
                onLocalAndRemoteWebSocketsPaired();
            }
        }
    };

    onPong = function (callbackObj, data, wsClient) {
        /* We don't care about this */
    };

    onClose = function (callbackObj, statusCode, reason, wsClient) {
        testAPI.reportMessage("Closed remote websocket " + websocketId);
    };

    this.onFail = function (callbackObj, statusCode, reason, wsClient) {
        testAPI.reportStepResult(3, false, "Remote websocket " + websocketId +
            " failed to connect");
        tearDown();
    };

    testAPI.openWebsocket(url, onConnect, onMessage, onPong, onClose, onFail,
        callbackObject, null, null);
}


function onRemoteSocketsOpened() {
    testAPI.reportStepResult(3, true, "Opened 10 remote websockets");
    testAPI.reportMessage("Attempting to open local web sockets...");

    pairingTimeout = setTimeout(onLocalWebSocketsPairingTimeout, 10000);
    openLocalWebSocketId(0);
}


function openLocalWebSocketId(websocketId) {
    var localws;

    try {
        localws = new openLocalWebSocket(localWebSocketURL, websocketId);
        localWebSockets.push(localws);
    } catch (ex) {
        testAPI.reportStepResult(4, false, "Exception when opening local " +
            "websocket " + websocketId + ": " + ex.message);
        tearDown();
        return;
    }
}


function openLocalWebSocket(url, websocketId) {
    var onopen, onmessage, onclose, websocket;

    onopen = function (event) {
        testAPI.reportMessage("Local websocket " + websocketId +
            " opened");
    };

    onmessage = function (event) {
        testAPI.reportMessage("Local websocket " + websocketId +
            " received message");

        if (event.data === 'pairingcompleted') {
            if(remoteSocketsPaired[websocketId] === true) {
                testAPI.reportStepResult(3, false, "Remote websocket " +
                    "received 'pairingcompleted' message when already " +
                    "paired.");
                return;
            }

            remoteSocketsPaired[websocketId] = true;

            if (allSocketsPaired() && !pairingCompleted) {
               onLocalAndRemoteWebSocketsPaired();
               return;
            }

            // Open the next local web socket
            if (currentPairedSocketId < numberOfSocketsToOpen) {
                currentPairedSocketId++;
                openLocalWebSocketId(currentPairedSocketId);
            }
        }
    };

    onclose = function (event) {
        testAPI.reportMessage("Local websocket " + websocketId +
            " closed");
    };

    websocket = new WebSocket(url);

    if (websocket === null || websocket === undefined) {
        testAPI.reportStepResult(4, false, "Error while creating local " +
            "web socket object. Returned: " + websocket);
        tearDown();
        return;
    }
    websocket.onopen = onopen;
    websocket.onclose = onclose;
    websocket.onmessage = onmessage;

    return websocket;
}


function onRemoteWebSocketsOpenedTimeout() {
    testAPI.reportStepResult(3, false, "Timeout opening remote websockets");
    tearDown();
}


function onLocalWebSocketsPairingTimeout() {
    testAPI.reportStepResult(4, false, "Timeout pairing local and remote websockets");
    tearDown();
}


function onLocalAndRemoteWebSocketsPaired() {
    pairingCompleted = true;
    testAPI.reportStepResult(4, true, "Pairing completed messages received");
    testAPI.endTest();
}

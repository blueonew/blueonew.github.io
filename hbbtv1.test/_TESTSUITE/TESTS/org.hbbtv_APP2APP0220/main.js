/* global HbbTVTestAPI: false */
/* jslint sloppy: true, maxerr: 1000, vars: true, browser: true */

var testAPI;
var csManager;
var localWebSocket, remoteWebSocket1, remoteWebSocket2;
var localWebSocketURL, remoteWebSocketURL1, remoteWebSocketURL2;
var webSocketsPairingTimeout;
var appEndPoint1 = "myapp.mychannel.org/?pairing_1";
var appEndPoint2 = "myapp.mychannel.org/?pairing_2";
var localSocketPaired = false;
var remoteSocketPaired = false;
var pairingCompleted = false;
var openedRemoteSockets = 0;

testAPI = new HbbTVTestAPI();
testAPI.init();

function tearDown() {
    clearTimeout(webSocketsPairingTimeout);

    if (localWebSocket) {
        localWebSocket.close();
    }

    if (remoteWebSocket1) {
        remoteWebSocket1.close();
    }

    if (remoteWebSocket2) {
        remoteWebSocket2.close();
    }
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
    localWebSocketURL = localURL + appEndPoint1;
    remoteWebSocketURL1 = remoteURL + appEndPoint1;
    remoteWebSocketURL2 = remoteURL + appEndPoint2;

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
            if (localSocketPaired && remoteSocketPaired && !pairingCompleted) {
                onLocalAndRemoteWebSocketsPaired();
            }
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
    testAPI.reportMessage("Opened local web socket");

    testAPI.reportMessage("Attempting to open remote web sockets...");

    try {
        openRemoteWebSocket(remoteWebSocketURL2);
    } catch (ex) {
        testAPI.reportStepResult(3, false, "Exception when opening remote " +
            "websocket with app endpoint " + appEndPoint2 + ": " + ex.message);
        tearDown();
        return;
    }
}


function onLocalAndRemoteWebSocketsPaired() {
    clearTimeout(webSocketsPairingTimeout);
    pairingCompleted = true;

    testAPI.reportStepResult(3, true, "Pairing completed messages received");
    tearDown();
    testAPI.endTest();
}


function openRemoteWebSocket(url) {
    var onConnect, onMessage, onClose, onFail, onPong, callbackObject;

    onConnect = function (callbackObj, wsExtHeader, wsClient) {
        testAPI.reportMessage("Opened remote websocket");

        openedRemoteSockets++;

        if (openedRemoteSockets === 1) {
            remoteWebSocket1 = wsClient;
            setTimeout(onFirstRemoteWebSocketOpened, 2000);
        }

        if (openedRemoteSockets === 2) {
            remoteWebSocket2 = wsClient;
            setTimeout(onSecondRemoteWebSocketOpened, 2000);
        }
    };

    onMessage = function (callbackObj, data, binary, wsClient) {
        testAPI.reportMessage("Remote websocket received message");

        if (data === 'pairingcompleted') {
            if(remoteWebSocket1 === wsClient) {
                if(remoteSocketPaired === true) {
                    testAPI.reportStepResult(3, false, "Remote websocket " +
                        "received 'pairingcompleted' message when already " +
                        "paired.");
                    return;
                }
            }

            if(remoteWebSocket2 === wsClient) {
                testAPI.reportStepResult(3, false, "Remote websocket 2" +
                    "should not receive a 'pairingcompleted' message");
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
    };

    onClose = function (callbackObj, statusCode, reason, wsClient) {
        testAPI.reportMessage("Closed remote web socket");
    };

    onFail = function (callbackObj, statusCode, reason, wsClient) {
        testAPI.reportStepResult(3, false, "Remote websocket failed to connect");
        tearDown();
    };

    testAPI.openWebsocket(url, onConnect, onMessage, onPong, onClose, onFail,
        callbackObject, null, null);
}


function onFirstRemoteWebSocketOpened() {
    try {
        openRemoteWebSocket(remoteWebSocketURL1);
    } catch (ex) {
        testAPI.reportStepResult(3, false, "Exception when opening remote " +
            "websocket with app endpoint " + appEndPoint1 + ": " + ex.message);
        tearDown();
        return;
    }
}


function onSecondRemoteWebSocketOpened() {
    webSocketsPairingTimeout = setTimeout(onWebSocketsPairingTimeout, 5000);
}


function onLocalWebSocketOpenedTimeout() {
    testAPI.reportStepResult(3, false, "Timeout opening local web socket");
    tearDown();
}


function onRemoteWebSocketsOpenedTimeout() {
    testAPI.reportStepResult(3, false, "Timeout opening remote websockets");
    tearDown();
}


function onWebSocketsPairingTimeout() {
    testAPI.reportStepResult(3, false, "Timeout pairing local and remote websockets");
    tearDown();
}

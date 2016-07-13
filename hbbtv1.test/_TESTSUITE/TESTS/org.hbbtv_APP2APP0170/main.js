/* global HbbTVTestAPI: false */
/* jslint sloppy: true, maxerr: 1000, vars: true, browser: true */

var testAPI;
var csManager;
var remoteWebSocket;
var origin = "http://xyz.example.com";
var appEndPoint = "myapp.mychannel.org";
    
testAPI = new HbbTVTestAPI();
testAPI.init();

window.onload = function () {
    var appMan, app, remoteURL;

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
        remoteURL = csManager.getApp2AppRemoteBaseURL();
    } catch (ex) {
        testAPI.reportStepResult(2, false, "Exception when calling " +
            "getApp2AppRemoteBaseURL: " + ex.message);
        return;
    }

    testAPI.reportStepResult(2, true, "Obtained remote App2App URL");

    remoteWebSocketURL = remoteURL + appEndPoint;

    // Open the remote socket
    testAPI.reportMessage("Attempting to open remote websocket...");
    try {
        remoteWebSocket = openRemoteWebSocket(remoteWebSocketURL);
    } catch (ex) {
        testAPI.reportStepResult(3, false, "Exception when opening remote " +
            "websocket: " + ex.message);
    }
};

function openRemoteWebSocket(url) {
    var onConnect, onMessage, onClose, onFail, onPong, callbackObject, originHeader;

    setTimeout(onRemoteWebsocketOpenedTimeout, 5000);

    onConnect = function (callbackObj, wsExtHeader, wsClient) {
        clearTimeout(onRemoteWebsocketOpenedTimeout);
        testAPI.reportStepResult(3, true, "Successfully opened remote " +
            "websocket");
        testAPI.endTest();
    };

    onFail = function (callbackObj, statusCode, reason, wsClient) {
        testAPI.reportStepResult(3, false, "Remote websocket failed to connect");
        tearDown();
    };

    onMessage = function (callbackObj, data, binary, wsClient) {
        /* We don't care about this */
    };

    onPong = function (callbackObj, data, wsClient) {
        /* We don't care about this */
    };

    onClose = function (callbackObj, statusCode, reason, wsClient) {
        /* We don't care about this */
    };

    testAPI.openWebsocket(url, onConnect, onMessage, onPong, onClose, onFail, callbackObject, origin, null);
}

function onRemoteWebsocketOpenedTimeout() {
    testAPI.reportStepResult(3, false, "Timeout opening remote websocket");
    tearDown();
}

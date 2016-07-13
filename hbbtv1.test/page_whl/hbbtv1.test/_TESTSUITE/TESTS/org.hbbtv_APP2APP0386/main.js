/* global HbbTVTestAPI: false */
/* jslint sloppy: true, maxerr: 1000, vars: true, browser: true */

var csManager;
var localWebSocket;
var localWebSocketURL;
var remoteWebSocketURL;
var pairingTimeout;
var appEndPoint = "myapp.mychannel.org/org.hbbtv_APP2APP0386";
var messageCount = 0;

function clearTimeouts() {
    clearTimeout(pairingTimeout);
}


window.onload = function () {
    var appMan, app;

    // Init app
    appMan = document.getElementById("app-man");
    app = appMan.getOwnerApplication(document);
    app.show();

    // Init CSManager
    csManager = document.getElementById("cs-man");

    // Get remote URL
    var webSocketURL = csManager.getApp2AppLocalBaseURL();

    // Append slash (if needed) and app end point
    if (webSocketURL.substr(-1) !== '/') {
        webSocketURL += '/';
    }
    webSocketURL += appEndPoint;

    // Fail test if not paired within 20 seconds
    pairingTimeout = setTimeout(socketsNotPairedTimeout, 20000);

    // Open local web socket
    localWebSocket = openLocalWebSocket(webSocketURL);
};


function openLocalWebSocket(url) {
    var onopen, onmessage, onclose, websocket;

    onopen = function (event) {
        // Indicate web socket was opened
        document.getElementById("socket-opened-indicator").className = "indicator true";
    };

    onmessage = function (event) {
        if (event.data === "pairingcompleted") {
            if (messageCount === 0) {
                socketPaired();
            } else {
                clearTimeouts();
                throw new Error("Pairing message was not first message " +
                    "received on local websocket");
            }
        }

        messageCount++;
    };

    onclose = function (event) { /* Do nothing */ };

    // Try to open the web socket
    websocket = new WebSocket(url);

    if (websocket === null || websocket === undefined) {
        clearTimeouts();
        throw new Error("Unable to create WebSocket object");
    }

    websocket.onopen = onopen;
    websocket.onclose = onclose;
    websocket.onmessage = onmessage;

    return websocket;
}


function socketPaired() {
    clearTimeout(pairingTimeout);

    // Indicate web socket was paired
    document.getElementById("socket-paired-indicator").className = "indicator true";

    // NOTE: Channel will be changed on the harness side
}


function socketsNotPairedTimeout() {
    clearTimeouts();
    throw new Error("Web socket pairing timed out");
}


function localWebsocketTimeoutCallback() {
    clearTimeouts();
    throw new Error("Time out opening local web socket");
}

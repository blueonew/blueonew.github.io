/* global HbbTVTestAPI: false */
/* jslint sloppy: true, maxerr: 1000, vars: true, browser: true */

var testAPI;
var csManager;
var localWebSocket;
var localWebSocketURL;
var remoteWebSocketURL;
var messageLength = 131072;
var messageSentCount = 0;
var messageReceivedCount = 0;
var messageSendDuration = 60000;
var messageRepeatDuration = 1000;
var localSocketPaired;
var remoteSocketPaired;
var pairingCompleted;
var messagePayload = createPayload(messageLength);
var appEndPoint = "myapp.mychannel.org";
var pairingTimeout;
var localWebSocketTimeout;
var validateMessageCountTimeout;
var remoteWebSocketClient;
var sendMessageTimeout;
var stopSendMessagesTimeout;

testAPI = new HbbTVTestAPI();
testAPI.init();

function tearDown() {
    clearTimeout(sendMessageTimeout);
    clearTimeout(validateMessageCountTimeout);
    clearTimeout(pairingTimeout);
    clearTimeout(localWebSocketTimeout);
    clearTimeout(stopSendMessagesTimeout);

    if (localWebSocket && localWebSocket.readyState === 1) {
        localWebSocket.close();
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

    try {
        initApp2AppComms(localURL, remoteURL);
    } catch (ex) {
        testAPI.reportStepResult(3, false, "Exception when calling " +
            "initApp2AppComms: " + ex.message);
        return;
    }
};


function initApp2AppComms(localURL, remoteURL) {
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
        return;
    }

    testAPI.reportMessage("Attempting to open remote web sockets...");

    // If all of the sockets aren't paired within 10 seconds, then we fail
    // the test
    pairingTimeout = setTimeout(socketsNotPairedTimeout, 10000);

    // Open the remote socket
    try {
        openRemoteWebSocket(remoteWebSocketURL);
    } catch (ex) {
        testAPI.reportStepResult(3, false, "Exception when opening remote " +
            "websocket: " + ex.message);
        tearDown();
        return;
    }
}


function openLocalWebSocket(url) {
    // Define web socket callbacks
    var onOpen = function (event) {
        testAPI.reportMessage("Opened local web socket");
        clearTimeout(localWebSocketTimeout);
    };

    var onMessage = function (event) {
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
            return;
        }

        // Message should be binary and match length of message sent
        if (typeof event.data === 'object' && event.data.size === messagePayload.length) {
            var reader = new FileReader();
            reader.addEventListener("loadend", function () {
                if (this.result !== messagePayload) {
                    throw new Error("Received message differs from sent " +
                        "message");
                }
            });

            reader.readAsText(event.data);
            messageReceivedCount++;
            return;
        }

        // Invalid message
        throw new Error("Local websocket received invalid invalid message");
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
    var onConnect = function (callbackObject, websocketExtensionHeader, webSocket) {
        remoteWebSocketClient = webSocket;
    };

    onMessage = function (callbackObj, data, binary, wsClient) {
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

    var onClose = function (callbackObject, reasonCode, message, client) {
        testAPI.reportMessage("Remote web socket closed");
    };

    var onFail = function (callbackObject, reasonCode, message, client) {
        testAPI.reportStepResult(3, false, "Web socket onFail was called");
        tearDown();
    };

    var onPong = function () { /* We don't care about this */ };

    // Open web socket
    testAPI.openWebsocket(url, onConnect, onMessage, onPong, onClose, onFail,
        null, null, null);
}


function socketsNotPairedTimeout() {
    testAPI.reportStepResult(3, false, "Could not pair all web sockets.");
    tearDown();
}


function localWebsocketTimeoutCallback() {
    testAPI.reportStepResult(3, false, "Timeout opening local web socket");
    tearDown();
}


function onLocalAndRemoteWebSocketsPaired() {
    clearTimeout(pairingTimeout);
    pairingCompleted = true;

    testAPI.reportStepResult(3, true, "Remote web socket paired with " +
        "local socket");

    testAPI.reportMessage("Sending message payload to websocket. This will " +
        "take 60 seconds. Please wait...");

    // Send first message
    sendMessage();

    // Stop sending messages
    stopSendMessagesTimeout = setTimeout(stopSendingMessages, messageSendDuration);
}


function sendMessage() {
    // Send binary message
    remoteWebSocketClient.sendMessage(messagePayload, true);
    messageSentCount++;

    // Send another message in x seconds
    sendMessageTimeout = setTimeout(sendMessage, messageRepeatDuration);
}


function stopSendingMessages() {
    clearTimeout(sendMessageTimeout);

    // Wait for any remaining messages to be delivered
    validateMessageCountTimeout = setTimeout(validateMessageCount, 2500);
}


function validateMessageCount() {
    if (messageReceivedCount === messageSentCount) {
        testAPI.reportStepResult(4, true, messageSentCount + " messages " +
            "sent, " + messageReceivedCount + " recevied");
    } else {
        testAPI.reportStepResult(4, false, messageSentCount + " messages " +
            "sent, " + messageReceivedCount + " recevied");
    }

    tearDown();
}


function createPayload(count) {
    var result = '0123456789ABCDEF';

    if (count < result.length) {
        result = result.substring(0, count);
    } else {
        var count2 = count / 2;

        while (result.length <= count2) {
            result += result;
        }

        result += result.substring(0, count - result.length);
    }

    return result;
}

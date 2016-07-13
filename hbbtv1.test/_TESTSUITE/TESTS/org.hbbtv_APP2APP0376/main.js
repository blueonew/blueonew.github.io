/* global HbbTVTestAPI: false */
/* jslint sloppy: true, maxerr: 1000, vars: true, browser: true */

var testAPI;
var csManager;
var localWebSocketURL;
var remoteWebSocketURL;
var appEndPoint = "myapp.mychannel.org/org.hbbtv_APP2APP0376";
var numberOfSocketsToOpen = 10;
var messageSendDuration = 60000;
var messageLength = 131072;
var messageRepeatFrequency = 2000;
var messageSentCount = 0;
var messageReceivedCount = 0;
var pairedSocketCount = 0;
var webSocketClients = [];
var pairedLocalSockets = {};
var pairedRemoteSockets = {};
var sentMessages = {};
var pairingTimeout;
var sendMessageTimeout;

testAPI = new HbbTVTestAPI();
testAPI.init();

function tearDown() {
    clearTimeout(pairingTimeout);
    clearTimeout(sendMessageTimeout);
}


window.onload = function () {
    var appMan, app, localURL, remoteURL;

    // Initialise application
    appMan = document.getElementById("app-man");

    try {
        app = appMan.getOwnerApplication(document);
    } catch (err) {
        testAPI.reportStepResult(0, false, "Exception when getting the " +
            "owner Application object. Error: " + err.message);
        tearDown();
        return;
    }

    try {
        app.show();
    } catch (err) {
        testAPI.reportStepResult(0, false, "Exception when calling show() " +
            "on the owner Application object. Error: " + err.message);
        tearDown();
        return;
    }

    testAPI.reportStepResult(0, true, "Application initialised");

    // Initialise CS Manager
    try {
        csManager = document.getElementById("cs-man");
    } catch (ex) {
        testAPI.reportStepResult(1, false, "Exception when getting a " +
            "reference to the HbbTVCSManager: " + ex.message);
        tearDown();
        return;
    }

    if (csManager === null || csManager === undefined) {
        testAPI.reportStepResult(1, false, "The reference to the " +
            "HbbTVCSManager is " + csManager);
        tearDown();
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

    // Set up APP2APP comms
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
    var i;
    localWebSocketURL = localURL + appEndPoint;
    remoteWebSocketURL = remoteURL + appEndPoint;

    // Open the local sockets
    testAPI.reportMessage("Attempting to open local web sockets...");

    // Start time out to pair a local + remote socket
    pairingTimeout = setTimeout(socketsNotPairedTimeout, 10000);

    // Try to open multiple local web sockets
    try {
        for (i = 0; i < numberOfSocketsToOpen; i++) {
            var webSocket = new openLocalWebSocket(localWebSocketURL, i);

        }
    } catch (ex) {
        testAPI.reportStepResult(3, false, "Exception when opening local " +
            " websocket: " + ex.message);
        tearDown();
        return;
    }

    // Open the remote sockets
    testAPI.reportMessage("Attempting to open remote web sockets...");

    // Try to open multiple remote web sockets
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


function openLocalWebSocket(url, id) {
    var messageCount = 0;

    // Define web socket callbacks
    var onOpen = function (event) {
        testAPI.reportMessage("Opened local web socket " + id);
    };

    var onClose = function (event) {
        testAPI.reportMessage("Local web socket closed");
    };

    // Open web socket
    var webSocket = new WebSocket(url);

    if (webSocket) {
        webSocket.onopen = onOpen;
        webSocket.onclose = onClose;
        webSocket.onmessage = function (event) {
            localWebSocketOnMessage(event, id, messageCount);
            messageCount++;
        };
    } else {
        testAPI.reportStepResult(3, false, "Error, creating web socket " +
            "object returned: " + webSocket);
        tearDown();
        return;
    }

    return webSocket;
}


function localWebSocketOnMessage(event, id, messageCount) {
    // We should only receive one 'pairingcompleted' message, and it should be
    // the first message received
    if (!messageCount) {
        if (event.data === 'pairingcompleted') {
            if (pairedLocalSockets[id] !== undefined) {
                testAPI.reportStepResult(3, false, "Local Websocket " +
                    "received multiple 'pairingcompleted' messages");
                tearDown();
                return;
            }

            pairedLocalSockets[id] = true;
            if (pairedLocalSockets[id] && pairedRemoteSockets[id]) {
                increasePairedSocketCount();
            }
            return;
        }
        else {
            testAPI.reportStepResult(3, false, "Local Websocket received " +
                "invalid message (first message was not " +
                "'pairingcompleted')");
            tearDown();
            return;
        }
    }

    validateMessage(id, event.data);
}


function validateMessage(id, messageData) {
    // Get the pending messages for this Websocket
    var messageQueue = sentMessages[id];

    // Check some messages were actually sent to us
    if (!messageQueue || messageQueue.length === 0) {
        testAPI.reportStepResult(3, false, "Local Websocket received " +
            " message when no messages were pending");
        tearDown();
        return;
    }

    // Get the last message sent for this web socket
    var lastMessage = messageQueue.pop();

    // Get the web socket ID from the start of the message
    var intendedWebsocketId = lastMessage.match(/^([0-9]+){1}/);

    // Check the message was intended for us
    if (parseInt(intendedWebsocketId, 10) !== id) {
        testAPI.reportStepResult(3, false, "Local Websocket received " +
            " message intended for different Websocket (Websocket id should " +
            " be " + id + " but was " + intendedWebsocketId);
        tearDown();
        return;
    }

    // Check message is correct
    if (lastMessage != messageData) {
        testAPI.reportStepResult(3, false, "Local Websocket received " +
            "different message from one that was sent");
        tearDown();
        return;
    }

    messageReceivedCount++;
}


function openRemoteWebSocket(url, id) {
    var _id = id;
    var messageCount = 0;

    // Define web socket callbacks
    var onConnect = function (callbackObject, websocketExtensionHeader, webSocket) {
        testAPI.reportMessage("Opened remote Websocket " + _id);

        // Save the remote sockets and ids as we'll them for message sending
        webSocketClients.push({
            id: _id,
            client: webSocket
        });
    };

    var onMessage = function (callbackObject, message) {
        remoteWebSocketOnMessage(callbackObject, message, _id, messageCount);
        messageCount++;
    };

    var onClose = function (callbackObject, reasonCode, message, client) {
        testAPI.reportMessage("Closed Remote Websocket " + _id);
    };

    var onFail = function (callbackObject, reasonCode, message, client) {
        testAPI.reportStepResult(3, false, "Web socket " + _id +
            " onFail was called");
        tearDown();
    };

    var onPong = function () { /* We don't care about this */ };

    // Open web socket
    testAPI.openWebsocket(url, onConnect, onMessage, onPong, onClose, onFail,
        null, null, null);
}


function remoteWebSocketOnMessage(callbackObject, message, id, messageCount) {
    // We should only receive one 'pairingcompleted' message, and it should be
    // the first message received
    if (!messageCount) {
        if (message === 'pairingcompleted') {
            if (pairedRemoteSockets[id] !== undefined) {
                testAPI.reportStepResult(3, false, "Remote Websocket " +
                    "received multiple 'pairingcompleted' messages");
                tearDown();
                return;
            }

            pairedRemoteSockets[id] = true;
            if (pairedRemoteSockets[id] && pairedLocalSockets[id]) {
                increasePairedSocketCount();
            }
            return;
        }
    }

    testAPI.reportStepResult(3, false, "Remote Websocket received " +
        "message. Non-'pairingcompleted' messages should be not be " +
        " received on any remote Web Sockets");
    tearDown();
}


function increasePairedSocketCount() {
    pairedSocketCount++;
    clearTimeout(pairingTimeout);

    if (pairedSocketCount === numberOfSocketsToOpen) {
        pairingCompleted();
    } else {
        // Restart timeout for next web socket pairing
        pairingTimeout = setTimeout(socketsNotPairedTimeout, 10000);
    }
}


function pairingCompleted() {
    testAPI.reportStepResult(3, true, numberOfSocketsToOpen + " remote " +
        "web sockets paired with local web sockets");

    testAPI.reportMessage("Sending message payload to websockets. This will " +
        "take 60 seconds. Please wait...");

    // Start sending messages
    sendMessage();

    // Stop sending messages
    stopSendMessagesTimeout = setTimeout(stopSendingMessages,
        messageSendDuration);
}


function sendMessage() {
    // Send a message through each web socket
    for(var i = 0; i < webSocketClients.length; i++) {
        var websocket = webSocketClients[i];
        var messagePayload = createPayload(messageLength, websocket.id, messageSentCount);

        // Save sent message so we can check it arrives later
        if (sentMessages[websocket.id] === undefined) {
            sentMessages[websocket.id] = [];
        }
        sentMessages[websocket.id].push(messagePayload);

        // Send the message through the remote web socket
        websocket.client.sendMessage(messagePayload, false);

        messageSentCount++;
    }

    // Send another message in 2 seconds
    sendMessageTimeout = setTimeout(sendMessage, messageRepeatFrequency);
}


function stopSendingMessages() {
    clearTimeout(sendMessageTimeout);

    // Wait for any remaining messages to be delivered
    setTimeout(validateMessageCount, 2500);
}


function validateMessageCount() {
    if ((messageReceivedCount > 0 && messageSentCount > 0) &&
        (messageReceivedCount == messageSentCount)
    ) {
        testAPI.reportStepResult(4, true, messageSentCount + " messages " +
            "sent, " + messageReceivedCount + " recevied");
        testAPI.endTest();
        tearDown();
        return;
    }

    testAPI.reportStepResult(4, false, messageSentCount + " messages " +
        "sent, " + messageReceivedCount + " recevied");
    tearDown();
}


function createPayload(count, websocketId, messageId) {
    var result = websocketId + '.' + messageId + '.0123456789ABCDEF';

    if (count < result.length) {
        result = result.substring(0, count);
    }
    else {
        var count2 = count / 2;

        while (result.length <= count2) {
            result += result;
        }

        result += result.substring(0, count - result.length);
    }

    return result;
}


function localWebsocketTimeoutCallback() {
    clearTimeout(pairingTimeout);
    testAPI.reportStepResult(3, false, "Timeout opening local web socket");
    tearDown();
}


function socketsNotPairedTimeout() {
    testAPI.reportStepResult(3, false, "Could not pair all web sockets");
    tearDown();
}

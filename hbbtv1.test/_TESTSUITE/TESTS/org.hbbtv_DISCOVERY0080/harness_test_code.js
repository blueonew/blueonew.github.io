/* global HbbTVTestAPI: false */
/* jslint sloppy: true, maxerr: 1000, vars: true, browser: true */

var testAPI;
var origin = 'http://xyz.example.com';

testAPI = new HbbTVTestAPI();
testAPI.init();

testAPI.dial.doMSearch(onDIALServerDiscovery);

function onDIALServerDiscovery(callbackObj, locationHeader) {
    testAPI.reportStepResult(1, true, "The 'onDIALServerDiscovery' " +
        "callback was called.");

    if (locationHeader === null || locationHeader === undefined) {
        testAPI.reportStepResult(2, false, "Invalid 'locationHeader' string " +
            "value returned by 'testAPI.dial.doMSearch' function. Got: " +
            locationHeader);
        return;
    }

    testAPI.reportStepResult(2, true,
            "testAPI.dial.doMSearch returned location " + locationHeader);

    getDeviceDescription(locationHeader);
}

function getDeviceDescription(locationHeader) {
    testAPI.dial.getDeviceDescription(locationHeader, origin,
        onGetDeviceDescription);

    testAPI.reportStepResult(3, true, "Called 'dial.getDeviceDescription()'");
}

function onGetDeviceDescription(callbackObject, applicationUrl, didRedirect,
    allowOrigin) {

    testAPI.reportStepResult(4, true, "'onGetDeviceDescription()' was called");

    if (allowOrigin !== '*' && allowOrigin !== origin) {
        testAPI.reportStepResult(5, false, "allowOrigin was equal to " +
            allowOrigin + " (must be equal to " + origin + " or '*')");
        return;
    }

    testAPI.reportStepResult(5, true, "allowOrigin was equal to " +
        allowOrigin);
    testAPI.endTest();
}

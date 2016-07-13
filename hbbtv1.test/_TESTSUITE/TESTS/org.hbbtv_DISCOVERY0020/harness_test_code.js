/* global HbbTVTestAPI: false */
/* jslint sloppy: true, maxerr: 1000, vars: true, browser: true */

var testAPI;

// parseUri 1.2.2
// (c) Steven Levithan <stevenlevithan.com>
// MIT License

function parseUri(str) {
    var o   = parseUri.options,
        m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
        uri = {},
        i   = 14;

    while (i--) {uri[o.key[i]] = m[i] || ""; }

    uri[o.q.name] = {};
    uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
        if ($1) {uri[o.q.name][$1] = $2; }
    });

    return uri;
}

parseUri.options = {
    strictMode: false,
    key: ["source", "protocol", "authority", "userInfo",
          "user", "password", "host", "port", "relative",
          "path", "directory", "file", "query", "anchor"],
    q:   {
        name:   "queryKey",
        parser: /(?:^|&)([^&=]*)=?([^&]*)/g
    },
    parser: {
        strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
        loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
    }
};

testAPI = new HbbTVTestAPI();
testAPI.init();

testAPI.reportStepResult(0, true, "Application initialised");

testAPI.dial.doMSearch(onDIALServerDiscovery);

function onDIALServerDiscovery(unused, locationHeader) {

    testAPI.reportStepResult(1, true, "The 'onDIALServerDiscovery' " +
        "callback function was called.");

    if (locationHeader === null || locationHeader === undefined) {
        testAPI.reportStepResult(2, false, "Invalid 'locationHeader' string " +
            "value returned by 'testAPI.dial.doMSearch' function. Got: " +
            locationHeader);
        return;
    }

    testAPI.reportStepResult(2, true,
            "testAPI.dial.doMSearch() returned location " + locationHeader);

    testAPI.dial.getDeviceDescription(locationHeader, null,
        onGetDeviceDescription);
}

function onGetDeviceDescription(unused, applicationUrl, didRedirect,
    allowOrigin) {

    testAPI.reportStepResult(3, true, "The 'onGetDeviceDescription' " +
        "callback function was called.");

    try {
        result = parseUri(applicationUrl);
    } catch (err) {
        testAPI.reportStepResult(4, false, "Exception when calling " +
            "parseUri() with 'applicationUrl' equal to " + applicationUrl +
            ". Error: " + err.message);
        return;
    }

    if (result.protocol !== null || result.protocol !== undefined ||
        result.protocol === "http") {
        testAPI.reportStepResult(4, true, "testAPI.dial." +
            "getDeviceDescription() returned an absolute HTTP URL as " +
            "Application-URL: " + applicationUrl);
    } else {
        testAPI.reportStepResult(4, false, "testAPI.dial." +
            "getDeviceDescription() did not return an absolute HTTP URL as " +
            "Application-URL: " + applicationUrl);
        return;
    }

    testAPI.endTest();
}

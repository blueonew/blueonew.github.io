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
    var result, hostname = null;

    testAPI.reportStepResult(1, true, "The 'onDIALServerDiscovery' " +
        "callback function was called.");

    if (locationHeader === null || locationHeader === undefined) {
        testAPI.reportStepResult(2, false, "Invalid 'locationHeader' string " +
            "value returned by 'testAPI.dial.doMSearch' function. Got: " +
            locationHeader);
        return;
    }

    testAPI.reportStepResult(2, true,
        "testAPI.dial.doMSearch() returned non-null 'locationHeader' " +
        locationHeader);

    try {
        result = parseUri(locationHeader);
    } catch (err) {
        testAPI.reportStepResult(3, false, "Exception when calling " +
            "parseUri() with 'locationHeader' equal to " + locationHeader +
            ". Error: " + err.message);
        return;
    }

    if (result.protocol === null || result.protocol === undefined ||
        result.protocol !== "http" || result.host === "") {
        testAPI.reportStepResult(3, false, "The 'locationHeader' string " +
            "value returned does not contain an absolute HTTP URL. Got: " +
            locationHeader);
        return;
    }

    testAPI.reportStepResult(3, true,
        "The 'locationHeader' string value contains an absolute HTTP URL.");

    hostname = result.host;

    testAPI.dial.resolveIpV4Address(hostname, onResolveIPV4Address);
}

function onResolveIPV4Address(unused, dottedIpv4) {

    testAPI.reportStepResult(4, true, "The 'onResolveIPV4Address' " +
        "callback function was called.");

    if (dottedIpv4 !== null) {
        testAPI.reportStepResult(5, true, "The IP address returned by " +
            "testAPI.dial.resolveIPV4Address() corresponds to a " +
            "valid dotted IPv4 address format.");
    } else {
        testAPI.reportStepResult(5, false, "The IP address returned by " +
            "testAPI.dial.resolveIPV4Address() does not correspond to a " +
            "valid dotted IPv4 address format. Got: " + dottedIpv4);
        return;
    }
    testAPI.endTest();
}

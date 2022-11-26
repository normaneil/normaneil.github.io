// Replace the DASH and HLS URIs when you test your own content.
let myData = document.getElementById("browserCheckResult");
let dashUri = myData.getAttribute("data-dash-uri");
let hlsUri = myData.getAttribute("data-hls-uri");
let licenseUri = myData.getAttribute("data-license-uri");

console.log("dashUri", dashUri);
console.log("hlsUri", hlsUri);

// Replace the DEMO site ID with yours when you test your own FPS content.
let fairplayCertUri = myData.getAttribute("data-fairplayCertUri"); // for base64 encoded binary cert data
let fairplayCertDerUri = myData.getAttribute("data-fairplayCertDerUri"); // for cert .der file download
console.log("fairplayCertUri", fairplayCertUri)
// Create and set the license tokens when you test your own content.
let widevineToken = myData.getAttribute("data-widevineToken");
let playreadyToken = myData.getAttribute("data-playreadyToken");
let fairplayToken = myData.getAttribute("data-fairplayToken");
console.log("widevineToken", widevineToken)
console.log("playreadyToken", playreadyToken)
console.log("fairplayToken", fairplayToken)
function arrayToString(array) {
    var uint16array = new Uint16Array(array.buffer);
    return String.fromCharCode.apply(null, uint16array);
}

function base64DecodeUint8Array(input) {
    console.log("input", input);
    var raw = window.atob(input);
    var rawLength = raw.length;
    var array = new Uint8Array(new ArrayBuffer(rawLength));

    for (i = 0; i < rawLength; i++) array[i] = raw.charCodeAt(i);

    return array;
}

function base64EncodeUint8Array(input) {
    var keyStr =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var output = "";
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    var i = 0;

    while (i < input.length) {
        chr1 = input[i++];
        chr2 = i < input.length ? input[i++] : Number.NaN;
        chr3 = i < input.length ? input[i++] : Number.NaN;

        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;

        if (isNaN(chr2)) {
            enc3 = enc4 = 64;
        } else if (isNaN(chr3)) {
            enc4 = 64;
        }
        output +=
            keyStr.charAt(enc1) +
            keyStr.charAt(enc2) +
            keyStr.charAt(enc3) +
            keyStr.charAt(enc4);
    }
    return output;
}

function checkBrowser() {
    let browser = "Non-DRM browser";
    let drmType = "No DRM";

    let agent = navigator.userAgent.toLowerCase();
    let name = navigator.appName;

    if (
        name === "Microsoft Internet Explorer" ||
        agent.indexOf("trident") > -1 ||
        agent.indexOf("edge/") > -1
    ) {
        browser = "ie";
        if (name === "Microsoft Internet Explorer") {
            // IE old version (IE 10 or Lower)
            agent = /msie ([0-9]{1,}[\.0-9]{0,})/.exec(agent);
            // browser += parseInt(agent[1]);
        } else if (agent.indexOf("edge/") > -1) {
            // Edge
            browser = "Edge";
        }
        drmType = "PlayReady";
    } else if (agent.indexOf("safari") > -1) {
        // Chrome or Safari
        if (agent.indexOf("opr") > -1) {
            // Opera
            browser = "Opera";
            drmType = "Widevine";
        } else if (agent.indexOf("whale") > -1) {
            // Chrome
            browser = "Whale";
            drmType = "Widevine";
        } else if (agent.indexOf("edg/") > -1 || agent.indexOf("Edge/") > -1) {
            // Chrome
            browser = "Edge";
            drmType = "PlayReady";
        } else if (agent.indexOf("chrome") > -1) {
            // Chrome
            browser = "Chrome";
            drmType = "Widevine";
        } else {
            // Safari
            browser = "Safari";
            drmType = "FairPlay";
        }
    } else if (agent.indexOf("firefox") > -1) {
        // Firefox
        browser = "firefox";
        drmType = "Widevine";
    }
    return {
        browser: browser,
        drmType: drmType,
    };
}

console.log("Browser:", checkBrowser().browser);
console.log("Drm:", checkBrowser().drmType);

let drmType = checkBrowser().drmType;

// if (drmType === "FairPlay") {
//     window.location.href = "/fairplay";
// }

// VideoJS
const player = videojs("videojs-player", {
    muted: true,
    autoplay: true,
    controlBar: {
        fullscreenToggle: false,
    },
    userActions: {
        doubleClick: false,
    },
});

function configureDRM() {
    player.ready(function () {
        let playerConfig;
        player.eme();
        if ("FairPlay" === drmType) {
            playerConfig = {
                src: hlsUri,
                type: 'application/x-mpegurl',
                keySystems: {
                    'com.apple.fps.1_0': {
                        getCertificate: function (emeOptions, callback) {
                            videojs.xhr({
                                url: fairplayCertUri,
                                method: 'GET',
                            }, function (err, response, responseBody) {
                                if (err) {
                                    callback(err)
                                    return
                                }
                                callback(null, base64DecodeUint8Array(responseBody));
                            })
                        },
                        getContentId: function (emeOptions, initData) {
                            const contentId = arrayToString(initData);
                            return contentId.substring(contentId.indexOf('skd://') + 6);
                        },
                        getLicense: function (emeOptions, contentId, keyMessage, callback) {
                            videojs.xhr({
                                url: licenseUri,
                                method: 'POST',
                                responseType: 'text',
                                body: 'spc=' + base64EncodeUint8Array(keyMessage),
                                headers: {
                                    'Content-type': 'application/x-www-form-urlencoded',
                                    'pallycon-customdata-v2': fairplayToken
                                }
                            }, function (err, response, responseBody) {
                                if (err) {
                                    callback(err)
                                    return
                                }
                                callback(null, base64DecodeUint8Array(responseBody))
                            })
                        }
                    }
                }
            };
        } else if ("PlayReady" === drmType) {
            playerConfig = {
                src: dashUri,
                type: "application/dash+xml",
            };

            playerConfig.keySystemOptions = [];
            playerConfig.keySystemOptions.push({
                name: "com.microsoft.playready",
                options: {
                    serverURL: licenseUri,
                    httpRequestHeaders: {
                        "pallycon-customdata-v2": playreadyToken,
                    },
                },
            });
        } else if ("Widevine" === drmType) {
            playerConfig = {
                src: dashUri,
                type: "application/dash+xml",
            };

            playerConfig.keySystemOptions = [];
            playerConfig.keySystemOptions.push({
                name: "com.widevine.alpha",
                options: {
                    serverURL: licenseUri,
                    httpRequestHeaders: {
                        "pallycon-customdata-v2": widevineToken,
                    },
                },
            });
        } else {
            console.log("No DRM supported in this browser");
        }

        player.src(playerConfig);
    });
}

player.ready(function () {
    configureDRM();
});

player.play();

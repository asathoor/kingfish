/**
 * file: kingfish.js
 * being: the original jquery script
 **/
$(function () {
    // load all .persistent elements
    $(".persistent").each(function (i, d) {
        try {
            var val = localStorage.getItem("kingfish." + $(this).attr('id'));
            if (val) {
                $(this).val(val);
            }
        } catch (e) {}
    });

    // initialize devicetype if it's empty
    if ("" === $("#devicetype").val()) {
        $("#devicetype").val("Kingfish#" + Math.floor(Math.random() * 8999 + 1000).toString());
        $("#devicetype").change();
    }

    // set up light-group buttonset
    $("#lg").buttonset();
});

// save .persistent element when it changes
$(".persistent").on("change keyup", function () {
    try {
        localStorage.setItem("kingfish." + $(this).attr('id'), $(this).val());
    } catch (e) {}
});

var displayResponse = function (command, response) {
    if (!command && response.length) {
        if (response[0].error && response[0].error.description === 'link button not pressed') {
            alert("Press link button on bridge and try again.");
        } else if (response[0].success) {
            try {
                $("#username").val(response[0].success.username);
                $("#username").change();
            } catch (e) {
                alert(e)
            }
        }
    }
    $("#response").html('<pre>' + JSON.stringify(response, undefined, 4) + '</pre>');
};

var portalResponse = function (response) {
    if (response.length) {
        try {
            $("#bridge-ip").val(response[0].internalipaddress);
            $("#bridge-ip").change();
        } catch (e) {
            alert(e)
        }
    }
    $("#response").html('<pre>' + JSON.stringify(response, undefined, 4) + '</pre>');
};

var queryPortal = function () {
    try {
        $.ajax({
            url: "https://www.meethue.com/api/nupnp",
            type: "GET",
            dataType: "json",
            success: function (response) {
                portalResponse(response)
            },
            error: function (jqhxr, textStatus, errorThrown) {
                alert(textStatus + " sending to bridge - confirm IP address is correct");
            }
        });
    } catch (e) {
        alert(e);
    }
};

var doHue = function (type, command, dataObj) {
    try {
        $.ajax({
            url: "http://" + $("#bridge-ip").val() + "/api/" + $("#username").val() + (command ? ("/" + command) : ""),
            type: type,
            data: JSON.stringify(dataObj),
            dataType: "json",
            contentType: 'application/json; charset=utf-8',
            success: function (response) {
                displayResponse(command, response);
            },
            error: function (jqhxr, textStatus, errorThrown) {
                alert(textStatus + " sending to bridge - confirm IP address is correct");
            }
        });
    } catch (e) {
        alert(e);
    }
};

var doDrift = function () {
    doHue("PUT", stateAction(), {
        "hue": Math.floor(Math.random() * 65536),
        "sat": Math.floor(Math.random() * 256),
        "transitiontime": transitionTime()
    });
    console.log("sent drift ", Math.round(Date.now() / 1000));
};

var stateAction = function () {
    var lg = $("input[name=lg]:checked").val().replace(/\s*checked\s*/, '');
    return (lg + "/" + $("#lg-sel").val() + ((lg === 'lights') ? "/state" : "/action"));
};

var transitionTime = function () {
    return ($("#tt-sel").val() * $("#tt-val").val());
};

$("#huesat-set").change(function () {
    $("#huesat-hue").val(Math.round(65535 * $("#huesat-set").val() / 16));
});

$(".lg-set").mousedown(function () {
    $("#lg-group").prop("checked", true);
    $("#lg-group").change();
    $("#lg-light").change();
    $("#lg-sel").val("0");
    $("#lg-sel").change();
});

$(".ct-set").mousedown(function () {
    $("#ct-kelvin").val($(this).html());
    $("#ct-kelvin").change();
});

$(".tt-set").mousedown(function () {
    $("#tt-val").val($(this).html());
    $("#tt-val").change();
});

$(".bri-set").mousedown(function () {
    $("#on-bri").val($(this).html());
    $("#on-bri").change();
});

$(".sat-set").mousedown(function () {
    $("#huesat-sat").val($(this).html());
    $("#huesat-sat").change();
});

$("#query-portal").click(function () {
    queryPortal();
});

$("#get-username").click(function () {
    doHue("POST", null, {
        "devicetype": $("#devicetype").val()
    });
});

$("#get").click(function () {
    doHue("GET", $("#get-sel").val());
});

$("#colorloop").click(function () {
    doHue("PUT", stateAction(), {
        "effect": "colorloop"
    });
});

$("#effect-none").click(function () {
    doHue("PUT", stateAction(), {
        "effect": "none"
    });
});

$("#blink1").click(function () {
    doHue("PUT", stateAction(), {
        "alert": "select"
    });
});

$("#blink15").click(function () {
    doHue("PUT", stateAction(), {
        "alert": "lselect"
    });
});

var driftHandle;
$("#drift-on").click(function () {
    try {
        clearInterval(driftHandle);
    } catch (e) {}
    driftHandle = setInterval(doDrift, $("#di-sel").val() * $("#di-val").val() * 100);
});
$("#drift-off").click(function () {
    try {
        clearInterval(driftHandle);
    } catch (e) {}
});

$("#off").click(function () {
    doHue("PUT", stateAction(), {
        "on": false,
        "transitiontime": transitionTime()
    });
});

$("#on").click(function () {
    var bri = parseInt($("#on-bri").val());
    bri = isNaN(bri) ? 127 : bri;
    $("#on-bri").val(bri.toString());
    $("#on-bri").change();
    doHue("PUT", stateAction(), {
        "on": true,
        "bri": bri,
        "transitiontime": transitionTime()
    });
});

$("#huesat").click(function () {
    var hue = parseInt($("#huesat-hue").val());
    hue = isNaN(hue) ? 32767 : hue;
    $("#huesat-hue").val(hue.toString());
    var sat = parseInt($("#huesat-sat").val());
    sat = isNaN(sat) ? 127 : sat;
    $("#huesat-sat").val(sat.toString());
    $("#huesat-sat").change();
    doHue("PUT", stateAction(), {
        "hue": hue,
        "sat": sat,
        "transitiontime": transitionTime()
    });
});

$("#ct").click(function () {
    var kelvin = parseInt($("#ct-kelvin").val());
    kelvin = isNaN(kelvin) ? 2700 : kelvin;
    $("#ct-kelvin").val(kelvin.toString());
    $("#ct-kelvin").change();
    doHue("PUT", stateAction(), {
        "ct": Math.round(1000000 / kelvin),
        "transitiontime": transitionTime()
    });
});

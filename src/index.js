let didScroll = false;
window.onscroll = () => didScroll = true;
const [wght, XOPQ, YOPQ, YTLC, YTUC] = [200, 175, 135, 416, 760]
const [wght2, XOPQ2, YOPQ2, YTLC2, YTUC2] = [500, 101, 80, 712, 750]
const p = document.querySelector('p');
// const h3list = document.querySelectorAll('h3');
// for (let i = 0; i < h3list.length; i++) {
    setInterval(() => {
        // const h3 = h3list.item(i);
        if (didScroll) {
            p.style.fontVariationSettings = `"wght" ${wght}, "XOPQ" ${XOPQ}, "YOPQ" ${YOPQ}, "YTLC" ${YTLC}, "YTUC" ${YTUC}`;
            // h3.style.fontVariationSettings = `"wght" ${wght}, "XOPQ" ${XOPQ}, "YOPQ" ${YOPQ}, "YTLC" ${YTLC}, "YTUC" ${YTUC}`;
            console.log('scrolling');
            didScroll = false;
        } else {
            p.style.fontVariationSettings = `"wght" ${wght2}, "XOPQ" ${XOPQ2}, "YOPQ" ${YOPQ2}, "YTLC" ${YTLC2}, "YTUC" ${YTUC2}`;
            // h3.style.fontVariationSettings = `"wght" ${wght2}, "XOPQ" ${XOPQ2}, "YOPQ" ${YOPQ2}, "YTLC" ${YTLC2}, "YTUC" ${YTUC2}`;
        }
    }, 500);
    console.log(didScroll);
// }

const ambientLightIds = { vendorId: 0x05ac, };

const numberFormat = new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 2
});

const $error = document.getElementById("error");
const $requestButton = document.getElementById("request-hid-device");
const $output = document.getElementById("ambient-light-value");

(async () => {
    if (!hidAvaiable()) {
        return;
    }

    const devices = await navigator.hid.getDevices();
    let ambientDevices = devices.filter(
        dev =>
            dev.vendorId === ambientLightIds.vendorId &&
            dev.productId === ambientLightIds.productId
    );
    if (ambientDevices.length > 0) {
        initDevice(ambientDevices[0]);
    } else {
        setupButton();
    }
})();

function hidAvaiable() {
    const avaiable = "hid" in navigator;
    if (!avaiable) {
        hideRequestButton();
        showError(`
        Sorry the WebHID API is not supported in your browser.<br>
        Try enabling <span>Experimental Web Platform features</span> in <code>chrome://flags<code>.
        `);
    }
    return avaiable;
}

function setupButton() {
    showRequestButton();

    $requestButton.addEventListener("click", async () => {
        let devices;
        try {
            devices = await navigator.hid.requestDevice({
                filters: [ambientLightIds]
            });
            initDevice(devices[0]);
        } catch (error) {
            console.log("No device was selected.");
        }
    });
}

async function initDevice(device) {
    try {
        hideRequestButton();
        showOutput();

        if (!device.opened) await device.open();

        function parseAndDisplayData(view) {
            const flag = view.getUint8();
            const v1 = view.getUint32(1, true) * 10 ** -2; // Light - no idea what value, Exponent is from HidReport
            const v2 = view.getUint32(5, true); // This is reported as Temperatur, no idea
            const v3 = view.getUint32(9, true); // No idea
            const v4 = view.getUint32(13, true); // No idea
            $output.innerHTML = numberFormat.format(v1);
            console.log(v1);
            if (v1 > 6000) {
                document.body.style.backgroundColor = "#FFFFFF";
                // document.text.style.opacity = "0";
            } else {
                document.body.style.backgroundColor = "#191A1C";
                document.body.style.color = "#FFFFFF";
                document.body.style.opacity = "1";
            }
        }

        device.addEventListener("inputreport", event => {
            const data = event.data;
            parseAndDisplayData(new DataView(data.buffer));
        });

        window.addEventListener("onbeforeunload", async () => {
            await device.close();
        });
    } catch (e) {
        hideOutput();
        showError("Could not open device: " + e);
    }
}

function showRequestButton() {
    $requestButton.style.display = "block";
}
function hideRequestButton() {
    $requestButton.style.display = "none";
}

function hideOutput() {
    $output.style.display = "none";
}
function showOutput() {
    $output.style.display = "block";
}

function showError(errorMessage) {
    $error.innerHTML = errorMessage;
    $error.style.display = "Block";
}

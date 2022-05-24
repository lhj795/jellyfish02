// cursor
const cursor = document.querySelector(".cursor");
document.addEventListener("mousemove", (e) => {
    cursor.style.top = e.pageY + "px";
    cursor.style.left = e.pageX + "px";
});

// scroll effect
let didScroll = false;
window.onscroll = () => didScroll = true;
const [wght, XOPQ, YOPQ, YTLC, YTUC] = [200, 175, 135, 416, 760]
const [wght2, XOPQ2, YOPQ2, YTLC2, YTUC2] = [500, 101, 80, 712, 750]
const textElem = document.getElementById("textElem");
const videoElem = document.getElementById("video");
setInterval(() => {
    if (didScroll) {
        textElem.style.fontVariationSettings = `"wght" ${wght}, "XOPQ" ${XOPQ}, "YOPQ" ${YOPQ}, "YTLC" ${YTLC}, "YTUC" ${YTUC}`;
        textElem.style.letterSpacing = "-1px";
        console.log('scrolling');
        didScroll = false;
    } else {
        textElem.style.fontVariationSettings = `"wght" ${wght2}, "XOPQ" ${XOPQ2}, "YOPQ" ${YOPQ2}, "YTLC" ${YTLC2}, "YTUC" ${YTUC2}`;
        textElem.style.letterSpacing = "0px";
    }
}, 500);
console.log(didScroll);

// ambient light effect
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

// cursor colors
var colors = ['royalblue', 'lime', 'deeppink'];
var color = colors[Math.floor(Math.random() * colors.length)];
cursor.style.background = color;

async function initDevice(device) {
    try {
        hideRequestButton();
        showOutput();

        if (!device.opened) await device.open();

        function parseAndDisplayData(view) {
            const flag = view.getUint8();
            const v1 = view.getUint32(1, true) * 10 ** -2; // Light
            $output.innerHTML = numberFormat.format(v1);
            console.log(v1);
            if (v1 > 1000) {
                document.body.style.backgroundColor = "#FFFFFF";
                textElem.style.backgroundColor = "#FFFFFF";
                textElem.style.color = "rgba(0, 0, 0, .04)";
                videoElem.style.opacity = "0";
                cursor.style.mixBlendMode = "color-burn";
            } else {
                document.body.style.backgroundColor = "#000000";
                textElem.style.backgroundColor = "#000000";
                textElem.style.color = "rgba(255, 255, 255, 1)";
                videoElem.style.opacity = "1";
                cursor.style.mixBlendMode = "color-dodge";
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

// video player
const video = document.querySelector("video");
if (window.matchMedia('(prefers-reduced-motion)').matches) {
    video.removeAttribute("autoplay");
    video.pause();
}
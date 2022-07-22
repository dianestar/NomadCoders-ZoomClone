const socket = io();

const $welcome = document.querySelector("#welcome");
const $call = document.querySelector("#call");
$call.style.display = "none";

const $micOn = document.querySelector("#mic-on");
const $micOff = document.querySelector("#mic-off");
const $camOn = document.querySelector("#cam-on");
const $camOff = document.querySelector("#cam-off");
$micOff.style.display = "none";
$camOff.style.display = "none";

let myStream;
let myPeerConnection;
let roomName;

/* call div related codes */
// 유저의 모든 장치 정보 얻기
const $cameras = document.querySelector("#cameras");

async function getCameras() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        // console.log(devices);

        const cameras = devices.filter((device) => device.kind === "videoinput");
        // console.log(cameras);

        const currentCamera = myStream.getVideoTracks()[0];

        cameras.forEach((camera) => {
            const $option = document.createElement("option");
            $option.value = camera.deviceId;
            $option.innerText = camera.label;

            if (currentCamera.label == camera.label) {
                $option.selected = true;
            }

            $cameras.appendChild($option);
        });
    } catch (error) {
        console.log(error);
    }
}

// 비디오 & 오디오 허용
const $myFace = document.querySelector("#myFace");

async function getMedia(deviceId) {
    const initialConstraints = {
        audio: true,
        video: { facingMode: "user" },
    };
    const newConstraints = {
        audio: true,
        video: { deviceId: { exact: deviceId } },
    };

    try {
        myStream = await navigator.mediaDevices.getUserMedia(deviceId ? newConstraints : initialConstraints);
        $myFace.srcObject = myStream;

        if (!deviceId) {
            await getCameras();
        }
    } catch (error) {
        console.log(error);
    }
}

// getMedia();

// 비디오 & 오디오 켜고 끄기
const $muteBtn = document.querySelector("#mute");
const $cameraBtn = document.querySelector("#camera");

let muted = false;
let cameraOff = false;

function handleMuteClick() {
    // console.log(myStream.getAudioTracks());
    myStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
    });

    if (!muted) {
        // mic on 상태에서 mic off 상태로 변경
        muted = true;

        $micOff.style.display = "";
        $micOn.style.display = "none";

        $muteBtn.innerText = "Mic On";
    } else {
        // mic off 상태에서 mic on 상태로 변경
        muted= false;

        $micOn.style.display = "";
        $micOff.style.display = "none";

        $muteBtn.innerText = "Mic Off";
    }
}

function handleCameraClick() {
    // console.log(myStream.getVideoTracks());
    myStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
    });

    if (cameraOff) {
        // cam off 상태에서 cam on 상태로 변경
        cameraOff = false;
        
        $camOn.style.display = "";
        $camOff.style.display = "none";

        $cameraBtn.innerText = "Cam Off";
    } else {
        // cam on 상태에서 cam off 상태로 변경
        cameraOff = true;

        $camOff.style.display = "";
        $camOn.style.display = "none";

        $cameraBtn.innerText = "Cam On";
    }
}

$muteBtn.addEventListener("click", handleMuteClick);
$cameraBtn.addEventListener("click", handleCameraClick);

async function handleCameraChange() {
    await getMedia($cameras.value);

    $micOff.style.display = "none";
    $micOn.style.display = "";
    $muteBtn.innerText = "Mic Off";

    $camOff.style.display = "none";
    $camOn.style.display = "";
    $cameraBtn.innerText = "Cam Off";

    if (myPeerConnection) {
        const videoTrack = myStream.getVideoTracks()[0];
        console.log(videoTrack);

        const senders = myPeerConnection.getSenders();
        const ideoSender = senders.find((sender) => {
            return sender.track.kind === "video"
        });
        videoSender.replaceTrack(videoTrack);
    }
}

$cameras.addEventListener("input", handleCameraChange);
/*************/

/* RTC related codes */
function handleIce(data) {
    console.log("got ice candidate");
    console.log(data);

    console.log("sent candidate");
    socket.emit("ice", data.candidate, roomName);
}

function handleAddStream(data) {
    console.log("got stream from my peer");
    console.log("Peer's: ", data.stream);
    console.log("My: ", myStream);

    const $peersStream = document.querySelector("#peersStream");
    $peersStream.srcObject = data.stream;
}

function makeConnection() {
    myPeerConnection = new RTCPeerConnection({
        iceServers: [
            {
                urls: [
                    "stun:stun.l.google.com:19302",
                    "stun:stun1.l.google.com:19302",
                    "stun:stun2.l.google.com:19302",
                    "stun:stun3.l.google.com:19302",
                    "stun:stun4.l.google.com:19302",
                ],
            },
        ],
    });
    myPeerConnection.addEventListener("icecandidate", handleIce);
    myPeerConnection.addEventListener("addstream", handleAddStream);

    myStream.getTracks().forEach((track) => {
        myPeerConnection.addTrack(track, myStream);
    });
}
/*************/

/* welcome div related codes*/
const $welcomeForm = $welcome.querySelector("form");

async function initCall() {
    $welcome.hidden = true;
    $call.style.display = "";
    await getMedia();
    makeConnection();
}

async function handleWelcomeSubmit(e) {
    e.preventDefault();

    const $input = $welcomeForm.querySelector("input");
    // socket.emit("enter_room", $input.value, initCall);
    await initCall();

    socket.emit("enter_room", $input.value);
    roomName = $input.value;
    $input.value = "";
}

$welcomeForm.addEventListener("submit", handleWelcomeSubmit);
/*************/

/* socket event related codes */
socket.on("welcome", async () => {
    console.log("someone joined");

    const offer = await myPeerConnection.createOffer();
    myPeerConnection.setLocalDescription(offer);

    socket.emit("offer", offer, roomName);

    console.log("sent the offer");
    console.log(offer);
});

socket.on("offer", async (offer) => {
    console.log("received the offer");

    myPeerConnection.setRemoteDescription(offer);

    const answer = await myPeerConnection.createAnswer();
    myPeerConnection.setLocalDescription(answer);

    console.log("sent the answer");

    socket.emit("answer", answer, roomName);
    
    console.log(offer);
    console.log(answer);
});

socket.on("answer", (answer) => {
    console.log("received the answer");
    
    myPeerConnection.setRemoteDescription(answer);
});

socket.on("ice", (ice) => {
    console.log("received candidate");
    myPeerConnection.addIceCandidate(ice);
});
/*************/

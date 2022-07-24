const socket = io();

const $welcome = document.querySelector("#welcome");
const $call = document.querySelector("#call");
const $peersStream = document.querySelector("#peersStream");
const $guide = document.querySelector("p");
$call.style.display = "none";
$peersStream.style.display = "none";
console.log("Is it null?", $peersStream.srcObject);

const $micOn = document.querySelector("#mic-on");
const $micOff = document.querySelector("#mic-off");
const $camOn = document.querySelector("#cam-on");
const $camOff = document.querySelector("#cam-off");
$micOff.style.display = "none";
$camOff.style.display = "none";

let myStream;
let peerConnection;
let channel;
let roomName;

/* call + video div related codes */
// 카메라 선택 리스트 만들기
const $cameras = document.querySelector("#cameras");
async function getCameras() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter((device) => device.kind === "videoinput");
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
        if (!deviceId) { await getCameras(); }
    } catch (error) {
        console.log(error);
    }
}

// 비디오 & 오디오 켜고 끄기
const $micBtn = document.querySelector("#mic-btn");
const $camBtn = document.querySelector("#cam-btn");

let micOff = false;
let cameraOff = false;

function handleMuteClick() {
    myStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
    });

    if (!micOff) {
        // mic on 상태에서 mic off 상태로 변경
        micOff = true;

        $micOff.style.display = "";
        $micOn.style.display = "none";

        $micBtn.innerText = "Mic On";
    } else {
        // mic off 상태에서 mic on 상태로 변경
        micOff = false;

        $micOn.style.display = "";
        $micOff.style.display = "none";

        $micBtn.innerText = "Mic Off";
    }
}

function handleCameraClick() {
    myStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
    });

    if (!cameraOff) {
        // cam on 상태에서 cam off 상태로 변경
        cameraOff = true;

        $camOff.style.display = "";
        $camOn.style.display = "none";

        $camBtn.innerText = "Cam On";                
    } else {
        // cam off 상태에서 cam on 상태로 변경
        cameraOff = false;
        
        $camOn.style.display = "";
        $camOff.style.display = "none";

        $camBtn.innerText = "Cam Off";
    }
}

$micBtn.addEventListener("click", handleMuteClick);
$camBtn.addEventListener("click", handleCameraClick);

// 카메라 변경 이벤트 관리
async function handleCameraChange() {
    await getMedia($cameras.value);

    $micOff.style.display = "none";
    $micOn.style.display = "";
    $muteBtn.innerText = "Mic Off";

    $camOff.style.display = "none";
    $camOn.style.display = "";
    $cameraBtn.innerText = "Cam Off";

    // peer에게 송신되는 카메라 설정도 함께 변경
    if (peerConnection) {
        const videoTrack = myStream.getVideoTracks()[0];
        const senders = peerConnection.getSenders();
        const videoSender = senders.find((sender) => {
            return sender.track.kind === "video";
        });
        videoSender.replaceTrack(videoTrack);
    }
}

$cameras.addEventListener("input", handleCameraChange);
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
    await initCall();

    socket.emit("enter_room", $input.value);
    roomName = $input.value;
    $input.value = "";
}

$welcomeForm.addEventListener("submit", handleWelcomeSubmit);
/*************/

/* call + text div related codes */
const $textDiv = document.querySelector("#text");
const $bubbleDiv = document.querySelector("#bubble");
const $textForm = $textDiv.querySelector("form");
const $textInput = $textForm.querySelector("input");

const handleTextSubmit = (e) => {
    e.preventDefault();

    const msg = $textInput.value;
    $textInput.value = "";

    channel.send(msg);

    const $div = document.createElement("div");
    $div.innerText = msg;
    $div.style.cssText = "width: 100px; background-color: lightseagreen; color: white; border-radius: 8px; border: none; padding: 5px; margin: 5px 0 0 180px; word-break: break-all;";
    $bubbleDiv.appendChild($div);

    $bubbleDiv.scrollTop = $bubbleDiv.scrollHeight;
}

$textForm.addEventListener("submit", handleTextSubmit);

const handleMessage = (e) => {
    const msg = e.data;

    const $div = document.createElement("div");
    $div.innerText = msg;
    $div.style.cssText = "width: 100px; background-color: #D7DAE2; color: black; border-radius: 8px; border: none; padding: 5px; margin: 5px 0 0 0; word-break: break-all;";
    $bubbleDiv.appendChild($div);

    $bubbleDiv.scrollTop = $bubbleDiv.scrollHeight;
}

const handleOpen = () => {
    const $div = document.createElement("div");
    $div.innerText = "Hi! Chat has started 👍";
    $div.style.cssText = "color: lightseagreen; text-align: center";
    $bubbleDiv.appendChild($div);    
}

const handleClose = () => {
    const $div = document.createElement("div");
    $div.innerText = "Bye! Chat has ended 👋";
    $div.style.cssText = "color: lightseagreen; text-align: center";
    $bubbleDiv.appendChild($div);  

    $bubbleDiv.scrollTop = $bubbleDiv.scrollHeight;

    $peersStream.srcObject = null;
    peerConnection.close();

    $guide.innerText = "Peer has left 😥";
    $guide.style.display = "";
    $peersStream.style.display = "none";
}
/*************/

/* socket event related codes */
// Peer A
socket.on("welcome", async () => {
    console.log("someone joined");

    // data channel
    channel = peerConnection.createDataChannel("chat");
    console.log("Made channel", channel);

    channel.addEventListener("open", handleOpen);
    channel.addEventListener("close", handleClose);
    channel.addEventListener("message", handleMessage);

    // create offer & setLocalDescription()
    const offer = await peerConnection.createOffer();
    peerConnection.setLocalDescription(offer);

    socket.emit("offer", offer, roomName);

    console.log("sent the offer");
    console.log(offer);
});

// Peer B
socket.on("offer", async (offer) => {
    // data channel
    peerConnection.addEventListener("datachannel", (event) => {
        channel = event.channel;
        console.log("Got channel", channel);

        channel.addEventListener("open", handleOpen);
        channel.addEventListener("close", handleClose);            
        channel.addEventListener("message", handleMessage);
    });

    // receive offer & setRemoteDescription()
    console.log("received the offer");
    console.log(offer);

    peerConnection.setRemoteDescription(offer);

    // create answer & setLocalDescription()
    const answer = await peerConnection.createAnswer();
    peerConnection.setLocalDescription(answer);

    socket.emit("answer", answer, roomName);   

    console.log("sent the answer");
    console.log(answer);    
});

// Peer A
socket.on("answer", (answer) => {
    // receive answer & setRemoteDescription()
    console.log("received the answer");
    
    peerConnection.setRemoteDescription(answer);
});

socket.on("ice", (ice) => {
    console.log("received candidate");

    peerConnection.addIceCandidate(ice);
});
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

    $guide.style.display = "none";
    $peersStream.style.display = "";
    $peersStream.srcObject = data.stream;
}

function makeConnection() {
    peerConnection = new RTCPeerConnection({
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
    peerConnection.addEventListener("icecandidate", handleIce);
    peerConnection.addEventListener("addstream", handleAddStream);

    myStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, myStream);
    });
}
/*************/

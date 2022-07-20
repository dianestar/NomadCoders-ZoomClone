const socket = io();

const $welcome = document.querySelector("#welcome");
const $call = document.querySelector("#call");
$call.hidden = true;

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

let myStream;

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
        // console.log(myStream);
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
        $muteBtn.innerText = "Unmute";
        muted = true;
    } else {
        $muteBtn.innerText = "Mute";
        muted= false;
    }
}

function handleCameraClick() {
    // console.log(myStream.getVideoTracks());
    myStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
    });

    if (cameraOff) {
        $cameraBtn.innerText = "Turn Camera Off";
        cameraOff = false;
    } else {
        $cameraBtn.innerText = "Turn Camera On";
        cameraOff = true;
    }
}

$muteBtn.addEventListener("click", handleMuteClick);
$cameraBtn.addEventListener("click", handleCameraClick);

async function handleCameraChange() {
    await getMedia($cameras.value);
}

$cameras.addEventListener("input", handleCameraChange);
/*************/

/* welcome div related codes*/
let roomName;

const $welcomeForm = $welcome.querySelector("form");

async function startMedia() {
    $welcome.hidden = true;
    $call.hidden = false;
    await getMedia();
    makeConnection();
}

function handleWelcomeSubmit(e) {
    e.preventDefault();

    const $input = $welcomeForm.querySelector("input");
    socket.emit("enter_room", $input.value, startMedia);
    roomName = $input.value;
    $input.value = "";
}

$welcomeForm.addEventListener("submit", handleWelcomeSubmit);
/*************/

/* socket event related codes */
socket.on("welcome", async () => {
    // console.log("someone joined");
    const offer = await myPeerConnection.createOffer();
    myPeerConnection.setLocalDescription(offer);
    socket.emit("offer", offer, roomName);
    console.log(offer);
});

socket.on("offer", (offer) => {
    console.log(offer);
});
/*************/

/* RTC related codes */
let myPeerConnection;

function makeConnection() {
    myPeerConnection = new RTCPeerConnection();
    myStream.getTracks().forEach((track) => {
        myPeerConnection.addTrack(track, myStream);
    })
}
/*************/

/* using socket.io
const $welcome = document.querySelector("#welcome");
const $nickForm = $welcome.querySelector("#nickname");

const $roomForm = $welcome.querySelector("#roomname");
$roomForm.hidden = true;

const $room = document.querySelector("#room");
$room.hidden = true;

let roonName;

function handleRoomSubmit(e) {
    e.preventDefault();
    const $input = $welcome.querySelector("#roomname input");

    roomName = $input.value;
    socket.emit("enter_room", $input.value, showRoom);

    $input.value = "";
}

function handleNickSubmit(e) {
    e.preventDefault();
    const $input = $welcome.querySelector("#nickname input");
    socket.emit("nickname", $input.value);
    
    $input.value = "";
    $nickForm.hidden = true;
    $roomForm.hidden = false;
}

$nickForm.addEventListener("submit", handleNickSubmit);
$roomForm.addEventListener("submit", handleRoomSubmit);

function handleMsgSubmit(e) {
    e.preventDefault();
    const $input = $room.querySelector("input");
    const value = $input.value;
    socket.emit("new_message",value, roomName, () => {
        addMessage(`You: ${value}`);
    });

    $input.value = "";
}

function showRoom() {
    $welcome.hidden = true;
    $room.hidden = false;
    
    const $h3 = $room.querySelector("h3");
    $h3.innerText = `Room ${roomName}`;

    const $msgForm = $room.querySelector("#message");
    $msgForm.addEventListener("submit", handleMsgSubmit);
}

function addMessage(message) {
    const $ul = $room.querySelector("ul");
    const $li = document.createElement("li");
    $li.innerText = message;
    $ul.appendChild($li);
}

socket.on("welcome", (user, newCount) => {
    const $h3 = $room.querySelector("h3");
    $h3.innerText = `Room ${roomName} (${newCount})`;

    addMessage(`${user} joined 😍`);
});

socket.on("bye", (user, newCount) => {
    const $h3 = $room.querySelector("h3");
    $h3.innerText = `Room ${roomName} (${newCount})`;

    addMessage(`${user} left 😥`);
});


//socket.on("new_message", (message) => {
//    addMessage(message);
//});

socket.on("new_message", addMessage);

socket.on("room_change", (rooms) => {
    const $roomList = $welcome.querySelector("ul");
    $roomList.innerHTML = "";

    if (rooms.length === 0) {
        return;
    }
    
    rooms.forEach((room) => {
        const $li = document.createElement("li");
        $li.innerText = room;
        $roomList.append($li);
    });
});
*/

/* using ws
const $messageList = document.querySelector("ul");
const $nicknameForm = document.querySelector("#nickname");
const $messageForm = document.querySelector("#message");

const socket = new WebSocket(`ws://${window.location.host}`);

// open
socket.addEventListener("open", () => {
    console.log("Connected to Server ✅");
});

// message
socket.addEventListener("message", (message) => {
    console.log(message);

    const $li = document.createElement("li");
    $li.innerText = message.data;
    $messageList.append($li);
});

// close
socket.addEventListener("close", () => {
    console.log("Disconnected to Server ❌");
});

// 2가지 타입의 메시지가 존재 (닉네임 or 메시지)
// 현재로서는 백엔드가 메시지 타입을 구별할 수 없음
// 👉 text 대신 JSON 보내주기
function makeMessage(type, payload) {
    const msg = { type, payload };
    return JSON.stringify(msg);
}

function handleNickSubmit(e) {
    e.preventDefault();
    const $input = $nicknameForm.querySelector("input");
    
    // socket.send($input.value);
    socket.send(makeMessage("nickname", $input.value));

    $input.value = "";
}

function handleMsgSubmit(e) {
    e.preventDefault();
    const $input = $messageForm.querySelector("input");

    // socket.send($input.value);
    socket.send(makeMessage("new_message", $input.value));

    $input.value = "";
}

$nicknameForm.addEventListener("submit", handleNickSubmit);
$messageForm.addEventListener("submit", handleMsgSubmit);
*/
const socket = io();

// 비디오 & 오디오 허용
const $myFace = document.querySelector("#myFace");

let myStream;

async function getMedia() {
    try {
        myStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
        });
        // console.log(myStream);
        $myFace.srcObject = myStream;
    } catch (error) {
        console.log(error);
    }
}

getMedia();

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

// 유저의 장치 얻기
async function getCameras() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter((device) => device.kind === "videoinput");
        console.log(cameras);
    } catch (error) {
        console.log(error);
    }
}

/*
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
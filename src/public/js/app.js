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
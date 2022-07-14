// Put all your frontend code here.
const $nicknameForm = document.querySelector("#nickname");
const $messageForm = document.querySelector("#message");
const $ul = document.querySelector("ul");

const socket = new WebSocket(`ws://${window.location.host}`);
console.log(window);
socket.addEventListener("open", () => {
  console.log("Connected to Server ⭕");
});

socket.addEventListener("message", (msg) => {
  const $li = document.createElement("li");
  $li.innerText = msg.data;
  $ul.appendChild($li);
});

socket.addEventListener("close", () => {
  console.log("Disconnected to Server ❌");
});

const convertMsg = (type, payload) => {
  return JSON.stringify({ type, payload });
};

const handleNickSubmit = (e) => {
  e.preventDefault();
  const $input = $nicknameForm.querySelector("input");
  socket.send(convertMsg("nickname", $input.value));
  $input.value = "";
  alert("Your nickname has changed!");
};

const handleMsgSubmit = (e) => {
  e.preventDefault();
  const $input = $messageForm.querySelector("input");
  socket.send(convertMsg("message", $input.value));

  const $li = document.createElement("li");
  $li.innerText = "ME: " + $input.value;
  $ul.appendChild($li);

  $input.value = "";
};

$nicknameForm.addEventListener("submit", handleNickSubmit);
$messageForm.addEventListener("submit", handleMsgSubmit);

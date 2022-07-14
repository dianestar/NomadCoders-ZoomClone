const socket = io();

const $nickDiv = document.querySelector("#nickname");
const $nickForm = $nickDiv.querySelector("form");

const $roomDiv = document.querySelector("#roomname");
const $roomForm = $roomDiv.querySelector("form");
$roomDiv.hidden = true;

const $chatDiv = document.querySelector("#chatroom");
const $chatForm = $chatDiv.querySelector("form");
$chatDiv.hidden = true;

let roomname;

const addChat = (chat, type) => {
  const $ul = $chatDiv.querySelector("ul");
  const $li = document.createElement("li");
  $li.innerText = chat;
  if (type === "me") {
    $li.style.color = "gray";
  } else if (type === "notice") {
    $li.style.fontWeight = "bold";
  }
  $ul.appendChild($li);
};

const showPeopleCount = (peopleCount) => {
  const $h4 = $chatDiv.querySelector("h4");
  $h4.innerText = `${peopleCount} people are chatting 💬`;
};

const hideRoomDiv = (peopleCount) => {
  $roomDiv.hidden = true;

  showPeopleCount(peopleCount);

  const $h2 = $chatDiv.querySelector("h2");
  $h2.innerText = `💙 Room [${roomname}]`;
  $chatDiv.hidden = false;
};

const handleNickSubmit = (e) => {
  e.preventDefault();
  const $input = $nickDiv.querySelector("input");
  socket.emit("set_nickname", $input.value, () => {
    alert("Your nickname has successfully changed ✅");
    $nickDiv.hidden = true;
    $roomDiv.hidden = false;
  });
};

const handleRoomSubmit = (e) => {
  e.preventDefault();
  const $input = $roomDiv.querySelector("input");
  roomname = $input.value;
  socket.emit("enter_room", roomname, hideRoomDiv);
};

const handleChatSubmit = (e) => {
  e.preventDefault();
  const $input = $chatDiv.querySelector("input");
  const chat = $input.value;
  socket.emit("new_chat", roomname, chat, () => {
    addChat(`ME: ${chat}`, "me");
    $input.value = "";
  });
};

$nickForm.addEventListener("submit", handleNickSubmit);
$roomForm.addEventListener("submit", handleRoomSubmit);
$chatForm.addEventListener("submit", handleChatSubmit);

socket.on("entered", (nickname, count) => {
  addChat(`Hi! ${nickname} has entered 🙌`, "notice");
});

socket.on("left", (nickname, count) => {
  addChat(`Bye! ${nickname} has left 👋`, "notice");
});

socket.on("get_rooms", (publicRooms) => {
  const $ul = $roomDiv.querySelector("ul");
  $ul.innerHTML = "";

  publicRooms.forEach((room) => {
    const $li = document.createElement("li");

    $li.innerText = room;
    $li.style.cssText =
      "color: blue; text-decoration: underline; cursor: pointer;";
    $li.addEventListener("mouseover", () => {
      $li.style.color = "darkblue";
    });
    $li.addEventListener("mouseleave", () => {
      $li.style.color = "blue";
    });
    $li.addEventListener("click", () => {
      roomname = room;
      socket.emit("enter_room", room, hideRoomDiv);
    });

    $ul.appendChild($li);
  });
});

socket.on("get_count", (peopleCount) => {
  showPeopleCount(peopleCount);
});

socket.on("new_chat", addChat);

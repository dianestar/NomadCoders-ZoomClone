const socket = new WebSocket(`ws://${window.location.host}`);

// event 종류: close / error / message / open
// open: socket이 connection을 open 했을 때
socket.addEventListener("open", () => {
    console.log("Connected to Server ✅");
});

// message: message를 받을 때
socket.addEventListener("message", (message) => {
    console.log("Just got this: ", message, " from the Server");
    console.log(message.data);
});

// close: 서버가 오프라인이 될 때 등 socket이 close 되었을 때
socket.addEventListener("close", () => {
    console.log("Disconnected to Server ❌");
});

setTimeout(() => {
    socket.send("hello from the browser!");
}, 10000);
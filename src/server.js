import http from "http";
import WebSocket from "ws";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// fake database
// 서버에 연결된 브라우저 목록 저장
const sockets = [];

// connection
wss.on("connection", (socket) => {
    sockets.push(socket);
    socket["nickname"] = "anonymous";
    console.log("Connected to Browser ✅");

    // close
    socket.on("close", () => console.log("Disconnected from Client ❌"));

    // message
    socket.on("message", (message) => {
        // 서버 - 브라우저 하나와의 통신
        // socket.send(message.toString());

        // 서버 - 브라우저 여러개와의 통신
        // sockets.forEach(aSocket => aSocket.send(message.toString()));

        // 메시지 타입 구별하기
        const msgObj = JSON.parse(message);
        console.log(msgObj);

        if (msgObj.type === "new_message") {
            sockets.forEach(aSocket => aSocket.send(`${socket.nickname}: ${msgObj.payload}`));
        }
        else if (msgObj.type === "nickname") {
            socket["nickname"] = msgObj.payload;
        }
    })
});

server.listen(3000, handleListen);
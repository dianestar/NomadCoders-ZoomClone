import http from "http";
// import WebSocket from "ws";
import SocketIO from "socket.io";
// import { Server } from "socket.io";
// import { instrument } from "@socket.io/admin-ui";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

wsServer.on("connection", (socket) => {
    socket.on("enter_room", (roomName, done) => {
        socket.join(roomName);
        done();
        socket.to(roomName).emit("welcome");
    });
    socket.on("offer", (offer, roomName) => {
        socket.to(roomName).emit("offer");
    });
});

const handleListen = () => console.log("Listening on http://localhost:3000");
httpServer.listen(3000, handleListen);

/* using socket.io
const wsServer = new Server(httpServer, {
    cors: {
      origin: ["https://admin.socket.io"],
      credentials: true,
    },
  });
  
  instrument(wsServer, {
    auth: false,
  });

function publicRooms() {
    const { sockets: { adapter: { sids, rooms }}} = wsServer;
    const publicRooms = [];
    rooms.forEach((_, key) => {
        if (sids.get(key) === undefined) {
            publicRooms.push(key);
        }
    });
    return publicRooms;
}

function countRoom(roomName) {
    return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

wsServer.on("connection", (socket) => {
    socket["nickname"] = "anonymous";

    socket.onAny((event) => {
        console.log(`Socket Event: ${event}`);
    })

    socket.on("enter_room", (roomName, done) => {
        socket.join(roomName);
        done();
        socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
        wsServer.sockets.emit("room_change", publicRooms());
    });

    socket.on("new_message", (message, roomName, done) => {
        socket.to(roomName).emit("new_message", `${socket.nickname}: ${message}`);
        done();
    });

    socket.on("nickname", (nickname) => {
        socket["nickname"] = nickname;
    });

    socket.on("disconnecting", () => {
        socket.rooms.forEach((room) => {
            socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1);
        });
        
    });

    socket.on("disconnect", () => {
        wsServer.sockets.emit("room_change", publicRooms());
    });
});
*/

/* using ws
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
*/
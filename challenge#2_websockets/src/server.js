import http from "http";
import WebSocket from "ws";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Put all your backend code here.
const sockets = [];
let index = 0;

wss.on("connection", (socket) => {
  console.log("Connected to Browser ⭕");

  socket["nickname"] = "anonymousID" + Date.now().toString() + index.toString();
  index++;
  sockets.push(socket);

  socket.on("message", (msg) => {
    const msgObj = JSON.parse(msg);
    if (msgObj.type === "nickname") {
      socket["nickname"] = msgObj.payload;
    } else if (msgObj.type === "message") {
      sockets.forEach((aSocket) => {
        if (aSocket.nickname !== socket.nickname) {
          aSocket.send(`${socket.nickname}: ${msgObj.payload}`);
        }
      });
    }
  });

  socket.on("close", () => {
    console.log("Disconnected to Browser ❌");
  });
});

server.listen(process.env.PORT, handleListen);

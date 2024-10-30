const express = require("express");
const http = require('http');
const app = express();
const server = http.Server(app);
const io = require('socket.io')(server);

const ip = "127.0.0.1";
const port = 4000;
app.use(express.static('public'));
app.get('/', (req, res) => {
    res.sendFile('index.html', { root: __dirname });
});

// Un tableau pour suivre les utilisateurs actifs
const users = [];
const publicMessages = [];

io.on("connection", (socket) => {
    socket.emit("init", { message: "Bienvenue cher client du chat" });

    // Attente de l'emit sendLog
    socket.on("sendLog", (data) => {
        data.id = socket.id;
        users.push(data);
        
        // Émettre la mise à jour de la liste des utilisateurs à tous les clients
        io.emit("updateUserList", users);
    });

    socket.on("publicMessage", (data) => {
        data.id = socket.id;
        publicMessages.push(data);
        socket.broadcast.emit("publicMessageGlobal", data);
    });

    socket.on("privateMessage", (data) => {
        const { recipientId, messageContent } = data;
        const message = {
            pseudo: data.pseudo,
            messageContent,
            date: new Date(),
        };
        // Émettre le message privé à l'utilisateur cible
        socket.to(recipientId).emit("privateMessage", message);
    });

    socket.on("disconnect", () => {
        const indexDisconnect = users.findIndex(element => element.id === socket.id);
        if (indexDisconnect !== -1) {
            users.splice(indexDisconnect, 1);
            // Émettre la mise à jour de la liste des utilisateurs à tous les clients
            io.emit("updateUserList", users);
        }
    });
});

server.listen(port, ip, () => {
    console.log("Démarré sur http://" + ip + ":" + port);
});

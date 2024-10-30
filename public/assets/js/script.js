// Code client (dans script.js)

// déclaration de variables
const sendPublic = document.querySelector("#sendPublic");
const messagesPublic = document.getElementById("messagesPublic");
const clientsList = document.getElementById("clientsList");
const socket = io();
const query = window.location.search;
const urlParams = new URLSearchParams(query);
const pseudo = urlParams.get("pseudo");
const pwd = urlParams.get("pwd");

// déclarations de fonction
const displayMessage = (data) => {
    messagesPublic.innerHTML += `
    <div class="newMessage">
        <h2>${data.pseudo}</h2>
        <p class="content">${data.messageContent}</p>
        <p class="date">${data.date}</p>
    </div>`;
};

// Fonction pour afficher la liste des utilisateurs connectés
const displayUserList = (users) => {
    clientsList.innerHTML = ''; // Réinitialiser la liste
    users.forEach(user => {
        clientsList.innerHTML += `
            <p onclick="openPrivateChat('${user.id}', '${user.pseudo}')">${user.pseudo}</p>`;
    });
};

tinymce.init({
    selector: '#textPublic',
    plugins: [
        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
        'preview', 'anchor', 'searchreplace', 'visualblocks',
        'fullscreen', 'insertdatetime', 'media', 'table', 'help', 'wordcount'
    ],
    toolbar: 'undo redo | formatpainter casechange blocks | ' +
        'bold italic backcolor | alignleft aligncenter alignright alignjustify | ' +
        'bullist numlist checklist outdent indent | removeformat | a11ycheck code table help'
});

socket.on("init", (data) => {
    console.dir(data);
    socket.emit("sendLog", { pseudo: pseudo, pwd: pwd });
});

sendPublic.addEventListener("click", () => {
    let messageContent = tinyMCE.get("textPublic").getContent();
    let date = new Date();
    let data = { pseudo: pseudo, messageContent: messageContent, date: date };
    socket.emit("publicMessage", data);
    displayMessage(data);
});

socket.on("publicMessageGlobal", (data) => {
    console.dir(data);
    displayMessage(data);
});

// Écoute l'événement pour mettre à jour la liste des utilisateurs
socket.on("updateUserList", (users) => {
    displayUserList(users);
});

// Fonction pour ouvrir une discussion privée
function openPrivateChat(recipientId, recipientPseudo) {
    const privateMessageContent = prompt(`Envoyer un message privé à ${recipientPseudo}:`);
    if (privateMessageContent) {
        const messageData = {
            recipientId: recipientId,
            pseudo: pseudo,
            messageContent: privateMessageContent
        };
        socket.emit("privateMessage", messageData);
    }
}

// Écoute l'événement pour les messages privés
socket.on("privateMessage", (data) => {
    alert(`Message privé de ${data.pseudo}: ${data.messageContent}`);
});

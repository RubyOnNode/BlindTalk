const chatForm = document.getElementById("chat-form");
const chatMessages = document.getElementById("chat-messages");
const roomName = document.getElementById("room-name");
const usersList = document.getElementById("users");

//Get username and room from URL
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const socket = io();

//Join chatroom
socket.emit("joinRoom", { username, room });

socket.on("roomUsers", ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

//Message from server
socket.on("message", (message) => {
  outputMessage(message);
  //scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

//submit message
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  //Get message text
  const msg = e.target.elements.msg.value;

  socket.emit("chatMessage", msg);

  //clear input area
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

//Output message to DOM

function outputMessage(message) {
  const div = document.createElement("div");
  div.className = "message";
  div.innerHTML = `<p class="meta"> ${message.username} <span>${message.time}</span></p><p class="text">${message.text}</p>`;
  document.querySelector("#chat-messages").appendChild(div);
}

function outputRoomName(room) {
  roomName.innerHTML = room;
}

//output users in side bar all thee users
function outputUsers(users) {
  usersList.innerHTML = `
  ${users.map((user) => `<li>${user.username}</li>`).join("")}`;
}

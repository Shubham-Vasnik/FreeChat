const socket = io();
const chatForm = document.querySelector('#chat-form');
const chatMessages = document.querySelector('.chat-messages');
const group = document.querySelector('#group-name');

const detail = {user:currentUser,currGroup:group.innerHTML};


function online(detail){
    socket.emit('online',detail);
}

setInterval("online(detail)",1000);




socket.on('message',message => {
    // console.log(message);
    outputMessage(message);
    chatMessages.scrollTop = chatMessages.scrollHeight;
})

socket.on('userOnline',user =>{
    userOnline(user);
});

    chatMessages.scrollTop = chatMessages.scrollHeight;

chatForm.addEventListener('submit', (e) => {
e.preventDefault();
const msg = e.target.elements.msg.value;
const url = window.location.href;
const message = { 'message' : msg};
axios.post(url,message,{headers: {'Content-Type': 'application/json'}});
socket.emit('chatMessage',msg);
e.target.elements.msg.value = '';
e.target.elements.msg.focus();
});

function outputMessage(msg){
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `
                        <p class="meta">${msg.author.username} <span><small>${msg.time}</small></span></p>
						<p class="text">
							${msg.text}
						</p>
    `;
    document.querySelector('.chat-messages').appendChild(div);
}

window.onbeforeunload = function(){
    socket.emit('leaveGroup',detail);
  }

  socket.on('userOffline',user =>{
    userOffline(user);
});


function userOnline(user){
   currUser = document.querySelector(`#${user}`);
   currUser.classList.add("online");
}

function userOffline(user){
    currUser = document.querySelector(`#${user}`);
   currUser.classList.remove("online");
}
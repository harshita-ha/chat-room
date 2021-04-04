const socket = io();

const $messageForm = document.querySelector('#message-form');
const $messageInput = $messageForm.querySelector('input');
const $messageButton = $messageForm.querySelector('button');
const $locationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#message');

//Templates
const $messageTemplate = document.querySelector('#message-template').innerHTML;
const $locationTemplate = document.querySelector('#location-template').innerHTML;
const $sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

//Room
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoscroll = () => {
    const $newMessage = $messages.lastElementChild;
    const newMessageStyle = getComputedStyle($newMessage);
    const newMessageHeight = $newMessage.offsetHeight + parseInt(newMessageStyle.marginBottom);

    const containerHeight = $messages.scrollHeight;
    const visibleHeight = $messages.offsetHeight;

    const scrollOffset = $messages.scrollTop + visibleHeight;

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = containerHeight;
    }
}

socket.on('message', (message) => {
    const html = Mustache.render($messageTemplate, { username: message.username, message: message.text, createdAt: moment(message.createdAt).format('h:mm A') });
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
});

socket.on('locationMessage', (message) => {
    const html = Mustache.render($locationTemplate, { username: message.username, url: message.url, createdAt: moment(message.createdAt).format('h:mm A') });
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
});

$messageForm.addEventListener('submit', (e) => {

    e.preventDefault();

    $messageButton.setAttribute('disabled', 'disabled');

    const message = e.target.elements.message.value;
    socket.emit('sendMessage', message, (error) => {
        if (error) {
            return console.log(error);
        }

        $messageInput.value = '';
        $messageInput.focus();

        console.log('Message sent!');
        $messageButton.removeAttribute('disabled');
    });
})

$locationButton.addEventListener('click', (e) => {

    $locationButton.setAttribute('disabled', 'disabled');

    if (!navigator.geolocation) {
        return alert('Your browser does not support geolocation.')
    }

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', { latitude: position.coords.latitude, longitude: position.coords.longitude }, () => {
            console.log('Location shared!');
            $locationButton.removeAttribute('disabled');
        });
    })
});

socket.on('roomData', ({ room, users }) => {
    const $chatSidebar = document.querySelector('#sidebar');
    const html = Mustache.render($sidebarTemplate, {
        room,
        users
    });
    $chatSidebar.innerHTML = html;
})

//Join a room
socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error);
        location.href = '/';
    }
});
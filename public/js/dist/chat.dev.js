"use strict";

var socket = io();
var $messageForm = document.querySelector('#message-form');
var $messageInput = $messageForm.querySelector('input');
var $messageButton = $messageForm.querySelector('button');
var $locationButton = document.querySelector('#send-location');
var $messageTemplate = document.querySelector('#message-template').innerHTML;
var $locationTemplate = document.querySelector('#location-template').innerHTML;
var $messages = document.querySelector('#message'); //Room

var _Qs$parse = Qs.parse(location.search, {
  ignoreQueryPrefix: true
}),
    username = _Qs$parse.username,
    room = _Qs$parse.room;

socket.on('message', function (message) {
  var html = Mustache.render($messageTemplate, {
    message: message.text,
    createdAt: moment(message.createdAt).format('h:mm A')
  });
  $messages.insertAdjacentHTML('beforeend', html);
});
socket.on('locationMessage', function (message) {
  var html = Mustache.render($locationTemplate, {
    url: message.url,
    createdAt: moment(message.createdAt).format('h:mm A')
  });
  $messages.insertAdjacentHTML('beforeend', html);
});
$messageForm.addEventListener('submit', function (e) {
  e.preventDefault();
  $messageButton.setAttribute('disabled', 'disabledd');
  var message = e.target.elements.message.value;
  socket.emit('sendMessage', message, function (error) {
    if (error) {
      return console.log(error);
    }

    $messageInput.value = '';
    $messageInput.focus();
    console.log('Message sent!');
    $messageButton.removeAttribute('disabled');
  });
});
$locationButton.addEventListener('click', function (e) {
  $locationButton.setAttribute('disabled', 'disabled');

  if (!navigator.geolocation) {
    return alert('Your browser does not support geolocation.');
  }

  navigator.geolocation.getCurrentPosition(function (position) {
    socket.emit('sendLocation', {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    }, function () {
      console.log('Location shared!');
      $locationButton.removeAttribute('disabled');
    });
  });
}); //Join a room

socket.emit('join', {
  username: username,
  room: room
});
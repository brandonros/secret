var $ = require('jquery-browserify')
var crypto = require('crypto-browserify');
var io = require('socket.io-client');
var moment = require('moment');

var socket;

function encrypt(str, key) {
	var cipher = crypto.createCipher('aes-256-ctr', key);

	return cipher.update(str, 'utf8', 'hex') + cipher.final('hex');
}

function decrypt(str, key) {
	var decipher = crypto.createDecipher('aes-256-ctr', key);

	return decipher.update(str, 'hex', 'utf8') + decipher.final('utf8');
}

function init_socket() {
	socket = io('http://localhost:3000/');

	socket.on('connect', function () {
		$('#disconnected').removeClass('hide');
	});

	socket.on('message', function (data) {
		var key = $('#key').val();

		var message = data['message'];
		var nickname = data['nickname'];

		message = decrypt(message, key);
		nickname = decrypt(nickname, key);

		$('#log').append('<div>(' + moment().format('h:mma') + ') ' + nickname + ': ' + message + '</div>');
	});
}

function init_events() {
	$('#channel, #key, #nickname').on('keypress', function (event) {
		if (event['which'] !== 13) {
			return;
		}

		$('#connect').trigger('click');
	});

	$('#connect').on('click', function (event) {
		var channel = $('#channel').val();
		var key = $('#key').val();
		var nickname = $('#nickname').val();

		if (!channel || !key || !nickname) {
			return;
		}

		channel = encrypt(channel, key);
		nickname = encrypt(nickname, key);

		socket.emit('join', { channel: channel, nickname: nickname });

		$('#disconnected').addClass('hide');
		$('#connected').removeClass('hide');

		$('#message').focus();
	});

	$('#message').on('keypress', function (event) {
		if (event['which'] !== 13) {
			return;
		}

		$('#send').trigger('click');
	});

	$('#send').on('click', function (event) {
		var channel = $('#channel').val();
		var key = $('#key').val();
		var message = $('#message').val();

		if (!message) {
			return;
		}

		message = encrypt(message, key);
		channel = encrypt(channel, key);

		socket.emit('message', { channel: channel, message: message });

		$('#message').val('');

		$('#message').focus();
	});
}

init_socket();
init_events();
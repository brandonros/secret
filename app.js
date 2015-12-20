var crypto = require('crypto');
var io = require('socket.io');

var server;

var nicknames = {};

function encrypt(str, key) {
	var cipher = crypto.createCipher('aes-256-ctr', key);

	return cipher.update(str, 'utf8', 'hex') + cipher.final('hex');
}

function decrypt(str, key) {
	var decipher = crypto.createDecipher('aes-256-ctr', key);

	return decipher.update(str, 'hex', 'utf8') + decipher.final('utf8');
}

function init_socket() {
	server = io(3000);

	server.on('connection', function (socket) {
		socket.on('join', function (data) {
			if (!data['channel'] || !data['nickname']) {
				return;
			}

			nicknames[socket['id']] = data['nickname'];

			socket.join(data['channel']);
		});

		socket.on('message', function (data) {
			if (!data['channel'] || !data['message']) {
				return;
			}

			server.to(data['channel']).emit('message', { nickname: nicknames[socket['id']], message: data['message'] });
		});
	});
}

init_socket();
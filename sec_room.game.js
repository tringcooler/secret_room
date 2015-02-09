var game_test = (function(_super) {
	__extends(game_test, _super);
	function game_test(sheet, pipe) {
		_super.call(this, sheet);
		this.pipe = pipe;
		this.seq = 0;
		$('#btn1', this.element).click((function() {
			this.pipe.send('Test Started.', 'console_info');
			this._intrv = setInterval((function() {
				this.pipe.send(this.seq++, ['peersend_tst', 'peerid_all', 'peer_send']);
			}).bind(this));
			$('#btn1', this.element).attr('disabled', 'disabled');
			$('#btn2', this.element).removeAttr('disabled');
		}).bind(this));
		$('#btn2', this.element).click((function() {
			if(this._intrv) {
				clearInterval(this._intrv);
				this.pipe.send('Stop Started.', 'console_info');
				$('#btn2', this.element).attr('disabled', 'disabled');
				$('#btn1', this.element).removeAttr('disabled');
			}
		}).bind(this));
		this.pipe.reg((function (data) {
			if(data != this.seq) {
				this.pipe.send('Error.', 'console_info');
			} else {
				this.seq++;
			}
		}).bind(this), 'tst_channel');
		this.pipe.add_tags('tst_channel', 'peerrecv_tst');
	}
	game_test.prototype._class = 'game_test';
	game_test.prototype._conf_intf = {
		"name": "form",
		"elem": "div",
		"chld": [{
			"name": "button",
			"elem": "input",
			"attr": {
				"id": "btn1",
				"value": "Start Test",
				"type": "button",
			},
		}, {
			"name": "button",
			"elem": "input",
			"attr": {
				"id": "btn2",
				"value": "Stop Test",
				"type": "button",
				"disabled": "disabled",
			},
		}],
	}
	
	return game_test;
})(comp_base);

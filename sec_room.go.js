
var game_go = (function(_super) {
	__extends(game_go, _super);
	function game_go(sheet, pipe) {
		_super.call(this, sheet);
		this.pipe = pipe;
		$('#start_game', this.element).click(this._start.bind(this));
		$('#go_pass', this.element).click(this._pass.bind(this));
		$('#go_undo', this.element).click(this._undo.bind(this));
		this.pipe.reg(this._cmd_cb.bind(this), 'go_cmd_channel');
		this.pipe.add_tags('go_cmd_channel', 'peerrecv_go_cmd');
	}
	var board_size = 500;
	var board_margin = 30;
	game_go.prototype._class = 'game_go';
	game_go.prototype._conf_intf = {
		"name": "form",
		"elem": "div",
		"chld": [{
			"name": "board_panel",
			"elem": "div",
			"styl": {
				"float": "left",
				"position": "relative",
			},
			"chld": [{
				"name": "board_bg",
				"elem": "canvas",
				"attr": {
					"id": "board_bg",
					"width": board_size,
					"height": board_size,
				},
				"styl": {
					"z-index": 0,
				},
			}, {
				"name": "board",
				"elem": "canvas",
				"attr": {
					"id": "board",
					"width": board_size,
					"height": board_size,
				},
				"styl": {
					"position": "absolute",
					"left": 0,
					"top": 0,
					"background": "transparent",
					"z-index": 1,
				}
			}],
		}, {
			"name": "ctrl_panel",
			"elem": "div",
			"chld": [{
				"name": "div",
				"elem": "div",
				"chld": [{
					"name": "span",
					"elem": "span",
					"text": "Black:",
				}, {
					"name": "radio",
					"elem": "input",
					"attr": {
						"id": "player_black",
						"type": "radio",
						"name": "player",
						"checked": "checked",
					},
				}, {
					"name": "span",
					"elem": "span",
					"text": "White:",
				}, {
					"name": "radio",
					"elem": "input",
					"attr": {
						"id": "player_white",
						"type": "radio",
						"name": "player",
					},
				}],
			}, {
				"name": "ctrl_ready",
				"elem": "div",
				"styl": {
					"display": "block",
				},
				"chld": [{
					"name": "div",
					"elem": "div",
					"chld": [{
						"name": "span",
						"elem": "span",
						"text": "Size of board:",
					}, {
						"name": "gamesize",
						"elem": "input",
						"attr": {
							"id": "board_size",
							"value": 9,
						},
						"styl": {
							"width": "20px",
							"text-align": "right",
						},
					}, {
						"name": "span",
						"elem": "span",
						"text": "Strict mode:",
					}, {
						"name": "checkbox",
						"elem": "input",
						"attr": {
							"id": "strict_mode",
							"type": "checkbox",
							"name": "strict",
							"checked": "checked",
						},
					}],
				}, {
					"name": "button",
					"elem": "input",
					"attr": {
						"id": "start_game",
						"value": "Start Game",
						"type": "button",
					},
				}],
			}, {
				"name": "ctrl_game",
				"elem": "div",
				"styl": {
					"display": "none",
				},
				"chld": [{
					"name": "div",
					"elem": "div",
					"chld": [{
						"name": "span",
						"elem": "span",
						"text": "Black Capture:",
					}, {
						"name": "span",
						"elem": "span",
						"attr": {
							"id": "capture_black",
						},
					}],
				}, {
					"name": "div",
					"elem": "div",
					"chld": [{
						"name": "span",
						"elem": "span",
						"text": "White Capture:",
					}, {
						"name": "span",
						"elem": "span",
						"attr": {
							"id": "capture_white",
						},
					}],
				}, {
					"name": "div",
					"elem": "div",
					"chld": [{
						"name": "button",
						"elem": "input",
						"attr": {
							"id": "go_pass",
							"value": "Pass",
							"type": "button",
						},
					}, {
						"name": "button",
						"elem": "input",
						"attr": {
							"id": "go_undo",
							"value": "Undo",
							"type": "button",
						},
					}],
				}],
			}],
		}],
	};
	game_go.prototype._game_init = function(size) {
		this.canvas = {
			"bg": $('#board_bg', this.element)[0].getContext('2d'),
			"stone": $('#board', this.element)[0].getContext('2d'),
		};
		this.setting = {
			"stone": (((board_size - board_margin * 2) / (size - 1) * 0.4) | 0),
			"size": size,
			"dist": (((board_size - board_margin * 2) / (size - 1)) | 0),
			"first": board_margin,
		};
		this.setting.last = this.setting.first + this.setting.dist * (this.setting.size - 1);
		this._draw_bg();
		/*  errata workaround for a bug only on my browser */
		(function(a,b){a(function(){b(0, 0, 1, 1);a(function(){b(0, 0, 1, 1);});});})
		(requestAnimationFrame, this.canvas.stone.clearRect.bind(this.canvas.stone));
		$('#board', this.element).click(this._on_click.bind(this));
		this.core = new core_go(size, this._draw_stone.bind(this));
	};
	game_go.prototype._tst = function() {
		if(!this._tst_idx) this._tst_idx = 0;
		{
			var c = this.canvas.stone
			//c.strokeStyle = 'black';
			//c.fillStyle  = 'white';
			c.beginPath();
			c.arc(40 + (this._tst_idx++) * 50, 40, 20, 0, Math.PI * 2, true);
			c.closePath();
			c.fill();
			//c.stroke();
		}
		//this._draw_stone([this._tst_idx++, 0], 'white');
		//this._draw_stone([1, 0], 'white');
		//this._draw_stone([0, 1], 'white');
		//this._draw_stone([1, 1], 'white');
		//this._draw_stone([1, 1], 'empty');
	};
	game_go.prototype.player = function(p) {
		if(p) {
			p == 'black'
			&& $('#player_black', this.element).prop('checked', true)
			|| $('#player_white', this.element).prop('checked', true);
			this._player_lock(p);
			return p;
		} else {
			return $('#player_black', this.element).prop('checked') && 'black' || 'white';
		}
	};
	game_go.prototype.player_swap = function() {
		if($('#player_black', this.element).prop('checked')) {
			$('#player_white', this.element).prop('checked', true);
			this._player_lock('white');
		} else {
			$('#player_black', this.element).prop('checked', true);
			this._player_lock('black');
		}
	};
	game_go.prototype._player_lock = function(player) {
		if(this._strict) {
			if(player == this._player) {
				$('#go_pass', this.element).removeAttr('disabled');
				$('#go_undo', this.element).removeAttr('disabled');
			} else {
				$('#go_pass', this.element).attr('disabled', 'disabled');
				$('#go_undo', this.element).attr('disabled', 'disabled');
			}
		}
	}
	game_go.prototype.update_capture = function() {
		if(this.core) {
			$('#capture_black', this.element).text(this.core._capture.white);
			$('#capture_white', this.element).text(this.core._capture.black);
		}
	};
	game_go.prototype._draw_bg = function() {
		var c = this.canvas.bg;
		c.strokeStyle = "black";
		c.beginPath();
		for(var x = this.setting.first; x <= this.setting.last; x += this.setting.dist) {
			c.moveTo(x, this.setting.first);
			c.lineTo(x, this.setting.last);
		}
		for(var y = this.setting.first; y <= this.setting.last; y += this.setting.dist) {
			c.moveTo(this.setting.first, y);
			c.lineTo(this.setting.last, y);
		}
		c.stroke();
	};
	game_go.prototype._draw_stone = function(pos, stn) {
		var c = this.canvas.stone;
		var x = pos[0] * this.setting.dist + this.setting.first;
		var y = pos[1] * this.setting.dist + this.setting.first;
		var r = this.setting.stone;
		if(stn == 'empty') {
			var rs = c.lineWidth + r;
			c.clearRect(x - rs, y - rs, 2 * rs, 2 * rs);
		} else {
			c.strokeStyle = 'black';
			c.fillStyle  = stn;
			c.beginPath();
			c.arc(x, y, r, 0, Math.PI * 2, true);
			c.fill();
			c.stroke();
		}
		//console.log('draw', pos, stn);
	};
	game_go.prototype._start = function() {
		if(!this._peer_init()) return;
		this.style('ctrl_ready').set_style('display', 'none');
		this.style('ctrl_game').set_style('display', 'block');
		if($('#strict_mode', this.element).prop('checked') && this._remote) {
			this._strict = true;
			$('#player_black', this.element).attr('disabled', 'disabled')
			$('#player_white', this.element).attr('disabled', 'disabled');
			this._player = this.player();
			this.player('black');
		} else {
			this._strict = false;
		}
		this._game_init($('#board_size', this.element).val());
		this.update_capture();
	};
	game_go.prototype._pass = function(ev) {
		this.player_swap();
		if(ev)this.send('pass');
	};
	game_go.prototype._undo = function(ev) {
		var stone = this.core.cmd('undo');
		if(stone) {
			this.player(stone);
			this.update_capture();
			if(ev)this.send('undo');
		};
	};
	game_go.prototype._on_click = function(e) {
		var player = this.player();
		if(this._strict && player != this._player) return;
		var x = (((e.offsetX - this.setting.first) / this.setting.dist + 0.5) | 0);
		var y = (((e.offsetY - this.setting.first) / this.setting.dist + 0.5) | 0);
		x = Math.max(Math.min(x, this.setting.size - 1), 0);
		y = Math.max(Math.min(y, this.setting.size - 1), 0);
		if(this.core.cmd('set', player, [x, y])) {
			this.player_swap();
			this.update_capture();
			this.send('set', [x, y], player);
		}
	};
	game_go.prototype._cmd2data = function(args) {
		var data = {
			"cmd": args[0],
			"args": Array.prototype.slice.call(args, 1),
		};
		return data;
	};
	game_go.prototype._peer_cmd = function() {
		return this.pipe.quick(this._cmd2data(arguments), 'peer_cmd', 'peer_cmd_result')[0]
	}
	game_go.prototype._peer_init = function() {
		if(this._peer_cmd('count') > 2) {
			this.pipe.send('This game is only for 2 players.', 'console_info');
			return false;
		}
		peers = this._peer_cmd('lock');
		if(peers.cnt == 1) {
			this._remote = false;
			return true;
		}
		this._remote = true;
		this._started = true;
		this._send_seq = 1;
		this._recv_seq = 0;
		this.pipe.reg(this._recv_cb.bind(this), 'go_game_channel');
		this.pipe.add_tags('go_game_channel', 'peerrecv_go_game');
		this.pipe.send({
			"cmd": "start",
			"size": $('#board_size', this.element).val(),
			"strict": $('#strict_mode', this.element).prop('checked'),
			"player": (this.player() == 'black' && 'white' || 'black'),
		}, ['peersend_go_cmd', 'peerid_all', 'peer_send']);
		return true;
	};
	game_go.prototype._cmd_cb = function(data, pure_tags, ext_tags) {
		switch(data.cmd) {
			case 'start':
				if(!this._started) {
					$('#board_size', this.element).val(data.size);
					$('#strict_mode', this.element).prop('checked', data.strict);
					this.player(data.player);
					this._start();
				}
				break;
			default:
				break;
		}
	};
	game_go.prototype.send = function() {
		var data = this._cmd2data(arguments);
		data.seq = this._send_seq++;
		this.pipe.send(data, ['peersend_go_game', 'peerid_all', 'peer_send']);
	};
	game_go.prototype._recv_cb = function(data, pure_tags, ext_tags) {
		if(data.seq - this._recv_seq != 1) this.pipe.send('Error: Invalid Sequence.', 'console_info');
		this._recv_seq = data.seq;
		switch(data.cmd) {
			case 'set':
				this.player(data.args[1]);
				this.core.cmd('set', this.player(), data.args[0]);
				this.player_swap();
				this.update_capture();
				break;
			case 'pass':
				this._pass();
				break;
			case 'undo':
				this._undo();
				break;
			default:
				break;
		}
	};
	return game_go;
})(comp_base);

var core_go = (function() {
	function core_go(size, draw_cb) {
		this.draw = draw_cb;
		this.size = size;
		this.info_cur_lvl = 'detail';
		this._logs = [];
		this._ko_pos = null;
		this._capture = {
			'black': 0,
			'white': 0,
		}
		this._stat_empty = new this._stat_chain({
			'stone': 'empty',
		});
		this._tbl = [];
		for(var i = 0; i < size; i++) {
			var _line = [];
			for(var j = 0; j < size; j++) {
				_line.push(this._stat_empty);
			}
			this._tbl.push(_line);
		}
	}
	core_go.prototype._stat_chain = (function() {
		function _stat_chain(val) {
			this._val = val;
			this._next = null;
		}
		_stat_chain.prototype.val = function() {
			return this.tail()._val;
		};
		_stat_chain.prototype.tail = function() {
			return this._next && this._next.tail() || this;
		};
		_stat_chain.prototype.merge = function(c) {
			this.tail()._next = c;
		};
		_stat_chain.prototype.cut = function() {
			this._next = null;
		};
		return _stat_chain;
	})();
	core_go.prototype._info_lvls = [
		'detail', 'info', 'illegal', 'error'
	];
	core_go.prototype._info = function() {
		if(!this.info_cur_lvl) return;
		var lvl = arguments[0];
		if(this._info_lvls.indexOf(lvl) >= this._info_lvls.indexOf(this.info_cur_lvl))
			//console.log(lvl, ':', Array.prototype.slice.call(arguments, 1).join(' '));
			console.log.apply(console, [lvl, ':'].concat(Array.prototype.slice.call(arguments, 1)));
	};
	core_go.prototype._illegal = function(msg) {
		this._info('illegal', msg);
	};
	core_go.prototype._reverse_stone = function(stone) {
		switch(stone) {
			case 'black':
				return 'white';
			case 'white':
				return 'black';
			default:
				return 'empty';
		}
	};
	core_go.prototype._concat_pos = function(d, s) {
		var c = 0;
		if((s instanceof Array) && (typeof(s[0]) == 'number')) s = [s];
		for(var i = 0; i < s.length; i++) {
			var x = s[i][0], y = s[i][1];
			for(var j = 0; j < d.length; j++) {
				if(d[j][0] == x && d[j][1] == y) break;
			}
			if(j == d.length) {
				d.push(s[i]);
				c++;
			}
		}
		return c;
	};
	core_go.prototype._remove_pos = function(d, s) {
		var c = 0;
		if((s instanceof Array) && (typeof(s[0]) == 'number')) s = [s];
		for(var i = 0; i < s.length; i++) {
			var x = s[i][0], y = s[i][1];
			for(var j = 0; j < d.length; j++) {
				if(d[j][0] == x && d[j][1] == y) {
					d.splice(j, 1);
					c++;
					break;
				}
			}
		}
		return c;
	};
	core_go.prototype._remove_pos_idx = function(d, r) {
		for(var i = d.length - 1; i > -1; i--) {
			if(d[i][0] == r[0] && d[i][1] == r[1]) {
				d.splice(i, 1);
				break;
			}
		}
		return i;
	};
	core_go.prototype._remove_pos_safe = function(s, r) {
		var d = [];
		if((r instanceof Array) && (typeof(r[0]) == 'number')) r = [r];
		for(var i = 0; i < s.length; i++) {
			var x = s[i][0], y = s[i][1];
			for(var j = 0; j < r.length; j++) {
				if(r[j][0] == x && r[j][1] == y) break;
			}
			if(j == r.length) {
				d.push(s[i]);
			}
		}
		return d;
	};
	core_go.prototype._set = function(pos, stn) {
		var cur_stat = this._tbl[pos[0]][pos[1]];
		if(cur_stat.val().stone != 'empty') return this._illegal('Already has a stone here.');
		if(this._ko_pos && this._ko_pos[0] == pos[0] && this._ko_pos[1] == pos[1]) return this._illegal('Ko.');
		var log = {
			"pos": pos,
			"stone": stn,
			"prev_stat": cur_stat,
			"group_len": 0,
			"liberties_len": 0,
			"merge_tl": [],
			"weaken_vli": [],
			"free_vl": [],
			"capture": [],
			"ko": this._ko_pos,
		};
		var ko_check = true;
		this._ko_pos = null;
		var liberties = [];
		var capture_st = [];
		cur_stat = null;
		var _check = (function(posx, posy) {
			var _st = this._tbl[posx][posy];
			var _stn = _st.val().stone;
			if(_stn == 'empty') {
				this._concat_pos(liberties, [posx, posy]);
			} else if ( _stn == stn) {
				if(cur_stat) {
					if(cur_stat.tail() != _st.tail()) {
						log.group_len += this._concat_pos(cur_stat.val().group, _st.val().group);
						log.liberties_len += this._concat_pos(cur_stat.val().liberties, _st.val().liberties);
						log.merge_tl.push(_st.tail());
						_st.merge(cur_stat);
					}
				} else {
					cur_stat = _st;
					log.group_len += this._concat_pos(cur_stat.val().group, pos);
				}
			} else {
				var _ri;
				if((_ri = this._remove_pos_idx(_st.val().liberties, pos)) > -1) {
					log.weaken_vli.push([_st.val(), _ri]);
					if(_st.val().liberties.length == 0) {
						capture_st.push(_st);
					}
					this._info('info', 'Weaken', [posx, posy], 'to', _st.val().liberties.length, 'liberties');
				}
			}
		}).bind(this);
		this._info('info', 'Set', pos, ':', stn);
		if(pos[0] > 0) _check(pos[0] - 1, pos[1]);
		if(pos[0] < this.size - 1) _check(pos[0] + 1, pos[1]);
		if(pos[1] > 0) _check(pos[0], pos[1] - 1);
		if(pos[1] < this.size - 1) _check(pos[0], pos[1] + 1);
		if(!cur_stat) {
			cur_stat = new this._stat_chain({
				'stone': stn,
				'liberties': [],
				'group': [pos],
			});
		} else {
			ko_check = false;
		}
		this._tbl[pos[0]][pos[1]] = cur_stat;
		log.liberties_len += this._concat_pos(cur_stat.val().liberties, liberties);
		var _ri;
		if((_ri = this._remove_pos_idx(cur_stat.val().liberties, pos)) > -1)
			log.weaken_vli.push([cur_stat.val(), _ri]);
		this._info('info', pos, ':', stn, 'has', cur_stat.val().liberties.length, 'liberties');
		if(capture_st.length == 0) {
			if(cur_stat.val().liberties.length == 0) {
				this._undo(log);
				return this._illegal('Self-capture.');
			}
		} else {
			for(var i = 0; i < capture_st.length; i++) {
				this._concat_pos(log.capture, capture_st[i].val().group);
			}
			if(ko_check && log.capture.length == 1) {
				this._info('info', 'Ko', log.capture[0]);
				this._ko_pos = log.capture[0];
			}
			var _free_lib = (function(pos, d_posx, d_posy) {
				var s = this._tbl[pos[0]][pos[1]];
				var d = this._tbl[d_posx][d_posy];
				if(d.val().stone != 'empty' && d.val().stone != s.val().stone) {
					if(this._concat_pos(d.val().liberties, pos) > 0)
						log.free_vl.push(d.val());
				}
			}).bind(this);
			for(var i = 0; i < log.capture.length; i++) {
				var posc = log.capture[i];
				this._info('info', 'Capture', posc);
				if(posc[0] > 0) _free_lib(posc, posc[0] - 1, posc[1]);
				if(posc[0] < this.size - 1) _free_lib(posc, posc[0] + 1, posc[1]);
				if(posc[1] > 0) _free_lib(posc, posc[0], posc[1] - 1);
				if(posc[1] < this.size - 1) _free_lib(posc, posc[0], posc[1] + 1);
			}
			for(var i = 0; i < capture_st.length; i++) {
				log.merge_tl.push(capture_st[i].tail());
				capture_st[i].merge(this._stat_empty);
			}
			this._capture[stn] += log.capture.length;
		}
		return log;
	};
	core_go.prototype._undo = function(log) {
		this._info('info', 'undo', log.pos, ':', log.stone);
		var cur_stat_val = this._tbl[log.pos[0]][log.pos[1]].val();
		for(var i = 0; i < log.merge_tl.length; i++) {
			log.merge_tl[i].cut();
		}
		for(var i = 0; i < log.free_vl.length; i++) {
			log.free_vl[i].liberties.pop();
		}
		for(var i = 0; i < log.weaken_vli.length; i++) {
			log.weaken_vli[i][0].liberties.splice(log.weaken_vli[i][1], 0, log.pos);
		}
		if(log.liberties_len > 0)
			cur_stat_val.liberties = cur_stat_val.liberties.slice(0, - log.liberties_len);
		if(log.group_len > 0)
			cur_stat_val.group = cur_stat_val.group.slice(0, - log.group_len);
		this._tbl[log.pos[0]][log.pos[1]] = log.prev_stat;
		this._capture[log.stone] -= log.capture.length;
		this._ko_pos = log.ko;
	};
	core_go.prototype.cmd = function() {
		var rslt = null;
		switch(arguments[0]) {
			case 'set':
				var stone = arguments[1];
				var pos = arguments[2];
				var log = this._set(pos, stone);
				if(log) {
					this._logs.push(log);
					this.draw(pos, stone);
					for(var i = 0; i < log.capture.length; i++) {
						this.draw(log.capture[i], 'empty');
					}
					rslt = true;
				}
				break;
			case 'undo':
				var log = this._logs.pop();
				if(log) {
					this.draw(log.pos, 'empty');
					for(var i = 0; i < log.capture.length; i++) {
						this.draw(log.capture[i], this._reverse_stone(log.stone));
					}
					this._undo(log);
					rslt = log.stone;
				}
			default:
				break;
		};
		return rslt;
	};
	return core_go;
})();

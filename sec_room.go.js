
var game_go = (function(_super) {
	__extends(game_go, _super);
	function game_go(sheet, pipe) {
		_super.call(this, sheet);
		this.pipe = pipe;
		this.core = new core_go(9, this._draw_stone.bind(this));
		this._game_init(9);
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
				"name": "pannel_title",
				"elem": "p",
				"text": "control",
			}],
		}, {
			"name": "info_panel",
			"elem": "div",
			"chld": [{
				"name": "pannel_title",
				"elem": "p",
				"text": "info",
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
		this.player = 'black';
		$('#board', this.element).click(this._on_click.bind(this));
		/*  errata workaround for a bug only on my browser */
		(function(a,b){a(function(){b(0, 0, 1, 1);a(function(){b(0, 0, 1, 1);});});})
		(requestAnimationFrame, this.canvas.stone.clearRect.bind(this.canvas.stone));
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
	game_go.prototype._on_click = function(e) {
		var x = (((e.offsetX - this.setting.first) / this.setting.dist + 0.5) | 0);
		var y = (((e.offsetY - this.setting.first) / this.setting.dist + 0.5) | 0);
		x = Math.max(Math.min(x, this.setting.size - 1), 0);
		y = Math.max(Math.min(y, this.setting.size - 1), 0);
		if(this.core.cmd('set', this.player, [x, y])) {
			if(this.player == 'black') this.player = 'white';
			else this.player = 'black';
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
				}
			default:
				break;
		};
		return rslt;
	};
	return core_go;
})();

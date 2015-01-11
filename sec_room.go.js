
var game_go = (function(_super) {
	__extends(game_go, _super);
	function game_go(sheet, pipe) {
		_super.call(this, sheet);
		this.pipe = pipe;
		this.core = new core_go(9, this._draw_chess.bind(this));
		this._game_init(9);
	}
	var board_size = 500;
	var board_margin = 30;
	game_go.prototype._class = 'game_go';
	game_go.prototype._conf_intf = {
		"name": "form",
		"elem": "div",
		"chld": [{
			"name": "chess_panel",
			"elem": "div",
			"styl": {
				"float": "left",
				"position": "relative",
			},
			"chld": [{
				"name": "chessboard_bg",
				"elem": "canvas",
				"attr": {
					"id": "chessboard_bg",
					"width": board_size,
					"height": board_size,
				},
				"styl": {
					"z-index": 0,
				},
			}, {
				"name": "chessboard",
				"elem": "canvas",
				"attr": {
					"id": "chessboard",
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
			"bg": $('#chessboard_bg', this.element)[0].getContext('2d'),
			"chess": $('#chessboard', this.element)[0].getContext('2d'),
		};
		this.setting = {
			"chess": (((board_size - board_margin * 2) / (size - 1) * 0.4) | 0),
			"size": size,
			"dist": (((board_size - board_margin * 2) / (size - 1)) | 0),
			"first": board_margin,
		};
		this.setting.last = this.setting.first + this.setting.dist * (this.setting.size - 1);
		this._draw_bg();
		$('#chessboard', this.element).click(this._on_click.bind(this));
	};
	game_go.prototype._tst = function() {
		this._draw_chess([0, 0], 'black');
		this._draw_chess([1, 0], 'white');
		this._draw_chess([0, 1], 'black');
		this._draw_chess([1, 1], 'white');
		this._draw_chess([1, 1], 'empty');
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
	game_go.prototype._draw_chess = function(pos, chs) {
		var c = this.canvas.chess;
		var x = pos[0] * this.setting.dist + this.setting.first;
		var y = pos[1] * this.setting.dist + this.setting.first;
		var r = this.setting.chess;
		if(chs == 'empty') {
			var rs = c.lineWidth + r;
			c.clearRect(x - rs, y - rs, 2 * rs, 2 * rs);
		} else {
			c.strokeStyle = 'black';
			c.fillStyle  = chs;
			c.beginPath();
			c.arc(x, y, r, 0, Math.PI * 2, true);
			c.fill();
			c.stroke();
		}
		console.log('draw', pos, chs);
	};
	game_go.prototype._on_click = function(e) {
		var x = (((e.offsetX - this.setting.first) / this.setting.dist + 0.5) | 0);
		var y = (((e.offsetY - this.setting.first) / this.setting.dist + 0.5) | 0);
		x = Math.max(Math.min(x, this.setting.size - 1), 0);
		y = Math.max(Math.min(y, this.setting.size - 1), 0);
		this.core.cmd('set', 'white', [x, y]);
	};
	return game_go;
})(comp_base);

var core_go = (function(_super) {
	function core_go(size, draw_cb) {
		this.draw = draw_cb;
		this.size = size;
		this._tbl = [];
		for(var i = 0; i < size; i++) {
			var _line = [];
			for(var j = 0; j < size; j++) {
				_line.push(0);
			}
			this._tbl.push(_line);
		}
	}
	core_go.prototype._tblv = {
		'empty': 0,
		'black': 1,
		'white': 2,
	};
	core_go.prototype._tblvr = [];
	for(var v in core_go.prototype._tblv) {
		core_go.prototype._tblvr[core_go.prototype._tblv[v]] = v;
	}
	core_go.prototype.tbl = function(pos, val) {
		if(val) {
			this._tbl[pos[0]][pos[1]] = this._tblv[val];
			return val;
		} else {
			return this._tblvr[this._tbl[pos[0]][pos[1]]];
		}
	};
	core_go.prototype.cmd = function() {
		switch(arguments[0]) {
			case 'check':
				var player = arguments[1];
				var pos = arguments[2];
				break;
			case 'set':
				var chess = arguments[1];
				var pos = arguments[2];
				if(this.tbl(pos) != 'empty') {
					this.draw(pos, 'empty');
				}
				if(chess != 'empty') {
					this.tbl(pos, chess);
					this.draw(pos, chess);
				}
				break;
			default:
				break;
		};
	};
	return core_go;
})();

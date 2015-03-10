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
			}).bind(this), 10);
			$('#btn1', this.element).attr('disabled', 'disabled');
			$('#btn2', this.element).removeAttr('disabled');
		}).bind(this));
		$('#btn2', this.element).click((function() {
			if(this._intrv) {
				clearInterval(this._intrv);
				this.pipe.send('Test Stoped.', 'console_info');
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

var game_graph = (function() {
	function game_graph(ctx) {
		this.ctx = ctx;
	}
	return game_graph;
})();

var graph_surface = (function() {
	function graph_surface(atom) {
		this.layers = {length: 0};
	}
	graph_surface.prototype._foreach_layers = function(cb) {
		if(this.layers.length > 1) {
			var _k = Object.keys(this.layers).sort(function(a, b) {
				if(isNaN(a) || isNaN(b)) {
					var _a = a.toString(), _b = b.toString();
					if(_a > _b) return 1;
					else if(_a < _b) return -1;
					else return 0;
				} else {
					return a - b;
				}
			});
			for(var i = 0; i < _k.length; i++) {
				if(!isNaN(_k[i])) {
					if(cb) cb(_k[i], this.layers[_k[i]]);
				}
			}
		} else {
			for(k in this.layers) {
				if(cb) cb(k, this.layers[k]);
			}
		}
	};
	graph_surface.prototype._isbase_atom = function(base, dest) {
		for(k in base) {
			if(base.hasOwnProperty(k) && !(dest.hasOwnProperty(k) && base[k] == dest[k]))
				return false;
		}
		return true;
	};
	graph_surface.prototype._eq_atom = function(a1, a2) {
		return this._isbase_atom(a1, a2) && this._isbase_atom(a2, a1);
	};
	graph_surface.prototype._blit_atom = function(atom) {
		
	};
	return graph_surface;
})();

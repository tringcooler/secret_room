
var __extends = this.__extends || function (d, b) {
	// for property own by base_class itself
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	/*
	for property define in constructor
	inhert_class's constructor must excute base_class's constructor by base_class.apply(this)
	*/
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
	/*
	new object means:
	obj.__proto__ = class.prototype
	extends means:
	inhert_class.prototype.__proto__ = base_class.prototype
	then:
	inhert_class.prototype must be created by new base_class without constructor
	*/
    d.prototype = new __();
};

var pipe_net = (function() {
	function pipe_net() {
		this._default_id_index = 0;
		this._tag_hooks = {};
		this._id_hooks = {};
	}
	pipe_net.prototype.send = function(info, tags) {
		var _trig_list = {};
		if(!(tags instanceof Array))
			tags = [tags];
		for(var i = 0; i < tags.length; i++) {
			if(this._tag_hooks.hasOwnProperty(tags[i])) {
				for(var j = 0; j < this._tag_hooks[tags[i]].length; j++) {
					var _trig_id = this._tag_hooks[tags[i]][j];
					if(!_trig_list.hasOwnProperty(_trig_id))
						_trig_list[_trig_id] = [];
					_trig_list[_trig_id].push(tags[i]);
				}
			}
		}
		for(id in _trig_list) {
			for(var i = 0; i < this._id_hooks[id].length; i++) {
				this._id_hooks[id][i](info, _trig_list[id]);
			}
		}
	};
	pipe_net.prototype.reg = function(func, id) {
		if(id == undefined) id = 'defid_' + (this._default_id_index++).toString();
		if(!this._id_hooks.hasOwnProperty(id))
			this._id_hooks[id] = [];
		this._id_hooks[id].push(func);
		return id;
	};
	pipe_net.prototype.add_tags = function(id, tags) {
		if(!(tags instanceof Array))
			tags = [tags];
		for(var i = 0; i < tags.length; i++) {
			if(!this._tag_hooks.hasOwnProperty(tags[i]))
				this._tag_hooks[tags[i]] = [];
			if(this._tag_hooks[tags[i]].indexOf(id) == -1)
				this._tag_hooks[tags[i]].push(id);
		}
	};
	pipe_net.prototype._remove_tag = function(id, tag) {
		var _ti_idx = this._tag_hooks[tag].indexOf(id);
		if(_ti_idx > -1) {
			this._tag_hooks[tag].splice(_ti_idx);
			if(this._tag_hooks[tag].length == 0) {
				delete this._tag_hooks[tag];
			}
		}
	}
	pipe_net.prototype.remove_tags = function(id, tags) {
		if(!(tags instanceof Array))
			tags = [tags];
		for(var i = 0; i < tags.length; i++) {
			this._remove_tag(id, tags[i]);
		}
	};
	pipe_net.prototype.unreg = function(id) {
		if(!this._id_hooks.hasOwnProperty(id)) return;
		for(tag in this._tag_hooks) {
			this._remove_tag(id, tag);
		}
		delete this._id_hooks[id];
	};
	return pipe_net;
})();

var style_sheet = (function() {
	function style_sheet() {
		var el_style = document.createElement('style');
		el_style.type = 'text/css';
		document.head.appendChild(el_style);
		this.element = el_style;
		this.sheet = el_style.sheet;
		this.rules = el_style.sheet.cssRules;
	}
	style_sheet.prototype.get_rule = function(selector) {
		for(var i = 0; i < this.rules.length; i++) {
			if(this.rules[i].selectorText == selector) {
				return this.rules[i];
			}
		}
		this.sheet.insertRule(selector + '{}', 0);
		return this.rules[0];
	};
	style_sheet.prototype.set_rule = function() {
		var rule = arguments[0];
		var vargs = arguments.slice(1);
		if(typeof(rule) == 'string') {
			rule = this.get_rule(rule);
		}
		rule.style.setProperty.apply(rule.style, vargs);
	};
	return style_sheet;
})();

var style_class = (function() {
	function style_class(name, sheet) {
		this.name = name
		this.rule = sheet.get_rule('.' + name);
	}
	style_class.prototype.style_length = function() {
		return this.rule.style.length;
	};
	style_class.prototype.get_style = function(prop) {
		return this.rule.style.getPropertyValue(prop);
	};
	style_class.prototype.set_style = function() {
		this.rule.style.setProperty.apply(this.rule.style, arguments);
	};
	return style_class;
})();

var comp_base = (function() {
	function comp_base(sheet) {
		this.sheet = sheet;
		this.intf = {};
		this.element = this.cr_elem(this._conf_intf);
	}
	comp_base.prototype._class = 'comp_base';
	comp_base.prototype._conf_intf = {
		"name":    "form",
		"elem":    "div",
		"styl": {
			"display": "block",
		},
		"chld": [{
			"name": "text",
			"elem": "p",
			"text": "test text",
			"styl": {
				"color": "red"
			},
		}, {
			"name": "text",
			"elem": "p",
			"text": "test text 2",
			"styl": {
				"color": "blue"
			}
		}]
	};
	comp_base.prototype.to_elem = function(name, elem) {
		if(elem)
			return elem.addClass(this._class + '_' + name);
		else
			return $('.' + this._class + '_' + name);
	};
	comp_base.prototype.cr_elem = function(conf) {
		var class_name = this._class + '_' + conf.name;
		var element = $('<' + conf.elem + '>').addClass(class_name);
		if(conf.hasOwnProperty('text'))
			element.text(conf.text);
		if(conf.hasOwnProperty('attr')) {
			for(var e in conf.attr) {
				element.attr(e, conf.attr[e]);
			}
		}
		if(conf.hasOwnProperty('styl')) {
			if(!this.intf.hasOwnProperty(conf.name)) {
				this.intf[conf.name] = {};
				this.intf[conf.name].style = new style_class(class_name, this.sheet);
				if(this.intf[conf.name].style.style_length() > 0) 
					this.intf[conf.name].style_lock = true; /* something else used this style, then skip it */
				else
					this.intf[conf.name].style_lock = false;
			}
			if(!this.intf[conf.name].style_lock) {
				for(rule in conf.styl) {
					this.intf[conf.name].style.set_style(rule, conf.styl[rule]);
				}
			}
		}
		if(conf.hasOwnProperty('chld')) {
			for(var i = 0; i < conf.chld.length; i++) {
				element.append(this.cr_elem(conf.chld[i]));
			}
		}
		return element;
	};
	comp_base.prototype.style = function(name) {
		return this.intf[name].style
	};
	return comp_base;
})();

var comp_chat = (function(_super) {
	__extends(comp_chat, _super);
	function comp_chat(sheet, pipe) {
		_super.call(this, sheet);
		this.pipe = pipe;
		this._init();
	}
	comp_chat.prototype._class = 'comp_chat';
	comp_chat.prototype._conf_intf = {
		"name": "form",
		"elem": "div",
		"chld": [{
			"name": "console",
			"elem": "div",
			"attr": {
				"id": "chat_console",
			},
			"styl": {
				"word-wrap": "break-word",
				"overflow-x": "hidden",
				"overflow-y": "auto",
				"width": "300px",
				"height": "200px",
			},
			"chld": [{
				"name": "font_sys",
				"elem": "!--font_sys--",
				"styl": {
					"color": "grey",
				},
			}, {
				"name": "font_net",
				"elem": "!--font_net--",
				"styl": {
					"color": "red",
				},
			}, {
				"name": "font_self",
				"elem": "!--font_self--",
				"styl": {
					"color": "blue",
				},
			}]
		}, {
			"name": "sendbox",
			"elem": "form",
			"attr": {
				"id": "chat_sendbox",
			},
			"chld": [{
				"name": "input",
				"elem": "input",
				"attr": {
					"id": "chat_input",
					"autocomplete": "off",
				},
			}, {
				"name": "submit",
				"elem": "input",
				"attr": {
					"type": "submit",
					"value": "send",
				},
			}]
		}]
	};
	comp_chat.prototype._tag2font = {
		"peer_connect_info": "font_sys",
		"chat_recv": "font_net",
		"chat_send": "font_self",
	};
	comp_chat.prototype._init = function() {
		var _this = this;
		this.pipe.reg(function(){_this.recv_cb.apply(_this, arguments)}, 'chat_pipe');
		this.pipe.add_tags('chat_pipe', Object.keys(this._tag2font));
		$('#chat_sendbox', this.element).submit(function(e) {
			e.preventDefault();
			var msg = $('#chat_input').val();
			if(!msg) return;
			_this.pipe.send(msg, 'chat_send');
			$('#chat_input').val('');
			$('#chat_input').focus();
		});
	}
	comp_chat.prototype.scroll_to_bottom = function() {
		var d = $("#chat_console");
		var b = d[0].scrollHeight - d.height();
		if(d.scrollTop() < b)
			d.animate({ scrollTop: b}, 200);
	};
	comp_chat.prototype.print = function(info, font) {
		var d = $("#chat_console");
		var scrl2bot = false;
		if(d.scrollTop() == d[0].scrollHeight - d.height()) scrl2bot = true;
		d.append(this.to_elem(font, $('<p>').text(info.toString())));
		if(scrl2bot) this.scroll_to_bottom();
	}
	comp_chat.prototype.recv_cb = function(info, tags) {
		this.print(info, this._tag2font[tags[0]]);
	};
	return comp_chat;
})(comp_base);

var comp_peer = (function(_super) {
	__extends(comp_peer, _super);
	function comp_peer(sheet, pipe) {
		_super.call(this, sheet);
		this.pipe = pipe;
		this._peer_init();
	}
	comp_peer.prototype._class = 'comp_peer';
	comp_peer.prototype._conf_intf = {
		"name": "form",
		"elem": "div",
		"chld": [{
			"name": "setting",
			"elem": "div",
			"chld": [{
				"name": "setting_title",
				"elem": "span",
				"text": "Host ID :"
			}, {
				"name": "peer_id",
				"elem": "span",
				"attr": {
					"id": "peer_host_id",
				},
			}]
		}, {
			"name": "setting",
			"elem": "div",
			"chld": [{
				"name": "setting_title",
				"elem": "span",
				"text": "Dest ID :"
			}, {
				"name": "dest_id",
				"elem": "input",
				"attr": {
					"id": "peer_dest_id",
				},
			}, {
				"name": "post_button",
				"elem": "input",
				"attr": {
					"id": "peer_connect",
					"type": "button",
					"value": "connect",
				},
			}]
		}]
	};
	comp_peer.prototype._peer_init = function() {
		var _this = this;
		this.peer = new Peer({
			key: '9lay1kbtfpvf5hfr',
			debug: 3,
			logFunction: function() {
				var copy = Array.prototype.slice.call(arguments).join(' ');
				_this.pipe.send(copy, 'peer_debug_info');
			},
			config: {'iceServers': [
				{ url: 'stun:stun.stunprotocol.org:3478' }
			]}
		});
		this.peer.on('open', function(id){
			$('#peer_host_id').text(id);
		});
		this.peer.on('connection', connect);
		function connect(c) {
			$('#peer_dest_id').val(c.peer).attr('readonly', 'readonly');
			_this.pipe.send('connected to ' + c.peer, 'peer_connect_info');
			c.on('data', function(data) {
				_this.pipe.send(data, 'chat_recv');
			});
			c.on('close', function() {
				_this.pipe.send('disconnected with ' + c.peer, 'peer_connect_info');
			});
		};
		$('#peer_connect', this.element).click(function() {
			var c = _this.peer.connect($('#peer_dest_id', this.element).val());
			c.on('open', function() {
				connect(c);
			});
			c.on('error', function(err) { alert(err);});
		});
		this.pipe.reg(function(info, tags) {
			var c = _this.peer.connections[$('#peer_dest_id').val()][0];
			c.send(info);
		}, 'peer_pipe');
		this.pipe.add_tags('peer_pipe', 'chat_send');
	};
	return comp_peer;
})(comp_base);

$(document).ready(function() {
	console.log('ready');
	var sht = new style_sheet();
	var pipe = new pipe_net();
	var obj1 = new comp_peer(sht, pipe);
	var obj2 = new comp_chat(sht, pipe);
	$('body').append(obj1.element).append(obj2.element);
	console.log('done');
});

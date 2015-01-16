
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
		//console.log('pipe:', tags, info);
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
				this._id_hooks[id][i](info, _trig_list[id], tags);
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
	pipe_net.prototype.quick = function(info, req_tags, resp_tags) {
		var _rslt;
		var _pipeid = this.reg(function(info, tags, src_tags){
			_rslt = [info, tags, src_tags];
		});
		this.add_tags(_pipeid, resp_tags);
		this.send(info, req_tags);
		this.unreg(_pipeid);
		return _rslt;
	}
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
		var vargs = Array.prototype.slice.call(arguments, 1);
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
			return $('.' + this._class + '_' + name, this.element);
	};
	comp_base.prototype.find_conf = function(name, conf) {
		if(conf == undefined) conf = this._conf_intf;
		if(conf.name == name) return conf;
		if(conf.hasOwnProperty('chld')) {
			for(var i = 0; i < conf.chld.length; i++) {
				var rslt = this.find_conf(name, conf.chld[i]);
				if(rslt) return rslt;
			}
		}
	}
	comp_base.prototype.cr_elem = function(conf, phase) {
		var class_name = this._class + '_' + conf.name;
		var element;
		if(conf.hasOwnProperty('nspc'))
			element = $(document.createElementNS(conf.nspc, conf.elem));
		else
			element = $('<' + conf.elem + '>');
		element.addClass(class_name);
		if(conf.hasOwnProperty('text'))
			element.text(conf.text);
		if(conf.hasOwnProperty('clas')) {
			element.addClass(conf.clas);
		}
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
				element.append(this.cr_elem(conf.chld[i], phase));
			}
		}
		if(conf.hasOwnProperty('phas')) {
			if(phase != conf.phas) return undefined;
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
				"elem": "p",
				"phas": "manual",
				"styl": {
					"color": "grey",
				},
			}, {
				"name": "font_net",
				"elem": "p",
				"phas": "manual",
				"styl": {
					"color": "red",
				},
			}, {
				"name": "font_self",
				"elem": "p",
				"phas": "manual",
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
		"console_info": "font_sys",
		"peer_connect_info": "font_sys",
		"peerrecv_chat": "font_net",
		"peersend_chat": "font_self",
	};
	comp_chat.prototype._init = function() {
		var _this = this;
		this.pipe.reg(function(){_this.recv_cb.apply(_this, arguments)}, 'chat_pipe');
		this.pipe.add_tags('chat_pipe', Object.keys(this._tag2font));
		$('#chat_sendbox', this.element).submit(function(e) {
			e.preventDefault();
			var msg = $('#chat_input', _this.element).val();
			if(!msg) return;
			_this.send(msg);
			$('#chat_input', _this.element).val('');
			$('#chat_input', _this.element).focus();
		});
	}
	comp_chat.prototype.scroll_to_bottom = function() {
		var d = $("#chat_console", this.element);
		var b = d[0].scrollHeight - d.height();
		if(d.scrollTop() < b)
			//d.animate({ scrollTop: b}, 200);
			d.scrollTop(b);
	};
	comp_chat.prototype.print = function(info, font) {
		var d = $("#chat_console", this.element);
		var scrl2bot = false;
		if(d.scrollTop() == d[0].scrollHeight - d.height()) scrl2bot = true;
		d.append(
			this.to_elem(font, $('<p>'))
			/*this.cr_elem(this.find_conf(font), 'manual')*/
			.text(info.toString())
		);
		if(scrl2bot) this.scroll_to_bottom();
	}
	comp_chat.prototype.send = function(msg) {
		this.pipe.send(msg, ['peersend_chat', 'peer_send', 'peerid_all']);
	};
	comp_chat.prototype.recv_cb = function(info, tags) {
		this.print(info, this._tag2font[tags[0]]);
	};
	return comp_chat;
})(comp_base);

var comp_chat_2 = (function(_super) {
	__extends(comp_chat_2, _super);
	function comp_chat_2(sheet, pipe) {
		_super.call(this, sheet, pipe);
		this.username = undefined;
	}
	comp_chat_2.prototype.send = function(msg) {
		if(!this.username)
			this.username = this.pipe.quick({"cmd":"username"}, 'peer_cmd', 'peer_cmd_result')[0];
		this.pipe.send({
			"username": this.username,
			"msg": msg,
		}, ['peersend_chat', 'peer_send', 'peerid_all']);
	};
	comp_chat_2.prototype.recv_cb = function(info, tags) {
		if(this._tag2font[tags[0]] != 'font_sys')
			info = info.username + ': ' + info.msg;
		this.print(info, this._tag2font[tags[0]]);
	};
	return comp_chat_2;
})(comp_chat);

var comp_peer = (function(_super) {
	__extends(comp_peer, _super);
	function comp_peer(sheet, pipe) {
		_super.call(this, sheet);
		this.pipe = pipe;
		this._init();
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
				"text": "Username :"
			}, {
				"name": "setting_input",
				"elem": "input",
				"attr": {
					"id": "peer_username",
					"value": "Player",
				},
			}, {
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
				"name": "setting_input",
				"elem": "input",
				"attr": {
					"id": "peer_dest_id",
				},
			}, {
				"name": "connect_button",
				"elem": "input",
				"attr": {
					"id": "peer_connect",
					"type": "button",
					"value": "connect",
					"disabled": "disabled",
				},
			}]
		}]
	};
	comp_peer.prototype._init = function() {
		this._lock_cb = null;
		this.conns = {};
		this.peer = new Peer({
			key: '9lay1kbtfpvf5hfr',
			debug: 3,
			logFunction: (function() {
				var copy = Array.prototype.slice.call(arguments).join(' ');
				this.pipe.send(copy, 'peer_debug_info');
			}).bind(this),
			config: {'iceServers': [
				{
					"url": "stun:stun.stunprotocol.org:3478"
				}, {
					"url": "turn:numb.viagenie.ca:3478",
					"username": "bsod123456@gmail.com",
					"credential": "111111",
				},
			]}
		});
		this.peer.on('open', (function(id) {
			this.peer_id = id;
			$('#peer_host_id', this.element).text(id);
			$('#peer_connect').removeAttr('disabled');
		}).bind(this));
		this.peer.on('error', this._error);
		this.peer.on('connection', (function(c) {
			c.on('open', (function() {
				if(this._lock_cb) {
					c.close();
					return;
				}
				this._connect(c);
				this.send_token(c, 'rename', this.peer_id, this.username());
			}).bind(this));
		}).bind(this));
		$('#peer_connect', this.element).click((function() {
			var peer_id = $('#peer_dest_id', this.element).val();
			var username = this.username();
			if(this.conns.hasOwnProperty(peer_id)) return;
			var c = this.peer.connect(peer_id, {
				"metadata": username,
				"serialization": "json",
			});
			c.on('open', (function() {
				this._connect(c);
			}).bind(this));
		}).bind(this));
		this.pipe.reg(this._send.bind(this), 'peer_pipe');
		this.pipe.add_tags('peer_pipe', 'peer_send');
		this.pipe.reg(this._token_cb.bind(this), 'peer_cmd_pipe');
		this.pipe.add_tags('peer_cmd_pipe', 'peer_cmd');
	};
	comp_peer.prototype.pids = function() {
		return Object.keys(this.conns);
	};
	comp_peer.prototype.username = function(pid) {
		if(pid) {
			return this.conns[pid].username;
		} else {
			return $('#peer_username', this.element).attr('readonly', 'readonly').val();
		}
	};
	comp_peer.prototype._connect = function(c) {
		var peer_id = c.peer;
		if(this.conns.hasOwnProperty(peer_id)) return this._error('duplicate connection');
		var username = c.metadata;
		c.on('data', this._recv.bind(this));
		c.on('close', (function() {
			this._close(peer_id);
		}).bind(this));
		c.on('error', this._error);
		var conn_elem = this.to_elem('connect_button', $('<input>')).attr({
			"type": "button",
			"value": username,
		}).data({
			"peer_id": peer_id,
			"connect": c
		}).click(function() {
			$(this).data().connect.close();
		});
		$('#peer_dest_id', this.element).before(conn_elem);
		$('#peer_dest_id', this.element).val('');
		this.conns[peer_id] = {
			"username": username,
			"connect": c,
			"element": conn_elem,
		};
		this.pipe.send('connected to ' + peer_id, 'peer_connect_info');
	};
	comp_peer.prototype._send = function(info, pure_tags, tags) {
		var pids = [];
		var pids_scan = true;
		tags.splice(tags.indexOf('peer_send'), 1);
		for(var i = 0; i < tags.length; i++) {
			var _tagcheck = tags[i].split('_');
			if(pids_scan && _tagcheck[0] == 'peerid') {
				tags.splice(i--, 1);
				if(_tagcheck[1] == 'all') {
					pids = Object.keys(this.conns);
					pids_scan = false;
				} else {
					pids.push(_tagcheck[1]);
				}
			} else if(_tagcheck[0] == 'peersend') {
				_tagcheck[0] = 'peerrecv';
				tags[i] = _tagcheck.join('_');
			}
		}
		var data = {
			"tags": tags,
			"payload": info,
		};
		for(var i = 0; i < pids.length; i++) {
			var conn = this.conns[pids[i]];
			conn.connect.send(data);
		}
	};
	comp_peer.prototype._recv = function(data) {
		var tags = data.tags;
		if(tags == '__token__') return this._token(data.payload);
		tags.push('peer_recv');
		this.pipe.send(data.payload, tags);
	};
	comp_peer.prototype.send_token = function() {
		var c = arguments[0];
		var cmd = arguments[1];
		var vargs = Array.prototype.slice.call(arguments, 2);
		var data = {
			"cmd": cmd,
			"args": vargs,
		};
		c.send({
			"tags": '__token__',
			"payload": data,
		});
	};
	comp_peer.prototype._token = function(data) {
		var rslt;
		switch(data.cmd) {
			case 'rename':
				/* rename: peer_id, username */
				this.conns[data.args[0]].username = data.args[1];
				this.conns[data.args[0]].element.attr('value', data.args[1]);
				break;
			case 'username':
				rslt = this.username();
				break;
			case 'unlock':
				this._lock_cb = null;
				$('#peer_connect', this.element).removeAttr('disabled');
				break;
			case 'lock':
				/* lock: [callback] */
				/* callback: peer_id -> false/true (unlock/not)*/
				if(data.args && data.args[0])
					this._lock_cb = data.args[0];
				else
					this._lock_cb = function(){};
				$('#peer_connect', this.element).attr('disabled', 'disabled');
			case 'peers':
				rslt = {};
				rslt.peers = {};
				rslt.pid = this.peer_id;
				rslt.peers[this.peer_id] = this.username();
				rslt.cnt = 1;
				for(var pid in this.conns) {
					rslt.peers[pid] = this.conns[pid].username;
					rslt.cnt++;
				}
				break;
			case 'count':
				rslt = Object.keys(this.conns).length + 1;
				break;
			default:
				break;
		}
		return rslt;
	};
	comp_peer.prototype._token_cb = function(info, pure_tags, all_tags) {
		this.pipe.send(this._token(info), 'peer_cmd_result');
	};
	comp_peer.prototype._close = function(peer_id) {
		var username = this.conns[peer_id].username;
		this.conns[peer_id].element.remove();
		delete this.conns[peer_id];
		this.pipe.send('disconnected to ' + username + ': ' + peer_id, 'peer_connect_info');
		if(this._lock_cb) {
			if(!this._lock_cb(peer_id)) {
				this._lock_cb = null;
				$('#peer_connect', this.element).removeAttr('disabled');
			}
		}
	};
	comp_peer.prototype._error = function(err) {
		alert(err);
		//console.log('Error', this, err);
	};
	return comp_peer;
})(comp_base);

var t;
$(document).ready(function() {
	console.log('ready');
	var sht = new style_sheet();
	var pipe = new pipe_net();
	var obj1 = new comp_peer(sht, pipe);
	var obj2 = new comp_chat_2(sht, pipe);
	var obj3 = new game_go(sht, pipe);
	$('body').append(obj1.element).append(obj2.element.css('float', 'right')).append(obj3.element);
	console.log('done');
	t = obj3;
});

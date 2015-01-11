
var game_go = (function(_super) {
	__extends(game_go, _super);
	function game_go(sheet, pipe) {
		_super.call(this, sheet);
		this.pipe = pipe;
		$('#chessboard', this.element).click( (function() {
			$('#chessboard')
				//.append(this.cr_elem(this.find_conf('g_point'), 'manual'))
				.append(this.svg_use('go_g_point').attr({
					'x': '0',
					'y': '0',
					'width': '55',
					'height': '70',
				})).attr('width', '900');
		}).bind(this));
	}
	var svgns = "http://www.w3.org/2000/svg";
	game_go.prototype._class = 'game_go';
	game_go.prototype._conf_intf = {
		"name": "form",
		"elem": "div",
		"chld": [{
			"name": "chess_panel",
			"elem": "div",
			"styl": {
				"float": "left"
			},
			"chld": [{
				"name": "chessboard",
				"elem": "svg",
				"nspc": svgns,
				"attr": {
					"id": "chessboard",
					"width": "1000",
					"height": "1000",
					"version": "1.1",
				},
				"chld": [{
					"name": "g_point",
					"elem": "symbol",
					"nspc": svgns,
					"attr": {
						"id": "go_g_point",
						"viewBox": "0 0 100 100",
					},
					"chld": [{
						"name": "g_line_1",
						"elem": "line",
						"nspc": svgns,
						"attr": {
							"x1": "0",
							"y1": "50",
							"x2": "100",
							"y2": "50",
							"stroke": "black",
							"stroke-width": "2",
						},
					}, {
						"name": "g_line_2",
						"elem": "line",
						"nspc": svgns,
						"attr": {
							"x1": "50",
							"y1": "0",
							"x2": "50",
							"y2": "100",
							"stroke": "black",
							"stroke-width": "2",
						},
					}, {
						"name": "g_cir",
						"elem": "circle",
						"nspc": svgns,
						"attr": {
							"cx": "50",
							"cy": "50",
							"r": "49",
							"stroke": "black",
							"stroke-width": "2",
							"fill-opacity": "0",
						},
					}],
				}],
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
	game_go.prototype.sprite = {
		"point": {
			
		},
	};
	game_go.prototype.svg_use = function(id) {
		var svgns = "http://www.w3.org/2000/svg";
		var xlinkns = "http://www.w3.org/1999/xlink";
		var elem = document.createElementNS(svgns, 'use');
		elem.setAttributeNS(xlinkns, 'href', '#' + id);
		return $(elem);
	};
	return game_go;
})(comp_base);

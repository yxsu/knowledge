/**
 * 
 */
 
Schema.addCategory({
	name: "uml_common",
	text: "UML Common",
	dataAttributes: []
});

/**
 * Package
 */
Schema.addShape({
	name: "package",
	title: "Package",
	category: "uml_common",
	props: {
		w: 210,
		h: 150
	},
	fontStyle: {bold: true, textAlign: "left"},
	textBlock: [
		{position: {x: "10", y: "0", w: "w*0.7-10", h: "25"}, text: "Package"},
		{position: {x: "10", y: "30", w: "w-20", h: "h-35"}, text: "Attribute", fontStyle: {bold: false}}
	],
	path: [
		{
			actions: [
				{action: "move", x: "0", y: "25"},
				{action: "line", x: "w-4", y: "25"},
				{action: "quadraticCurve", x1: "w", y1: "25", x: "w", y: "29"},
				{action: "line", x: "w", y: "h-4"},
				{action: "quadraticCurve", x1: "w", y1: "h", x: "w-4", y: "h"},
				{action: "line", x: "4", y: "h"},
				{action: "quadraticCurve", x1: "0", y1: "h", x: "0", y: "h-4"},
				{action: "close"}
			]
		},
		{
			actions: [
				{action: "move", x: "0", y: "4"},
				{action: "quadraticCurve", x1: "0", y1: "0", x: "4", y: "0"},
				{action: "line", x: "w*0.7-4", y: "0"},
				{action: "quadraticCurve", x1: "w*0.7", y1: "0", x: "w*0.7+3", y: "3"},
				{action: "line", x: "w*0.76", y: "25"},
				{action: "line", x: "0", y: "25"},
				{action: "close"}
			]
		},
		{
			fillStyle: {type: "none"},
			lineStyle: {lineWidth: 0},
			actions: [
				{action: "move", x: "0", y: "0"},
				{action: "line", x: "w*0.7", y: "0"},
				{action: "line", x: "w*0.76", y: "25"},
				{action: "line", x: "w", y: "25"},
				{action: "line", x: "w", y: "h"},
				{action: "line", x: "0", y: "h"},
				{action: "close"}
			]
		}
	],
	drawIcon: function(w, h){
		return [
			{
				actions: [
					{action: "move", x: 0, y: 2},
					{action: "quadraticCurve", x1: 0, y1: 0, x: 2, y: 0},
					{action: "line", x: w*0.7-1.5, y: 0},
					{action: "quadraticCurve", x1: w*0.7, y1: 0, x: w*0.7+1, y: 1.5},
					{action: "line", x: w*0.76, y: h*0.22},
					{action: "line", x: w-2, y: h*0.22},
					{action: "quadraticCurve", x1: w, y1: h*0.22, x: w, y: h*0.22+2},
					{action: "line", x: w, y: h-2},
					{action: "quadraticCurve", x1: w, y1: h, x: w-2, y: h},
					{action: "line", x: 2, y: h},
					{action: "quadraticCurve", x1: 0, y1: h, x: 0, y: h-2},
					{action: "close"}
				]
			},
			{
				actions: [
					{action: "move", x: 0, y: h*0.22},
					{action: "line", x: w-2, y: h*0.22}
				]
			}
		];
	}
});

/**
 * Combined Fragment
 */
Schema.addShape({
	name: "combinedFragment",
	title: "Combined Fragment",
	category: "uml_common",
	props: {
		w: 400,
		h: 280
	},
	fontStyle: {textAlign: "left", vAlign: "top"},
	textBlock: [
		{position: {x: "10", y: "30", w: "w-20", h: "h-35"}, text: "[Condition]"},
		{position: {x: "10", y: "0", w: "w*0.3-10", h: "25"}, text: "Opt | Alt | Loop ", fontStyle: {vAlign: "middle"}}
	],
	path: [
		{
			actions: {ref: "roundRectangle"}
		},
		{
			actions: [
				{action: "move", x: "0", y: "25"},
				{action: "line", x: "w*0.3", y: "25"},
				{action: "line", x: "w*0.3+8", y: "17"},
				{action: "line", x: "w*0.3+8", y: "0"},
			]
		},
		{
			fillStyle: {type: "none"},
			lineStyle: {lineWidth: 0},
			actions: {ref: "rectangle"}
		}
	],
	drawIcon: function(w, h){
		return [
			{
				actions: [
					{action: "move", x: 0, y: 2},
					{action: "quadraticCurve", x1: 0, y1: 0, x: 2, y: 0},
					{action: "line", x: w-2, y: 0},
					{action: "quadraticCurve", x1: w, y1: 0, x: w, y: 2},
					{action: "line", x: w, y: h-2},
					{action: "quadraticCurve", x1: w, y1: h, x: w-2, y: h},
					{action: "line", x: 2, y: h},
					{action: "quadraticCurve", x1: 0, y1: h, x: 0, y: h-2},
					{action: "line", x: 0, y: 2},
					{action: "close"}
				]
			},
			{
				actions: [
					{action: "move", x: 0, y: h*0.22},
					{action: "line", x: w*0.4, y: h*0.22},
					{action: "line", x: w*0.45, y: h*0.16},
					{action: "line", x: w*0.45, y: 0},
				]
			}
		];
	}
});

/**
 * 6. Note
 */
Schema.addShape({
	name: "umlNote",
	title: "Note",
	category: "uml_common",
	attribute: {
		linkable: false
	},
	props: {
		w: 100,
		h: 70
	},
	anchors: [],
	textBlock: [{position: {x: "w*0.1", y: "h*0.1", w: "w*0.8", h: "h*0.8"}}],
	path: [
		{
			actions: [
			    {action: "move", x: "0", y: "0"},
				{action: "line", x: "w-16", y: "0"},
				{action: "line", x: "w", y: "16"},
				{action: "line", x: "w", y: "h"},
				{action: "line", x: "0", y: "h"},
				{action: "line", x: "0", y: "0"},
				{action: "close"}
			]
		},
		{
			actions: [
				{action: "move", x: "w-16", y: "0"},
				{action: "line", x: "w-16", y: "16"},
				{action: "line", x: "w", y: "16"}
			]
		},
		{
			fillStyle: {
				type: "none"
			},
			actions: [
				{action: "move", x: "0", y: "0"},
				{action: "line", x: "w-16", y: "0"},
				{action: "line", x: "w", y: "16"},
				{action: "line", x: "w", y: "h"},
				{action: "line", x: "0", y: "h"},
				{action: "line", x: "0", y: "0"},
				{action: "close"}
			]
		}
	],
	drawIcon: function(w, h){
		return [
			{
				actions: [
				    {action: "move", x: 0, y: 0},
					{action: "line", x: w*0.7, y: 0},
					{action: "line", x: w, y: h*0.2},
					{action: "line", x: w, y: h},
					{action: "line", x: 0, y: h},
					{action: "line", x: 0, y: 0},
					{action: "close"}
				]
			}
			,
			{
				actions: [
					{action: "move", x: w*0.7, y: 0},
					{action: "line", x: w*0.7, y: h*0.2},
					{action: "line", x: w, y: h*0.2}
				]
			},
			{
				fillStyle: {
					type: "none"
				},
				actions: [
					{action: "move", x: 0, y: 0},
					{action: "line", x: w*0.7, y: 0},
					{action: "line", x: w, y: h*0.2},
					{action: "line", x: w, y: h},
					{action: "line", x: 0, y: h},
					{action: "line", x: 0, y: 0},
					{action: "close"}
				]
			}
		];
	}
});
/**
 * Text
 */
Schema.addShape({
	name: "umlText",
	title: "Text",
	category: "uml_common",
	attribute: {
		linkable: false
	},
	props: {
		w: 160,
		h: 40
	},
	anchors: [],
	textBlock: [{position: {x: 0, y: 0, w: "w", h: "h"}, text: "Text"}],
	path: [
		{
			lineStyle: {lineWidth: 0},
			fillStyle: {
				type: "none"
			},
			actions: {ref: "rectangle"}
		}
	],
	drawIcon: function(w, h){
		var x = 0;
		var y = -6;
		h = h + 12;
		return [
			{
				lineStyle: {lineWidth: 2},
				fillStyle: {
					type: "solid",
					color: "50, 50, 50"
				},
				actions: [
				    {action: "move", x: x, y: y},
					{action: "line", x: w, y: y},
					{action: "line", x: w, y: y+h*0.2},
					{action: "line", x: w*0.9, y: y+h*0.12},
					{action: "line", x: w*0.55, y: y+h*0.12},
					{action: "line", x: w*0.55, y: y+h*0.85},
					{action: "line", x: w*0.63, y: y+h},
					{action: "line", x: w*0.37, y: y+h},
					{action: "line", x: w*0.45, y: y+h*0.85},
					{action: "line", x: w*0.45, y: y+h*0.12},
					{action: "line", x: w*0.1, y: y+h*0.12},
					{action: "line", x: 0, y: y+h*0.20},
					{action: "close"}
				]
			}
		];
	}
});

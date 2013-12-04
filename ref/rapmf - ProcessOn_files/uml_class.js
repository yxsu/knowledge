/**
 *UML Class 9 diagram
 *Class | Active Class | Simple Class | Interface | Simple Interface | Multiplicity | Package | Constraint | Node 
 */
Schema.addCategory({
	name: "uml_class",
	text: "UML Class",
	dataAttributes: []
});
/**
 * Class类图
 */
Schema.addShape({
	name: "cls",
	title: "Class",
	category: "uml_class",
	props: {
		w: 210,
		h: 150
	},
	fontStyle: {bold: true},
	textBlock: [
		{position: {x: "10", y: "0", w: "w-20", h: "30"}, text: "Class"},
		{position: {x: "10", y: "35", w: "w-20", h: "(h-50)/2"}, text: "+ attribute1:type = defaultValue\n+ attribute2:type\n- attribute3:type", fontStyle: {textAlign: "left", bold: false}},
		{position: {x: "10", y: "h/2+20", w: "w-20", h: "(h-50)/2"}, text: "+ operation1(params):returnType\n- operation2(params)\n- operation3()", fontStyle: {textAlign: "left", bold: false}}
	],
	path: [
		{
			actions: {ref: "roundRectangle"}
		},
		{
			fillStyle: {type: "none"},
			actions: [
				{action: "move", x: "0", y: 30},
				{action: "line", x: "w", y: 30},
				{action: "move", x: "0", y: "h/2+15"},
				{action: "line", x: "w", y: "h/2+15"}
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
					{action: "line", x: w, y: h*0.22},
					{action: "move", x: 0, y: h*0.55},
					{action: "line", x: w, y: h*0.55}
				]
			}
		];
	}
});

/**
 * 1. Simple Class
 */
Schema.addShape({
	name: "simpleClass",
	title: "Simple Class",
	category: "uml_class",
	props: {
		w: 100,
		h: 70
	},
	path: [
		{
			actions: {ref: "roundRectangle"}
		}
	]
});	
/**
 * 3. Active Class
 */
Schema.addShape({
	name: "activeClass",
	title: "Active Class",
	category: "uml_class",
	props: {
		w: 100,
		h: 70
	},
	textBlock: [{position: {x: "Math.min(w/6,20)", y: "0", w: "w-Math.min(w/6,20)*2", h: "h"}}],
	path: [
		{
			actions: [
				{action: "move", x: "0", y: "4"},
				{action: "quadraticCurve", x1: "0", y1: "0", x: "4", y: "0"},
				{action: "line", x: "w-4", y: "0"},
				{action: "quadraticCurve", x1: "w", y1: "0", x: "w", y: "4"},
				{action: "line", x: "w", y: "h-4"},
				{action: "quadraticCurve", x1: "w", y1: "h", x: "w-4", y: "h"},
				{action: "line", x: "4", y: "h"},
				{action: "quadraticCurve", x1: "0", y1: "h", x: "0", y: "h-4"},
				{action: "line", x: "0", y: "4"},
				{action: "close"},
				{action: "move", x: "Math.min(w/6,20)", y: "0"},
				{action: "line", x: "Math.min(w/6,20)", y: "h"},
				{action: "move", x: "w- Math.min(w/6,20)", y: "0"},
				{action: "line", x: "w- Math.min(w/6,20)", y: "h"}  
			]
		}
	],
	drawIcon: function(w, h){
		return [
			{
					actions: [
						{action: "move", x: 0, y:4},
						{action: "quadraticCurve", x1: 0, y1: 0, x: 4, y: 0},
						{action: "line", x: w-4, y: 0},
						{action: "quadraticCurve", x1: w, y1: 0, x: w, y: 4},
						{action: "line", x: w, y: h-4},
						{action: "quadraticCurve", x1: w, y1: h, x: w-4, y: h},
						{action: "line", x: 4, y: h},
						{action: "quadraticCurve", x1: 0, y1: h, x: 0, y: h-4},
						{action: "line", x: 0, y: 4},
						{action: "close"},
						{action: "move", x: w/7+3, y: 0},
						{action: "line", x: w/7+3, y: h},
						{action: "move", x: w- w/7 -3, y: 0},
						{action: "line", x: w- w/7-3, y: h} 
					]
			}
		];
		
	}
});
/**
 * 2. Multiplicty Class
 */
Schema.addShape({
	name: "multiplictyClass",
	title: "Multiplicty Class",
	category: "uml_class",
	props: {
		w:100,
		h:  70
	},
	textBlock: [{position: {x: "Math.min(w/6,20)-4", y: "8", w: "w-Math.min(w/6,20)*2", h: "h-8"}}],
	anchors: [{x:"0",y:"(w-16)*0.5"},{x:"w*0.5",y:"0"},{x:"w",y:"h*0.5"},{x:"w*0.5",y:"h"}],
	path: [
		{
			actions: [
				{action: "move", x: "8", y: "8"},
				{action: "quadraticCurve", x1: "8", y1: "0", x: "16", y: "0"},
				{action: "line", x: "w-8", y: "0"},
				{action: "quadraticCurve", x1: "w", y1: "0", x: "w", y: "8"},
				{action: "line", x: "w", y: "h-16"},
				{action: "quadraticCurve", x1: "w", y1: "h-8", x: "w-8", y: "h-8"},
				{action: "line", x: "w-8", y: "h-8"}
			]
		},
		{
			actions:[
				{action: "move", x: "0", y: "16"},
				{action: "quadraticCurve", x1: "0", y1: "8", x: "8", y: "8"},
				{action: "line", x: "w-16", y: "8"},
				{action: "quadraticCurve", x1: "w-8", y1: "8", x: "w-8", y: "16"},
				{action: "line", x: "w-8", y: "h-8"},
				{action: "quadraticCurve", x1: "w-8", y1: "h", x: "w-16", y: "h"},
				{action: "line", x: "8", y: "h"},
				{action: "quadraticCurve", x1: "0", y1: "h", x: "0", y: "h-8"},
				{action: "line", x: "0", y: "16"},
				{action:"close"}
			]
		},
		{
			lineStyle: {
				lineWidth: 0
			},
			fillStyle: {type: "none"},
			actions: {ref: "roundRectangle"}
		}
	],
	drawIcon: function(w, h){
		return [
			{
				actions: [
					{action: "move", x: 4, y: 4},
					{action: "quadraticCurve", x1: 4, y1: 0, x: 8, y: 0},
					{action: "line", x: w-4, y: 0},
					{action: "quadraticCurve", x1: w, y1: 0, x: w, y: 4},
					{action: "line", x:w, y: h-8},
					{action: "quadraticCurve", x1: w, y1: h-4, x: w-2, y: h-4},
					{action: "line", x: w-4, y: h-4}
				]
			 },
			{
				actions:[
					{action: "move", x: 0, y: 8},
					{action: "quadraticCurve", x1: 0, y1: 4, x: 4, y: 4},
					{action: "line", x: w-8, y: 4},
					{action: "quadraticCurve", x1: w-4, y1: 4, x: w-4, y: 8},
					{action: "line", x: w-4, y: h-4},
					{action: "quadraticCurve", x1: w-4, y1: h, x: w-8, y: h},
					{action: "line", x: 4, y: h},
					{action: "quadraticCurve", x1: 0, y1: h, x: 0, y: h-4},
					{action: "line", x: 0, y: 8},
					{action:"close"}
				]
			},
			{
				lineStyle: {
					lineWidth: 0
				},
				fillStyle: {type: "none"},
				actions: {ref: "roundRectangle"}
			}
		];
		
	}
});	

/**
 * Interface接口
 */
Schema.addShape({
	name: "interface",
	title: "Interface",
	category: "uml_class",
	props: {
		w: 210,
		h: 150
	},
	fontStyle: {bold: true},
	textBlock: [
		{position: {x: "10", y: "0", w: "w-20", h: "30"}, text: "Interface"},
		{position: {x: "10", y: "35", w: "w-20", h: "h-40"}, text: "+ operation1(params):returnType\n- operation2(params)\n- operation3()", fontStyle: {textAlign: "left", bold: false}}
	],
	path: [
		{
			actions: {ref: "roundRectangle"}
		},
		{
			fillStyle: {type: "none"},
			actions: [
				{action: "move", x: "0", y: 30},
				{action: "line", x: "w", y: 30}
				
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
					{action: "line", x: w, y: h*0.22}
				]
			}
		];
	}
});

/**
 * 4. Simple Interface
 */
Schema.addShape({
	name: "simpleInterface",
	title: "Simple Interface",
	category: "uml_class",
	props: {
		w: 110,
		h: 140
	},
	path: [
		{
			actions: {ref: "roundRectangle"}
		}
	]
});	
/**
*5. Class Constraint
*/
Schema.addShape({
	name: "constraint",
	title: "Constraint",
	category: "uml_class",
	attribute: {
		linkable: false
	},
	props: {
		w: 110,
		h: 70
	},
	textBlock: [{position: {x: "w*0.1", y: "0", w: "w*0.8", h: "h"}}],
	anchors: [{x: "w", y: "h*0.5"}, {x: "0", y: "h*0.5"}],
	path: [
		{
			fillStyle: {
				type: "none"
			},
			actions: [
				{action: "move", x: "Math.min(w*0.2,18)", y: "0"},
				{action: "quadraticCurve", x1: "Math.min(w*0.1,9)", y1: "0", x: "Math.min(w*0.1,9)", y: "Math.min(h*0.1,9)"},
				{action: "line", x: "Math.min(w*0.1,9)", y: "h*0.5-Math.min(h*0.1,9)"},
				{action: "quadraticCurve", x1: "Math.min(w*0.1,9)", y1: "h*0.5", x: "0", y: "h*0.5"},
				{action: "quadraticCurve", x1: "Math.min(w*0.1,9)", y1: "h*0.5", x: "Math.min(w*0.1,9)", y: "h*0.5+Math.min(h*0.1,9)"},
				{action: "line", x: "Math.min(w*0.1,9)", y: "h-Math.min(h*0.1,9)"},
				{action: "quadraticCurve", x1: "Math.min(w*0.1,9)", y1: "h", x: "Math.min(w*0.2,18)", y: "h"}
			]
		},
		{
			fillStyle: {
				type: "none"
			},
			actions: [
				{action: "move", x: "w-Math.min(w*0.2,18)", y: "h"},
				{action: "quadraticCurve", x1: "w-Math.min(w*0.1,9)", y1: "h", x: "w-Math.min(w*0.1,9)", y: "h-Math.min(h*0.1,9)"},
				{action: "line", x: "w-Math.min(w*0.1,9)", y: "h*0.5+Math.min(h*0.1,9)"},
				{action: "quadraticCurve", x1: "w-Math.min(w*0.1,9)", y1: "h*0.5", x: "w", y: "h*0.5"},
				{action: "quadraticCurve", x1: "w-Math.min(w*0.1,9)", y1: "h*0.5", x: "w-Math.min(w*0.1,9)", y: "h*0.5-Math.min(h*0.1,9)"},
				{action: "line", x: "w-Math.min(w*0.1,9)", y: "Math.min(h*0.1,9)"},
				{action: "quadraticCurve", x1: "w-Math.min(w*0.1,9)", y1: "0", x: "w-Math.min(w*0.2,18)", y: "0"}
			]
		},
		{
			lineStyle: {
				lineWidth: 0
			},
			fillStyle: {type: "none"},
			actions: {ref: "rectangle"}
		}
	]
});

/**
 * 16. Port
 */
Schema.addShape({
	name: "port",
	title: "Port",
	category: "uml_class",
	props: {
		w: 20,
		h: 20
	},
	resizeDir: [],
	attribute: {
		linkable: false
	},
	textBlock: [],
	path: [
		{
			actions: {ref: "rectangle"}
		}
	]
});
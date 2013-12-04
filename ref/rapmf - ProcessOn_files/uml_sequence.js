/**
 * UML Sequence 11 diagram
 * Object | Activiation | Delation | Node | Package | Constraint | Option Loop | 
 * Alternative | Entity | Boundary | Control | Dispose Point | Time Signal
 */
Schema.addCategory({
	name: "uml_sequence",
	text: "UML Sequence",
	dataAttributes: []
});

/**
 * 1. Sequence UML Object
 */
Schema.addShape({
	name: "sequenceObject",
	title: "UML Object",
	category: "uml_sequence",
	props: {
		w: 100,
		h: 70
	},
	path: [
		{
			actions: {ref: "rectangle"}
		}
	]
});
/**
 * 5. Sequence Entity
 */
Schema.addShape({
	name: "sequenceEntity",
	title: "Entity",
	category: "uml_sequence",
	props: {
		w: 40,
		h: 40
	},
	textBlock: [{position: {x: "-20", y: "h", w: "w+40", h: "30"}}],
	path: [
		{
			actions:[
				{action: "move", x: "0", y: "h*(1/2)"},
			    {action: "curve", x1: "0", y1: "-h*(1/6)", x2: "w", y2: "-h*(1/6)", x: "w", y: "h*(1/2)"},
			    {action: "curve", x1: "w", y1: "h*(7/6)", x2: "0", y2: "h*(7/6)", x: "0", y: "h*(1/2)"},
			    {action: 'close'},
			    {action:"move",x:"0",y:"h"},
				{action:"line",x:"w",y:"h"}
			]
		}
	]
});
/**
 * 6. Sequence Control
 */
Schema.addShape({
	name: "sequenceControl",
	title: "Control",
	category: "uml_sequence",
	props: {
		w: 40,
		h: 40
	},
	textBlock: [{position: {x: "-20", y: "h", w: "w+40", h: "30"}}],
	path: [
		{
			actions:[
				{action: "move", x: "0", y: "h*(1/2)"},
			    {action: "curve", x1: "0", y1: "-h*(1/6)", x2: "w", y2: "-h*(1/6)", x: "w", y: "h*(1/2)"},
			    {action: "curve", x1: "w", y1: "h*(7/6)", x2: "0", y2: "h*(7/6)", x: "0", y: "h*(1/2)"},
			    {action: 'close'},
			    {action:"move",x:"w*(1/2)",y:"0"},
				{action:"line",x:"w*(1/2)+6",y:"5"},
				{action:"move",x:"w*(1/2)",y:"0"},
				{action:"line",x:"w*(1/2)+6",y:"-5"}
			]
		}
	],
	drawIcon: function(w, h){
		return [
		{
			actions:[
				{action: "move", x: 0, y: h*(1/2)},
			    {action: "curve", x1: 0, y1: -h*(1/6), x2: w, y2: -h*(1/6), x: w, y: h*(1/2)},
			    {action: "curve", x1: w, y1: h*(7/6), x2: 0, y2: h*(7/6), x: 0, y: h*(1/2)},
			    {action: 'close'}
			]
		},
		{
			actions: [
				{action:"move",x:w*(1/2),y:0},
				{action:"line",x:w*(4/6),y:h*(1/12)},
				{action:"move",x:w*(1/2),y:0},
				{action:"line",x:w*(4/6),y:-h*(1/12)}
			]
		},
		{
			lineStyle: {
				lineWidth: 0
			},
			fillStyle: {type: "none"},
			actions: {ref: "rectangle"}
		}
		];
	}
});


/**
 * 4. Sequence Boundary
 */
Schema.addShape({
	name: "sequenceBoundary",
	title: "Boundary",
	category: "uml_sequence",
	props: {
		w: 50,
		h: 40
	},
	textBlock: [{position: {x: "-20", y: "h", w: "w+40", h: "30"}}],
	path: [
		{
			actions:[
				{action: "move", x: "w*(1/5)", y: "h*(1/2)"},
			    {action: "curve", x1: "w*(1/5)", y1: "-h*(1/6)", x2: "w", y2: "-h*(1/6)", x: "w", y: "h*(1/2)"},
			    {action: "curve", x1: "w", y1: "h*(7/6)", x2: "w*(1/5)", y2: "h*(7/6)", x: "w*(1/5)", y: "h*(1/2)"},
			    {action: 'close'},
			    {action:"move",x:"0",y:"0"},
				{action:"line",x:"0",y:"h"},
				{action:"move",x:"0",y:"h*(1/2)"},
				{action:"line",x:"w*(1/5)",y:"h*(1/2)"}
			]
		}
	]
});
/**
 * 9. Timer Signal
 */
Schema.addShape({
	name: "sequenceTimerSignal",
	title: "Timer Signal",
	category: "uml_sequence",
	props: {
		w: 30,
		h: 30
	},
	attribute: {
		linkable: false
	},
	textBlock: [],
	path: [
		{
			actions: [
					{action: "move", x: "0", y: "0"},
					{action: "line", x: "w", y: "0"},
					{action: "line", x: "0", y: "h"},
					{action: "line", x: "w", y: "h"},
					{action: "line", x: "0", y: "0"},
					{action:"close"}
			]
		},
		{
			lineStyle: {
				lineWidth: 0
			},
			fillStyle: {type: "none"},
			actions: {ref: "rectangle"}
		}
	],
	drawIcon: function(w, h){
		return [
		{
			actions: [
					{action: "move", x: 0, y: 5},
					{action: "line", x: w, y: 5},
					{action: "line", x: 0, y: h-5},
					{action: "line", x: w, y: h-5},
					{action: "line", x: 0, y: 5},
					{action:"close"}
			]
		}
		];
	}
});
/**
*2. Sequence Constraint
*/
Schema.addShape({
	name: "sequenceConstraint",
	title: "Constraint",
	category: "uml_sequence",
	attribute: {
		linkable: false
	},
	props: {
		w: 110,
		h: 70
	},
	fillStyle: {
		type: "none"
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
				{action: "quadraticCurve", x1: "Math.min(w*0.1,9)", y1: "h", x: "Math.min(w*0.2,18)", y: "h"}//左边结束
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
				{action: "quadraticCurve", x1: "w-Math.min(w*0.1,9)", y1: "0", x: "w-Math.min(w*0.2,18)", y: "0"}//右边结束
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
 * 8. Activation
 */
Schema.addShape({
	name: "sequenceActivation",
	title: "Activation",
	category: "uml_sequence",
	props: {
		w: 30,
		h: 100
	},
	resizeDir: ["t", "b"],
	anchors: [],
	textBlock: [],
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
					{action: "close"}
			]
		}
	],
	drawIcon: function(w, h){
		w+=6;
		var x = - 3;
		return [
		{
			actions: [
					{action: "move", x: x, y: 4},
					{action: "quadraticCurve", x1:x, y1: 0, x: 0, y: 0},
					{action: "line", x: w-4-3, y: 0},
					{action: "quadraticCurve", x1: w-3, y1: 0, x: w-3, y: 4},
					{action: "line", x: w-3, y: h-4},
					{action: "quadraticCurve", x1: w-3, y1: h, x: w-4-3, y: h},
					{action: "line", x: 0, y: h},
					{action: "quadraticCurve", x1: x, y1: h, x: x, y: h-4},
					{action: "line", x: x, y: 4},
					{action: "close"}
			]
		}
		];
	}
});

/**
 * 9. Life Line
 */
Schema.addShape({
	name: "sequenceLifeLine",
	title: "Life Line",
	category: "uml_sequence",
	props: {
		w: 70,
		h: 140
	},
	attribute: {
		linkable: false
	},
	textBlock: [{position: {x: "10", y: "0", w: "w-20", h: "30"}}],
	anchors: [],
	path: [
		{
			lineStyle: {
				lineWidth: 2,
				lineStyle:"dot"
			},
			fillStyle: {type: "none"},
			actions:[
					{action: "move", x: "w*(1/2)", y: "30"},
					{action: "line", x: "w*(1/2)", y: "h"}
			]
		},
		{
			actions: [
					{action: "move", x: "0", y: "0"},
					{action: "line", x: "w", y: "0"},
					{action: "line", x: "w", y: "30"},
					{action: "line", x: "0", y: "30"},
					{action: "close"}
			]
		}
	],
	drawIcon: function(w, h){
		w+=4;
		return [
				{
					lineStyle: {
						lineWidth: 2,
						lineStyle:"dot"
					},
					actions:[
							{action: "move", x: w/2-1, y:h*0.2},
							{action: "line", x: w/2-1, y: h}		
					]
				},
				{
					actions: [
							{action: "move", x: -6, y: 0},
							{action: "line", x: w+3, y: 0},
							{action: "line", x: w+3, y: h*0.2},
							{action: "line", x: -6, y: h*0.2},
							{action: "close"}
					]
				}
		];
	}
});

/**
 * 7. Deletion
 */
Schema.addShape({
	name: "sequenceDeletion",
	title: "Deletion",
	category: "uml_sequence",
	props: {
		w: 40,
		h: 40
	},
	attribute: {
		linkable: false
	},
	textBlock: [],
	path: [
		{
			lineStyle: {
				lineWidth: 4
			},
			fillStyle: {type: "none"},
			actions: [
				{action:"move",x:"0",y:"0"},
				{action:"line",x:"w",y:"h"},
				{action:"move",x:"w",y:"0"},
				{action:"line",x:"0",y:"h"},				
			]
		},
		{
			lineStyle: {
				lineWidth: 0
			},
			fillStyle: {type: "none"},
			actions: {ref: "rectangle"}
		}
	],
	drawIcon: function(w, h){
		return [
			{
			lineStyle: {
				lineWidth: 4
			},
			actions: [
				{action:"move",x:0,y:0},
				{action:"line",x:w*0.7,y:h*0.7},
				{action:"move",x:w*0.7,y:0},
				{action:"line",x:0,y:h*0.7}
			]
		}
		];
	}
});

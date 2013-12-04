
/**
 * UML State/Activity 17 diagram
 * Option Loop | Start | State | Brance/Merge | Horizontal Fork/Join | 
 * Vertical Fork/Join | Flow Final | Simple History | Detial History| End | 
 * Rectangle Container | Node | Object | Send Signal | Receive Signal |
 * Provided Interface | required Interface
 */
Schema.addCategory({
	name: "uml_stateactivity",
	text: "UML State/Activity",
	dataAttributes: []
});

/**
 * 2. UML Object
 */
Schema.addShape({
	name: "umlObject",
	title: "UML Object",
	category: "uml_stateactivity",
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
 * 8. UML State
 */
Schema.addShape({
	name: "umlState",
	title: "State",
	category: "uml_stateactivity",
	props: {
		w: 100,
		h: 70
	},
	path: [
		{
			actions: [
			  	{action: "move", x: "0", y: "18"},
				{action: "quadraticCurve", x1: "0", y1: "0", x: "18", y: "0"},
				{action: "line", x: "w-18", y: "0"},
				{action: "quadraticCurve", x1: "w", y1: "0", x: "w", y: "18"},
				{action: "line", x: "w", y: "h-18"},
				{action: "quadraticCurve", x1: "w", y1: "h", x: "w-18", y: "h"},
				{action: "line", x: "18", y: "h"},
				{action: "quadraticCurve", x1: "0", y1: "h", x: "0", y: "h-18"},
				{action: "line", x: "0", y: "18"},
				{action: "close"}
			]
		}
	],
	drawIcon: function(w, h){
		return [
				{
					actions: [
					    {action: "move", x: 0, y: 6},
						{action: "quadraticCurve", x1: 0, y1: 0, x: 6, y:0},
						{action: "line", x: w-6, y: 0},
						{action: "quadraticCurve", x1: w, y1: 0, x: w, y: 6},
						{action: "line", x: w, y: h-6},
						{action: "quadraticCurve", x1: w, y1: h, x: w-6, y: h},
						{action: "line", x: 6, y: h},
						{action: "quadraticCurve", x1: 0, y1: h, x: 0, y: h-6},
						{action: "line", x: 0, y: 6},
						{action: "close"}
					]
				}
		];
	}
});
/** 
 * 3. UML Start
 */
Schema.addShape({
	name: "umlStart",
	title: "Start",
	category: "uml_stateactivity",
	props: {
		w: 40,
		h: 40
	},
	textBlock: [{position: {x: "-20", y: "h", w: "w+40", h: "30"}}],
	path: [
		{
			lineStyle: {
				lineWidth: 0,
				lineStyle: "solid"
			},
			fillStyle: {
				type: "solid",
				color: "50,50,50"
			},
			actions: {ref: "round"}
		}
	]
});
/**
 * 4. UML End
 */
Schema.addShape({
	name: "umlEnd",
	title: "End",
	category: "uml_stateactivity",
	props: {
		w: 40,
		h: 40
	},
	textBlock: [{position: {x: "-20", y: "h", w: "w+40", h: "30"}}],
	path: [
		{
			lineStyle: {
				lineWidth: "lineWidth + 2",
				lineStyle: "solid"
			},
			actions: {ref: "round"}
		},
		{
			lineStyle: {
				lineWidth: 0,
				lineStyle: "solid"
			},
			fillStyle: {
				type: "solid",
				color: "50,50,50"
			},
			actions: [
					{action: "move", x: "w*0.5 - w*0.25", y:"h*0.5"},
					{action: "curve", x1: "w*0.5 - w*0.25", y1: "h*0.5 - h*2/3*0.5", x2: "w*0.5 + w*0.25", y2: "h*0.5 - h*2/3*0.5", x: "w*0.5 + w*0.25", y: "h*0.5"},
					{action: "curve", x1: "w*0.5 + w*0.25", y1: "h*0.5 + h*2/3*0.5", x2: "w*0.5 - w*0.25", y2: "h*0.5 + h*2/3*0.5", x: "w*0.5 - w*0.25", y: "h*0.5"},
					{action: "close"}
			]
		},
		{
			lineStyle: {
				lineWidth: 0
			},
			fillStyle: {
				type: "none"
			},
			actions: {ref: "round"}
		}
	]
});
/**
 * 5. Flow Final
 */
Schema.addShape({
	name: "flowFinal",
	title: "Flow Final",
	category: "uml_stateactivity",
	props: {
		w: 40,
		h: 40
	},
	textBlock: [],
	path: [
		{
			actions: {ref: "round"}
		},
		{
			actions:[
				{action:"move",x:"w*(1/6)",y:"h*(1/6)"},
				{action:"line",x:"w*(5/6)",y:"h*(5/6)"},
				{action:"move",x:"w*(5/6)",y:"h*(1/6)"},
				{action:"line",x:"w*(1/6)",y:"h*(5/6)"}
			]
		},
		{
			fillStyle: {
				type: "none"
			},
			lineStyle: {lineWidth: 0},
			actions: {ref: "round"}
		}
		
	]
});
/**
 * 6. Simple History
 */
Schema.addShape({
	name: "simpleHistory",
	title: "History",
	category: "uml_stateactivity",
	props: {
		w: 40,
		h: 40
	},
	textBlock: [],
	path: [
		{
			actions: {ref: "round"}
		},
		{
			actions:[
				{action:"move",x:"w*(1/3)",y:"h*(1/3)"},
				{action:"line",x:"w*(1/3)",y:"h*(2/3)"},
				{action:"move",x:"w*(1/3)",y:"h*(1/2)"},
				{action:"line",x:"w*(2/3)",y:"h*(1/2)"},
				{action:"move",x:"w*(2/3)",y:"h*(1/3)"},
				{action:"line",x:"w*(2/3)",y:"h*(2/3)"}
			]
		},
		{
			fillStyle: {
				type: "none"
			},
			lineStyle: {lineWidth: 0},
			actions: {ref: "round"}
		}
		
	]
});
/**
 * 7. Detial History
 */
Schema.addShape({
	name: "detialHistory ",
	title: "Detail History",
	category: "uml_stateactivity",
	props: {
		w: 40,
		h: 40
	},
	textBlock: [],
	path: [
		{
			actions: {ref: "round"}
		},
		{
			fillStyle: {
				type: "none"
			},
			actions:[
				{action:"move",x:"w*(1/5)+w*(1/80)",y:"h*(1/3)-h*(1/10)"},
				{action:"line",x:"w*(1/5)+w*(1/80)",y:"h*(2/3)+h*(1/10)"},
				{action:"move",x:"w*(1/5)+w*(1/80)",y:"h*(1/2)"},
				{action:"line",x:"w*(1/5)+w*(1/80)+w*(1/5)*(8/9)",y:"h*(1/2)"},
				{action:"move",x:"w*(1/5)+w*(1/80)+w*(1/5)*(8/9)",y:"h*(1/3)-h*(1/10)"},
				{action:"line",x:"w*(1/5)+w*(1/80)+w*(1/5)*(8/9) ",y:"h*(2/3)+h*(1/10)"}
			]
		},
		{
			fillStyle: {
				type: "none"
			},
			actions:[
				{action:"move",x:"w*(1/5)+w*(1/4)",y:"h*(1/3)+h*(1/3)*(1/4)"},
				{action:"line",x:"w*(4/5)",y:"h*(1/3)+h*(1/3)*(3/4)"},
				{action:"move",x:"w*(6/10)+w*(1/40)",y:"h*(1/3)"},
				{action:"line",x:"w*(6/10)+w*(1/40)",y:"h*(2/3)"},
				{action:"move",x:"w*(4/5)",y:"h*(1/3)+h*(1/3)*(1/4)"},
				{action:"line",x:"w*(1/5)+w*(1/4)",y:"h*(1/3)+h*(1/3)*(3/4)"}
			]
		},
		{
			fillStyle: {
				type: "none"
			},
			lineStyle: {lineWidth: 0},
			actions: {ref: "round"}
		}
		
	]
});


/**
 * 11. Send Signal
 */
Schema.addShape({
	name: "sendSignal",
	title: "Send Signal",
	category: "uml_stateactivity",
	props: {
		w: 150,
		h: 70
	},
	textBlock: [{position: {x: "w*0.1", y: "2", w: "(w-Math.min(h/2,w/6))*0.8", h: "h-2"}}],
	path: [
		{
			actions: [
				{action: "move", x: "0", y: "0"},
				{action: "line", x: "w-Math.min(h/2,w/6)", y: "0"},
				{action: "line", x: "w", y: "h*0.5"},
				{action: "line", x: "w-Math.min(h/2,w/6)", y: "h"},
				{action: "line", x: "0", y: "h"},
				{action: "line", x: "0", y: "0"},
				{action: "close"}          
			]
		}
	]
});
/**
 * 12. Receive Signal
 */
Schema.addShape({
	name: "receiveSignal",
	title: "Receive Signal",
	category: "uml_stateactivity",
	props: {
		w: 150,
		h: 70
	},
	textBlock: [{position: {x: "w*0.1", y: "2", w: "(w-Math.min(h/2,w/6))*0.8", h: "h-2"}}],
	path: [
		{
			actions: [
				{action: "move", x: "0", y: "0"},
				{action: "line", x: "w", y: "0"},
				{action: "line", x: "w-Math.min(h/2,w/6)", y: "h*0.5"},
				{action: "line", x: "w", y: "h"},
				{action: "line", x: "0", y: "h"},
				{action: "line", x: "0", y: "0"},
				{action: "close"}          
			]
		}
	]
});
/**
 * 13. Branch/Merge
 */
Schema.addShape({
	name: "branchMerge",
	title: "Branch Merge",
	category: "uml_stateactivity",
	props: {
		w: 40,
		h: 40
	},
	textBlock: [],
	path: [
		{
			actions: [
						{action: "move", x: "0", y: "h*0.5"},
						{action: "line", x: "w*0.5", y: "0"},
						{action: "line", x: "w", y: "h*0.5"},
						{action: "line", x: "w*0.5", y: "h"},
						{action: "line", x: "0", y: "h*0.5"},
						{action: "close"}
			]
		}
	]
});
/**
 * 9. Synchronization 
 */
Schema.addShape({
	name: "Synchronization",
	title: "Synchronization(Fork/Join)",
	category: "uml_stateactivity",
	props: {
		w: 120,
		h: 20
	},
	textBlock: [],
	resizeDir: ["l", "r"],
	anchors: [],
	path: [
		{
			lineStyle: {
				lineWidth: 0,
				lineStyle: "solid"
			},
			fillStyle: {
				type: "solid",
				color: "50,50,50"
			},
			actions: {ref: "roundRectangle"}
		}
	],
	drawIcon: function(w, h){
		h+=2;
		return [
				{
						lineStyle: {
							lineWidth: 0,
							lineStyle: "solid"
						},
						fillStyle: {
							type: "solid",
							color: "50,50,50"
						},
						actions: [
							{action: "move", x: 0, y: 3 - 5 +3},
							{action: "quadraticCurve", x1: 0, y1: -5 +3, x: 3, y: -5 +3},
							{action: "line", x:w-3, y: -5+3},
							{action: "quadraticCurve", x1: w, y1: -5+3, x: w, y: 3 - 5 +3},
							{action: "line", x: w, y: h-3},
							{action: "quadraticCurve", x1: w, y1: h, x: w-3, y: h},
							{action: "line", x: 3, y: h},
							{action: "quadraticCurve", x1:0, y1: h, x:0, y: h-3},
							{action: "line", x: 0, y: 3 - 5 +3},
							{action: "close"}
						]
				}
		];
	}
});
/**
 * 14. Rectangle Container
 */
Schema.addShape({
	name: "stateRectangleContainer",
	title: "Rectangle Container",
	category: "uml_stateactivity",
	props: {
		w: 300,
		h: 240
	},
	textBlock: [{position: {x: "5", y: "2", w: "w-10", h: "h*(1/7)-2"}}],
	path: [
		{
			actions: {ref: "roundRectangle"}
		}
	]
});
/**
 * 垂直泳池
 */
Schema.addShape({
	name: "swimlane",
	title: "Swimlane(Vertical)",
	category: "uml_stateactivity",
	attribute: {
		rotatable: false,
		linkable: false,
		container: true
	},
	children: [],
	props: {
		w: 250,
		h: 540
	},
	fontStyle: {size: 16},
	textBlock: [{position: {x: 10, y: 0, w: "w-20", h: 40}}],
	anchors: [],
	resizeDir: ["l", "b", "r"],
	path: [
		{
			fillStyle: {type: "none"},
			lineStyle: {lineStyle: "solid"},
			actions: {ref: "rectangle"}
		},
		{
			lineStyle: {lineStyle: "solid"},
			actions: [
				{action: "move", x: 0, y: 0},
				{action: "line", x: "w", y: 0},
				{action: "line", x: "w", y: 40},
				{action: "line", x: 0, y: 40},
				{action: "close"}
			]
		}
		
	],
	drawIcon: function(w, h){
		var x = -4;
		return [
			{
				fillStyle: {type: "none"},
				actions: [
					{action: "move", x: x, y: 0},
					{action: "line", x: w, y: 0},
					{action: "line", x: w, y: h},
					{action: "line", x: x, y: h},
					{action: "close"}
				]
			},
			{
				actions: [
					{action: "move", x: x, y: 0},
					{action: "line", x: w, y: 0},
					{action: "line", x: w, y: 4},
					{action: "line", x: x, y: 4},
					{action: "close"}
				]
			}
		];
	}
});
/*
 * 水平泳池
 */
Schema.addShape({
	name: "horizontalSwimlane",
	title: "Swimlane(Horizontal)",
	category: "uml_stateactivity",
	attribute: {
		rotatable: false,
		linkable: false,
		container: true
	},
	children: [],
	props: {
		w: 640,
		h: 200
	},
	fontStyle: {size: 16, orientation: "horizontal"},
	textBlock: [{position: {x: 0, y: 10, w: 40, h: "h-20"}}],
	anchors: [],
	resizeDir: ["t", "r", "b"],
	path: [
		{
			fillStyle: {type: "none"},
			lineStyle: {lineStyle: "solid"},
			actions: {ref: "rectangle"}
		},
		{
			lineStyle: {lineStyle: "solid"},
			actions: [
				{action: "move", x: 0, y: 0},
				{action: "line", x: 40, y: 0},
				{action: "line", x: 40, y: "h"},
				{action: "line", x: 0, y: "h"},
				{action: "close"}
			]
		}
	],
	drawIcon: function(w, h){
		var y = -4;
		return [
			{
				fillStyle: {type: "none"},
				actions: [
					{action: "move", x: 0, y: y},
					{action: "line", x: w, y: y},
					{action: "line", x: w, y: h},
					{action: "line", x: 0, y: h},
					{action: "close"}
				]
			},
			{
				actions: [
					{action: "move", x: 0, y: y},
					{action: "line", x: 4, y: y},
					{action: "line", x: 4, y: h},
					{action: "line", x: 0, y: h},
					{action: "close"}
				]
			}
		];
	}
});
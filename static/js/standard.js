/**
 * standard shapes
 */

Schema.addCategory({
	name: "standard",
	text: "StandardShape",
	dataAttributes: [
		{name: "link", type:"link", value:"", category: "default"}]
});

/**
 * 矩形
 */
Schema.addShape({
	name: "process",
	title: "Process",
	category: "standard",
	props: {
		w: 120,
		h: 50
	},
	textBlock: [{position: {x: "0", y: "0", w: "w", h: "h"}}],
	path: [
		{
			actions: {ref: "rectangle"}
		}
	]
});

/**
 * 菱形：Decision
 */
Schema.addShape({
	name: "decision",
	title: "Decision",
	category: "standard",
	props: {
		w: 90,
		h: 70
	},
	path: [
		{
			actions: [
				{action: "move", x: "0", y: "h/2"},
				{action: "line", x: "w/2", y: "0"},
				{action: "line", x: "w", y: "h/2"},
				{action: "line", x: "w/2", y: "h"},
				{action: "line", x: "0", y: "h/2"},
				{action: "close"}          
			]
		}
	]
});

/**
 * 胶囊型：Terminator
 */
Schema.addShape({
	name: "terminator",
	title: "Start/Terminator",
	category: "standard",
	props: {
		w: 100,
		h: 50
	},
	path: [
		{
			actions: [
				{action: "move", x: "Math.min(w,h)/3", y: "0"},
				{action: "line", x: "w-Math.min(w,h)/3", y: "0"},
				{action: "curve", x1: "w+Math.min(w,h)/3/3", y1: "0", x2: "w+Math.min(w,h)/3/3", y2: "h", x: "w-Math.min(w,h)/3", y: "h"},
				{action: "line", x: "Math.min(w,h)/3", y: "h"},
				{action: "curve", x1: "-Math.min(w,h)/3/3", y1: "h", x2: "-Math.min(w,h)/3/3", y2: "0", x: "Math.min(w,h)/3", y: "0"},
				{action: "close"}          
			]
		}
	]
});

/**
 * 下边波浪矩形：Document
 */
Schema.addShape({
	name: "document",
	title: "Document",
	category: "standard",
	props: {
		w: 100,
		h: 70
	},
	anchors: [{x: "w*0.5", y: "0"}, {x: "w", y: "h*0.5"}, {x: "w*0.5", y: "h-Math.min(h/8,w/12)"}, {x: "0", y: "h*0.5"}],
	textBlock: [{position: {x: "0", y: "0", w: "w", h: "h*0.9"}}],
	path: [
		{
			actions: [
				{action: "move", x: "0", y: "h-Math.min(h/8,w/12)"},
				{action: "line", x: "0", y: "0"},
				{action: "line", x: "w", y: "0"},
				{action: "line", x: "w", y: "h-Math.min(h/8,w/12)"},
				{action: "quadraticCurve", x1: "w*0.75", y1: "h-3*Math.min(h/8,w/12)", x: "w*0.5", y : "h-Math.min(h/8,w/12)"},
				{action: "quadraticCurve", x1: "w*0.25", y1: "h+Math.min(h/8,w/12)", x: "0", y : "h-Math.min(h/8,w/12)"},
				{action: "close"}          
			]
		}
	]
});

/**
 * 平行四边形：Data
 */
Schema.addShape({
	name: "data",
	title: "Data",
	category: "standard",
	props: {
		w: 100,
		h: 70
	},
	anchors: [{x: "w*0.5", y: "0"}, {x: "w-Math.min(h/3,w/3)/2", y: "h*0.5"}, {x: "w*0.5", y: "h"}, {x: "Math.min(h/3,w/3)/2", y: "h*0.5"}],
	textBlock: [{position: {x: "w*0.15", y: "0", w: "w*0.7", h: "h"}}],
	path: [
		{
			actions: [
				{action: "move", x: "Math.min(h/3,w/3)", y: "0"},
				{action: "line", x: "w", y: "0"},
				{action: "line", x: "w-Math.min(h/3,w/3)", y: "h"},
				{action: "line", x: "0", y: "h"},
				{action: "line", x: "Math.min(h/3,w/3)", y: "0"},
				{action: "close"}          
			]
		}
	]
});

/**
 * 三分矩形：Predefined process
 */
Schema.addShape({
	name: "predefinedProcess",
	title: "Predefined Process",
	category: "standard",
	props: {
		w: 100,
		h: 70
	},
	textBlock: [{position: {x: "Math.min(w/6,20)", y: "0", w: "w-Math.min(w/6,20)*2", h: "h"}}],
	path: [
		{
			actions: [
				{action: "move", x: "0", y: "0"},
				{action: "line", x: "w", y: "0"},
				{action: "line", x: "w", y: "h"},
				{action: "line", x: "0", y: "h"},
				{action: "line", x: "0", y: "0"},
				{action: "close"},
				{action: "move", x: "Math.min(w/6,20)", y: "0"},
				{action: "line", x: "Math.min(w/6,20)", y: "h"},
				{action: "move", x: "w- Math.min(w/6,20)", y: "0"},
				{action: "line", x: "w- Math.min(w/6,20)", y: "h"}          
			]
		}
	]
});

/**
 * 横圆柱矩形：Stored data
 */
Schema.addShape({
	name: "storedData",
	title: "Store Data",
	category: "standard",
	props: {
		w: 100,
		h: 70
	},
	anchors: [{x: "w*0.5", y: "0"}, {x: "w-Math.min(w/8,h/8)", y: "h*0.5"}, {x: "w*0.5", y: "h"}, {x: "0", y: "h*0.5"}],
	textBlock: [{position: {x: "w*0.1", y: "0", w: "w*0.75", h: "h"}}],
	path: [
		{
			actions: [
				{action: "move", x: "w/6", y: "0"},
				{action: "line", x: "w", y: "0"},
				{action: "curve", x1: "w-w/6", y1: "0", x2: "w-w/6", y2: "h", x: "w", y: "h"},
				{action: "line", x: "w/6", y: "h"},
				{action: "curve", x1: "-w/17", y1: "h", x2: "-w/17", y2: "0", x: "w/7", y: "0"},
				{action: "close"}         
			]
		}
	]
});

/**
 * 四分矩形：Internal storage
 */
Schema.addShape({
	name: "internalStorage",
	title: "Internal Storage",
	category: "standard",
	props: {
		w: 100,
		h: 70
	},
	textBlock: [{position: {x: "Math.min(w/6,20)", y: "Math.min(h/5,20)", w: "w - Math.min(w/6,20)", h: "h- Math.min(h/5,20)"}}],
	path: [
		{
			actions: [
				{action: "move", x: "0", y: "0"},
				{action: "line", x: "w", y: "0"},
				{action: "line", x: "w", y: "h"},
				{action: "line", x: "0", y: "h"},
				{action: "line", x: "0", y: "0"},
				{action: "close"},
				{action: "move", x: "Math.min(w/6,20)", y: "0"},
				{action: "line", x: "Math.min(w/6,20)", y: "h"},
				{action: "move", x: "0", y: "Math.min(h/5,20)"},
				{action: "line", x: "w", y: "Math.min(h/5,20)"}          
			]
		}
	]
});

/**
 * 圆Q：Sequential data
 */
Schema.addShape({
	name: "sequentialData",
	title: "Sequential Data",
	category: "standard",
	props: {
		w: 70,
		h: 70
	},
	textBlock: [{position: {x: "w*0.1", y: "h*0.2", w: "w*0.8", h: "h*0.6"}}],
	path: [
		{
			actions: [
				{action: "move", x: "w/2", y: "h"},
				{action: "curve", x1: "w/2-w*2/3", y1: "h", x2: "w/2-w*2/3", y2: "0", x: "w/2", y: "0"},
				{action: "curve", x1: "w/2+w*2/3", y1: "0", x2: "w/2+w*2/3", y2: "h", x: "w/2", y: "h"},
				{action: "line", x: "w", y: "h"},
				{action: "close"}          
			]
		}
	]
});

/**
 * 横立体圆柱：Direct data
 */
Schema.addShape({
	name: "directData",
	title: "Direct Data",
	category: "standard",
	props: {
		w: 100,
		h: 70
	},
	textBlock: [{position: {x: "0", y: "0", w: "w*0.8", h: "h"}}],
	path: [
		{
			actions: [
				{action: "move", x: "w*0.15", y: "0"},
				{action: "line", x: "w-h/6", y: "0"},
				{action: "curve", x1: "w+h/22", y1: "0", x2: "w+h/22", y2: "h", x: "w-h/6", y: "h"},
				{action: "line", x: "w*0.15", y: "h"},
				{action: "curve", x1: "-w*0.05", y1: "h", x2: "-w*0.05", y2: "0", x: "w*0.15", y: "0"},
				{action: "close"},
				{action: "move", x: "w-h/6", y: "0"},
				{action: "curve", x1: "w-h/8*3", y1: "0", x2: "w-h/8*3", y2: "h", x: "w-h/6", y: "h"},
				{action: "curve", x1: "w-h/8*3", y1: "h", x2: "w-h/8*3", y2: "0", x: "w-h/6", y: "0"}
			]
		}
	]
});

/**
 * 横梯形：Manual input
 */
Schema.addShape({
	name: "manualInput",
	title: "Manual Input",
	category: "standard",
	props: {
		w: 100,
		h: 70
	},
	anchors: [{x: "0", y: "h*0.5"}, {x: "w*0.5", y: "Math.min(h/2,w/6)/2"}, {x: "w", y: "h*0.5"}, {x: "w*0.5", y: "h"}],
	textBlock: [{position: {x: "0", y: "h*0.1", w: "w", h: "h*0.9"}}],
	path: [
		{
			actions: [
				{action: "move", x: "0", y: "Math.min(h/2,w/6)"},
				{action: "line", x: "w", y: "0"},
				{action: "line", x: "w", y: "h"},
				{action: "line", x: "0", y: "h"},
				{action: "line", x: "0", y: "Math.min(h/2,w/6)"},
				{action: "close"}          
			]
		}
	]
});

/**
 * 纸牌：Card
 */
Schema.addShape({
	name: "card",
	title: "Card",
	category: "standard",
	props: {
		w: 100,
		h: 70
	},
	path: [
		{
			actions: [
				{action: "move", x: "0", y: "Math.min(h/2,w/4)"},
				{action: "line", x: "Math.min(h/2,w/4)", y: "0"},
				{action: "line", x: "w", y: "0"},
				{action: "line", x: "w", y: "h"},
				{action: "line", x: "0", y: "h"},
				{action: "line", x: "0", y: "Math.min(h/2,w/4)"},
				{action: "close"}          
			]
		}
	]
});

/**
 * 旗：Paper tape
 */
Schema.addShape({
	name: "paperTape",
	title: "Paper Tape",
	category: "standard",
	props: {
		w: 100,
		h: 70
	},
	textBlock: [{position: {x: "0", y: "h*0.1", w: "w", h: "h*0.8"}}],
	anchors: [{x: "w*0.5", y: "Math.min(Math.min(w,h)/8,w/12)"}, {x: "w", y: "h*0.5"}, {x: "w*0.5", y: "h-Math.min(Math.min(w,h)/8,w/12)"}, {x: "0", y: "h*0.5"}],
	path: [
		{
			actions: [
				{action: "move", x: "0", y: "Math.min(Math.min(w,h)/8,w/12)"},
				{action: "quadraticCurve", x1: "w*0.25", y1: "3*Math.min(Math.min(w,h)/8,w/12)", x: "w*0.5", y: "Math.min(Math.min(w,h)/8,w/12)"},
				{action: "quadraticCurve", x1: "w*0.75", y1: "-Math.min(Math.min(w,h)/8,w/12)", x: "w", y: "Math.min(Math.min(w,h)/8,w/12)"},
				{action: "line", x: "w", y: "h-Math.min(Math.min(w,h)/8,w/12)"},
				{action: "quadraticCurve", x1: "w*0.75", y1: "h-3*Math.min(Math.min(w,h)/8,w/12)", x: "w*0.5", y: "h-Math.min(Math.min(w,h)/8,w/12)"},
				{action: "quadraticCurve", x1: "w*0.25", y1: "h+Math.min(Math.min(w,h)/8,w/12)", x: "0", y: "h-Math.min(Math.min(w,h)/8,w/12)"},
				{action: "line", x: "0", y: "Math.min(Math.min(w,h)/8,w/12)"},
				{action: "close"}          
			]
		}
	]
});

/**
 * 左角按钮：Display
 */
Schema.addShape({
	name: "display",
	title: "Display",
	category: "standard",
	props: {
		w: 100,
		h: 70
	},
	path: [
		{
			actions: [
				{action: "move", x: "w-w/6", y: "0"},
				{action: "line", x: "w/6", y: "0"},
				{action: "line", x: "0", y: "h/2"},
				{action: "line", x: "w/6", y: "h"},
				{action: "line", x: "w-w/6", y: "h"},
				{action: "quadraticCurve", x1: "w", y1: "h", x: "w", y: "h*0.5"},
				{action: "quadraticCurve", x1: "w", y1: "0", x: "w-w/6", y: "0"},
				{action: "close"}          
			]
		}
	]
});

/**
 * 倒梯形：Manual operation
 */
Schema.addShape({
	name: "manualOperation",
	title: "Manual Operation",
	category: "standard",
	props: {
		w: 100,
		h: 70
	},
	textBlock: [{position: {x: "w*0.1", y: "0", w: "w*0.8", h: "h"}}],
	anchors: [{x: "w*0.5", y: "0"}, {x: "w-Math.min(h/2,w/6)/2", y: "h*0.5"}, {x: "w*0.5", y: "h"}, {x: "Math.min(h/2,w/6)/2", y: "h*0.5"}],
	path: [
		{
			actions: [
				{action: "move", x: "0", y: "0"},
				{action: "line", x: "w", y: "0"},
				{action: "line", x: "w-Math.min(h/2,w/6)", y: "h"},
				{action: "line", x: "Math.min(h/2,w/6)", y: "h"},
				{action: "line", x: "0", y: "0"},
				{action: "close"}          
			]
		}
	]
});

/**
 * 水晶棱形：Preparation
 */
Schema.addShape({
	name: "preparation",
	title: "Preparation",
	category: "standard",
	props: {
		w: 100,
		h: 70
	},
	path: [
		{
			actions: [
				{action: "move", x: "0", y: "h*0.5"},
				{action: "line", x: "Math.min(h/2,w/6)", y: "0"},
				{action: "line", x: "w-Math.min(h/2,w/6)", y: "0"},
				{action: "line", x: "w", y: "h/2"},
				{action: "line", x: "w-Math.min(h/2,w/6)", y: "h"},
				{action: "line", x: "Math.min(h/2,w/6)", y: "h"},
				{action: "line", x: "0", y: "h/2"},
				{action: "close"}          
			]
		}
	]
});

/**
 * 两条水平线：Parallel mode
 */
Schema.addShape({
	name: "parallelMode",
	title: "Parallel Mode",
	category: "standard",
	props: {
		w: 100,
		h: 70
	},
	anchors: [{x: "w*0.5", y: "0"}, {x: "w*0.5", y: "0"}, {x: "w*0.5", y: "h"}, {x: "w*0.5", y: "h"}],
	path: [
		{
			actions: [
				{action: "move", x: "0", y: "0"},
				{action: "line", x: "w", y: "0"},
				{action: "line", x: "0", y: "0"},
				{action: "move", x: "0", y: "h"},
				{action: "line", x: "w", y: "h"},
				{action: "line", x: "0", y: "h"},
				{action: "close"}          
			]
		},
		{
			fillStyle: {type: "none"},
			lineStyle: {
				lineWidth: 0
			},
			actions: [
			    {action: "move", x: "0", y: "0"},
				{action: "line", x: "w", y: "0"},
				{action: "line", x: "w", y: "h"},    
				{action: "line", x: "0", y: "h"},  
				{action: "line", x: "0", y: "0"},
				{action: "close"}
			]
		}
	]
});

/**
 * 棺型：Loop limit
 */
Schema.addShape({
	name: "loopLimit",
	title: "Loop Limit",
	category: "standard",
	props: {
		w: 100,
		h: 70
	},
	path: [
		{
			actions: [
				{action: "move", x: "0", y: "Math.min(h/2,w/6)"},
				{action: "line", x: "Math.min(h/2,w/6)", y: "0"},
				{action: "line", x: "w-Math.min(h/2,w/6)", y: "0"},
				{action: "line", x: "w", y: "Math.min(h/2,w/6)"},
				{action: "line", x: "w", y: "h"},
				{action: "line", x: "0", y: "h"},
				{action: "line", x: "0", y: "Math.min(h/2,w/6)"},
				{action: "close"}          
			]
		}
	]
});

/**
 * 圆形：On-page reference
 */
Schema.addShape({
	name: "onPageReference",
	title: "On-page Reference",
	category: "standard",
	props: {
		w: 70,
		h: 70
	},
	path: [
		{
			actions: {ref: "round"}
		}
	]
});

/**
 * 下三角锥型：Off-page reference
 */
Schema.addShape({
	name: "offPageReference",
	title: "Off-page Reference",
	category: "standard",
	props: {
		w: 70,
		h: 60
	},
	textBlock: [{position: {x: "0", y: "0", w: "w", h: "h-Math.min(h,w)/3"}}],
	path: [
		{
			actions: [
				{action: "move", x: "0", y: "0"},
				{action: "line", x: "w", y: "0"},
				{action: "line", x: "w", y: "h-Math.min(h,w)/3"},
				{action: "line", x: "w*0.5", y: "h"},
				{action: "line", x: "0", y: "h-Math.min(h,w)/3"},
				{action: "line", x: "0", y: "0"},
				{action: "close"}          
			]
		}
	]
});

/**
 * 特殊线矩形：Annotation
 */
Schema.addShape({
	name: "annotation",
	title: "Annotation",
	category: "standard",
	props: {
		w: 100,
		h: 70
	},
	anchors: [{x: "0", y: "h*0.5"}, {x: "0", y: "h*0.5"}, {x: "0", y: "h*0.5"}, {x: "0", y: "h*0.5"}],
	path: [
       {
			fillStyle: {type: "none"},
			lineStyle: {
				lineWidth: 0
			},
			actions: [
			    {action: "move", x: "0", y: "0"},
				{action: "line", x: "w", y: "0"},
				{action: "line", x: "w", y: "h"},
				{action: "line", x: "0", y: "h"},
				{action: "line", x: "0", y: "0"},
				{action: "close"}      
			]
		},
		{
			fillStyle: {type: "none"},
			actions: [
			    {action: "move", x: "w/6", y: "0"},
				{action: "line", x: "0", y: "0"},
				{action: "line", x: "0", y: "h"},
				{action: "line", x: "w/6", y: "h"}
			]
		},
		{
			fillStyle: {type: "none"},
			lineStyle: {
				lineWidth: 0
			},
			actions: [
				{action: "move", x: "0", y: "0"},
				{action: "line", x: "w", y: "0"},
				{action: "line", x: "w", y: "h"},
				{action: "line", x: "0", y: "h"},
				{action: "close"},
			]
		}
	]
});

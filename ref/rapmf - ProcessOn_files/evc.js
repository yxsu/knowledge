/**
 * EVC shapes
 */

Schema.addCategory({
	name: "evc",
	text: "EVC Shapes",
	dataAttributes: [
		{name: "no.", type:"number", value:"", category: "default"},
		{name: "name", type:"string", value:"", category: "default"},
		{name: "owner", type:"string", value:"", category: "default"},
		{name: "link", type:"link", value:"", category: "default"},
		{name: "memo", type:"string", value:"", category: "default"},
		{name: "cost", type:"number", value:"", category: "default"},
		{name: "time", type:"number", value:"", category: "default"},
		{name: "department", type:"string", value:"", category: "default"},
		{name: "input", type:"string", value:"", category: "default"},
		{name: "output", type:"string", value:"", category: "default"},
		{name: "risk", type:"string", value:"", category: "default"},
		{name: "remarks", type:"string", value:"", category: "default"}
	]
});

/**
 * ValueChain1
 */
Schema.addShape({
	name: "valueChain1",
	title: "Value Chain 1",
	category: "evc",
	props: {
		w: 150,
		h: 70
	},
	textBlock: [{position: {x: "Math.min(h/2,w/6)", y: "0", w: "w-Math.min(h/2,w/6)*2", h: "h"}}],
	anchors: [{x: "w*0.5", y: "0"}, {x: "w", y: "h*0.5"}, {x: "w*0.5", y: "h"}, {x: "Math.min(h/2,w/6)", y: "h*0.5"}],
	path: [
		{
			actions: [
				{action: "move", x: "Math.min(h/2,w/6)", y: "h*0.5"},
				{action: "line", x: "0", y: "0"},
				{action: "line", x: "w-Math.min(h/2,w/6)", y: "0"},
				{action: "line", x: "w", y: "h*0.5"},
				{action: "line", x: "w-Math.min(h/2,w/6)", y: "h"},
				{action: "line", x: "0", y: "h"},
				{action: "line", x: "Math.min(h/2,w/6)", y: "h*0.5"},
				{action: "close"}          
			]
		}
	]
});

/**
 * ValueChain2
 */
Schema.addShape({
	name: "valueChain2",
	title: "Value Chain 2",
	category: "evc",
	props: {
		w: 150,
		h: 70
	},
	textBlock: [{position: {x: "Math.min(h/2,w/6)", y: "0", w: "w-Math.min(h/2,w/6)*2", h: "h"}}],
	anchors: [{x: "w*0.5", y: "0"}, {x: "w-Math.min(h/2,w/6)", y: "h*0.5"}, {x: "w*0.5", y: "h"}, {x: "0", y: "h*0.5"}],
	path: [
		{
			actions: [
				{action: "move", x: "0", y: "h*0.5"},
				{action: "line", x: "Math.min(h/2,w/6)", y: "0"},
				{action: "line", x: "w", y: "0"},
				{action: "line", x: "w-Math.min(h/2,w/6)", y: "h*0.5"},
				{action: "line", x: "w", y: "h"},
				{action: "line", x: "Math.min(h/2,w/6)", y: "h"},
				{action: "line", x: "0", y: "h*0.5"},
				{action: "close"}          
			]
		}
	]
});

/**
 *ValueChain3 
 */
Schema.addShape({
	name: "valueChain3",
	title: "Value Chain 3",
	category: "evc",
	props: {
		w: 150,
		h: 70
	},
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
 * ValueChain4
 */
Schema.addShape({
	name: "valueChain4",
	title: "Value Chain 4",
	category: "evc",
	props: {
		w: 150,
		h: 70
	},
	path: [
		{
			actions: [
				{action: "move", x: "0", y: "h*0.5"},
				{action: "line", x: "Math.min(h/2,w/6)", y: "0"},
				{action: "line", x: "w", y: "0"},
				{action: "line", x: "w", y: "h"},
				{action: "line", x: "Math.min(h/2,w/6)", y: "h"},
				{action: "line", x: "0", y: "h*0.5"},
				{action: "close"}          
			]
		}
	]
});

/**
 * ValueChain5
 */
Schema.addShape({
	name: "valueChain5",
	title: "Value Chain 5",
	category: "evc",
	props: {
		w: 150,
		h: 70
	},
	textBlock: [{position: {x: "0", y: "Math.min(h/2,w/6)", w: "w", h: "h-Math.min(h/2,w/6)"}}],
	path: [
		{
			actions: [
				{action: "move", x: "w*0.5", y: "0"},
				{action: "line", x: "w", y: "Math.min(h/2,w/6)"},
				{action: "line", x: "w", y: "h"},
				{action: "line", x: "0", y: "h"},
				{action: "line", x: "0", y: "Math.min(h/2,w/6)"},
				{action: "line", x: "w*0.5", y: "0"},
				{action: "close"}          
			]
		}
	]
});

/**
 * ValueChain6
 */
Schema.addShape({
	name: "valueChain6",
	title: "Value Chain 6",
	category: "evc",
	props: {
		w: 150,
		h: 70
	},
	textBlock: [{position: {x: "0", y: "0", w: "w", h: "h-Math.min(h/2,w/6)"}}],
	path: [
		{
			actions: [
				{action: "move", x: "0", y: "0"},
				{action: "line", x: "w", y: "0"},
				{action: "line", x: "w", y: "h-Math.min(h/2,w/6)"},
				{action: "line", x: "w*0.5", y: "h"},
				{action: "line", x: "0", y: "h-Math.min(h/2,w/6)"},
				{action: "line", x: "0", y: "0"},
				{action: "close"}          
			]
		}
	]
});
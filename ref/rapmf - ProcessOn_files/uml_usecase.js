/**
 * UML Use Case 6 diagram
 * Actor | Use Case | Use Case(w/Extension Points) | Oval Container | Rectangle Container | Node
 */
Schema.addCategory({
	name: "uml_usecase",
	text: "UML Use Case",
	dataAttributes: []
});
/**
 * 1. Actor
 */
Schema.addShape({
	name: "actor",
	title: "Actor",
	category: "uml_usecase",
	props: {
		w: 70,
		h: 100
	},
	textBlock: [{position: {x: "-20", y: "h", w: "w+40", h: "30"}}],
	path: [
		{
			actions:[
				{action: "move", x: "w*(4/12)", y: "h*(1/8)"},
			    {action: "curve", x1: "w*(4/12)", y1: "-h*(2/8)*(1/6)", x2: "w*(8/12)", y2: "-h*(2/8)*(1/6)",x: "w*(8/12)", y: "h*(1/8)"},
			    {action: "curve", x1: "w*(8/12)", y1: "h*(2/8)*1/6+h*(2/8)", x2: "w*(4/12)", y2: "h*(2/8)*1/6+h*(2/8)", x: "w*(4/12)", y: "h*(1/8)"},
				{action:"move",x:"w*(6/12)",y:"h*(2/8)"},
				{action:"line",x:"w*(6/12)",y:"h*(6/8)"},
				{action:"move",x:"w*(6/12)",y:"h*(6/8)"},
				{action:"line",x:"w*(1/12)",y:"h"},
				{action:"move",x:"w*(6/12)",y:"h*(6/8)"},
				{action:"line",x:"w*(11/12)",y:"h"},
				{action:"move",x:"0",y:"h*(4/8)"},
				{action:"line",x:"w",y:"h*(4/8)"}
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
 * 2. Use Case
 */
Schema.addShape({
	name: "useCase",
	title: "Use Case",
	category: "uml_usecase",
	props: {
		w: 100,
		h: 70
	},
	path: [
		{
			actions: {ref: "round"}
		}
	]
});
/**
 * 3. Oval Container
 */
Schema.addShape({
	name: "ovalContainer",
	title: "Oval Container",
	category: "uml_usecase",
	props: {
		w: 150,
		h: 220
	},
	textBlock: [{position: {x: "0", y: "0", w: "w", h: "h"}}],
	path: [
		{
			actions:[
					{action: "move", x: "0", y: "h/2"},
				    {action: "curve", x1: "0", y1: "-h/6", x2: "w", y2: "-h/6", x: "w", y: "h/2"},
				    {action: "curve", x1: "w", y1: "h+h/6", x2: "0", y2: "h+h/6", x: "0", y: "h/2"},
				    {action: 'close'}				
			]
		}
	]
});

/**
 * 4. Rectangle Container
 */
Schema.addShape({
	name: "rectangleContainer",
	title: "Rectangle Container",
	category: "uml_usecase",
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
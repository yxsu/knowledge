
/**
 * UML Entity Relationship  6 diagram
 * Entity|Weak Entity| Attribute | MultiValue Attribute | Relationship | Weak Relationship
 */
Schema.addCategory({
	name: "er",
	text: "Entity Relationship",
	dataAttributes: []
});
/**
 * 3. Entity
 */
Schema.addShape({
	name: "entity",
	title: "Entity",
	category: "er",
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
 * 1. Derived Attribute
 */
Schema.addShape({
	name: "derivedAttribute",
	title: "Derived Attribute",
	category: "er",
	props: {
		w: 100,
		h: 70
	},
	path: [
		{
			lineStyle: {
				lineStyle: "dashed"
			},
			actions: {ref: "round"}
		}
	]
});
/**
 * 1. Key Attribute
 */
Schema.addShape({
	name: "keyAttribute",
	title: "Key Attribute",
	category: "er",
	props: {
		w: 100,
		h: 70
	},
	fontStyle: {
			underline: true
	},
	path: [
		{
			lineStyle: {
				lineStyle: "solid"
			},
			actions: {ref: "round"}
		}
	]
});
/**
 * 2. Multivalued Attribute
 */
Schema.addShape({
	name: "multivaluedAttribute",
	title: "Multi-valued Attribute ",
	category: "er",
	props: {
		w: 100,
		h: 70
	},
	path: [
		{
			actions: [
						{action: "move", x: "0", y: "h/2"},
					    {action: "curve", x1: "0", y1: "-h/6", x2: "w", y2:" -h/6", x: "w", y:" h/2"},
					    {action: "curve", x1: "w", y1: "h+h/6", x2: "0", y2: "h+h/6", x:" 0", y: "h/2"},
					    {action: "move", x: "Math.min(w*(1/25),h*(1/14))", y: "h*0.5"},
						{action: "curve", x1: "Math.min(w*(1/25),h*(1/14))", y1: "-h/6+Math.min(w*(1/25),h*(1/14))", x2: "w-Math.min(w*(1/25),h*(1/14)) ", y2: "-h/6+Math.min(w*(1/25),h*(1/14))", x: "w-Math.min(w*(1/25),h*(1/14))", y: "h*0.5"},
						{action: "curve", x1: "w-Math.min(w*(1/25),h*(1/14))", y1: "h+h/6-Math.min(w*(1/25),h*(1/14))", x2: "Math.min(w*(1/25),h*(1/14)) ", y2: "h+h/6-Math.min(w*(1/25),h*(1/14))", x: "Math.min(w*(1/25),h*(1/14))", y: "h*0.5"},
						{action:"close"}
			]
		}
	],
	drawIcon: function(w, h){
		return [
				{
					actions: [
						{action: "move", x: 0, y: h/2},
					    {action: "curve", x1: 0, y1: -h/6, x2: w, y2: -h/6, x: w, y: h/2},
					    {action: "curve", x1: w, y1: h+h/6, x2: 0, y2: h+h/6, x: 0, y: h/2},
					    {action: 'close'},
					    {action: "move", x: w*(1/8), y: h*0.5},
						{action: "curve", x1: w*(1/8), y1: -h/6+h*(1/5), x2: w-w*(1/8), y2: -h/6+h*(1/5), x: w-w*(1/8), y: h*0.5},
						{action: "curve", x1: w-w*(1/8), y1: h+h/6-h*(1/5), x2: w*(1/8), y2: h+h/6-h*(1/5), x: w*(1/8), y: h*0.5},
						{action:"close"}
					]
				}
		];
	}
});

/**
 * 4. Weak Entity
 */
Schema.addShape({
	name: "weakEntity",
	title: "Weak Entity",
	category: "er",
	props: {
		w: 100,
		h: 70
	},
	path: [
		{
			lineStyle: {
				lineStyle: "solid",
				lineColor:"120,120,120"
			},
			actions: [
			    {action: "move", x: "0", y: "0"},
				{action: "line", x: "w", y: "0"},
				{action: "line", x: "w", y: "h"},
				{action: "line", x: "0", y: "h"},
				{action: "close"}
			]
		},
		{
			fillStyle: {type: "none"},
			actions: [
	  			{action: "move", x: "Math.min(w*(1/20),h*(1/15))", y: "Math.min(w*(1/20),h*(1/15))"},
				{action: "line", x: "Math.max(w*(19/20),w-Math.min(w*(1/20),h*(1/15)))", y: "Math.min(h*(1/15),w-w*(19/20))"},
				{action: "line", x: "Math.max(w*(19/20),w-Math.min(w*(1/20),h*(1/15)))", y: "Math.max(h*(14/15),h-Math.min(h*(1/15),w*(1/20)))"},
				{action: "line", x: "Math.min(w*(1/20),h-h*(14/15))", y: "Math.max(h*(14/15),h-Math.min(h*(1/15),w*(1/20)))"},
				{action: "close"}
			]
		},
		{
			lineStyle: {lineWidth: 0},
			fillStyle: {type: "none"},
			actions: [
			    {action: "move", x: "0", y: "0"},
				{action: "line", x: "w", y: "0"},
				{action: "line", x: "w", y: "h"},
				{action: "line", x: "0", y: "h"},
				{action: "close"}
			]
		},
	],
	drawIcon: function(w, h){
		return [
				{
					lineStyle: {
						lineStyle: "solid",
						lineColor:"120,120,120"
					},
					actions: [
					    {action: "move", x: 0, y: 0},
						{action: "line", x: w, y: 0},
						{action: "line", x: w, y: h},
						{action: "line", x: 0, y: h},
						{action: "close"}
					]
				},
				{
					actions: [
			  			{action: "move", x: w*(1/10), y: h*(1/8)},
						{action: "line", x:w*(9/10), y:h*(1/8)},
						{action: "line", x:w*(9/10), y:h*(7/8)},
						{action: "line", x: w*(1/10), y: h*(7/8)},
						{action: "close"}
					]
				}
		];
	}
});
/**
 * 5. Relationship
 */
Schema.addShape({
	name: "relationship",
	title: "Relationship",
	category: "er",
	props: {
		w: 100,
		h: 70
	},
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
 * 6. Weak Relationship
 */
Schema.addShape({
	name: "weakRelationship",
	title: "Weak Relationship",
	category: "er",
	props: {
		w: 100,
		h: 80
	},
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
		},
		{
			fillStyle: {type: "none"},
			actions: [
			 	{action: "move", x: "w*(1/25)", y: "h*0.5"},
			 	{action: "line", x: "w*0.5", y: "h*(1/20)"},
			 	{action: "line", x: "w-w*(1/25)", y: "h*0.5"},
			 	{action: "line", x: "w*0.5", y: "h-h*(1/20)"},
			 	{action: "line", x: "w*(1/25)", y: "h*0.5"},
			 	{action: "close"}
			]
		},
		{
			fillStyle: {type: "none"},
			lineStyle: {lineWidth: 0},
			actions: [
				{action: "move", x: "0", y: "h*0.5"},
				{action: "line", x: "w*0.5", y: "0"},
				{action: "line", x: "w", y: "h*0.5"},
				{action: "line", x: "w*0.5", y: "h"},
				{action: "line", x: "0", y: "h*0.5"},
				{action: "close"}
			]
		}
	],
	drawIcon: function(w, h){
		return [
				{
					actions: [
						{action: "move", x: 0, y: h*0.5},
						{action: "line", x: w*0.5, y: 0},
						{action: "line", x: w, y: h*0.5},
						{action: "line", x: w*0.5, y: h},
						{action: "line", x: 0, y:h*0.5},
						{action: "close"},
					 	{action: "move", x: w*(1/6), y: h*0.5},
					 	{action: "line", x: w*0.5, y: h*(1/5)},
					 	{action: "line", x: w-w*(1/6), y: h*0.5},
					 	{action: "line", x: w*0.5, y: h-h*(1/5)},
					 	{action: "line", x: w*(1/6), y: h*0.5},
					 	{action: "close"}
					]
				}
		];
	}
});

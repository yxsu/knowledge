/**
 * Basic shapes
 */

Schema.addCategory({
	name: "lane",
	text: "Pool/Lane"
});

/**
 * 获取图形重叠的泳池
 * @param {} shape
 */
function getPool(shape, poolName){
	//寻找重叠的泳池
	for(var i = Model.orderList.length - 1; i >= 0; i--){
		var shapeId = Model.orderList[i].id;
		var modelShape = Model.getShapeById(shapeId);
		if(modelShape.name == poolName){
			if(Utils.rectCross(modelShape.props, shape.props)){
				return modelShape;
			}
		}
	}
	return null;
}

/**
 * 计算Pool的宽度
 * @param {} pool
 */
function getVerticalPoolWidth(pool){
	var w = 0;
	for (var i = 0; i < pool.children.length; i++) {
		var childId = pool.children[i];
		var child = Model.getShapeById(childId);
		if(child.name != "horizontalSeparator"){
			w += child.props.w;
		}
	}
	return w;
}

function getHorizontalPoolHeight(pool){
	var w = 0;
	for (var i = 0; i < pool.children.length; i++) {
		var childId = pool.children[i];
		var child = Model.getShapeById(childId);
		if(child.name != "horizontalSeparator"){
			w += child.props.w;
		}
	}
	return w;
}

/**
 * 获取某个子图形
 */
function getChild(pool, childName){
	for (var i = 0; i < pool.children.length; i++) {
		var childId = pool.children[i];
		var child = Model.getShapeById(childId);
		if(child.name == childName){
			return child;
		}
	}
	return null;
}

/**
 * 垂直泳池
 */
Schema.addShape({
	name: "verticalPool",
	title: "Vertical Pool",
	category: "lane",
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
		w += 8;
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
			},
			{
				actions: [
					{action: "move", x: (x+w)/2, y: 4},
					{action: "line", x: (x+w)/2, y: h}
				]
			}
		];
	}
});

/**
 * 垂直泳道
 */
Schema.addShape({
	name: "verticalLane",
	title: "Vertical Lane",
	category: "lane",
	attribute: {
		container: true,
		rotatable: false,
		linkable: false
	},
	props: {
		w: 250,
		h: 500
	},
	textBlock: [{position: {x: 10, y: 0, w: "w-20", h: 30}}],
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
				{action: "line", x: "w", y: 30},
				{action: "line", x: 0, y: 30},
				{action: "close"}
			]
		}
	],
	drawIcon: function(w, h){
		return [
			{
				fillStyle: {type: "none"},
				lineStyle: {lineStyle: "solid"},
				actions: [
					{action: "move", x: 0, y: 0},
					{action: "line", x: w, y: 0},
					{action: "line", x: w, y: h},
					{action: "line", x: 0, y: h},
					{action: "close"}
				]
			},
			{
				lineStyle: {lineStyle: "solid"},
				actions: [
					{action: "move", x: 0, y: 0},
					{action: "line", x: w, y: 0},
					{action: "line", x: w, y: 4},
					{action: "line", x: 0, y: 4},
					{action: "close"}
				]
			}
		];
	},
	onCreated: function(){
		//寻找重叠的泳池
		var pool = getPool(this, "verticalPool");
		if(pool == null){
			//没有找到重叠的泳池，则创建一个泳池
			pool = Model.create("verticalPool", this.props.x, this.props.y - 40);
			pool.children = [this.id];
			Model.add(pool);
		}else{
			if(!pool.children){
				pool.children = [];
			}
			var updates = [pool];
			var x = pool.props.x;
			var laneCount = 0;
			var sepCount = 0;
			//更新分隔符
			for (var i = 0; i < pool.children.length; i++) {
				var childId = pool.children[i];
				var child = Model.getShapeById(childId);
				if(child.name == "verticalLane"){
					x += child.props.w;
					laneCount++;
				}else if(child.name == "verticalSeparatorBar"){
					x += child.props.w;
					sepCount++;
				}
			}
			this.props.x = x;
			this.props.y = pool.props.y + 40;
			this.props.h = pool.props.h - 40;
			if(laneCount == 0){
				if(sepCount == 0){
					this.props.w = pool.props.w;
				}else{
					this.props.w = pool.props.w - 20;
				}
			}
			Designer.painter.renderShape(this);
			pool.props.w = this.props.x + this.props.w - pool.props.x;
			//更新分隔符
			for (var i = 0; i < pool.children.length; i++) {
				var childId = pool.children[i];
				var child = Model.getShapeById(childId);
				if(child.name == "horizontalSeparator"){
					child.props.w = pool.props.w;
					Designer.painter.renderShape(child);
					updates.push(child);
				}
			}
			pool.children.push(this.id);
			Model.updateMulti(updates);
		}
		Designer.painter.renderShape(pool);
		this.parent = pool.id;
	}
});

/**
 * 垂直分隔符标题栏，用于垂直泳池
 */
Schema.addShape({
	name: "verticalSeparatorBar",
	title: "Vertical Separator Bar",
	category: "lane",
	attribute: {
		rotatable: false,
		linkable: false,
		visible: false
	},
	props: {
		w: 20,
		h: 500
	},
	anchors: [],
	resizeDir: [],
	textBlock: [],
	path: [
		{
			lineStyle: {lineStyle: "solid"},
			actions: {ref: "rectangle"}
		}
	]
});

/**
 * 水平分隔符，用于垂直泳池
 */
Schema.addShape({
	name: "horizontalSeparator",
	title: "Horizontal Separator",
	category: "lane",
	attribute: {
		rotatable: false,
		linkable: false
	},
	props: {
		w: 300,
		h: 0
	},
	fontStyle: {orientation: "horizontal", textAlign: "left"},
	textBlock: [{position: {x: 0, y: 5, w: 20, h: "h-10"}, text: "Stage"}],
	anchors: [],
	resizeDir: ["b"],
	path: [
		{
			fillStyle: {type: "none"},
			lineStyle: {lineStyle: "solid"},
			actions: [
				{action: "move", x: 0, y: "h"},
				{action: "line", x: "w", y: "h"}
			]
		},
		{
			actions: [
				{action: "move", x: 0, y: 0},
				{action: "line", x: 20, y: 0},
				{action: "line", x: 20, y: "h"},
				{action: "line", x: 0, y: "h"},
				{action: "close"}
			]
		}
	],
	drawIcon: function(w, h){
		return [
			{
				fillStyle: {type: "none"},
				lineStyle: {lineStyle: "solid"},
				actions: [
					{action: "move", x: 0, y: 0},
					{action: "line", x: w, y: 0}
				]
			}
		];
	},
	onCreated: function(){
		//寻找重叠的泳池
		var pool = getPool(this, "verticalPool");
		if(pool == null){
			return false;
		}
		//查找泳池中的分隔符标题栏
		var titleBar = getChild(pool, "verticalSeparatorBar");
		if(titleBar == null){
			titleBar = Model.create("verticalSeparatorBar", pool.props.x - 20, pool.props.y + 40);
			titleBar.props.h = pool.props.h - 40;
			titleBar.parent = pool.id;
			Model.add(titleBar);
			Designer.painter.renderShape(titleBar);
			pool.props.x -= titleBar.props.w;
			pool.props.w += titleBar.props.w;
			pool.children.push(titleBar.id);
			Designer.painter.renderShape(pool);
		}
		//确定y坐标、高
		var bottom = this.props.y + this.props.h;
		var y = pool.props.y + 40;
		var next = null;
		for (var i = 0; i < pool.children.length; i++) {
			var childId = pool.children[i];
			var child = Model.getShapeById(childId);
			if(child.name != "horizontalSeparator"){
				continue;
			}
			var childBottom = child.props.y + child.props.h;
			if(childBottom <= bottom){
				y += child.props.h;
			}else if(next == null || child.props.y < next.props.y){
				next = child;
			}
		}
		this.props.x = pool.props.x;
		this.props.w = pool.props.w;
		this.props.h = bottom - y;
		this.props.y = y;
		pool.children.push(this.id);
		this.parent = pool.id;
		if(bottom > pool.props.y + pool.props.h){
			this.props.h = pool.props.y + pool.props.h - y;
		}
		Designer.painter.renderShape(this);
		if(next != null){
			next.props.y += this.props.h;
			next.props.h -= this.props.h;
			Designer.painter.renderShape(next);
			Model.updateMulti([pool, next]);
		}else{
			Model.update(pool);
		}
		this.props.zindex = Model.maxZIndex + 1;
	}
});

/**
 * 水平分隔符标题栏，用于水平泳池
 */
Schema.addShape({
	name: "horizontalSeparatorBar",
	title: "Horizontal Separator Bar",
	category: "lane",
	attribute: {
		rotatable: false,
		linkable: false,
		visible: false
	},
	props: {
		w: 600,
		h: 20
	},
	anchors: [],
	resizeDir: [],
	textBlock: [],
	path: [
		{
			lineStyle: {lineStyle: "solid"},
			actions: {ref: "rectangle"}
		}
	]
});

/**
 * 垂直分隔符，用于水平泳池
 */
Schema.addShape({
	name: "verticalSeparator",
	title: "Vertical Separator",
	category: "lane",
	attribute: {
		rotatable: false,
		linkable: false
	},
	props: {
		w: 0,
		h: 300
	},
	fontStyle: {textAlign: "right"},
	textBlock: [{position: {x: 5, y: 0, w: "w-10", h: 20}, text: "Stage"}],
	anchors: [],
	resizeDir: ["r"],
	path: [
		{
			fillStyle: {type: "none"},
			lineStyle: {lineStyle: "solid"},
			actions: [
				{action: "move", x: "w", y: 0},
				{action: "line", x: "w", y: "h"}
			]
		},
		{
			actions: [
				{action: "move", x: 0, y: 0},
				{action: "line", x: "w", y: 0},
				{action: "line", x: "w", y: 20},
				{action: "line", x: 0, y: 20},
				{action: "close"}
			]
		}
	],
	drawIcon: function(w, h){
		return [
			{
				fillStyle: {type: "none"},
				lineStyle: {lineStyle: "solid"},
				actions: [
					{action: "move", x: 0, y: 0},
					{action: "line", x: 0, y: h}
				]
			}
		];
	},
	onCreated: function(){
		//寻找重叠的泳池
		var pool = getPool(this, "horizontalPool");
		if(pool == null){
			return false;
		}
		//查找泳池中的分隔符标题栏
		var titleBar = getChild(pool, "horizontalSeparatorBar");
		if(titleBar == null){
			titleBar = Model.create("horizontalSeparatorBar", pool.props.x + 40, pool.props.y-20);
			pool.props.y -= titleBar.props.h;
			pool.props.h += titleBar.props.h;
			pool.children.push(titleBar.id);
			Designer.painter.renderShape(pool);
			titleBar.props.w = pool.props.w - 40;
			titleBar.parent = pool.id;
			Model.add(titleBar);
			Designer.painter.renderShape(titleBar);
		}
		//确定x坐标、宽
		var right = this.props.x + this.props.w;
		var x = pool.props.x +  40;
		var next = null;
		for (var i = 0; i < pool.children.length; i++) {
			var childId = pool.children[i];
			var child = Model.getShapeById(childId);
			if(child.name != "verticalSeparator"){
				continue;
			}
			var childRight = child.props.x + child.props.w;
			if(childRight <= right){
				x += child.props.w;
			}else if(next == null || child.props.x < next.props.x){
				next = child;
			}
		}
		this.props.x = x;
		this.props.w = right - x;
		this.props.y = pool.props.y;
		this.props.h = pool.props.h;
		if(right > pool.props.x + pool.props.w){
			this.props.w = pool.props.x + pool.props.w - x;
		}
		Designer.painter.renderShape(this);
		pool.children.push(this.id);
		this.parent = pool.id;
		if(next != null){
			next.props.x += this.props.w;
			next.props.w -= this.props.w;
			Designer.painter.renderShape(next);
			Model.updateMulti([pool, next]);
		}else{
			Model.update(pool);
		}
		this.props.zindex = Model.maxZIndex + 1;
	}
});

/**
 * 水平泳池
 */
Schema.addShape({
	name: "horizontalPool",
	title: "Horizontal Pool",
	category: "lane",
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
		h += 8;
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
			},
			{
				actions: [
					{action: "move", x: 4, y: (y+h)/2},
					{action: "line", x: w, y: (y+h)/2}
				]
			}
		];
	}
});

/**
 * 水平泳道
 */
Schema.addShape({
	name: "horizontalLane",
	title: "Horizontal Lane",
	category: "lane",
	attribute: {
		container: true,
		rotatable: false,
		linkable: false
	},
	props: {
		w: 600,
		h: 200
	},
	fontStyle: {orientation: "horizontal"},
	textBlock:[{position: {x: 0, y: 10, w: 30, h: "h-20"}}],
	anchors: [],
	resizeDir: ["t", "b", "r"],
	path: [
		{
			fillStyle: {type: "none"},
			lineStyle: {lineStyle: "solid"},
			actions: {ref: "rectangle"}
		},{
			lineStyle: {lineStyle: "solid"},
			actions: [
				{action: "move", x: 0, y: 0},
				{action: "line", x: 30, y: 0},
				{action: "line", x: 30, y: "h"},
				{action: "line", x: 0, y: "h"},
				{action: "close"}
			]
		}
	],
	drawIcon: function(w, h){
		h += 3;
		return [
			{
				fillStyle: {type: "none"},
				lineStyle: {lineStyle: "solid"},
				actions: [
					{action: "move", x: 0, y: -1},
					{action: "line", x: w, y: -1},
					{action: "line", x: w, y: h},
					{action: "line", x: 0, y: h},
					{action: "close"}
				]
			},
			{
				lineStyle: {lineStyle: "solid"},
				actions: [
					{action: "move", x: 0, y: -1},
					{action: "line", x: 4, y: -1},
					{action: "line", x: 4, y: h},
					{action: "line", x: 0, y: h},
					{action: "close"}
				]
			}
		];
	},
	onCreated: function(){
		//寻找重叠的泳池
		var pool = getPool(this, "horizontalPool");
		if(pool == null){
			//没有找到重叠的泳池，则创建一个泳池
			pool = Model.create("horizontalPool", this.props.x-40, this.props.y);
			pool.children = [this.id];
			Model.add(pool);
		}else{
			if(!pool.children){
				pool.children = [];
			}
			var updates = [pool];
			var y = pool.props.y;
			var laneCount = 0;
			var sepCount = 0;
			//更新分隔符
			for (var i = 0; i < pool.children.length; i++) {
				var childId = pool.children[i];
				var child = Model.getShapeById(childId);
				if(child.name == "horizontalLane"){
					y += child.props.h;
					laneCount++;
				}else if(child.name == "horizontalSeparatorBar"){
					y += child.props.h;
					sepCount++;
				}
			}
			this.props.y = y;
			this.props.x = pool.props.x + 40;
			this.props.w = pool.props.w - 40;
			if(laneCount == 0){
				if(sepCount == 0){
					this.props.h = pool.props.h;
				}else{
					this.props.h = pool.props.h - 20;
				}
			}
			Designer.painter.renderShape(this);
			pool.props.h = this.props.y + this.props.h - pool.props.y;
			//更新分隔符
			for (var i = 0; i < pool.children.length; i++) {
				var childId = pool.children[i];
				var child = Model.getShapeById(childId);
				if(child.name == "verticalSeparator"){
					child.props.h = pool.props.h;
					Designer.painter.renderShape(child);
					updates.push(child);
				}
			}
			pool.children.push(this.id);
			Model.updateMulti(updates);
		}
		Designer.painter.renderShape(pool);
		this.parent = pool.id;
	}
});




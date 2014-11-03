/**
 * 图形定义Schema
 */
var Schema = {
	config: {
		markerSize: 14	
	},
	pageDefaults: {
		backgroundColor: "255,255,255",
		width: 1050,
		height: 1500,
		padding: 10,
		showGrid: true,
		gridSize: 15
	},
	shapeDefaults: {
		id: "",
		name: "",
		title: "",
		category: "",
		group: "",
		groupName: null,
		locked: false,
		link: "",
		children: [],
		parent: "",
		resizeDir: ["tl", "tr", "br", "bl"],
		attribute: {
			container: false,
			visible: true,
			rotatable: true,
			linkable: true,
			markerOffset: 5,
		},
		dataAttributes: [],
		props: {
			x:0,
			y:0,
			w:120,
			h:80,
			zindex: 0,
			angle: 0
		},
		//形状样式
		shapeStyle: {
			alpha: 1
		},
		lineStyle: {
			lineWidth: 2,
			lineColor: "50,50,50",
			lineStyle: "solid"
		},
		//填充样式
		fillStyle: {
			type: "solid", //填充类型：none, solid, gradient, image
			color: "255,255,255"
			//无背景
//				type: none
			//线性渐变的配置
//				type: "gradient",
//				gradientType: "linear",
//				beginColor: "0,255,0",
//				endColor: "0,175,0",
//				angle: Math.PI * 1.5
			//径向渐变的配置
//				type: "gradient",
//				gradientType: "radial",
//				beginColor: "25,140,255",
//				endColor: "0,76,151",
//				radius: 0.75
			//显示为图片的配置
//				type: "image",
//				fileId: "", //图片ID
//				display: "", //显示方式 fill 等比填充, fit 自适应, stretch 铺满, original 原始大小, tile 平铺, static 静态定位（此时会应用imageX和imageY属性）
//				imageW: 10,
//				imageH :10
//				imageX: 0,
//				imageY: 0
		},
		path: [
			{
				actions: [
					{action: "move", x: "0", y: "0"},
					{action: "line", x: "w", y: "0"},
					{action: "line", x: "w", y: "h"},
					{action: "line", x: "0", y: "h"},
					{action: "close"}
				]
			}
		],
		//文本样式
		fontStyle: {
			fontFamily: "Arial",
			size: 13,
			color: "50,50,50",
			bold: false,
			italic: false,
			underline: false,
			textAlign: "center",
			vAlign: "middle",
			orientation: "vertical"
		},
		//字体文本样式
		textBlock: [
			{
				position: {x: 10, y: 0, w: "w-20", h: "h"},
				text: new Array(0)
			}
		],
		anchors: [{x: "w/2", y: "0"}, {x: "w/2", y: "h"}, {x: "0", y: "h/2"}, {x: "w", y: "h/2"}]
	},
	linkerDefaults: {
		id: "",
		name: "linker",
		text: new Array(0),
		group: "",
		linkerType: "broken",
		points: [],
		locked: false,
		dataAttributes: [],
		props: {
			zindex: 0
		},
		//形状样式
		lineStyle: {
			lineWidth: 2,
			lineColor: "50,50,50",
			lineStyle: "solid",
			beginArrowStyle: "none",
			endArrowStyle: "solidArrow"
		},
		//字体文本样式
		fontStyle: {
			fontFamily: "Arial",
			size: 13,
			color: "50,50,50",
			bold: false,
			italic: false,
			underline: false,
			textAlign: "center"
		}
	},
	categories: [],
	shapes: {},
	markers: {},
	/**
	 * 添加分类
	 * @param {} category
	 */
	addCategory: function(category){
		Schema.categories.push(category);
		CategoryMapping[category.name] = category;
	},
	/**
	 * 添加图形
	 * @param {} shape
	 */
	addShape: function(shape){
		if(typeof Schema.shapes[shape.name] != "undefined"){
			throw "--Duplicated shape name: " + shape.name;
		}
		if(shape.groupName){
			SchemaGroup.addGroupShape(shape.groupName, shape.name);
		}
		//对形状进行初始化
		Schema.shapes[shape.name] = this.initShape(shape);
	},
	/**
	 * 初始化一个图形，继承自shapeDefaults
	 * @param {} shape
	 */
	initShape: function(shape){
		var result = {};
		for(var key in this.shapeDefaults){
			if(key == "attribute"){
				result.attribute = this.extend(shape.attribute, this.shapeDefaults.attribute);
			}else if(key == "props"){
				result.props = this.extend(shape.props, this.shapeDefaults.props);
			}else if(key == "shapeStyle"){
				result.shapeStyle = this.extend(shape.shapeStyle, this.shapeDefaults.shapeStyle);
			}else if(key == "lineStyle"){
				result.lineStyle = this.extend(shape.lineStyle, this.shapeDefaults.lineStyle);
			}else if(key == "fillStyle"){
				result.fillStyle = this.extend(shape.fillStyle, this.shapeDefaults.fillStyle);
			}else if(key == "fontStyle"){
				result.fontStyle = this.extend(shape.fontStyle, this.shapeDefaults.fontStyle);
			}else if(key == "textBlock"){
				if(typeof shape[key] != "undefined"){
					result[key] = shape[key];
				}else{
					result[key] = [{
						position: this.extend({}, this.shapeDefaults.textBlock[0].position),
						text: new Array(0)
					}];
				}
			}else{
				if(typeof shape[key] != "undefined"){
					result[key] = shape[key];
				}else{
					result[key] = this.shapeDefaults[key];
				}
			}
		}
		if(shape.onCreated){
			result.onCreated = shape.onCreated;
		}
		if(shape.drawIcon){
			result.drawIcon = shape.drawIcon;
		}
		return result;
	},
	/**
	 * 继承两个对象
	 * @param {} child
	 * @param {} superObj
	 */
	extend: function(child, superObj){
		if(!child){
			child = {};
		}
		var result = {};
		for(var key in superObj){
			result[key] = superObj[key];
		}
		for(var key in child){
			result[key] = child[key];			
		}
		return result;
	},
	/**
	 * 添加全局的绘制指令
	 * @param {} name指令名
	 * @param {} command指令对象
	 */
	addGlobalCommand: function(name, command){
		GlobalCommand[name] = command;
	},
	/**
	 * 添加Marker画法
	 * @param {} name
	 * @param {} path
	 */
	addMarker: function(name, path){
		if(typeof Schema.markers[name] != "undefined"){
			throw "--Duplicated marker name: " + name;
		}
		Schema.markers[name] = path;
	},
	/**
	 * 清空Schema
	 */
	empty: function(){
		Schema.categories = [];
		Schema.shapes = {};
		CategoryMapping = {};
		SchemaGroup.groups = {};
	},
	/**
	 * Init schema
	 * getTextBlock
	 * getAnchors
	 */
	init: function(initFunctions){
		for(var key in Schema.shapes){
			var shape = Schema.shapes[key];
			//初始化Schema图形的各种函数
			this.initShapePath(shape);
			if(initFunctions){
				this.initShapeFunctions(shape);
			}
			this.initShapeDataAttribute(shape);
		}
	},
	/**
	 * 初始化图形的绘制路径
	 * 主要初始化引用的部分
	 * @param {} shape
	 */
	initShapePath: function(shape){
		if(shape.path){
			for(var i = 0; i < shape.path.length; i++){
				var cmd = shape.path[i];
				if(cmd.actions && cmd.actions.ref){
					//如果此指令节是引用类型
					shape.path[i].actions = GlobalCommand[cmd.actions.ref];
				}
			}
		}
	},
	/**
	 * 初始化图形的方法
	 * getPath(), getTextBlock(), getAnchors()
	 */
	initShapeFunctions: function(shape){
		//初始化getPath
		var pathEval = "shape.getPath = function(){" +
				"var color = [255,255,255];if(this.fillStyle.color && this.fillStyle.color.length > 0){color = this.fillStyle.color.split(',');}" + 
				"var r = color[0]; var g = color[1]; var b = color[2];" +
				"var w = this.props.w; var h = this.props.h; var lineWidth = this.lineStyle.lineWidth; ";
		pathEval += SchemaHelper.constructPathFunBody(shape.path) + "}";
		eval(pathEval);
		//初始化getAnchors
		var anchorsEval = "shape.getAnchors = function(){var w = this.props.w; var h = this.props.h; return [";
		for(var i = 0; i < shape.anchors.length; i++){
			var anchor = shape.anchors[i];
			anchorsEval += "{x:" + anchor.x +", y:" + anchor.y + "}"
			if(i < shape.anchors.length - 1){
				anchorsEval += ",";
			}
		}
		anchorsEval += "];}";
		eval(anchorsEval);
		//初始化textBlock，动态执行，在调用时进行eval
		shape.getTextBlock = function(){
			var tbs = this.textBlock;
			var w = this.props.w;
			var h = this.props.h;
			var result = [];
			for(var i = 0; i < tbs.length; i++){
				var tb = tbs[i];
				var p = tb.position;
				var newTb = {
					position: {x: eval(p.x), y: eval(p.y), w: eval(p.w), h: eval(p.h)},
					text: tb.text,
					fontStyle: tb.fontStyle
				};
				result.push(newTb);
			}
			return result;
		}
	},
	/**
	 * 初始化Marker画法
	 */
	initMarkers: function(){
		for(var name in Schema.markers){
			var pathEval = "Schema.markers['"+name+"'] = function(size){var w = size; var h = size; var lineWidth = this.lineStyle.lineWidth; ";
			pathEval += SchemaHelper.constructPathFunBody(Schema.markers[name]) + "}";
			eval(pathEval);
		}
	},
	/**
	 * 初始化图形的数据属性
	 * @param {} shape
	 */
	initShapeDataAttribute: function(shape){
		var categoryAttributes = CategoryMapping[shape.category].dataAttributes;
		if(!shape.dataAttributes){
			shape.dataAttributes = [];
		}
		if(categoryAttributes && categoryAttributes.length > 0){
			shape.dataAttributes = categoryAttributes.concat(shape.dataAttributes);
		}
	}
};
/**
 * 分类映射，以便通过分类的name，能快速得到分类
 * @type {}
 */
var CategoryMapping = {};
var GlobalCommand = {};

/**
 * 矩形全局画法
 */
Schema.addGlobalCommand("rectangle", [
	{action: "move", x: "0", y: "0"},
	{action: "line", x: "w", y: "0"},
	{action: "line", x: "w", y: "h"},
	{action: "line", x: "0", y: "h"},
	{action: "close"}
]);

/**
 * 圆全局画法
 */
Schema.addGlobalCommand("round", [
	{action: "move", x: "0", y: "h/2"},
    {action: "curve", x1: "0", y1: "-h/6", x2: "w", y2: "-h/6", x: "w", y: "h/2"},
    {action: "curve", x1: "w", y1: "h+h/6", x2: "0", y2: "h+h/6", x: "0", y: "h/2"},
    {action: 'close'}
]);

/**
 * 圆角矩形
 */
Schema.addGlobalCommand("roundRectangle", [
    {action: "move", x: "0", y: "10"},
	{action: "quadraticCurve", x1: "0", y1: "0", x: "10", y: "0"},
	{action: "line", x: "w-10", y: "0"},
	{action: "quadraticCurve", x1: "w", y1: "0", x: "w", y: "10"},
	{action: "line", x: "w", y: "h-10"},
	{action: "quadraticCurve", x1: "w", y1: "h", x: "w-10", y: "h"},
	{action: "line", x: "10", y: "h"},
	{action: "quadraticCurve", x1: "0", y1: "h", x: "0", y: "h-10"},
	{action: "close"}
]);


/** 添加图形BPMN Marker */

/**
 * 展开--Marker
 */
Schema.addMarker("expand", [
	{
		lineStyle: {
			lineWidth: 2,
			lineColor: "50,50,50",
			lineStyle: "solid"
		},
		fillStyle: {type: "none"},
		actions: [
			{action: "move", x: "w/2", y: "2"},
			{action: "line", x: "w/2", y: "h-2"},
			{action: "move", x: "2", y: "h/2"},
			{action: "line", x: "w-2", y: "h/2"},
			{action: "move", x: "0", y: "0"},
			{action: "line", x: "w", y: "0"},
			{action: "line", x: "w", y: "h"},
			{action: "line", x: "0", y: "h"},
			{action: "close"}
		]
	}
]);
/**
 * ad_hoc --Marker
 */
Schema.addMarker("ad_hoc", [
	{
		lineStyle: {
			lineWidth: 3,
			lineColor: "50,50,50",
			lineStyle: "solid"
		},
		fillStyle: {type: "none"},
		actions: [
			{action: "move", x: "0", y: "5*h/8"},
			{action: "curve", x1: "w/8-1", y1: "h/2-h/8", x2: "3*w/8-1", y2: "h/2-h/8", x: "w/2", y: "h/2"},
			{action: "curve", x1: "5*w/8-1", y1: "h/2+h/8", x2: "7*w/8+1", y2: "h/2+h/8", x: "w", y: "3*w/8"}
		]
	}
]);

/**
 * Compensation--Marker
 */
Schema.addMarker("compensation", [
	{
		lineStyle: {
			lineWidth: 2,
			lineColor: "50,50,50",
			lineStyle: "solid"
		},
		fillStyle: {type: "none"},
		actions: [
			{action: "move", x: "0", y: "h*0.5"},
			{action: "line", x: "w*0.5", y: "0"},
			{action: "line", x: "w*0.5", y: "h"},
			{action: "line", x: "0", y: "h*0.5"},
			{action: "move", x: "w*0.5", y: "h*0.5"},
			{action: "line", x: "w", y: "0"},
			{action: "line", x: "w", y: "h"},
			{action: "line", x: "w*0.5", y: "h*0.5"}
		]
	}
]);

/**
 * Parallel MI--Marker
 */
Schema.addMarker("parallel", [
  {
	    lineStyle: {
			lineWidth: 4,
			lineColor: "50,50,50",
			lineStyle: "solid"
		},
		fillStyle: {type: "none"},
		actions: [
			{action: "move", x: 1, y: "0"},
			{action: "line", x: 1, y: "h"},
			{action: "move", x: "w/2", y: "0"},
			{action: "line", x: "w/2", y: "h"},
			{action: "move", x: "w-1", y: "0"},
			{action: "line", x: "w-1", y: "h"}
		]
  }
]);

/**
 * Sequential Marker
 */
Schema.addMarker("sequential", [
  {
	    lineStyle: {
			lineWidth: 4,
			lineColor: "50,50,50",
			lineStyle: "solid"
		},
		fillStyle: {type: "none"},
		actions: [
			{action: "move", x: "0", y: 1},
			{action: "line", x: "w", y: 1},
			{action: "move", x: "0", y: "h/2"},
			{action: "line", x: "w", y: "h/2"},
			{action: "move", x: "0", y: "h-1"},
			{action: "line", x: "w", y: "h-1"}
		]
  }
]);

/**
 * Loop--Marker
 */
Schema.addMarker("loop", [
  {
  		lineStyle: {
			lineWidth: 2,
			lineColor: "50,50,50",
			lineStyle: "solid"
		},
		fillStyle: {type: "none"},
		actions: [
		    {action: "move", x: "w/2", y: "h"},
		    {action: "curve", x1: "w*7/6", y1: "h", x2: "w*7/6", y2: "0", x: "w/2", y: "0"},
		    {action: "curve", x1: "-w/6", y1: "0", x2: "-w*0.2/6", y2: "h*0.8", x: "w*0.2", y: "h*0.8"},
		    {action: "move", x: "w*0.2", y: "h*0.8"},
		    {action: "line", x: "-w*0.1", y: "h*0.7"},
		    {action: "move", x: "w*0.2", y: "h*0.8"},
		    {action: "line", x: "w*0.25", y: "h*0.6"}
		]
  }
]);

/** 添加Standard标准图形 */
Schema.addCategory({
	name: "standard",
	text: "Standard",
	dataAttributes: []
});

/**
 * Text
 */
Schema.addShape({
	name: "standardText",
	title: "",
	category: "standard",
	attribute: {
		linkable: false
	},
	props: {
		w: 160,
		h: 40
	},
	anchors: [],
	textBlock: [
		{
			position: {x: 0, y: 0, w: "w", h: "h"},
			text: ""
		}
	],
	path: [
		{
			lineStyle: {lineWidth: 0},
			fillStyle: {
				type: "none"
			},
			actions: {ref: "rectangle"}
		}
	]
});
/**
 * 图片
 */
Schema.addShape({
	name: "standardImage",
	title: "",
	attribute: {
		linkable: false,
		editable: false,
		visible: false
	},
	category: "standard",
	props: {
		w: 100,
		h: 70
	},
	textBlock: [
		{
			position: {x: 0, y: 0, w: "w", h: "h"},
			text: ""
		}
	],
	path: [
	    {
	    	lineStyle: {lineWidth: 0},
	    	actions: {ref: "rectangle"}
	    }
	]
});
Schema.addShape({
	name: "standardRectangle",
	title: "",
	attribute: {
		visible: false
	},
	category: "standard",
	props: {
		w: 100,
		h: 70
	},
	textBlock: [
		{
			position: {x: 0, y: 0, w: "w", h: "h"},
			text: ""
		}
	],
	path: [
	    {
	    	actions: {ref: "rectangle"}
	    }
	]
});

/**
 * Schema 帮助类
 * @type {}
 */
var SchemaHelper = {
	/**
	 * 构建画法方法体
	 * @param {} path
	 */
	constructPathFunBody: function(path){
		var pathEval = "return [";
		for(var i = 0; i < path.length; i++){
			var cmd = path[i];
			//一节路径
			pathEval += "{";
			if(cmd.fillStyle){
				var fillStyleStr = "fillStyle: {";
				var fill = cmd.fillStyle;
				if(typeof fill.type != "undefined"){
					fillStyleStr += "type:'" + fill.type + "',";
				}
				if(typeof fill.color != "undefined"){
					var colorArray = fill.color.split(",");
					var color = "";
					if(colorArray[0].indexOf("r") >= 0){
						color += "(" + colorArray[0] + ")+','+";
					}else{
						color += "'" + colorArray[0] + ",'+";
					}
					if(colorArray[1].indexOf("g") >= 0){
						color += "(" + colorArray[1] + ")+','+";
					}else{
						color += "'" + colorArray[1] + ",'+";
					}
					if(colorArray[2].indexOf("b") >= 0){
						color += "(" + colorArray[2] + ")";
					}else{
						color += "'" + colorArray[2] + "'";
					}
					fillStyleStr += "color:" + color + ",";
				}
				if(typeof fill.gradientType != "undefined"){
					fillStyleStr += "gradientType:" + fill.gradientType + ",";
				}
				if(typeof fill.beginColor != "undefined"){
					var colorArray = fill.beginColor.split(",");
					var color = "";
					if(colorArray[0].indexOf("r") >= 0){
						color += "(" + colorArray[0] + ")+','+";
					}else{
						color += "'" + colorArray[0] + ",'+";
					}
					if(colorArray[1].indexOf("g") >= 0){
						color += "(" + colorArray[1] + ")+','+";
					}else{
						color += "'" + colorArray[1] + ",'+";
					}
					if(colorArray[2].indexOf("b") >= 0){
						color += "(" + colorArray[2] + ")";
					}else{
						color += "'" + colorArray[2] + "'";
					}
					fillStyleStr += "beginColor:" + color + ",";
				}
				if(typeof fill.endColor != "undefined"){
					var colorArray = fill.endColor.split(",");
					var color = "";
					if(colorArray[0].indexOf("r") >= 0){
						color += "(" + colorArray[0] + ")+','+";
					}else{
						color += "'" + colorArray[0] + ",'+";
					}
					if(colorArray[1].indexOf("g") >= 0){
						color += "(" + colorArray[1] + ")+','+";
					}else{
						color += "'" + colorArray[1] + ",'+";
					}
					if(colorArray[2].indexOf("b") >= 0){
						color += "(" + colorArray[2] + ")";
					}else{
						color += "'" + colorArray[2] + "'";
					}
					fillStyleStr += "endColor:" + color + ",";
				}
				if(typeof fill.angle != "undefined"){
					fillStyleStr += "angle:" + fill.angle + ",";
				}
				if(typeof fill.radius != "undefined"){
					fillStyleStr += "radius:" + fill.radius + ",";
				}
				if(typeof fill.fileId != "undefined"){
					fillStyleStr += "fileId:'" + fill.fileId + "',";
				}
				if(typeof fill.display != "undefined"){
					fillStyleStr += "display:'" + fill.display + "',";
				}
				if(typeof fill.imageW != "undefined"){
					fillStyleStr += "imageW:" + fill.imageW + ",";
				}
				if(typeof fill.imageH != "undefined"){
					fillStyleStr += "imageH:" + fill.imageH + ",";
				}
				if(typeof fill.alpha != "undefined"){
					fillStyleStr += "alpha:" + fill.alpha + ",";
				}
				if(typeof fill.imageX != "undefined"){
					fillStyleStr += "imageX:" + fill.imageX + ",";
				}
				if(typeof fill.imageY != "undefined"){
					fillStyleStr += "imageY:" + fill.imageY + ",";
				}
				fillStyleStr = fillStyleStr.substring(0, fillStyleStr.length - 1);
				fillStyleStr += "},"
				pathEval += fillStyleStr;
			}
			if(cmd.lineStyle){
				var lineStyleStr = "lineStyle: {";
				if(typeof cmd.lineStyle.lineWidth != "undefined"){
					lineStyleStr += "lineWidth:" + cmd.lineStyle.lineWidth + ",";
				}
				if(typeof cmd.lineStyle.lineStyle != "undefined"){
					lineStyleStr += "lineStyle:'" + cmd.lineStyle.lineStyle + "',";
				}
				if(typeof cmd.lineStyle.lineColor != "undefined"){
					lineStyleStr += "lineColor:'" + cmd.lineStyle.lineColor + "',";
				}
				lineStyleStr = lineStyleStr.substring(0, lineStyleStr.length - 1);
				lineStyleStr += "},"
				pathEval += lineStyleStr;
			}
			pathEval += "actions:["
			//一节路径中的每个指令
			var actions = cmd.actions;
			for (var j = 0; j < actions.length; j++) {
				var action = actions[j];
				pathEval += "{action:'" + action.action +"'"
				if(action.action == "move" || action.action == "line"){
					pathEval += ",x:" + action.x + ",y:" + action.y;
				}else if(action.action == "curve"){
					pathEval += ",x1:" + action.x1 + ",y1:" + action.y1 + ",x2:" + action.x2 + ",y2:" + action.y2 + ",x:" + action.x + ",y:" + action.y;
				}else if(action.action == "quadraticCurve"){
					pathEval += ",x1:" + action.x1 + ",y1:" + action.y1 + ",x:" + action.x + ",y:" + action.y;
				}
				pathEval += "}";
				if(j < actions.length - 1){
					pathEval += ",";
				}
			}
			pathEval += "]}";
			if(i < path.length - 1){
				pathEval += ",";
			}
		}
		pathEval += "];";
		return pathEval;
	}
};

/**
 * 图形分组信息
 * @type {}
 */
var SchemaGroup = {
	/**
	 * @type {}
	 */
	groups: {},
	/**
	 * 添加一个图形到分组
	 * @param {} groupName
	 * @param {} shapeName
	 */
	addGroupShape: function(groupName, shapeName){
		if(!this.groupExists(groupName)){
			this.groups[groupName] = [shapeName];
		}else{
			this.groups[groupName].push(shapeName);
		}
	},
	/**
	 * 分组是否存在
	 * @param {} groupName
	 */
	groupExists: function(groupName){
		if(this.groups[groupName]){
			return true;
		}else{
			return false;		
		}
	},
	/**
	 * 获取一个分组图形
	 * @param {} groupName
	 */
	getGroup: function(groupName){
		return this.groups[groupName];
	}
};

/**
 * JSON Helper
 */
if (typeof JSON !== 'object') {
    JSON = {};
}
(function () {
    'use strict';
    function f(n) {
        return n < 10 ? '0' + n : n;
    }
    if (typeof Date.prototype.toJSON !== 'function') {
        Date.prototype.toJSON = function (key) {
            return isFinite(this.valueOf())
                ? this.getUTCFullYear()     + '-' +
                    f(this.getUTCMonth() + 1) + '-' +
                    f(this.getUTCDate())      + 'T' +
                    f(this.getUTCHours())     + ':' +
                    f(this.getUTCMinutes())   + ':' +
                    f(this.getUTCSeconds())   + 'Z'
                : null;
        };
        String.prototype.toJSON      =
            Number.prototype.toJSON  =
            Boolean.prototype.toJSON = function (key) {
                return this.valueOf();
            };
    }
    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;
    function quote(string) {
        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string'
                ? c
                : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }
    function str(key, holder) {
        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];
        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }
        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }
        switch (typeof value) {
        case 'string':
            return quote(value);
        case 'number':
            return isFinite(value) ? String(value) : 'null';
        case 'boolean':
        case 'null':
            return String(value);
        case 'object':
            if (!value) {
                return 'null';
            }
            gap += indent;
            partial = [];
            if (Object.prototype.toString.apply(value) === '[object Array]') {
                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }
                v = partial.length === 0
                    ? '[]'
                    : gap
                    ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
                    : '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }
            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    if (typeof rep[i] === 'string') {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {
                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }
            v = partial.length === 0
                ? '{}'
                : gap
                ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
                : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }
    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {
            var i;
            gap = '';
            indent = '';
            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }
            } else if (typeof space === 'string') {
                indent = space;
            }
            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }
            return str('', {'': value});
        };
    }
    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {
            var j;
            function walk(holder, key) {
                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }
            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }
            if (/^[\],:{}\s]*$/
                    .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
                j = eval('(' + text + ')');
                return typeof reviver === 'function'
                    ? walk({'': j}, '')
                    : j;
            }
            throw new SyntaxError('JSON.parse');
        };
    }
}());



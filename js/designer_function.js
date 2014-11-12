/**
 * 设计器对外提供的方法
 */
 


/**
 * 设计器方法：打开
 */
Designer.addFunction("open", function(definition){
	if(definition == ""){
		return;
	}
	if(typeof definition == "string"){
		eval('definition = ' + definition);
	}
	jQuery(".shape_box").remove();
	Model.define.elements = {};
	Model.persistence.elements = {};
 	Model.define.page = definition.page;
 	Model.persistence.page = Utils.copy(definition.page);
 	Designer.initialize.initCanvas();
 	var shapes = definition.elements;
    jQuery(".diagram_title").text(definition.title);
 	//先构造形状，再构造连接线，因为连接线的绘制过程有可能依赖所连接的图形
 	var shapeCount = 0;
 	for(var shapeId in shapes){
 		var shape = shapes[shapeId];
 		if(shape.name != "linker"){
 			Schema.initShapeFunctions(shape);
 			Designer.painter.renderShape(shape);
 			Model.add(shape, false);
 		}
 		shapeCount++;
 	}
 	for(var shapeId in shapes){
 		var shape = shapes[shapeId];
 		if(shape.name == "linker"){
 			Designer.painter.renderLinker(shape);
 			Model.add(shape, false);
 		}
 	}
 	if(shapeCount == 0){
 		Model.build();
 	}
 	Navigator.draw();
});

/**
 * 设计器方法：全选
 */
Designer.addFunction("selectAll", function(){
 	var shapes = Model.define.elements;
 	var shapeIds = [];
 	for(var shapeId in shapes){
 		shapeIds.push(shapeId);
 	}
 	Utils.selectShape(shapeIds);
});

/**
 * 设计器方法：修改字体样式
 */
Designer.addFunction("setFontStyle", function(style){
 	var selected = Utils.getSelected();
 	if(selected.length == 0){
 		return;
 	}
	for(var i = 0; i < selected.length; i++){
		var shape = selected[i];
		shape.fontStyle = Utils.copy(shape.fontStyle);
		if(typeof style.fontFamily != "undefined"){
			shape.fontStyle.fontFamily = style.fontFamily;
		}
		if(typeof style.size != "undefined"){
			shape.fontStyle.size = style.size;
		}
		if(typeof style.color != "undefined"){
			shape.fontStyle.color = style.color;
		}
		if(typeof style.bold != "undefined"){
			shape.fontStyle.bold = style.bold;
		}
		if(typeof style.italic != "undefined"){
			shape.fontStyle.italic = style.italic;
		}
		if(typeof style.underline != "undefined"){
			shape.fontStyle.underline = style.underline;
		}
		if(typeof style.textAlign != "undefined"){
			shape.fontStyle.textAlign = style.textAlign;
		}
		//连接线和形状不同的样式
		if(shape.name == "linker"){
			//如果是连接线
			Designer.painter.renderLinker(shape);
		}else{
			if(typeof style.vAlign != "undefined"){
				shape.fontStyle.vAlign = style.vAlign;
			}
			Designer.painter.renderShape(shape);
		}
	}
	Model.updateMulti(selected);
});

/**
 * 设计器方法：修改样式
 */
Designer.addFunction("setShapeStyle", function(style){
 	var selected = Utils.getSelected();
 	if(selected.length == 0){
 		return;
 	}
 	var changed = [];
	for(var i = 0; i < selected.length; i++){
		var shape = selected[i];
		//连接线和形状不同的样式
		if(shape.name != "linker"){
			//如果不是连接线
			//重新赋一下，因为有些新建的图形可能没有style属性
			shape.shapeStyle = Utils.copy(shape.shapeStyle);
			if(typeof style.alpha != "undefined"){
				shape.shapeStyle.alpha = style.alpha;
			}
			Designer.painter.renderShape(shape);
			changed.push(shape);
		}
	}
	Model.updateMulti(changed);
});

/**
 * 设计器方法：修改线条样式
 */
Designer.addFunction("setLineStyle", function(style){
 	var selected = Utils.getSelected();
 	if(selected.length == 0){
 		return;
 	}
 	var familyShapes = Utils.getFamilyShapes(selected);
 	selected = selected.concat(familyShapes);
	for(var i = 0; i < selected.length; i++){
		var shape = selected[i];
		//重新赋一下，因为有些新建的图形可能没有lineStyle属性
		shape.lineStyle = Utils.copy(shape.lineStyle);
		if(typeof style.lineWidth != "undefined"){
			shape.lineStyle.lineWidth = style.lineWidth;
		}
		if(typeof style.lineColor != "undefined"){
			shape.lineStyle.lineColor = style.lineColor;
		}
		if(typeof style.lineStyle != "undefined"){
			shape.lineStyle.lineStyle = style.lineStyle;
		}
		//连接线和形状不同的样式
		if(shape.name == "linker"){
			//如果是连接线
			if(typeof style.beginArrowStyle != "undefined"){
				shape.lineStyle.beginArrowStyle = style.beginArrowStyle;
				Schema.linkerDefaults.lineStyle.beginArrowStyle = style.beginArrowStyle;
			}
			if(typeof style.endArrowStyle != "undefined"){
				shape.lineStyle.endArrowStyle = style.endArrowStyle;
				Schema.linkerDefaults.lineStyle.endArrowStyle = style.endArrowStyle;
			}
			//连接线线条不可以为0
			if(shape.lineStyle.lineWidth == 0){
				shape.lineStyle.lineWidth = 1;
			}
			Designer.painter.renderLinker(shape);
		}else{
			Designer.painter.renderShape(shape);
		}
	}
	Model.updateMulti(selected);
});

/**
 * 设计器方法：修改填充样式
 */
Designer.addFunction("setFillStyle", function(style){
 	var selected = Utils.getSelected();
 	if(selected.length == 0){
 		return;
 	}
 	if(selected.length == 0){
 		return;
 	}
 	var changed = [];
	for(var i = 0; i < selected.length; i++){
		var shape = selected[i];
		if(shape.name != "linker"){
			//重新赋一下，因为有些新建的图形可能没有fillStyle属性
			shape.fillStyle = Utils.copy(shape.fillStyle);
			var type = shape.fillStyle.type;
			if(typeof style.type != "undefined"){
				//如果要修改填充类型，则要进行初始化
				changeFillType(shape, style.type);
				type = style.type;
			}
			if(typeof style.color != "undefined"){
				if(type == "solid"){
					//纯色，只可以修改color属性
					shape.fillStyle.color = style.color;
				}else if(type == "gradient"){
					shape.fillStyle.beginColor = GradientHelper.getLighterColor(style.color);
					shape.fillStyle.endColor = GradientHelper.getDarkerColor(style.color);
				}
			}
			if(type == "gradient"){
				//渐变的，可修改渐变色等属性
				if(typeof style.beginColor != "undefined"){
					shape.fillStyle.beginColor = style.beginColor;
				}
				if(typeof style.endColor != "undefined"){
					shape.fillStyle.endColor = style.endColor;
				}
				if(typeof style.gradientType != "undefined"){
					shape.fillStyle.gradientType = style.gradientType;
					if(style.gradientType == "linear"){
						delete shape.fillStyle.radius;
						shape.fillStyle.angle = 0;
					}else{
						delete shape.fillStyle.angle;
						shape.fillStyle.radius = 0.75;
					}
				}
				if(typeof style.radius != "undefined"){
					shape.fillStyle.radius = style.radius;
				}
				if(typeof style.angle != "undefined"){
					shape.fillStyle.angle = style.angle;
				}
				
			}
			if(type == "image"){
				//图片类型
				if(typeof style.display != "undefined"){
					shape.fillStyle.display = style.display;
				}
				if(typeof style.fileId != "undefined"){
					//如果要修改图片地址，删除原有的图片元素，绘制时重新加载
					shape.fillStyle.fileId = style.fileId;
				}
				if(typeof style.imageW != "undefined"){
					shape.fillStyle.imageW = style.imageW;
				}
				if(typeof style.imageH != "undefined"){
					shape.fillStyle.imageH = style.imageH;
				}
			}
			Designer.painter.renderShape(shape);
			changed.push(shape);
		}
	}
	Model.updateMulti(changed);
	/**
	 * 修改一个图形的填充类型
	 */
	function changeFillType(shape, type){
		//只有图形具有填充样式
		var oldStyle = shape.fillStyle;
		if(oldStyle.type != type){
			var newStyle = {type: type};
			//只调整不是此类型的图形
			if(type == "solid"){
				//改成纯色
				if(oldStyle.type == "gradient"){
					//以前是渐变的
					var newColor = GradientHelper.getDarkerColor(oldStyle.beginColor);
					newStyle.color = newColor;
				}else{
					newStyle.color = "255,255,255";
				}
			}else if(type == "gradient"){
				//改成渐变的
				var oldColor = oldStyle.color;
				if(oldStyle.type != "solid"){
					//如果以前不是纯色的
					oldColor = "255,255,255";
				}
				newStyle.gradientType = "linear";
				newStyle.angle = 0;
				newStyle.beginColor = GradientHelper.getLighterColor(oldColor);
				newStyle.endColor = GradientHelper.getDarkerColor(oldColor);
			}else if(type == "image"){
				newStyle.fileId = "";
				newStyle.display = "fill";
				newStyle.imageW = 10;
				newStyle.imageH = 10;
			}
			shape.fillStyle = newStyle;
		}
	}
});

/**
 * 设计器方法：修改连接线类型
 */
Designer.addFunction("setLinkerType", function(type){
 	var selected = Utils.getSelected();
 	if(selected.length == 0){
 		return;
 	}
 	var changed = [];
	for(var i = 0; i < selected.length; i++){
		var shape = selected[i];
		if(shape.name == "linker"){
			//如果是连接线
			shape.linkerType = type;
			Designer.painter.renderLinker(shape, true);
			changed.push(shape);
		}
	}
	Schema.linkerDefaults.linkerType = type;
	var selectedIds = Utils.getSelectedIds();
	if(selectedIds.length > 1){
		Designer.painter.drawControls(selectedIds);
	}
	Model.updateMulti(changed);
	Utils.showLinkerControls();
});

/**
 * 设计器方法：匹配大小
 */
Designer.addFunction("matchSize", function(size){
 	var selected = Utils.getSelected();
 	if(selected.length == 0 || !size){
 		return;
 	}
 	var maxW = null;
 	var maxH = null;
 	var linkerIds = []; //定义linkerIds变量，保存会变化的连接线id，随后再逐一进行计算
	for(var i = 0; i < selected.length; i++){
		var shape = selected[i];
		if(shape.name != "linker"){
			if(maxW == null || shape.props.w > maxW){
				maxW = shape.props.w;
			}
			if(maxH == null || shape.props.h > maxH){
				maxH = shape.props.h;
			}
		}
	}
	if(size.w == "auto"){
		size.w = maxW;
	}
	if(size.h == "auto"){
		size.h = maxH;
	}
	Utils.removeAnchors();
	var changed = [];
	for(var i = 0; i < selected.length; i++){
		var shape = selected[i];
		if(shape.name != "linker"){
			var shapeLinkers = Designer.op.changeShapeProps(shape, size);
			Utils.showAnchors(shape);
			Utils.mergeArray(linkerIds, shapeLinkers);
			changed.push(shape);
		}
	}
	for(var i = 0; i < linkerIds.length; i++){
		var id = linkerIds[i];
		var linker = Model.getShapeById(id);
		Designer.painter.renderLinker(linker, true);
		changed.push(linker);
	}
	Designer.painter.drawControls(Utils.getSelectedIds());
	Model.updateMulti(changed);
});

/**
 * 设计器方法：对齐图形
 * left center right top middle bottom
 */
Designer.addFunction("alignShapes", function(type){
 	var selected = Utils.getSelected();
 	if(selected.length == 0 || !type){
 		return;
 	}
 	var selectedIds = Utils.getSelectedIds();
 	var box = Utils.getControlBox(selectedIds);
 	var linkerIds = [];
 	Utils.removeAnchors();
 	var changed = [];
 	for(var i = 0; i < selected.length; i++){
		var shape = selected[i];
		if(shape.name != "linker"){
			changed.push(shape);
		}
		if(type == "left"){
			//左对齐
			if(shape.name != "linker"){
				var shapeBox = Utils.getShapeBox(shape);
				var newProps = {x: box.x - (shapeBox.x - shape.props.x)};
				var shapeLinkers = Designer.op.changeShapeProps(shape, newProps);
				Utils.showAnchors(shape);
				Utils.mergeArray(linkerIds, shapeLinkers);
			}else if(shape.from.id == null && shape.to.id == null){
				var linkerBox = Utils.getLinkerBox(shape);
				shape.from.x -= (linkerBox.x - box.x);
				shape.to.x -= (linkerBox.x - box.x);
				linkerIds.push(shape.id);
			}
		}else if(type == "center"){
			//右对齐
			var center = box.x + box.w/2;
			if(shape.name != "linker"){
				var newProps = {x: Math.round(center - shape.props.w/2)};
				var shapeLinkers = Designer.op.changeShapeProps(shape, newProps);
				Utils.showAnchors(shape);
				Utils.mergeArray(linkerIds, shapeLinkers);
			}else if(shape.from.id == null && shape.to.id == null){
				var linkerBox = Utils.getLinkerBox(shape);
				shape.from.x += Math.round(center - linkerBox.w/2 - linkerBox.x);
				shape.to.x += Math.round(center - linkerBox.w/2 - linkerBox.x);
				linkerIds.push(shape.id);
			}
		}else if(type == "right"){
			//右对齐
			var right = box.x + box.w;
			if(shape.name != "linker"){
				var shapeBox = Utils.getShapeBox(shape);
				var newProps = {x: right - shape.props.w - (shape.props.x - shapeBox.x)};
				var shapeLinkers = Designer.op.changeShapeProps(shape, newProps);
				Utils.showAnchors(shape);
				Utils.mergeArray(linkerIds, shapeLinkers);
			}else if(shape.from.id == null && shape.to.id == null){
				var linkerBox = Utils.getLinkerBox(shape);
				shape.from.x += (right - linkerBox.x - linkerBox.w);
				shape.to.x += (right - linkerBox.x - linkerBox.w);
				linkerIds.push(shape.id);
			}
		}else if(type == "top"){
			//上对齐
			if(shape.name != "linker"){
				var shapeBox = Utils.getShapeBox(shape);
				var newProps = {y: box.y - (shapeBox.y - shape.props.y)};
				var shapeLinkers = Designer.op.changeShapeProps(shape, newProps);
				Utils.showAnchors(shape);
				Utils.mergeArray(linkerIds, shapeLinkers);
			}else if(shape.from.id == null && shape.to.id == null){
				var linkerBox = Utils.getLinkerBox(shape);
				shape.from.y -= (linkerBox.y - box.y);
				shape.to.y -= (linkerBox.y - box.y);
				linkerIds.push(shape.id);
			}
		}else if(type == "middle"){
			//垂直居中对齐
			var middle = box.y + box.h/2;
			if(shape.name != "linker"){
				var newProps = {y: Math.round(middle - shape.props.h/2)};
				var shapeLinkers = Designer.op.changeShapeProps(shape, newProps);
				Utils.showAnchors(shape);
				Utils.mergeArray(linkerIds, shapeLinkers);
			}else if(shape.from.id == null && shape.to.id == null){
				var linkerBox = Utils.getLinkerBox(shape);
				shape.from.y += Math.round(middle - linkerBox.h/2 - linkerBox.y);
				shape.to.y += Math.round(middle - linkerBox.h/2 - linkerBox.y);
				linkerIds.push(shape.id);
			}
		}else if(type == "bottom"){
			//下对齐
			var bottom = box.y + box.h;
			if(shape.name != "linker"){
				var shapeBox = Utils.getShapeBox(shape);
				var newProps = {y: bottom - shape.props.h - (shape.props.y - shapeBox.y)};
				var shapeLinkers = Designer.op.changeShapeProps(shape, newProps);
				Utils.showAnchors(shape);
				Utils.mergeArray(linkerIds, shapeLinkers);
			}else if(shape.from.id == null && shape.to.id == null){
				var linkerBox = Utils.getLinkerBox(shape);
				shape.from.y += (bottom - linkerBox.y - linkerBox.h);
				shape.to.y += (bottom - linkerBox.y - linkerBox.h);
				linkerIds.push(shape.id);
			}
		}
	}
	//重绘连接线
	for(var i = 0; i < linkerIds.length; i++){
		var id = linkerIds[i];
		var linker = Model.getShapeById(id);
		Designer.painter.renderLinker(linker, true);
		changed.push(linker);
	}
	Designer.painter.drawControls(selectedIds);
	Model.updateMulti(changed);
});

/**
 * 设计器方法：分布图形
 * h, v
 */
Designer.addFunction("distributeShapes", function(type){
 	var selected = Utils.getSelected();
 	if(selected.length == 0 || !type){
 		return;
 	}
 	var selectedIds = Utils.getSelectedIds();
 	var box = Utils.getControlBox(selectedIds);
 	var linkerIds = [];
 	Utils.removeAnchors();
 	var shapes = [];
 	for(var i = 0; i < selected.length; i++){
		var shape = selected[i];
		if(shape.name != "linker"){
			shapes.push(shape);
		}
	}
	if(type == "h"){
		shapes.sort(function compare(a, b){
	 		return a.props.x - b.props.x;
	 	});
	 	var w = box.w;
	 	for(var i = 0; i < shapes.length; i++){
			var shape = shapes[i];
			w -= shape.props.w;
		}
		var space = w / (shapes.length - 1);
		var start = box.x;
		for(var i = 0; i < shapes.length; i++){
			var shape = shapes[i];
			var newProps = {x: start};
			var shapeLinkers = Designer.op.changeShapeProps(shape, newProps);
			Utils.showAnchors(shape);
			Utils.mergeArray(linkerIds, shapeLinkers);
			start += (shape.props.w + space);
		}
	}else{
		shapes.sort(function compare(a, b){
	 		return a.props.y - b.props.y;
	 	});
	 	var h = box.h;
	 	for(var i = 0; i < shapes.length; i++){
			var shape = shapes[i];
			h -= shape.props.h;
		}
		var space = h / (shapes.length - 1);
		var start = box.y;
		for(var i = 0; i < shapes.length; i++){
			var shape = shapes[i];
			var newProps = {y: start};
			var shapeLinkers = Designer.op.changeShapeProps(shape, newProps);
			Utils.showAnchors(shape);
			Utils.mergeArray(linkerIds, shapeLinkers);
			start += (shape.props.h + space);
		}
	}
	//重绘连接线
	for(var i = 0; i < linkerIds.length; i++){
		var id = linkerIds[i];
		var linker = Model.getShapeById(id);
		Designer.painter.renderLinker(linker, true);
		shapes.push(linker);
	}
	Designer.painter.drawControls(selectedIds);
	Model.updateMulti(shapes);
});

/**
 * 设计器方法：修改z轴层级
 * h, v
 */
Designer.addFunction("layerShapes", function(type){
 	var selected = Utils.getSelected();
 	if(selected.length == 0 || !type){
 		return;
 	}
 	selected.sort(function compare(a, b){
 		return a.props.zindex - b.props.zindex;
 	});
 	var start;
 	if(type == "front"){
 		//顶层
 		start = Model.maxZIndex;
 		for(var i = 0; i < selected.length; i++){
			var shape = selected[i];
			start += 1;
			shape.props.zindex = start;
		}
 	}else if(type == "forward"){
 		//上移一层
		var uplayer = null;
		var shapeIndex = null;
		//得到选中图形上层的形状
		for(var i = 0; i < selected.length; i++){
			var shape = selected[i];
			uplayer = getUplayerShape(shape);
			if(uplayer != null){
				shapeIndex = shape.props.zindex;
				break;
			}
		}
		if(uplayer == null){
			//选中形状的上方没有形状，不执行任何操作
			return;
		}
		var index = uplayer.props.zindex;
		var uplayerUp = getUplayerShape(uplayer);
		var bringTo = index + 1;
		if(uplayerUp != null){
			//如果图形上层形状，上层还有形状，取两个形状的中间值
			bringTo = index + (uplayerUp.props.zindex - index)/2;
		}
		var offset = bringTo - shapeIndex;
		for(var i = 0; i < selected.length; i++){
			var shape = selected[i];
			shape.props.zindex += offset;
		}
 	}else if(type == "back"){
 		//底层
 		start = Model.orderList[0].zindex; //取到最小的zindex
 		for(var i = selected.length - 1; i >= 0; i--){
			var shape = selected[i];
			start -= 1;
			shape.props.zindex = start;
		}
 	}else if(type == "backward"){
 		//下移一层
		var downlayer = null;
		var shapeIndex = null;
		//得到选中图形上层的形状
		for(var i = 0; i < selected.length; i++){
			var shape = selected[i];
			downlayer = getDownlayerShape(shape);
			if(downlayer != null){
				shapeIndex = shape.props.zindex;
				break;
			}
		}
		if(downlayer == null){
			//选中形状的上方没有形状，不执行任何操作
			return;
		}
		var index = downlayer.props.zindex;
		var downlayerDown = getDownlayerShape(downlayer);
		var bringTo = index - 1;
		if(downlayerDown != null){
			//如果图形上层形状，上层还有形状，取两个形状的中间值
			bringTo = index - (index - downlayerDown.props.zindex)/2;
		}
		var offset = bringTo - shapeIndex;
		for(var i = 0; i < selected.length; i++){
			var shape = selected[i];
			shape.props.zindex += offset;
		}
 	}
 	Model.updateMulti(selected);
 	
 	/**
 	 * 获取图形上层的并且没有被选中的形状
 	 */
 	function getUplayerShape(shape){
 		var shapeBox = Utils.getShapeBox(shape);
 		for(var j = 0; j < Model.orderList.length; j++){
			var order = Model.orderList[j];
			if(order.zindex <= shape.props.zindex || Utils.isSelected(order.id)){
				continue;
			}
			//如果某图形在当前图形上方，并且没有被选中
			var orderShape = Model.getShapeById(order.id);
			var orderShapeBox = Utils.getShapeBox(orderShape);
			if(Utils.rectCross(shapeBox, orderShapeBox)){
				//并且两个形状重叠了
				return orderShape;
			}
		}
		return null;
 	}
 	/**
 	 * 获取图形下层的并且没有被选中的形状
 	 */
 	function getDownlayerShape(shape){
 		var shapeBox = Utils.getShapeBox(shape);
 		for(var j = Model.orderList.length - 1; j >= 0; j--){
			var order = Model.orderList[j];
			if(order.zindex >= shape.props.zindex || Utils.isSelected(order.id)){
				continue;
			}
			//如果某图形在当前图形下方，并且没有被选中
			var orderShape = Model.getShapeById(order.id);
			var orderShapeBox = Utils.getShapeBox(orderShape);
			if(Utils.rectCross(shapeBox, orderShapeBox)){
				//并且两个形状重叠了
				return orderShape;
			}
		}
		return null;
 	}
});

/**
 * 设计器方法：组合
 */
Designer.addFunction("group", function(){
 	var selected = Utils.getSelected();
 	if(selected.length < 2){
 		//必须有两个以上，才可以组合
 		return;
 	}
 	var groupId = Utils.newId();
 	for(var i = 0; i < selected.length; i++){
		var shape = selected[i];
		shape.group = groupId;
	}
	Model.updateMulti(selected);
});


/**
 * 设计器方法：取消组合
 */
Designer.addFunction("ungroup", function(){
 	var selected = Utils.getSelected();
 	if(selected.length == 0){
 		return;
 	}
 	for(var i = 0; i < selected.length; i++){
		var shape = selected[i];
		shape.group = null;
	}
	Model.updateMulti(selected);
});

/**
 * 设计器方法：锁定
 */
Designer.addFunction("lockShapes", function(){
 	var selectedIds = Utils.getSelectedIds();
 	if(selectedIds.length == 0){
 		return;
 	}
 	var changed = [];
 	for(var i = 0; i < selectedIds.length; i++){
		var shape = Model.getShapeById(selectedIds[i]);
		shape.locked = true;
		changed.push(shape);
	}
	Utils.unselect();
	Utils.selectShape(selectedIds);
	Model.updateMulti(changed);
});


/**
 * 设计器方法：解除锁定
 */
Designer.addFunction("unlockShapes", function(){
	var selectedIds = Utils.getSelectedLockedIds();
 	if(selectedIds.length == 0){
 		return;
 	}
 	var changed = [];
 	for(var i = 0; i < selectedIds.length; i++){
		var shape = Model.getShapeById(selectedIds[i]);
		shape.locked = false;
		changed.push(shape);
	}
	var allIds = Utils.getSelectedIds();
	Utils.unselect();
	Utils.selectShape(allIds);
	Model.updateMulti(changed);
});

/**
 * 设计器方法：设置页面样式
 */
Designer.addFunction("setPageStyle", function(pageStyle){
	Model.updatePage(pageStyle);
});

/**
 * 设计器方法：设置设计器只读状态
 */
Designer.addFunction("setReadonly", function(readonly){
	if(typeof readonly != "boolean"){
		return;
	}
	if(readonly){
		//只读
		jQuery(".diagram_title").addClass("readonly");
		jQuery(".menubar").hide();
		jQuery(".toolbar").hide();
		//隐藏图形面板
		jQuery("#note_list").addClass("readonly");
		jQuery("#shape_panel").addClass("readonly");
		jQuery("#designer_viewport").addClass("readonly");
		//取消快捷键
		Designer.hotkey.cancel();
		Designer.op.cancel();
		jQuery(window).trigger("resize.designer");
		//隐藏Dock
		jQuery("#dock").hide();
		jQuery(".dock_view").hide();
		Dock.currentView = "";
		Designer.contextMenu.destroy();
	}
});

/**
 * 设计器方法：放大
 */
Designer.addFunction("zoomIn", function(){
	var current = Designer.config.scale;
	var newScale = current + 0.1;
	Designer.setZoomScale(newScale);
});

/**
 * 设计器方法：缩小
 */
Designer.addFunction("zoomOut", function(){
	var current = Designer.config.scale;
	var newScale = current - 0.1;
	Designer.setZoomScale(newScale);
});

/**
 * 设计器方法：设置缩放值
 */
Designer.addFunction("setZoomScale", function(newScale){
	if(newScale < 0.25 ){
		newScale = 0.25;
	}
	if(newScale > 4){
		newScale = 4;
	}
	Utils.hideLinkerCursor();
	Designer.config.scale = newScale;
	Designer.initialize.initCanvas();
	for(var shapeId in Model.define.elements){
 		var shape = Model.define.elements[shapeId];
		Designer.painter.renderShape(shape);
 	}
 	//重新选中
	var selectedIds = Utils.getSelectedIds();
	var lockIds = Utils.getSelectedLockedIds();
	Utils.mergeArray(selectedIds, lockIds);
	Utils.unselect();
	Utils.selectShape(selectedIds);
	Utils.showLinkerCursor();
});

/**
 * 设计器方法：对齐图形
 * left center right top middle bottom
 */
Designer.addFunction("setShapeProps", function(props){
 	var selected = Utils.getSelected();
 	if(selected.length == 0 || !props){
 		return;
 	}
 	var changed = [];
 	var linkerIds = [];
 	for(var i = 0; i < selected.length; i++){
		var shape = selected[i];
		if(shape.name != "linker"){
			var related = Designer.op.changeShapeProps(shape, props);
			changed.push(shape);
			if(related && related.length){
				Utils.mergeArray(linkerIds, related);
			}
		}
	}
	for(var i = 0; i < linkerIds.length; i++){
		var id = linkerIds[i];
		var linker = Model.getShapeById(id);
		Designer.painter.renderLinker(linker, true);
		changed.push(linker);
	}
	if(changed.length > 0){
		Model.updateMulti(changed);
	}
	var selectedIds = Utils.getSelectedIds();
	Utils.unselect();
	Utils.selectShape(selectedIds);
});

/**
 * 添加数据属性
 */
Designer.addFunction("addDataAttribute", function(attr){
	var selectedIds = Utils.getSelectedIds();
	var shape = Model.getShapeById(selectedIds[0]);
	if(!shape.dataAttributes){
		shape.dataAttributes = [];
	}
	attr.id = Utils.newId();
	attr.category = "custom";
	shape.dataAttributes.push(attr);
	Model.update(shape);
	Designer.painter.renderShape(shape);

});

/**
 * 添加数据属性
 */
Designer.addFunction("updateDataAttribute", function(newAttr){
	var selectedIds = Utils.getSelectedIds();
	var shape = Model.getShapeById(selectedIds[0]);
	if(!shape.dataAttributes){
		shape.dataAttributes = [];
	}
	var changed = false;
	for (var i = 0; i < shape.dataAttributes.length; i++) {
		var attr = shape.dataAttributes[i];
		if(attr.id == newAttr.id){
			shape.dataAttributes[i] = newAttr;
			changed = true;
		}
	}
	if(!changed){
		return;
	}
	Model.update(shape);
	Designer.painter.renderShape(shape);
});

/**
 * 通过ID获取一条数据属性
 */
Designer.addFunction("getDataAttrById", function(attrId){
	var selectedIds = Utils.getSelectedIds();
	var shape = Model.getShapeById(selectedIds[0]);
	if(!shape.dataAttributes){
		shape.dataAttributes = [];
	}
	for (var i = 0; i < shape.dataAttributes.length; i++) {
		var attr = shape.dataAttributes[i];
		if(attr.id == attrId){
			return attr;
		}
	}
	return null;
});

/**
 * 通过名字获取默认的数据属性
 */
Designer.addFunction("getDefaultDataAttrByName", function(name){
	var selectedIds = Utils.getSelectedIds();
	var shape = Model.getShapeById(selectedIds[0]);
	if(!shape.dataAttributes){
		shape.dataAttributes = [];
	}
	for (var i = 0; i < shape.dataAttributes.length; i++) {
		var attr = shape.dataAttributes[i];
		if(attr.category == "default" && attr.name == name){
			return attr;
		}
	}
	return null;
});

/**
 * 删除数据属性
 */
Designer.addFunction("deleteDataAttribute", function(attrId){
	var selectedIds = Utils.getSelectedIds();
	var shape = Model.getShapeById(selectedIds[0]);
	if(!shape.dataAttributes){
		shape.dataAttributes = [];
	}
	var changed = false;
	for (var i = 0; i < shape.dataAttributes.length; i++) {
		var attr = shape.dataAttributes[i];
		if(attr.id == attrId){
			shape.dataAttributes.splice(i, 1);
			changed = true;
		}
	}
	if(!changed){
		return;
	}
	MessageSource.doWithoutUpdateDock(function(){
		Model.update(shape);
	});
	Designer.painter.renderShape(shape);
});

/**
 * 设置分类
 */
Designer.addFunction("setSchema", function(schemaCategories, callback){
	if(schemaCategories.length == 0){
		Schema.empty();
		Schema.init(true);
		Designer.initialize.initShapes();
		if(callback){
			callback();
		}
		return;
	}
	Util.ajax({
		url: "/diagraming/schema",
		data: {categories: schemaCategories},
		type: "get",
		success: function(data){
			Schema.empty();
			eval(data);
			Schema.init(true);
			Designer.initialize.initShapes();
			if(callback){
				callback();
			}
		}
	});
});




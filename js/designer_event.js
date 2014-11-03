/**
 * 设计器事件处理
 */

/**
 * 初始化完毕事件
 */
Designer.events.addEventListener("initialized", function(){
	Designer.open(definition);
});

/**
 * 图形创建前
 */
Designer.events.addEventListener("create", function(shape){
	
});

/**
 * Demo状态下，是否进行了创建后提示
 * @type {Boolean}
 */
var demoCreatedTiped = false;
/**
 * 图形创建后
 */
Designer.events.addEventListener("created", function(shape){
	if(Designer.status == "demo" && !demoCreatedTiped){
		UI.showStartStep("created", $("#" + shape.id));
		demoCreatedTiped = true;
	}else {
		// can add operations after creation in this place
	}
});

/**
 * 连接线创建时
 */
Designer.events.addEventListener("linkerCreating", function(linker){
	
});

/**
 * 连接线创建后
 */
Designer.events.addEventListener("linkerCreated", function(linker){
	
});

/**
 * 选择变化后
 */
Designer.events.addEventListener("selectChanged", function(){
	UI.update();
	Dock.update();
	UI.showShapeOptions();
});

/**
 * 剪切板变化后
 */
Designer.events.addEventListener("clipboardChanged", function(clipboardLength){
	if(clipboardLength > 0){
		$("#bar_list_edit").children("li[ac=paste]").menuitem("enable");
	}else{
		$("#bar_list_edit").children("li[ac=paste]").menuitem("disable");
	}
});

/**
 * 撤销堆栈变化后
 */
Designer.events.addEventListener("undoStackChanged", function(stackLength){
	if(stackLength == 0){
		$("#bar_list_edit").children("li[ac=undo]").menuitem("disable");
		$("#bar_undo").button("disable");
	}else{
		$("#bar_list_edit").children("li[ac=undo]").menuitem("enable");
		$("#bar_undo").button("enable");
	}
});
/**
 * 恢复堆栈变化后
 */
Designer.events.addEventListener("redoStackChanged", function(stackLength){
	if(stackLength == 0){
		$("#bar_list_edit").children("li[ac=redo]").menuitem("disable");
		$("#bar_redo").button("disable");
	}else{
		$("#bar_list_edit").children("li[ac=redo]").menuitem("enable");
		$("#bar_redo").button("enable");
	}
});

/**
 * 拖动之前
 */
Designer.events.addEventListener("beforeResize", function(event){
	var shapes = event.shapes;
	var minSize = event.minSize;
	var dir = event.dir;
	if(shapes.length == 1){
		var shape = shapes[0];
		if(shape.name == "verticalPool"){
			//拖动泳池
			if(dir == "b"){
				var minH = 0;
				for (var i = 0; i < shape.children.length; i++) {
					var childId = shape.children[i];
					var child = Model.getShapeById(childId);
					if(child.name == "horizontalSeparator"){
						minH += child.props.h;
					}
				}
				if(minH == 0){
					minH = 90;
				}else{
					minH += 40;
				}
				minSize.h = minH;
			}else if(dir == "l" || dir == "r"){
				var minW = 20;
				var lane = null;
				var sepCount = 0 ;
				for (var i = 0; i < shape.children.length; i++) {
					var childId = shape.children[i];
					var child = Model.getShapeById(childId);
					if(child.name == "horizontalSeparator"){
						sepCount ++;
					}else if(child.name == "verticalLane"){
						if(lane == null || (child.props.x < lane.props.x && dir == "l") || (child.props.x > lane.props.x && dir == "r")){
							lane = child;
						}
						minW += child.props.w;
					}
				}
				if(lane != null){
					minW -= lane.props.w;
				}
				if(sepCount > 0){
					minW += 20;
				}
				minSize.w = minW;
			}
		}else if(shape.name == "verticalLane" && dir == "b"){
			//拖动泳池，限制高度
			var minH = 0;
			var lane = shape;
			var pool = Model.getShapeById(lane.parent);
			for (var i = 0; i < pool.children.length; i++) {
				var childId = pool.children[i];
				var child = Model.getShapeById(childId);
				if(child.name == "horizontalSeparator"){
					minH += child.props.h;
				}
			}
			if(minH == 0){
				minH = 50;
			}
			minSize.h = minH;
		}else if(shape.name == "horizontalPool"){
			//拖动泳池
			if(dir == "r"){
				var minW = 0;
				for (var i = 0; i < shape.children.length; i++) {
					var childId = shape.children[i];
					var child = Model.getShapeById(childId);
					if(child.name == "verticalSeparator"){
						minW += child.props.w;
					}
				}
				if(minW == 0){
					minW = 90;
				}else{
					minW += 40;
				}
				minSize.w = minW;
			}else if(dir == "t" || dir == "b"){
				var minH = 20;
				var lane = null;
				var sepCount = 0 ;
				for (var i = 0; i < shape.children.length; i++) {
					var childId = shape.children[i];
					var child = Model.getShapeById(childId);
					if(child.name == "verticalSeparator"){
						sepCount ++;
					}else if(child.name == "horizontalLane"){
						if(lane == null || (child.props.y < lane.props.y && dir == "t") || (child.props.y > lane.props.y && dir == "b")){
							lane = child;
						}
						minH += child.props.h;
					}
				}
				if(lane != null){
					minH -= lane.props.h;
				}
				if(sepCount > 0){
					minH += 20;
				}
				minSize.h = minH;
			}
		}else if(shape.name == "horizontalLane" && dir == "r"){
			//拖动泳池，限制高度
			var minW = 0;
			var lane = shape;
			var pool = Model.getShapeById(lane.parent);
			for (var i = 0; i < pool.children.length; i++) {
				var childId = pool.children[i];
				var child = Model.getShapeById(childId);
				if(child.name == "verticalSeparator"){
					minW += child.props.w;
				}
			}
			if(minW == 0){
				minW = 50;
			}
			minSize.w = minW;
		}else if(shape.name == "cls" || shape.name == "interface" || shape.name == "package"
			 || shape.name == "combinedFragment"){
			minSize.h = 50;
		}
	}
});

/**
 * 图形缩放时
 * 会影响子元素
 */
Designer.events.addEventListener("resizing", function(event){
	var shape = event.shape;
	var dir = event.dir;
	var offset = event.offset;
	var changed = [];
	if(shape.name == "verticalPool"){
		if(dir == "b"){
			//水平缩放
			for (var i = 0; i < shape.children.length; i++) {
				var childId = shape.children[i];
				var child = Model.getShapeById(childId);
				if(child.name == "verticalLane" || child.name == "verticalSeparatorBar"){
					child.props.h = shape.props.h - 40;
					Designer.painter.renderShape(child);
					changed.push(child);
				}
			}
		}else if(dir == "r"){
			if(shape.children && shape.children.length > 0){
				var lane = null;
				for (var i = 0; i < shape.children.length; i++) {
					//找到最右边的泳道
					var childId = shape.children[i];
					var child = Model.getShapeById(childId);
					if(child.name == "horizontalSeparator"){
						child.props.w = shape.props.w;
						Designer.painter.renderShape(child);
						changed.push(child);
					}
					if(child.name == "verticalLane" && (lane == null || child.props.x > lane.props.x)){
						lane = child;
					}
				}
				if(lane != null){
					lane.props.w += offset.w;
					Designer.painter.renderShape(lane);
					changed.push(lane);
				}
			}
		}else if(dir == "l"){
			if(shape.children && shape.children.length > 0){
				var lane = null;
				for (var i = 0; i < shape.children.length; i++) {
					//找到最上边的泳道
					var childId = shape.children[i];
					var child = Model.getShapeById(childId);
					if(child.name == "horizontalSeparator"){
						//控制分隔符
						child.props.x += offset.x;
						child.props.w += offset.w;
						Designer.painter.renderShape(child);
						changed.push(child);
					}else if(child.name == "verticalSeparatorBar"){
						child.props.x += offset.x;
						Designer.painter.renderShape(child);
						changed.push(child);
					}if(child.name == "verticalLane" && (lane == null || child.props.x < lane.props.x)){
						lane = child;
					}
				}
				if(lane != null){
					lane.props.w += offset.w;
					lane.props.x += offset.x;
					Designer.painter.renderShape(lane);
					changed.push(lane);
				}
			}
		}
	}else if(shape.name == "verticalLane"){
		//先修改泳池
		var pool = Model.getShapeById(shape.parent);
		changed = [pool];
		pool.props.w += offset.w;
		pool.props.h = shape.props.h+40;
		pool.props.x += offset.x;
		Designer.painter.renderShape(pool);
		if(dir == "r"){
			//为向右缩放，移动右边的泳池
			var updateLanes = [];
			var persisShape = Model.getPersistenceById(shape.id);
			for (var i = 0; i < pool.children.length; i++) {
				var childId = pool.children[i];
				if(childId != shape.id){
					var persisChild = Model.getPersistenceById(childId);
					var child = Model.getShapeById(childId);
					if(child.name == "horizontalSeparator"){
						//控制分隔符
						child.props.w += offset.w;
						Designer.painter.renderShape(child);
						changed.push(child);
					}else if(persisChild.props.x > persisShape.props.x && persisChild.name == "verticalLane"){
						//在缩放泳池的右边
						updateLanes.push(child);
					}
				}
			}
			if(updateLanes.length > 0){
				//获取泳池包含的图形，一起移动
				var containedShapes = Utils.getContainedShapes(updateLanes);
				//获取选中形状上的连接线
				var outlinkers = Utils.getOutlinkers(containedShapes);
				containedShapes = containedShapes.concat(outlinkers);
				updateLanes = updateLanes.concat(containedShapes)
				Designer.op.moveShape(updateLanes, {x: offset.w, y: 0});
				changed = changed.concat(updateLanes);
			}
		}else if(dir == "b"){
			//高度变了
			for (var i = 0; i < pool.children.length; i++) {
				var childId = pool.children[i];
				if(childId != shape.id){
					var child = Model.getShapeById(childId);
					if(child.name == "verticalLane" || child.name == "verticalSeparatorBar"){
						child.props.h = shape.props.h;
						Designer.painter.renderShape(child);
						changed.push(child);
					}
				}
			}
		}else if(dir == "l"){
			//为左缩放，移动左边的泳池
			var updateLanes = [];
			var persisShape = Model.getPersistenceById(shape.id);
			for (var i = 0; i < pool.children.length; i++) {
				var childId = pool.children[i];
				if(childId != shape.id){
					var persisChild = Model.getPersistenceById(childId);
					var child = Model.getShapeById(childId);
					if(child.name == "horizontalSeparator"){
						//控制分隔符
						child.props.x += offset.x;
						child.props.w += offset.w;
						Designer.painter.renderShape(child);
						changed.push(child);
					}else if(child.name == "verticalSeparatorBar"){
						child.props.x += offset.x;
						Designer.painter.renderShape(child);
						changed.push(child);
					}else if(persisChild.props.x < persisShape.props.x && persisChild.name == "verticalLane"){
						//在缩放泳池的右边
						updateLanes.push(child);
					}
				}
			}
			if(updateLanes.length > 0){
				//获取泳池包含的图形，一起移动
				var containedShapes = Utils.getContainedShapes(updateLanes);
				//获取选中形状上的连接线
				var outlinkers = Utils.getOutlinkers(containedShapes);
				containedShapes = containedShapes.concat(outlinkers);
				updateLanes = updateLanes.concat(containedShapes)
				Designer.op.moveShape(updateLanes, {x: offset.x, y: 0});
				changed = changed.concat(updateLanes);
			}
		}
	}else if(shape.name == "horizontalSeparator"){
		//水平分隔符
		var pool = Model.getShapeById(shape.parent);
		changed = [pool];
		pool.props.h += offset.h;
		Designer.painter.renderShape(pool);
		//移动下边的分隔符
		for (var i = 0; i < pool.children.length; i++) {
			var childId = pool.children[i];
			var child = Model.getShapeById(childId);
			if(childId == shape.id){
				continue;
			}
			if(child.name != "horizontalSeparator"){
				child.props.h += offset.h;
				Designer.painter.renderShape(child);
				changed.push(child);
			}else if(child.props.y > shape.props.y){
				child.props.y += offset.h;
				Designer.painter.renderShape(child);
				changed.push(child);
			}
		}
	}else if(shape.name == "horizontalPool"){
		if(dir == "r"){
			//水平缩放
			for (var i = 0; i < shape.children.length; i++) {
				var childId = shape.children[i];
				var child = Model.getShapeById(childId);
				if(child.name == "horizontalLane" || child.name == "horizontalSeparatorBar"){
					child.props.w = shape.props.w - 40;
					Designer.painter.renderShape(child);
					changed.push(child);
				}
			}
		}else if(dir == "b"){
			if(shape.children && shape.children.length > 0){
				var lane = null;
				for (var i = 0; i < shape.children.length; i++) {
					//找到最下边的泳道
					var childId = shape.children[i];
					var child = Model.getShapeById(childId);
					if(child.name == "verticalSeparator"){
						child.props.h = shape.props.h;
						Designer.painter.renderShape(child);
						changed.push(child);
					}
					if(child.name == "horizontalLane" && (lane == null || child.props.y > lane.props.y)){
						lane = child;
					}
				}
				if(lane != null){
					lane.props.h += offset.h;
					Designer.painter.renderShape(lane);
					changed.push(lane);
				}
			}
		}else if(dir == "t"){
			if(shape.children && shape.children.length > 0){
				var lane = null;
				for (var i = 0; i < shape.children.length; i++) {
					//找到最上边的泳道
					var childId = shape.children[i];
					var child = Model.getShapeById(childId);
					if(child.name == "verticalSeparator"){
						//控制分隔符
						child.props.y += offset.y;
						child.props.h += offset.h;
						Designer.painter.renderShape(child);
						changed.push(child);
					}else if(child.name == "horizontalSeparatorBar"){
						child.props.y += offset.y;
						Designer.painter.renderShape(child);
						changed.push(child);
					}if(child.name == "horizontalLane" && (lane == null || child.props.y < lane.props.y)){
						lane = child;
					}
				}
				if(lane != null){
					lane.props.h += offset.h;
					lane.props.y += offset.y;
					Designer.painter.renderShape(lane);
					changed.push(lane);
				}
			}
		}
	}else if(shape.name == "horizontalLane"){
		//先修改泳池
		var pool = Model.getShapeById(shape.parent);
		changed = [pool];
		pool.props.h += offset.h;
		pool.props.w += offset.w;
		pool.props.y += offset.y;
		Designer.painter.renderShape(pool);
		if(dir == "r"){
			//水平缩放
			for (var i = 0; i < pool.children.length; i++) {
				var childId = pool.children[i];
				if(childId != shape.id){
					var child = Model.getShapeById(childId);
					if(child.name == "horizontalLane" || child.name == "horizontalSeparatorBar"){
						child.props.w = shape.props.w;
						Designer.painter.renderShape(child);
						changed.push(child);
					}
				}
			}
		}else if(dir == "b"){
			//为向下缩放，移动下边的泳池
			var updateLanes = [];
			var persisShape = Model.getPersistenceById(shape.id);
			for (var i = 0; i < pool.children.length; i++) {
				var childId = pool.children[i];
				if(childId != shape.id){
					var persisChild = Model.getPersistenceById(childId);
					var child = Model.getShapeById(childId);
					if(child.name == "verticalSeparator"){
						//控制分隔符
						child.props.h += offset.h;
						Designer.painter.renderShape(child);
						changed.push(child);
					}else if(persisChild.props.y > persisShape.props.y && persisChild.name == "horizontalLane"){
						//在缩放泳池的右边
						updateLanes.push(child);
					}
				}
			}
			if(updateLanes.length > 0){
				//获取泳池包含的图形，一起移动
				var containedShapes = Utils.getContainedShapes(updateLanes);
				//获取选中形状上的连接线
				var outlinkers = Utils.getOutlinkers(containedShapes);
				containedShapes = containedShapes.concat(outlinkers);
				updateLanes = updateLanes.concat(containedShapes)
				Designer.op.moveShape(updateLanes, {x: 0, y: offset.h});
				changed = changed.concat(updateLanes);
			}
		}else if(dir == "t"){
			//为向上缩放，移动上边边的泳池
			var updateLanes = [];
			var persisShape = Model.getPersistenceById(shape.id);
			for (var i = 0; i < pool.children.length; i++) {
				var childId = pool.children[i];
				if(childId != shape.id){
					var persisChild = Model.getPersistenceById(childId);
					var child = Model.getShapeById(childId);
					if(child.name == "verticalSeparator"){
						//控制分隔符
						child.props.y += offset.y;
						child.props.h += offset.h;
						Designer.painter.renderShape(child);
						changed.push(child);
					}else if(child.name == "horizontalSeparatorBar"){
						child.props.y += offset.y;
						Designer.painter.renderShape(child);
						changed.push(child);
					}else if(persisChild.props.y < persisShape.props.y && persisChild.name == "horizontalLane"){
						//在缩放泳池的右边
						updateLanes.push(child);
					}
				}
			}
			if(updateLanes.length > 0){
				//获取泳池包含的图形，一起移动
				var containedShapes = Utils.getContainedShapes(updateLanes);
				//获取选中形状上的连接线
				var outlinkers = Utils.getOutlinkers(containedShapes);
				containedShapes = containedShapes.concat(outlinkers);
				updateLanes = updateLanes.concat(containedShapes)
				Designer.op.moveShape(updateLanes, {x: 0, y: offset.y});
				changed = changed.concat(updateLanes);
			}
		}
	}else if(shape.name == "verticalSeparator"){
		//水平分隔符
		var pool = Model.getShapeById(shape.parent);
		changed = [pool];
		pool.props.w += offset.w;
		Designer.painter.renderShape(pool);
		//移动下边的分隔符
		for (var i = 0; i < pool.children.length; i++) {
			var childId = pool.children[i];
			var child = Model.getShapeById(childId);
			if(childId == shape.id){
				continue;
			}
			if(child.name != "verticalSeparator"){
				child.props.w += offset.w;
				Designer.painter.renderShape(child);
				changed.push(child);
			}else if(child.props.x > shape.props.x){
				child.props.x += offset.w;
				Designer.painter.renderShape(child);
				changed.push(child);
			}
		}
	}
	return changed;
});

/**
 * 删除前事件
 */
Designer.events.addEventListener("beforeRemove", function(shapes){
	var temp = {};
	for(var i = 0; i < shapes.length; i++){
		var shape = shapes[i];
		temp[shape.id] = shape;
	}
	var addIds = []; //添加的图形id，比如删除分隔符，可能会删除分隔符标题栏
	for(var i = 0; i < shapes.length; i++){
		var shape = shapes[i];
		if(shape.name == "verticalSeparatorBar" && !temp[shape.parent] && addIds.indexOf(shape.id) < 0){
			delete temp[shape.id];
		}else if(shape.name == "horizontalSeparatorBar" && !temp[shape.parent] && addIds.indexOf(shape.id) < 0){
			delete temp[shape.id];
		}else if(shape.name == "horizontalSeparator"){
			//删除水平分隔符，查找删除后，是否还存在分隔符，否则把标题栏删掉
			var parent = Model.getShapeById(shape.parent);
			var bar = null;
			var leftCount = 0; //剩下的分隔符数量
			for (var j = 0; j < parent.children.length; j++) {
				var childId = parent.children[j];
				var child = Model.getShapeById(childId);
				if(child.name == "horizontalSeparator" && !temp[childId]){
					leftCount += 1;
				}else if(child.name == "verticalSeparatorBar"){
					bar = child;
				}
			}
			if(leftCount == 0 && bar != null){
				//删除后没有剩余的分隔符，并且没有添加过标题栏，则添加进去，一起删除
				temp[bar.id] = bar;
				if(addIds.indexOf(bar.id) < 0){
					addIds.push(bar.id);
				}
			}
		}else if(shape.name == "verticalSeparator"){
			//删除水平分隔符，查找删除后，是否还存在分隔符，否则把标题栏删掉
			var parent = Model.getShapeById(shape.parent);
			var bar = null;
			var leftCount = 0; //剩下的分隔符数量
			for (var j = 0; j < parent.children.length; j++) {
				var childId = parent.children[j];
				var child = Model.getShapeById(childId);
				if(child.name == "verticalSeparator" && !temp[childId]){
					leftCount += 1;
				}else if(child.name == "horizontalSeparatorBar"){
					bar = child;
				}
			}
			if(leftCount == 0 && bar != null){
				//删除后没有剩余的分隔符，并且没有添加过标题栏，则添加进去，一起删除
				temp[bar.id] = bar;
				if(addIds.indexOf(bar.id) < 0){
					addIds.push(bar.id);
				}
			}
		}
	}
	shapes = [];
	for(var id in temp){
		shapes.push(temp[id]);
	}
	return shapes;
});

/**
 * 删除后事件
 */
Designer.events.addEventListener("removed", function(event){
	var shapes = event.shapes;
	var range = event.range;
	var changedIds = event.changedIds;
	var changed = [];
	var relatedParent = [];
	for (var i = 0; i < shapes.length; i++) {
		var shape = shapes[i];
		if(shape.name == "verticalLane" && range.indexOf(shape.parent) < 0 && relatedParent.indexOf(shape.parent) < 0){
			//删除泳道，而且不删除所在的泳池
			relatedParent.push(shape.parent);
		}else if(shape.name == "horizontalLane" && range.indexOf(shape.parent) < 0 && relatedParent.indexOf(shape.parent) < 0){
			relatedParent.push(shape.parent);
		}else if(shape.name == "verticalSeparatorBar" && range.indexOf(shape.parent) < 0){
			var parent = Model.getShapeById(shape.parent);
			parent.props.w -= shape.props.w;
			parent.props.x += shape.props.w;
			Designer.painter.renderShape(parent);
			if(changedIds.indexOf(shape.parent) < 0){
				changedIds.push(shape.parent);
				changed.push(parent);
			}
		}else if(shape.name == "horizontalSeparatorBar" && range.indexOf(shape.parent) < 0){
			var parent = Model.getShapeById(shape.parent);
			parent.props.y += shape.props.h;
			parent.props.h -= shape.props.h;
			Designer.painter.renderShape(parent);
			if(changedIds.indexOf(shape.parent) < 0){
				changedIds.push(shape.parent);
				changed.push(parent);
			}
		}else if(shape.name == "horizontalSeparator" && range.indexOf(shape.parent) < 0 && relatedParent.indexOf(shape.parent) < 0){
			relatedParent.push(shape.parent);
		}else if(shape.name == "verticalSeparator" && range.indexOf(shape.parent) < 0 && relatedParent.indexOf(shape.parent) < 0){
			relatedParent.push(shape.parent);
		}
	}
	for (var index = 0; index < relatedParent.length; index++) {
		var parentId = relatedParent[index];
		var parent = Model.getShapeById(parentId);
		if(parent.name == "verticalPool"){
			//计算泳道宽度
			var w = 0;
			var laneCount = 0;
			for (var i = 0; i < parent.children.length; i++) {
				var childId = parent.children[i];
				var child = Model.getShapeById(childId);
				if(child.name == "verticalLane"){
					laneCount++;
					w += child.props.w;
				}else if(child.name == "verticalSeparatorBar"){
					w += child.props.w;
				}
			}
			if(laneCount > 0){
				parent.props.w = w;
				Designer.painter.renderShape(parent);
				if(changedIds.indexOf(parentId) < 0){
					changedIds.push(parentId);
					changed.push(parent);
				}
				var childrenChanged = Utils.rangeChildren(parent);
				changed = changed.concat(childrenChanged);
			}
		}else if(parent.name == "horizontalPool"){
			//计算泳道高度
			var h = 0;
			var laneCount = 0;
			for (var i = 0; i < parent.children.length; i++) {
				var childId = parent.children[i];
				var child = Model.getShapeById(childId);
				if(child.name == "horizontalLane"){
					laneCount++;
					h += child.props.h;
				}else if(child.name == "horizontalSeparatorBar"){
					h += child.props.h;
				}
			}
			if(laneCount > 0){
				parent.props.h = h;
				Designer.painter.renderShape(parent);
				if(changedIds.indexOf(parentId) < 0){
					changedIds.push(parentId);
					changed.push(parent);
				}
				var childrenChanged = Utils.rangeChildren(parent);
				changed = changed.concat(childrenChanged);
			}
		}
	}
	return changed;
});

/**
 * 分组图形改变后事件
 */
Designer.events.addEventListener("shapeChanged", function(event){
	
});


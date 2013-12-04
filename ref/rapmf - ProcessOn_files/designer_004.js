
/**
 * 核心JS
 */
Schema.init(true);
Schema.initMarkers();

$(function(){
	Designer.init();
	if(role == "trial"){
		Designer.status = "demo";
	}else if(role == "viewer"){
		Designer.status = "readonly";
	}
	if(Designer.status == "readonly"){
		Designer.setReadonly(true);
		return;
	}
	UI.init();
	Dock.init();
	Navigator.init();
	if(Designer.status == "demo"){
		UI.gettingStart();
	}
});


var Designer = {
	/**
	 * 配置信息
	 */
	config: {
		//图形面板图形宽高
		panelItemWidth: 30,
		panelItemHeight: 30,
		//画布相对于画布容器的margin值
		pageMargin: 1000,
		//锚点尺寸
		anchorSize: 8,
		//旋转点尺寸
		rotaterSize: 9, 
		//锚点边框颜色
		anchorColor: "#833",
		//选择器边框颜色
		selectorColor: "#833",
		//默认缩放值
		scale: 1
	},
	/**
	 * 设计器状态，值包括：demo | readonly | presentation
	 * @type {String}
	 */
	status: "",
	/**
	 * 初始化
	 */
	initialize: {
		/**
		 * 是否初始化完成
		 * @type {Boolean}
		 */
		initialized: false,
		/**
		 * 初始化布局
		 */
		initLayout: function(){
			//Init designer layout.
			$(window).bind("resize.designer", function(){
				var height = $(window).height() - $("#designer_header").outerHeight() - $("#designer_footer").outerHeight();
				$(".layout").height(height);
				if($("#demo_signup").length){
					$("#designer_layout").height(height - $("#demo_signup").outerHeight());
				}
			});
			$(window).trigger("resize.designer");
		},
		/**
		 * 初始化对象
		 */
		initModel: function(){
			Model.define = {
				page: Utils.copy(Schema.pageDefaults),
				elements: {}
			};
			Model.persistence = {
				page: Utils.copy(Schema.pageDefaults),
				elements: {}
			};
		},
		/**
		 * 初始化画布
		 */
		initCanvas: function(){
			var w = Model.define.page.width.toScale();
			var h = Model.define.page.height.toScale();
			var pageColor = Model.define.page.backgroundColor;
			var darker = Utils.getDarkerColor(pageColor); //较深一级的颜色，为画布外围颜色、网格浅色线条
			var darkest = Utils.getDarkestColor(pageColor); //更深一级的颜色，为网格深色线条颜色
			//图形画布容器
			$("#designer_canvas").css({
				"background-color": "rgb("+darker+")"
			});
			//网布网格
			var grids = $("#designer_grids");
			grids.attr({
				width: w,
				height: h
			});
			var ctx = grids[0].getContext("2d");
			ctx.clearRect(0,0,w,h);
			var padding = Model.define.page.padding.toScale();
			var gridsW = w - padding*2;
			var gridsH = h - padding*2;
			//绘制网格
			ctx.fillStyle = "rgb(" + pageColor + ")";
			ctx.beginPath();
			ctx.rect(padding, padding, gridsW, gridsH);
			ctx.fill();
			var gridSize = Math.round(Model.define.page.gridSize.toScale());
			if(gridSize < 10){
				gridSize = 10;
			}
			if(Model.define.page.showGrid){
				ctx.translate(padding, padding);
				ctx.lineWidth = 1;
				ctx.save();
				var current = 0.5;
				var index = 0;
				//画横线
				while(current <= gridsH){
					ctx.restore();
					if(index % 4 == 0){
						//画深色线条
						ctx.strokeStyle = "rgb(" + darkest + ")";
					}else{
						//浅色线条
						ctx.strokeStyle = "rgb("+darker+")";
					}
					ctx.beginPath();
					ctx.moveTo(0, current);
					ctx.lineTo(gridsW, current);
					current += gridSize;
					index ++;
					ctx.stroke();
				}
				current = 0.5;
				index = 0;
				//画竖线
				while(current <= gridsW){
					ctx.restore();
					if(index % 4 == 0){
						//画深色线条
						ctx.strokeStyle = "rgb(" + darkest + ")";
					}else{
						//浅色线条
						ctx.strokeStyle = "rgb("+darker+")";
					}
					ctx.beginPath();
					ctx.moveTo(current, 0);
					ctx.lineTo(current, gridsH);
					current += gridSize;
					index ++;
					ctx.stroke();
				}
			}
			//画布的容器区域
			$("#canvas_container").css({
				width: w,
				height: h,
				padding: Designer.config.pageMargin
			});
			if(!this.initialized){
				//如果没有初始化完毕，即第一次初始化，调整滚动条
				$("#designer_layout").scrollTop(Designer.config.pageMargin - 10);
				$("#designer_layout").scrollLeft(Designer.config.pageMargin - 10);
			}
			var domShowGrid = $("#bar_list_page").children("li[ac=set_page_showgrid]");
			domShowGrid.menuitem("unselect");
			if(Model.define.page.showGrid){
				domShowGrid.menuitem("select");
			}
		},
		/**
		 * 初始化形状
		 */
		initShapes: function(){
			//Init shape panel.
			$("#shape_panel").empty();
			for(var i = 0; i < Schema.categories.length; i++){
				var cate = Schema.categories[i];
				if(cate.name == "standard"){
					continue;
				}
				$("#shape_panel").append("<div class='panel_container'><h3 class='panel_title'><div class='ico ico_accordion'></div>" + cate.text + "</h3><div id='panel_" + cate.name + "' class='content'></div></div>");
			}
			$(".panel_title").unbind().bind("click", function(){
				$(this).parent().toggleClass("panel_collapsed");
			});
			//Init schema items.
			for(var name in Schema.shapes){
				var shape = Schema.shapes[name];
				if(shape.attribute.visible && shape.category != "standard"){
					if(!shape.groupName){
						appendPanelItem(shape);
					}else{
						var groupShapes = SchemaGroup.getGroup(shape.groupName);
						if(groupShapes[0] == name){
							appendPanelItem(shape, shape.groupName);
						}
					}
				}
			}
			/**
			 * 添加图形DOM元素
			 */
			function appendPanelItem(shape, group){
				shape = Utils.copy(shape);
				var html = "<div class='panel_box' shapeName='" + shape.name + "'><canvas class='panel_item' width='"+(Designer.config.panelItemWidth)+"' height='"+(Designer.config.panelItemHeight)+"'></canvas></div>";
				var panelBox = $(html).appendTo("#panel_" + shape.category);
				if(group){
					panelBox.append("<div class='group_icon' onmousedown='Designer.op.showPanelGroup(\""+group+"\", event, this)'></div>")
				}
				var canvas = panelBox.children()[0];
				//绑定鼠标悬浮时，显示大图
				panelBox.bind("mouseenter", function(){
					if($(this).hasClass("readonly")){
						return;
					}
					var thumb = $("#shape_thumb");
					thumb.children("div").text(shape.title);
					var ctx = thumb.children("canvas")[0].getContext("2d");
					thumb.attr("current", shape.name);
					var props = {
						x: 0,
						y: 0,
						w: shape.props.w,
						h: shape.props.h,
						angle: shape.props.angle
					};
					var maxWidth = 160;
					var maxHeight = 160;
					ctx.clearRect(0, 0, maxWidth, maxHeight);
					//计算图标的宽高以及位移
					if(shape.props.w >= shape.props.h){
						if(shape.props.w > maxWidth){
							props.w = maxWidth;
							props.h = parseInt(shape.props.h / shape.props.w * props.w);
						}
					}else{
						if(shape.props.h > maxHeight){
							props.h = maxHeight;
							props.w = parseInt(shape.props.w / shape.props.h * props.h);
						}
					}
					thumb.children("canvas").attr({
						"width": maxWidth + 20,
						height: props.h + 20
					});
					thumb.show();
					shape.props = props;
					ctx.save();
					ctx.lineJoin = "round";
					ctx.globalAlpha = shape.shapeStyle.alpha;
					var translateX = (maxWidth + 20 - props.w)/2;
					var translateY = 10;
					ctx.translate(translateX, translateY);
					ctx.translate(props.w/2, props.h/2);
					ctx.rotate(props.angle);
					ctx.translate(-(props.w/2), -(props.h/2));
					Designer.painter.renderShapePath(ctx, shape, false, function(){
						if($("#shape_thumb[current="+shape.name+"]:visible").length > 0){
							panelBox.trigger("mouseenter");
						}
					});
					//绘制BPMN Marker
					Designer.painter.renderMarkers(ctx, shape, false);
					ctx.restore();
					ctx.translate(translateX, translateY);
					//控制坐标
					var top = panelBox.offset().top - $("#designer_header").outerHeight() + panelBox.height()/2 - thumb.outerHeight()/2;
					if(top < 5){
						top = 5;
					}else if(top + thumb.outerHeight() > $("#designer_viewport").height() - 5){
						top = $("#designer_viewport").height() - 5 - thumb.outerHeight();
					}
					thumb.css("top", top);
				}).bind("mouseleave", function(){
					$("#shape_thumb").hide();
				});
				//绘制图形
				Designer.painter.drawPanelItem(canvas, shape.name);
			}
			//Draw panel node items
			initPanelShapes();
			/**
			 * 绘制图形面板
			 */
			function initPanelShapes(){
				$(".panel_box").die().live("mousedown", function(downE){
					var currentShape = $(this);
					if(currentShape.hasClass("readonly")){
						return;
					}
					var name = currentShape.attr("shapeName");
					//给图片面板绑定Draggable，可创建图形
					var anchorInLinkers = [];
					Designer.op.changeState("creating_from_panel");
					//currentShape.css("position", "absolute");
					var createdShape = null;
					var createdBox = null;
					var designer_canvas = $("#designer_canvas");
					var creatingCanvas = getCreatingCanvas(name);
					$("#designer").bind("mousemove.creating", function(moveE){
						setCreatingCanvas(creatingCanvas, moveE);
					});
					$("#canvas_container").bind("mousemove.create", function(e){
						var location = Utils.getRelativePos(e.pageX, e.pageY, designer_canvas);
						if(createdShape == null){
							createdShape = createShape(name, location.x, location.y);
							createdBox = $("#" + createdShape.id);
							createdBox.attr("class", "shape_box_creating");
						}
						createdBox.css({
							left: location.x - createdBox.width()/2 + "px",
							top: location.y - createdBox.height()/2 + "px",
							"z-index": Model.orderList.length
						});
						createdShape.props.x = location.x.restoreScale() - createdShape.props.w/2;
						createdShape.props.y = location.y.restoreScale() - createdShape.props.h/2;
						//显示对齐线
						var p = createdShape.props;
						var snaped = Designer.op.snapLine(p, [createdShape.id], true, createdShape);
						if(snaped.attach){
							createdShape.attachTo = snaped.attach.id;
						}else{
							delete createdShape.attachTo;
						}
						createdBox.css({
							left: (createdShape.props.x - 10).toScale() + "px",
							top: (createdShape.props.y - 10).toScale() + "px",
							"z-index": Model.orderList.length
						});
						//判断是否有锚点在连接线上
						anchorInLinkers = Utils.getShapeAnchorInLinker(createdShape);
						Designer.op.hideLinkPoint();
						for(var i = 0; i < anchorInLinkers.length; i++){
							var anchorInLinker = anchorInLinkers[i];
							for ( var ai = 0; ai < anchorInLinker.anchors.length; ai++) {
								var an = anchorInLinker.anchors[ai];
								Designer.op.showLinkPoint(Utils.toScale(an));
							}
						}
					});
					var created = false;
					//判断mouseup是否发生在了画布上
					$("#canvas_container").bind("mouseup.create", function(e){
						created = true;
					});
					$(document).bind("mouseup.create", function(){
						$(this).unbind("mouseup.create");
						$("#designer").unbind("mousemove.creating");
						$("#creating_shape_container").hide();
						Designer.op.hideLinkPoint();
						Designer.op.hideSnapLine();
						$("#canvas_container").unbind("mouseup.create").unbind("mousemove.create");
						if(createdShape != null){
							if(created == false){
								createdBox.remove();
							}else{
								//创建成功
								MessageSource.beginBatch();
								//发送形状创建事件
								if(createdShape.onCreated){
									var result = createdShape.onCreated();
									if(result == false){
										createdBox.remove();
										MessageSource.commit();
										return;
									}
								}
								createdBox.attr("class", "shape_box");
								Designer.events.push("created", createdShape);
								Model.add(createdShape);
								//如果形状锚点有落在连接线上的情况，则要自动连接
								var shapeCtx = Utils.getShapeContext(createdShape.id);
								var shapeBoxPos = createdBox.position();
								var radius = 7;
								for(var i = 0; i < anchorInLinkers.length; i++){
									var anchorInLinker = anchorInLinkers[i];
									var linker = anchorInLinker.linker;
									if(anchorInLinker.type == "line"){
										//锚点落在了连接线的线上，这时候要创建出一条连接线
										var oriLinker = Utils.copy(linker);
										var newLinker = Utils.copy(linker);
										newLinker.id = Utils.newId();
										if(anchorInLinker.anchors.length == 1){
											//如果有一个锚点落在了连接线上
											var anchor = anchorInLinker.anchors[0];
											var angle = Utils.getPointAngle(createdShape.id, anchor.x, anchor.y, radius);
											linker.to = {id: createdShape.id, x: anchor.x, y: anchor.y, angle: angle};
											newLinker.from = {id: createdShape.id, x: anchor.x, y: anchor.y, angle: angle};
										}else if(anchorInLinker.anchors.length == 2){
											//有两个锚点落在了连接线上
											var anchor1 = anchorInLinker.anchors[0];
											var anchor2 = anchorInLinker.anchors[1];
											//判断两个锚点哪个距离连接线的起点距离较近，则作为以前连线的终点
											var distance1 = Utils.measureDistance(linker.from, anchor1);
											var distance2 = Utils.measureDistance(linker.from, anchor2);
											var toAnchor, fromAnchor;
											if(distance1 < distance2){
												toAnchor = anchor1;
												fromAnchor = anchor2;
											}else{
												toAnchor = anchor2;
												fromAnchor = anchor1;
											}
											var angle = Utils.getPointAngle(createdShape.id, toAnchor.x, toAnchor.y, radius);
											linker.to = {id: createdShape.id, x: toAnchor.x, y: toAnchor.y, angle: angle};
											//计算新创建的连接线
											angle = Utils.getPointAngle(createdShape.id, fromAnchor.x, fromAnchor.y, radius);
											newLinker.from = {id: createdShape.id, x: fromAnchor.x, y: fromAnchor.y, angle: angle};
										}
										if(anchorInLinker.anchors.length <= 2){
											//最多支持两个点落在连接线上的情况
											Designer.painter.renderLinker(linker, true);
											Model.update(linker);
											Designer.painter.renderLinker(newLinker, true);
											newLinker.props.zindex = Model.maxZIndex + 1;
											Model.add(newLinker);
											//抛出事件
											Designer.events.push("linkerCreated", newLinker);
										}
									}else{
										var anchor = anchorInLinker.anchors[0];
										var angle = Utils.getPointAngle(createdShape.id, anchor.x, anchor.y, radius);
										if(anchorInLinker.type == "from"){
											linker.from = {id: createdShape.id, x: anchor.x, y: anchor.y, angle: angle};
										}else{
											linker.to = {id: createdShape.id, x: anchor.x, y: anchor.y, angle: angle};
										}
										Designer.painter.renderLinker(linker, true);
										Model.update(linker);
									}
								}
								Utils.unselect();
								Utils.selectShape(createdShape.id);
								MessageSource.commit();
								Designer.op.editShapeText(createdShape);
							}
						}
						currentShape.css({
							left: "0px",
							top: "0px"
						});
						Designer.op.resetState();
					});
				});
			}
			/**
			 * 创建一个所创建图形的画布，并在上边绘制图形
			 */
			function getCreatingCanvas(name){
				var canvas = $("#creating_shape_canvas");
				var container = $("#creating_shape_container");
				if(canvas.length == 0){
					container = $("<div id='creating_shape_container'></div>").appendTo("#designer");
					canvas = $("<canvas id='creating_shape_canvas' width='"+(Designer.config.panelItemWidth)+"' height='"+(Designer.config.panelItemHeight)+"'></canvas>").appendTo(container);
				}
				container.css({
					left: "0px",
					top: "0px",
					width: $(".panel_container").width(),
					height: $("#shape_panel").outerHeight()
				});
				Designer.painter.drawPanelItem(canvas[0], name);
				return canvas;
			}
			/**
			 * 设置创建时图形的坐标
			 */
			function setCreatingCanvas(canvas, e){
				$("#creating_shape_container").show();
				var location = Utils.getRelativePos(e.pageX, e.pageY, $("#creating_shape_container"));
				canvas.css({
					left: location.x - Designer.config.panelItemWidth/2,
					top: location.y - Designer.config.panelItemHeight/2
				});
			}
			/**
			 * 创建形状
			 * @param schemaName
			 * @param centerX
			 * @param centerY
			 * @returns
			 */
			function createShape(shapeName, centerX, centerY){
				var newId = Utils.newId();
				var shape = Schema.shapes[shapeName];
				var x = centerX.restoreScale() - shape.props.w / 2;
				var y = centerY.restoreScale() - shape.props.h / 2;
				var newShape = Model.create(shapeName, x, y);
				Designer.painter.renderShape(newShape);
				return newShape;
			}
		}
	},
	/**
	 * 快捷键
	 * @type {}
	 */
	hotkey: {
		/**
		 * 初始化快捷键
		 */
		init: function(){
			//初始化快捷键
			var movingShapes = null; //在外围定义movingShapes变量，目的是在移动形状时，不重复获取
			$(document).unbind("keydown.hotkey").bind("keydown.hotkey", function(e){
				if(e.ctrlKey && e.keyCode == 65){
					//全选ctrl+a
					Designer.selectAll();
					e.preventDefault();
				}else if(e.keyCode == 46 || e.keyCode == 8){
					//删除 Delete或者Backspace
					Designer.op.removeShape();
					e.preventDefault();
				}else if(e.ctrlKey && e.keyCode == 90){
					//撤销ctrl+z
					MessageSource.undo();
					e.preventDefault();
				}else if(e.ctrlKey && e.keyCode == 89){
					//恢复ctrl+y
					MessageSource.redo();
					e.preventDefault();
				}else if(e.ctrlKey && !e.shiftKey && e.keyCode == 67){
					//复制ctrl+c
					Designer.clipboard.copy();
					e.preventDefault();
				}else if(e.ctrlKey && e.keyCode == 88){
					//剪切ctrl+x
					Designer.clipboard.cut();
					e.preventDefault();
				}else if(e.ctrlKey && e.keyCode == 86){
					//粘贴ctrl+v
					Designer.clipboard.paste();
					e.preventDefault();
				}else if(e.ctrlKey && e.keyCode == 68){
					//复用ctrl+d
					Designer.clipboard.duplicate();
					e.preventDefault();
				}else if(e.ctrlKey && e.shiftKey && e.keyCode == 66){
					//格式刷ctrl+b
					Designer.clipboard.brush();
					e.preventDefault();
				}else if(e.ctrlKey && e.keyCode == 190){
					//放大ctrl+ >
					Designer.zoomIn();
					e.preventDefault();
				}else if(e.ctrlKey && e.keyCode == 188){
					//缩小ctrl+ <
					Designer.zoomOut();
					e.preventDefault();
				}else if(e.keyCode >= 37 && e.keyCode <= 40){
					//移动选中的图形，上下左右
					if(movingShapes == null){
						var selected = Utils.getSelected();
						//先获取形状的家族图形，一起移动，父级、子级、兄弟
						var familyShapes = Utils.getFamilyShapes(selected);
						selected = selected.concat(familyShapes);
						//获取包含的图形，一起移动
						var containedShapes = Utils.getContainedShapes(selected);
						selected = selected.concat(containedShapes);
						//获取吸附的图形，一起移动
						var attachedShapes = Utils.getAttachedShapes(selected);
						selected = selected.concat(attachedShapes);
						//获取选中形状上的连接线
						var outlinkers = Utils.getOutlinkers(selected);
						movingShapes = selected.concat(outlinkers);
					}
					if(movingShapes.length > 0){
						e.preventDefault();
						//步长为10，如果按着ctrl，为微调，步长为1
						var step = 10;
						if(e.ctrlKey){
							step = 1;
						}
						Utils.hideLinkerCursor();
						UI.hideShapeOptions();
						if(e.keyCode == 37){
							//左移
							Designer.op.moveShape(movingShapes, {x: -step, y: 0});
						}else if(e.keyCode == 38){
							//上移
							Designer.op.moveShape(movingShapes, {x: 0, y: -step});
						}else if(e.keyCode == 39){
							//右移
							Designer.op.moveShape(movingShapes, {x: step, y: 0});
						}else if(e.keyCode == 40){
							//下移
							Designer.op.moveShape(movingShapes, {x: 0, y: step});
						}
						$(document).unbind("keyup.moveshape").bind("keyup.moveshape", function(){
							//发生了拖动，修改定义
							Model.updateMulti(movingShapes);
							movingShapes = null;
							$(document).unbind("keyup.moveshape");
							Designer.op.hideTip();
							Utils.showLinkerCursor();
							UI.showShapeOptions();
						});
					}
				}else if(e.keyCode == 221 && e.ctrlKey){
					//顶层、上移一层ctrl+]
					var type = "front";
					if(e.shiftKey){
						type = "forward";
					}
					Designer.layerShapes(type);
				}else if(e.keyCode == 219 && e.ctrlKey){
					//底层、下移一层ctrl+[
					var type = "back";
					if(e.shiftKey){
						type = "backward";
					}
					Designer.layerShapes(type);
				}else if(e.keyCode == 71 && e.ctrlKey){
					e.preventDefault();
					//组合、取消组合ctrl+G
					if(e.shiftKey){
						Designer.ungroup();
					}else{
						Designer.group();
					}
				}else if(e.keyCode == 76 && e.ctrlKey){
					e.preventDefault();
					//锁定、解锁ctrl+L
					if(e.shiftKey){
						Designer.unlockShapes();
					}else{
						Designer.lockShapes();
					}
				}else if(e.keyCode == 18){
					//Alt，可拖动画布
					Designer.op.changeState("drag_canvas");
				}else if(e.keyCode == 27){
					//Esc
					if(!Designer.op.state){
						Utils.unselect();
						$(".menu.list").hide();
						$(".menu").hide();
						$(".color_picker").hide();
					}else if(Designer.op.state == "creating_free_text" || Designer.op.state == "creating_free_linker"){
						Designer.op.resetState();
					}
				}else if(e.keyCode == 84 && !e.ctrlKey){
					//T，插入文本
					$(".menu.list").hide();
					Designer.op.changeState("creating_free_text");
				}else if(e.keyCode == 73 && !e.ctrlKey){
					//I，插入图片
					$(".menu.list").hide();
					UI.showImageSelect(function(fileId, w, h){
						UI.insertImage(fileId, w, h);
					});
					$("#designer_contextmenu").hide();
				}else if(e.keyCode == 76 && !e.ctrlKey){
					//T，插入文本
					$(".menu.list").hide();
					Designer.op.changeState("creating_free_linker");
					$("#designer_contextmenu").hide();
				}else if(e.keyCode == 66 && e.ctrlKey){
					//Ctrl + B，加粗
					var selectedIds = Utils.getSelectedIds();
					if(selectedIds.length > 0){
						var shape = Model.getShapeById(selectedIds[0]);
						Designer.setFontStyle({bold: !shape.fontStyle.bold});
						UI.update();
					}
				}else if(e.keyCode == 73 && e.ctrlKey){
					//Ctrl + I，斜体
					var selectedIds = Utils.getSelectedIds();
					if(selectedIds.length > 0){
						var shape = Model.getShapeById(selectedIds[0]);
						Designer.setFontStyle({italic: !shape.fontStyle.italic});
						UI.update();
					}
				}else if(e.keyCode == 85 && e.ctrlKey){
					//Ctrl + U，下划线
					var selectedIds = Utils.getSelectedIds();
					if(selectedIds.length > 0){
						var shape = Model.getShapeById(selectedIds[0]);
						Designer.setFontStyle({underline: !shape.fontStyle.underline});
						UI.update();
					}
					e.preventDefault();
				}else if(e.keyCode == 32 && !e.ctrlKey){
					//空格，编辑文本
					var selectedIds = Utils.getSelectedIds();
					if(selectedIds.length == 1){
						var shape = Model.getShapeById(selectedIds[0]);
						Designer.op.editShapeText(shape);
					}
					e.preventDefault();
				}else if(e.keyCode == 121){
					//F10，进入演示视图
					e.preventDefault();
					Dock.enterPresentation();
				}
			});
			$("input,textarea,select").die().live("keydown.hotkey", function(e){
				//阻止冒泡
				e.stopPropagation();
			});
		},
		/**
		 * 取消快捷键
		 */
		cancel: function(){
			$(document).unbind("keydown.hotkey");
		}
	},
	/**
	 * 右键菜单
	 * @type {}
	 */
	contextMenu: {
		init: function(){
			$("#designer_contextmenu").unbind("mousedown").bind("mousedown", function(e){
				e.stopPropagation();
			});
			$("#designer_contextmenu").find("li:not(.devider)").unbind("click").bind("click", function(){
				var item = $(this);
				if(!item.menuitem("isDisabled") && item.children(".extend_menu").length == 0){
					Designer.contextMenu.execAction(item);
					Designer.contextMenu.hide();
				}
			});
			$("#canvas_container").unbind("contextmenu").bind("contextmenu", function(e){
				e.preventDefault();
				var canvas = $("#designer_canvas");
				var pos = Utils.getRelativePos(e.pageX, e.pageY, canvas);
				Designer.contextMenu.show(pos.x, pos.y);
			});
		},
		/**
		 * 取消右键菜单
		 */
		destroy: function(){
			$("#canvas_container").unbind("contextmenu");
			this.hide();
		},
		/**
		 * 记录菜单位置
		 * @type {}
		 */
		menuPos: {x: 0, y: 0, shape: null},
		/**
		 * 打开右键菜单
		 * @param {} x
		 * @param {} y
		 */
		show: function(x, y){
			this.menuPos.x = x;
			this.menuPos.y = y;
			var menu = $("#designer_contextmenu");
			var currentFocus = Utils.getShapeByPosition(x, y, false);
			menu.children().hide();
			menu.children("li[ac=selectall]").show();
			menu.children(".devi_selectall").show();
			menu.children("li[ac=drawline]").show();
			var clipLen = Designer.clipboard.elements.length;
			if(currentFocus == null){
				//画布
				if(clipLen > 0){
					menu.children("li[ac=paste]").show();
					menu.children(".devi_clip").show();
				}
			}else{
				var shape = currentFocus.shape;
				this.menuPos.shape = shape;
				//形状
				if(shape.locked){
					//如果形状是锁定的
					if(clipLen > 0){
						menu.children("li[ac=paste]").show();
						menu.children(".devi_clip").show();
					}
					menu.children("li[ac=unlock]").show();
					menu.children(".devi_shape").show();
				}else{
					menu.children("li[ac=cut]").show();
					menu.children("li[ac=copy]").show();
					menu.children("li[ac=duplicate]").show();
					if(clipLen > 0){
						menu.children("li[ac=paste]").show();
					}
					menu.children(".devi_clip").show();
					menu.children("li[ac=front]").show();
					menu.children("li[ac=back]").show();
					menu.children("li[ac=lock]").show();
					var selectedIds = Utils.getSelectedIds();
					var count = selectedIds.length;
					if(count >= 2){
						menu.children("li[ac=group]").show();
						$("#ctxmenu_align").show();
					}
					var groupCount = Utils.getSelectedGroups().length;
					if(groupCount >= 1){
						menu.children("li[ac=ungroup]").show();
					}
					menu.children(".devi_shape").show();
					if(count == 1 && shape.name != "linker" && shape.link){
						menu.children("li[ac=changelink]").show();
					}
					if(shape.name == "linker" || (shape.textBlock && shape.textBlock.length > 0)){
						menu.children("li[ac=edit]").show();
					}
					menu.children("li[ac=delete]").show();
					menu.children(".devi_del").show();
				}
			}
			menu.css({
				display: "block",
				"z-index": Model.orderList.length + 3,
				left: x,
				top: y
			});
			$(document).bind("mousedown.ctxmenu", function(){
				Designer.contextMenu.hide();
			});
		},
		/**
		 * 隐藏右键菜单
		 */
		hide: function(){
			$("#designer_contextmenu").hide();
			$(document).unbind("mousedown.ctxmenu");
		},
		/**
		 * 执行一个右键菜单指令
		 * @param {} cmd
		 */
		execAction: function(item){
			var action = item.attr("ac");
			if(action == "cut"){
				Designer.clipboard.cut();
			}else if(action == "copy"){
				Designer.clipboard.copy();
			}else if(action == "paste"){
				Designer.clipboard.paste(this.menuPos.x, this.menuPos.y);
			}else if(action == "duplicate"){
				Designer.clipboard.duplicate();
			}else if(action == "front"){
				Designer.layerShapes("front");
			}else if(action == "back"){
				Designer.layerShapes("back");
			}else if(action == "lock"){
				Designer.lockShapes();
			}else if(action == "unlock"){
				Designer.unlockShapes();
			}else if(action == "group"){
				Designer.group();
			}else if(action == "ungroup"){
				Designer.ungroup();
			}else if(action == "align_shape"){
				var align = item.attr("al");
				Designer.alignShapes(align);
			}else if(action == "edit"){
				Designer.op.editShapeText(this.menuPos.shape, this.menuPos);
			}else if(action == "delete"){
				Designer.op.removeShape();
			}else if(action == "selectall"){
				Designer.selectAll();
			}else if(action == "drawline"){
				Designer.op.changeState("creating_free_linker");
			}else if(action == "changelink"){
				UI.showInsertLink();
			}
		}
	},
	/**
	 * 初始化入口
	 */
	init: function(){
		this.initialize.initLayout();
		this.initialize.initModel();
		this.initialize.initCanvas();
		this.initialize.initShapes();
		this.hotkey.init();
		this.contextMenu.init();
		//初始化图形操作
		Designer.op.init();
		this.initialize.initialized = true;
		//发送初始化完毕事件
		Designer.events.push("initialized");
	},
	/**
	 * 用户操作类
	 * @type {}
	 */
	op: {
		/**
		 * 初始化用户操作
		 */
		init: function(){
			var canvas = $("#designer_canvas");
			var container = $("#canvas_container");
			//绑定在画布上鼠标移动时，显示移动、连线，还是框选
			container.unbind("mousemove.operate").bind("mousemove.operate", function(hoverEvent){
				if(Designer.op.state != null){
					return;
				}
				//鼠标移动一下，就重新初始化鼠标操作
				Designer.op.destroy();
				var relativePos = Utils.getRelativePos(hoverEvent.pageX, hoverEvent.pageY, canvas);
				var focus = Utils.getShapeByPosition(relativePos.x, relativePos.y);
				if(focus != null){
					if(focus.type == "dataAttribute"){
						Designer.op.linkClickable(focus.attribute.value, relativePos);
					}else if(focus.type == "linker"){
						container.css("cursor", "pointer");
						Designer.op.shapeSelectable(focus.shape);
						var linker = focus.shape;
						var index = focus.pointIndex; //鼠标在第几个拐点之间，由此来判断是否可重置折线
						if(linker.linkerType == "broken" && index > 1 && index <= linker.points.length){
							//在折线拐线上，可以拖动
							Designer.op.brokenLinkerChangable(linker, index - 1);
						}else if(linker.from.id == null && linker.to.id == null){
							container.css("cursor", "move");
							Designer.op.shapeDraggable();
						}
						Designer.op.linkerEditable(linker);
					}else if(focus.type == "linker_point"){
						container.css("cursor", "move");
						Designer.op.shapeSelectable(focus.shape);
						Designer.op.linkerDraggable(focus.shape, focus.point);
						Designer.op.linkerEditable(focus.shape);
					}else if(focus.type == "linker_text"){
						container.css("cursor", "text");
						Designer.op.shapeSelectable(focus.shape);
						Designer.op.linkerEditable(focus.shape);
					}else{
						if(focus.type == "shape"){
							if(focus.shape.locked){
								container.css("cursor", "default");
								Designer.op.shapeSelectable(focus.shape);
							}else{
								container.css("cursor", "move");
								Designer.op.shapeSelectable(focus.shape);
								Designer.op.shapeEditable(focus.shape);
								Designer.op.shapeDraggable();
								if(focus.shape.link){
									Designer.op.linkClickable(focus.shape.link, relativePos);
								}
							}
						}else{
							//在边界上，可连线 
							container.css("cursor", "crosshair");
							Designer.op.shapeSelectable(focus.shape);
							Designer.op.shapeLinkable(focus.shape, focus.linkPoint);
						}
						if(focus.shape.parent){
							Utils.showAnchors(Model.getShapeById(focus.shape.parent));
						}else{
							Utils.showAnchors(focus.shape);
						}
					}
				}else{
					//如果鼠标坐标下没有图形，则可以进行多图形的选择
					container.css("cursor", "default");
					Designer.op.shapeMultiSelectable();
				}
			});
		},
		/**
		 * 取消用户操作
		 */
		cancel: function(){
			$("#canvas_container").unbind("mousemove.operate").css("cursor", "default");
			this.destroy();
		},
		/**
		 * 销毁操作状态
		 */
		destroy: function(){
			$("#designer_canvas").unbind("mousedown.drag").unbind("dblclick.edit")
				.unbind("mousedown.draglinker").unbind("mousedown.select").unbind("mousedown.brokenLinker")
				.unbind("dblclick.edit_linker");
			$("#canvas_container").unbind("mousedown.link").unbind("mousedown.create_text")
				.unbind("mousedown.drag_canvas");
			$("#designer_layout").unbind("mousedown.multiselect");
			Utils.hideAnchors();
			$("#link_spot").hide();
		},
		/**
		 * 操作状态
		 * @type {String}
		 */
		state: null,
		/**
		 * 修改操作状态
		 * @param {} state
		 */
		changeState: function(state){
			this.state = state;
			if(state == "creating_free_text"){
				//创建自由文本
				this.destroy();
				$("#canvas_container").css("cursor", "crosshair");
				this.textCreatable();
			}else if(state == "creating_free_linker"){
				//创建自由连接线
				this.destroy();
				$("#canvas_container").css("cursor", "crosshair");
				this.shapeLinkable();
			}else if(state == "drag_canvas"){
				this.destroy();
				this.canvasDraggable();
			}else if(state == "changing_curve"){
				this.destroy();
			}
		},
		/**
		 * 重置操作状态
		 */
		resetState: function(){
			this.state = null;
			$("#canvas_container").css("cursor", "default");
		},
		/**
		 * 选中图形
		 */
		shapeSelectable: function(shape){
			var canvas = $("#designer_canvas");
			canvas.bind("mousedown.select", function(downE){
				Designer.op.changeState("seelcting_shapes");
				var shapeId = shape.id;
				var selectIds = [];
				if(downE.ctrlKey){
					//如果按着ctrl，可以多选
					var selectIds = Utils.getSelectedIds();
					if(Utils.isSelected(shapeId)){
						//如果选中了，取消选择
						Utils.removeFromArray(selectIds, shapeId);
					}else{
						selectIds.push(shapeId);
					}
					Utils.unselect();
					if(selectIds.length > 0){
						Utils.selectShape(selectIds);
					}
				}else if(Utils.selectIds.indexOf(shapeId) < 0){
					Utils.unselect();
					Utils.selectShape(shapeId);
				}
				$(document).bind("mouseup.select", function(){
					Designer.op.resetState();
					canvas.unbind("mousedown.select");
					$(document).unbind("mouseup.select");
				});
			});
		},
		/**
		 * 形状拖动
		 */
		shapeDraggable: function(){
			var canvas = $("#designer_canvas");
			var container = $("#canvas_container");
			canvas.bind("mousedown.drag", function(downE){
				Utils.hideLinkerCursor();
				Utils.hideLinkerControls();
				Designer.op.changeState("dragging");
				//初始坐标，要取相对画布的坐标
				var begin = Utils.getRelativePos(downE.pageX, downE.pageY, canvas);
				var selected = Utils.getSelected();
				//拖动图形时，是否显示对齐线
				var snap = true;
				if(selected.length == 1 && selected[0].name == "linker"){
					snap = false;
				}
				var bounding = null;
				if(snap){
					bounding = Utils.getShapesBounding(selected);
				}
				//先获取形状的家族图形，一起移动，父级、子级、兄弟
				var familyShapes = Utils.getFamilyShapes(selected);
				selected = selected.concat(familyShapes);
				//获取包含的图形，一起移动
				var containedShapes = Utils.getContainedShapes(selected);
				selected = selected.concat(containedShapes);
				//获取吸附的图形，一起移动
				var attachedShapes = Utils.getAttachedShapes(selected);
				selected = selected.concat(attachedShapes);
				var exclude = []; //对齐时需要排除的id
				if(snap){
					for(var i = 0; i < selected.length; i++){
						var shape = selected[i];
						if(shape.name == "linker"){
							if(shape.from.id && exclude.indexOf(shape.from.id) < 0){
								exclude.push(shape.from.id);
							}
							if(shape.to.id && exclude.indexOf(shape.to.id) < 0){
								exclude.push(shape.to.id);
							}
						}
						if(exclude.indexOf(shape.id) < 0){
							exclude.push(shape.id);
						}
					}
				}
				var selectedShape = selected;
				//获取选中形状上的连接线
				var outlinkers = Utils.getOutlinkers(selected);
				selected = selected.concat(outlinkers);
				container.bind("mousemove.drag", function(moveE){
					$("#link_spot").hide();
					UI.hideShapeOptions();
					var now = Utils.getRelativePos(moveE.pageX, moveE.pageY, canvas);
					//计算和开始时候的偏移量
					var offset = {
						x: now.x - begin.x, y: now.y - begin.y
					};
					if(snap){
						var copy = Utils.copy(bounding);
						copy.x += offset.x;
						copy.y += offset.y;
						var snaped = Designer.op.snapLine(copy, exclude);
						offset = {
							x: copy.x - bounding.x, y: copy.y - bounding.y 
						};
						now = {
							x: begin.x + offset.x, y: begin.y + offset.y
						};
						bounding.x += offset.x;
						bounding.y += offset.y;
						if(selectedShape.length == 1 && selectedShape[0].groupName == "boundaryEvent"){
							if(snaped.attach){
								selectedShape[0].attachTo = snaped.attach.id;
							}else{
								delete selected[0].attachTo;
							}
						}
					}
					if(offset.x == 0 && offset.y == 0){
						return;
					}
					Designer.op.moveShape(selected, offset);
					begin = now;
					//在mousemove里绑定一个mouseup，目的是为了当鼠标发生了拖动之后，才认为是进行了拖动事件
					$(document).unbind("mouseup.drop").bind("mouseup.drop", function(){
						//发生了拖动，修改定义
						Model.updateMulti(selected);
						$(document).unbind("mouseup.drop");
					});
				});
				$(document).bind("mouseup.drag", function(){
					UI.showShapeOptions();
					Designer.op.resetState();
					container.unbind("mousemove.drag");
					canvas.unbind("mousedown.drag");
					$(document).unbind("mouseup.drag");
					Designer.op.hideTip();
					Designer.op.hideSnapLine();
					Utils.showLinkerCursor();
					Utils.showLinkerControls();
				});
			});
		},
		/**
		 * 形状缩放
		 */
		shapeResizable: function(){
			$(".shape_controller").bind("mousedown", function(downE){
				Utils.hideLinkerCursor();
				if($("#shape_text_edit").length){
					$("#shape_text_edit").trigger("blur");
				}
				var container = $("#canvas_container");
				var canvas = $("#designer_canvas");
				//首先四个控制点上，阻止事件冒泡
				downE.stopPropagation();
				//初始坐标，要取相对画布的坐标
				var begin = Utils.getRelativePos(downE.pageX, downE.pageY, canvas);
				var controller = $(this);
				Designer.op.changeState("resizing");
				var selectedIds = Utils.getSelectedIds();
				var selected = Utils.getSelected();
				var p;
				if(selectedIds.length == 1){
					//如果只有一个图形（有一个图形时，此图形不会是连接线，在调用时都做了判断）
					var shape = Model.getShapeById(selectedIds[0]);
					//选中的为一个图形时，开始角度为此形状的角度
					p = Utils.copy(shape.props);
				}else{
					p = Utils.getControlBox(selectedIds);
					p.angle = 0; //选中的为多个图形时，开始角度为0
				}
				var center = {x: p.x + p.w/2, y: p.y + p.h/2};
				//缩放的方向
				var resizeDir = controller.attr("resizeDir");
				var fixedPoint = {}; //相对与活动点，固定的点坐标
				if(resizeDir.indexOf("l") >= 0){
					fixedPoint.x = p.x + p.w;
				}else if(resizeDir.indexOf("r") >= 0){
					fixedPoint.x = p.x;
				}else{
					fixedPoint.x = p.x + p.w/2;
				}
				if(resizeDir.indexOf("t") >= 0){
					fixedPoint.y = p.y + p.h;
				}else if(resizeDir.indexOf("b") >= 0){
					fixedPoint.y = p.y;
				}else{
					fixedPoint.y = p.y + p.h/2;
				}
				//根据旋转情况，获得当前旋转后的坐标
				fixedPoint = Utils.getRotated(center, fixedPoint, p.angle);
				/**
				 * 得到连接线端点的变化形式
				 */
				function getLinkerPointMode(point, selected){
					if(point.id == null){
						//端点未连接形状
						if(selected){
							return {
								type: "box",
								x: (point.x - p.x) / p.w,
								y: (point.y - p.y) / p.h
							};
						}else{
							return {type: "fixed"};
						}
					}else if(Utils.isSelected(point.id)){
						//端点连接了形状，随形状的变化而变化
						var shape = Model.getShapeById(point.id);
						//得到图形的中心点
						var shapeCenter = {
							x: shape.props.x + shape.props.w/2,
							y: shape.props.y + shape.props.h/2
						};
						//得到未旋转情况下，连接线端点与图形的比例，即把坐标先旋转回去
						var rotateBack = Utils.getRotated(shapeCenter, point, -shape.props.angle);
						return {
							type: "shape",
							x: (rotateBack.x - shape.props.x) / shape.props.w,
							y: (rotateBack.y - shape.props.y) / shape.props.h
						};
					}else{
						//端点连接了形状，但形状没有被选中，不移动
						return {
							type: "fixed"
						};
					}
				}
				//定义都哪些图形会发生变化
				var changedShapes = [];
				//先定义changeMode变量，保存每个图形的变化形式
				var changeMode = {};
				var linkerIds = []; //定义linkerIds变量，保存会变化的连接线id，随后再逐一进行计算
				//先计算 形状
				var attachedShapes = Utils.getAttachedShapes(selected);
				selected = selected.concat(attachedShapes);
				//所有需要变化的图形的id集合
				var ids = [];
				for(var i = 0; i < selected.length; i++){
					var shape = selected[i];
					ids.push(shape.id);
					if(shape.parent){
						ids.push(shape.parent);
					}
					if(shape.name == "linker"){
						if(linkerIds.indexOf(shape.id) == -1){
							//添加到连接线集合中
							linkerIds.push(shape.id);
						}
					}else{
						changedShapes.push(shape);
						if(shape.attachTo && !Utils.isSelected(shape.id)){
							changeMode[shape.id] = {
								type: "attached",
								x: (shape.props.x + shape.props.w/2 - p.x) / p.w,
								y: (shape.props.y + shape.props.h/2 - p.y) / p.h
							};
						}else{
							changeMode[shape.id] = {
								x: (shape.props.x - p.x) / p.w,
								y: (shape.props.y - p.y) / p.h,
								w: shape.props.w / p.w,
								h: shape.props.h / p.h
							};
						
						}
						//从linkerMap中取到形状上的连接线，这些未选中的连接线也会随图形变化而发生变化
						var shapeLinkers = Model.getShapeLinkers(shape.id);
						if(shapeLinkers && shapeLinkers.length > 0){
							for(var index = 0; index < shapeLinkers.length; index++){
								var id = shapeLinkers[index];
								if(linkerIds.indexOf(id) == -1){
									//添加到连接线集合中
									linkerIds.push(id);
								}
							}
						}
					}
				}
				//再计算连接线，因为有些连接线的坐标计算相对于 图形，所以放在最后
				for(var i = 0; i < linkerIds.length; i++){
					var id = linkerIds[i];
					var linker = Model.getShapeById(id);
					changedShapes.push(linker);
					var selected = Utils.isSelected(id);
					changeMode[linker.id] = {
						from: getLinkerPointMode(linker.from, selected),
						to: getLinkerPointMode(linker.to, selected)
					};
				}
				var cursor = controller.css("cursor");
				container.css("cursor", cursor);
				var movingRelated = []; //缩放时，可能会引起其他图形的变化，在事件处理中会返回
				var minSize = {w: 20, h: 20};
				Designer.events.push("beforeResize", {minSize: minSize, shapes: changedShapes, dir: resizeDir});
				container.bind("mousemove.resize", function(moveE){
					UI.hideShapeOptions();
					movingRelated = [];
					var now = Utils.getRelativePos(moveE.pageX, moveE.pageY, canvas);
					now = Utils.restoreScale(now);
					//把当前点围绕固定点旋转回去
					var nowRotateBack = Utils.getRotated(fixedPoint, now, -p.angle);
					var newP = Utils.copy(p);
					//旋转回来之后，相减，即可得到宽高
					if(resizeDir.indexOf("r") >= 0){
						newP.w = nowRotateBack.x - fixedPoint.x;
					}else if(resizeDir.indexOf("l") >= 0){
						newP.w = fixedPoint.x - nowRotateBack.x;
					}
					if(resizeDir.indexOf("b") >= 0){
						newP.h = nowRotateBack.y - fixedPoint.y;
					}else if(resizeDir.indexOf("t") >= 0){
						newP.h = fixedPoint.y - nowRotateBack.y;
					}
					if(moveE.ctrlKey && resizeDir.length == 2){
						//如果拖动时按着ctrl，并且缩放点为四个角的某一点，为等比缩放，宽、高，哪个大，则以哪个为基准
						if(p.w >= p.h){
							newP.h = p.h / p.w * newP.w;
							if(newP.h < minSize.h){
								newP.h = minSize.h;
								newP.w = p.w / p.h * newP.h;
							}
						}else{
							newP.w = p.w / p.h * newP.h;
							if(newP.w < minSize.w){
								newP.w = minSize.w;
								newP.h = p.h / p.w * newP.w;
							}
						}
					}else{
						//限制宽高最小为20*20
						if(newP.w < minSize.w){
							newP.w = minSize.w;
						}
						if(newP.h < minSize.h){
							newP.h = minSize.h;
						}
					}
					//宽高经过计算后，重新计算活动点的坐标，得到旋转回去时的坐标
					var nowCalculated = {};
					if(resizeDir.indexOf("r") >= 0){
						nowCalculated.x = fixedPoint.x + newP.w;
					}else if(resizeDir.indexOf("l") >= 0){
						nowCalculated.x = fixedPoint.x - newP.w;
					}else{
						nowCalculated.x = fixedPoint.x;
					}
					if(resizeDir.indexOf("b") >= 0){
						nowCalculated.y = fixedPoint.y + newP.h;
					}else if(resizeDir.indexOf("t") >= 0){
						nowCalculated.y = fixedPoint.y - newP.h;
					}else{
						nowCalculated.y = fixedPoint.y;
					}
					//再旋转
					var nowReal = Utils.getRotated(fixedPoint, nowCalculated, p.angle);
					//根据公式：B(t) = (1-t)P0 + tP1，t=0.5，取线中点，即当前缩放程度，围绕此点旋转
					var midPoint = {
						x: 0.5*fixedPoint.x + 0.5*nowReal.x,
						y: 0.5*fixedPoint.y + 0.5*nowReal.y
					};
					//再把固定点、活动点，根据旋转情况，旋转回去，得到两点的真实坐标，进而得到x, y, w, h
					var fixedBack = Utils.getRotated(midPoint, fixedPoint, -p.angle);
					if(resizeDir.indexOf("r") >= 0){
						newP.x = fixedBack.x;
					}else if(resizeDir.indexOf("l") >= 0){
						newP.x = fixedBack.x - newP.w;
					}else{
						newP.x = fixedBack.x - newP.w/2;
					}
					if(resizeDir.indexOf("b") >= 0){
						newP.y = fixedBack.y;
					}else if(resizeDir.indexOf("t") >= 0){
						newP.y = fixedBack.y - newP.h;
					}else{
						newP.y = fixedBack.y - newP.h/2
					}
					if(newP.angle == 0){
						//计算缩放对齐线
						var shapeObj = changedShapes[0];
						var snap = Designer.op.snapResizeLine(newP, ids, resizeDir);
					}
					Utils.removeAnchors();
					for(var i = 0; i < changedShapes.length; i++){
						var shape = changedShapes[i];
						var mode = changeMode[shape.id]; //得到变化形式
						if(shape.name == "linker"){
							if(mode.from.type == "box"){
								//按容器比例变化
								shape.from.x = newP.x + newP.w * mode.from.x;
								shape.from.y = newP.y + newP.h * mode.from.y;
							}else if(mode.from.type == "shape"){
								var linked = Model.getShapeById(shape.from.id);
								var point = {
									x: linked.props.x + linked.props.w * mode.from.x,
									y: linked.props.y + linked.props.h * mode.from.y
								};
								var shapeCenter = {
									x: linked.props.x + linked.props.w/2,
									y: linked.props.y + linked.props.h/2
								};
								var rotated = Utils.getRotated(shapeCenter, point, linked.props.angle);
								shape.from.x = rotated.x;
								shape.from.y = rotated.y;
							}
							if(mode.to.type == "box"){
								//按容器比例变化
								shape.to.x = newP.x + newP.w * mode.to.x;
								shape.to.y = newP.y + newP.h * mode.to.y;
							}else if(mode.to.type == "shape"){
								var linked = Model.getShapeById(shape.to.id);
								var point = {
									x: linked.props.x + linked.props.w * mode.to.x,
									y: linked.props.y + linked.props.h * mode.to.y
								};
								var shapeCenter = {
									x: linked.props.x + linked.props.w/2,
									y: linked.props.y + linked.props.h/2
								};
								var rotated = Utils.getRotated(shapeCenter, point, linked.props.angle);
								shape.to.x = rotated.x;
								shape.to.y = rotated.y;
							}
							Designer.painter.renderLinker(shape, true);
						}else{
							if(mode.type == "attached"){
								shape.props.x = newP.x + newP.w * mode.x - shape.props.w/2;
								shape.props.y = newP.y + newP.h * mode.y - shape.props.h/2;
							}else{
								var old = Utils.copy(shape.props);
								shape.props.x = newP.x + newP.w * mode.x;
								shape.props.y = newP.y + newP.h * mode.y;
								shape.props.w = newP.w * mode.w;
								shape.props.h = newP.h * mode.h;
								//更新一下Model对象中的图形定义，因为在编辑文本状态下，对图形做缩放的话，先执行缩放的mousedown事件，才执行文本编辑输入框的blur事件进行保存
								//所以，当前的shape对象，已经和Model的这个shape不是一个对象，而绘制选择框是根据Model中的对象进行绘制，就会出现选择框与图形不一致的情况
								var modelProps = Model.getShapeById(shape.id).props;
								modelProps.x = newP.x + newP.w * mode.x;
								modelProps.y = newP.y + newP.h * mode.y;
								modelProps.w = newP.w * mode.w;
								modelProps.h = newP.h * mode.h;
								var offset = {
									x: shape.props.x - old.x,
									y: shape.props.y - old.y,
									w: shape.props.w - old.w,
									h: shape.props.h - old.h
								};
								var eventContent = {shape: shape, offset: offset, dir: resizeDir};
								var shapeRelated = Designer.events.push("resizing", eventContent);
								if(shapeRelated){
									movingRelated = movingRelated.concat(shapeRelated);
								}
							}
							Designer.painter.renderShape(shape);
							Utils.showAnchors(shape);
						}
					}
					Designer.painter.drawControls(selectedIds);
					var tipText = "W: " + Math.round(newP.w) + "&nbsp;&nbsp;H: " + Math.round(newP.h);
					if(newP.x != p.x){
						tipText =  "X: " + Math.round(newP.x) + "&nbsp;&nbsp;Y: " + Math.round(newP.y) + "<br/>" + tipText;
					}
					Designer.op.showTip(tipText);
					//在mousemove里绑定一个mouseup，目的是为了当鼠标发生了拖动之后，才认为是进行了缩放事件
					$(document).unbind("mouseup.resize_ok").bind("mouseup.resize_ok", function(){
						if(movingRelated.length > 0){
							changedShapes = changedShapes.concat(movingRelated);
						}
						Model.updateMulti(changedShapes);
						$(document).unbind("mouseup.resize_ok");
					});
				});
				$(document).bind("mouseup.resize", function(){
					UI.showShapeOptions();
					container.css("cursor", "default");
					Designer.op.resetState();
					container.unbind("mousemove.resize");
					$(document).unbind("mouseup.resize");
					Designer.op.hideTip();
					Utils.showLinkerCursor();
					Designer.op.hideSnapLine();
				});
			});
		},
		/**
		 * 形状旋转
		 */
		shapeRotatable: function(){
			$(".shape_rotater").bind("mousemove", function(e){
				var box = $(this);
				var x = e.pageX - box.offset().left;
				var y = e.pageY - box.offset().top;
				var ctx = box[0].getContext("2d");
				box.unbind("mousedown");
				box.removeClass("rotate_enable");
				if(ctx.isPointInPath(x, y)){
					box.addClass("rotate_enable");
					box.bind("mousedown", function(downE){
						Utils.hideLinkerCursor();
						if($("#shape_text_edit").length){
							$("#shape_text_edit").trigger("blur");
						}
						downE.stopPropagation();
						Designer.op.changeState("rotating");
						var selectedIds = Utils.getSelectedIds();
						//旋转开始时候的选择框的坐标信息
						var selectorPos;
						var startAngle; //旋转开始时的角度
						if(selectedIds.length == 1){
							//如果只有一个图形（有一个图形时，此图形不会是连接线，在调用时都做了判断）
							var shape = Model.getShapeById(selectedIds[0]);
							selectorPos = shape.props;
							startAngle = shape.props.angle; //选中的为一个图形时，开始角度为此形状的角度
						}else{
							selectorPos = Utils.getControlBox(selectedIds);
							startAngle = 0; //选中的为多个图形时，开始角度为0
						}
						//获取旋转的基准点，即选择控件的中心点
						var center = {
							x: selectorPos.x + selectorPos.w/2,
							y: selectorPos.y + selectorPos.h/2
						};
						var scaledCenter = Utils.toScale(center);
						var canvas = $("#designer_canvas");
						var selected = Utils.getSelected();
						//获取吸附的图形，一起旋转
						var attachedShapes = Utils.getAttachedShapes(selected);
						selected = selected.concat(attachedShapes);
						var outlinkers = Utils.getOutlinkers(selected);
						selected = selected.concat(outlinkers);
						var lastAngle = startAngle; //记录上一次旋转的角度
						$(document).bind("mousemove.rotate", function(moveE){
							UI.hideShapeOptions();
							var pos = Utils.getRelativePos(moveE.pageX, moveE.pageY, canvas);
							//计算旋转角度
							var angle = Math.atan(Math.abs(pos.x - scaledCenter.x)/Math.abs(scaledCenter.y - pos.y));
							if(pos.x >= scaledCenter.x && pos.y >= scaledCenter.y){
								angle = Math.PI - angle;
							}else if(pos.x <= scaledCenter.x && pos.y >= scaledCenter.y){
								angle = Math.PI + angle;
							}else if(pos.x <= scaledCenter.x && pos.y <= scaledCenter.y){
								angle = Math.PI*2 - angle;
							}
							angle = angle % (Math.PI*2);
							//每5度为一个单位
							var unit = Math.PI/36;
							var unitCount = Math.round(angle/unit);
							angle = unit * unitCount;
							if(angle == lastAngle){
								return;
							}
							lastAngle = angle;
							//打开提示
							Designer.op.showTip(unitCount*5%360 + "°");
							//旋转控件
							Designer.painter.rotateControls(selectorPos, angle);
							Utils.removeAnchors();
							var changedAngle = angle - startAngle;
							for (var i = 0; i < selected.length; i++) {
								var shape = selected[i];
								//获取持久化的对象，与旋转情况做对比
								var persis = Model.getPersistenceById(shape.id);
								if(shape.name != "linker"){
									//旋转形状
									shape.props.angle = Math.abs((changedAngle + persis.props.angle) % (Math.PI*2));
									var shapeCenter = {
										x: persis.props.x + persis.props.w/2,
										y: persis.props.y + persis.props.h/2
									};
									var shapeRotated = Utils.getRotated(center, shapeCenter, changedAngle);
									shape.props.x = shapeRotated.x - shape.props.w/2;
									shape.props.y = shapeRotated.y - shape.props.h/2;
									Designer.painter.renderShape(shape);
									Utils.showAnchors(shape);
								}else{
									//旋转连接线
									var fromChanged = false;
									if((Utils.isSelected(shape.id) && shape.from.id == null) || Utils.isSelected(shape.from.id)){
										var rotated = Utils.getRotated(center, persis.from, changedAngle);
										shape.from.x = rotated.x;
										shape.from.y = rotated.y;
										if(shape.from.angle != null){
											shape.from.angle = Math.abs((persis.from.angle + changedAngle) % (Math.PI*2));
										}
										fromChanged = true;
									}
									var toChanged = false;
									if((Utils.isSelected(shape.id) && shape.to.id == null) || Utils.isSelected(shape.to.id)){
										var rotated = Utils.getRotated(center, persis.to, changedAngle);
										shape.to.x = rotated.x;
										shape.to.y = rotated.y;
										if(shape.to.angle != null){
											shape.to.angle = Math.abs((persis.to.angle + changedAngle) % (Math.PI*2));
										}
										toChanged = true;
									}
									if(fromChanged || toChanged){
										Designer.painter.renderLinker(shape, true);
									}
								}
							}
						}).bind("mouseup.rotate", function(){
							UI.showShapeOptions();
							$(document).unbind("mousemove.rotate").unbind("mouseup.rotate");
							Designer.op.resetState();
							Model.updateMulti(selected);
							Designer.painter.drawControls(selectedIds);
							Designer.op.hideTip();
							Utils.showLinkerCursor();
						});
					});
				}else{
					box.removeClass("rotate_enable");
					box.unbind("mousedown");
				}
			});
		},
		/**
		 * 切换分组的图形
		 */
		groupShapeChangable: function(){
			$(".change_shape_icon").bind("mousedown", function(e){
				e.stopPropagation();
				var targetShape = Utils.getSelected()[0];
				var groupName = targetShape.groupName;
				var target = $(this).parent();
				var pos = target.position();
				var left = pos.left + target.width();
				var top = pos.top + target.height() + 10;
				Designer.op.groupDashboard(groupName, left, top, function(shapeName){
					if(targetShape.name != shapeName){
						var related = Designer.events.push("shapeChanged", {shape: targetShape, name: shapeName});
						Model.changeShape(targetShape, shapeName);
						var changed = [targetShape];
						if(related && related.length > 0){
							changed = changed.concat(related);
						}
						Model.updateMulti(changed);
					}
				});
			});
		},
		/**
		 * 形状选择
		 */
		shapeMultiSelectable: function(){
			var canvas = $("#designer_canvas");
			var layout = $("#designer_layout");
			layout.unbind("mousedown.multiselect").bind("mousedown.multiselect", function(downE){
				var selector = null;
				if(!downE.ctrlKey){
					Utils.unselect();
				}
				var dLocation = Utils.getRelativePos(downE.pageX, downE.pageY, canvas);
				Designer.op.changeState("multi_selecting");
				layout.bind("mousemove.multiselect", function(moveE){
					if(selector == null){
						selector = $("<div id='selecting_box'></div>").appendTo(canvas);
					}
					var location = Utils.getRelativePos(moveE.pageX, moveE.pageY, canvas);
					var style = {
						"z-index": Model.orderList.length,
						left: location.x,
						top: location.y
					};
					if(location.x > dLocation.x){
						style.left = dLocation.x;
					}
					if(location.y > dLocation.y){
						style.top = dLocation.y;
					}
					style.width = Math.abs(location.x - dLocation.x);
					style.height = Math.abs(location.y - dLocation.y);
					selector.css(style);
				});
				$(document).unbind("mouseup.multiselect").bind("mouseup.multiselect", function(upE){
					if(selector != null){
						//判断选取范围内的图形
						var range = {
							x: selector.position().left.restoreScale(),
							y: selector.position().top.restoreScale(),
							w: selector.width().restoreScale(),
							h: selector.height().restoreScale()
						};
						var shapeIds = Utils.getShapesByRange(range);
						if(upE.ctrlKey){
							var selected = Utils.getSelectedIds();
							Utils.mergeArray(shapeIds, selected);
						}
						Utils.unselect();
						Utils.selectShape(shapeIds);
						selector.remove();
					}
					Designer.op.resetState();
					$(document).unbind("mouseup.multiselect");
					layout.unbind("mousemove.multiselect");
				});
				layout.unbind("mousedown.multiselect");
			});
		},
		/**
		 * 编辑形状文本
		 */
		shapeEditable: function(shape){
			var canvas = $("#designer_canvas");
			canvas.unbind("dblclick.edit").bind("dblclick.edit", function(e){
				//计算点击位置在图形的哪个文本区域上
				canvas.unbind("dblclick.edit");
				var pos = Utils.getRelativePos(e.pageX, e.pageY, canvas);
				Designer.op.editShapeText(shape, pos);
			});
		},
		/**
		 * 编辑图形的文本
		 * @param {} pos 点击位置信息
		 * @param {} shape
		 */
		editShapeText: function(shape, pos){
			if(shape.name == "linker"){
				this.editLinkerText(shape);
				return;
			}
			if(!shape.textBlock || shape.textBlock.length == 0){
				return;
			}
			var textBlocks = shape.getTextBlock();
			var index = 0;
			if(pos){
				//转为没有缩放情况下的坐标
				pos.x = pos.x.restoreScale();
				pos.y = pos.y.restoreScale();
				if(shape.props.angle != 0){
					var center = {x: shape.props.x + shape.props.w/2, y: shape.props.y + shape.props.h/2};
					//把图形旋转回去
					pos = Utils.getRotated(center, pos, -shape.props.angle);
				}
				//计算相对于图形的坐标
				var rx = pos.x - shape.props.x;
				var ry = pos.y - shape.props.y;
				for(var i = 0; i < textBlocks.length; i++){
					var block = textBlocks[i];
					if(Utils.pointInRect(rx, ry, block.position)){
						index = i;
						break;
					}
				}
			}
			Designer.contextMenu.hide();
			var textarea = $("#shape_text_edit");
			if(textarea.length == 0){
				textarea = $("<textarea id='shape_text_edit'></textarea>").appendTo("#designer_canvas");
			}
			var ruler = $("#shape_text_ruler");
			if(ruler.length == 0){
				ruler = $("<textarea id='shape_text_ruler'></textarea>").appendTo("#designer_canvas");
			}
			//隐藏原有文本
			$(".text_canvas[forshape="+shape.id+"][ind="+index+"]").hide();
			var textBlock = textBlocks[index];
			var blockEntity = shape.textBlock[index]; //对象中的textBlock定义
			var fontStyle = $.extend({}, shape.fontStyle, textBlock.fontStyle);
			var textPos = textBlock.position;
			if(fontStyle.orientation == "horizontal"){
				var blockCenter = {
					x: textPos.x + textPos.w/2,
					y: textPos.y + textPos.h/2
				};
				textPos = {
					x: blockCenter.x - textPos.h/2,
					y: blockCenter.y - textPos.w/2,
					w: textPos.h,
					h: textPos.w
				};
			}
			//给输入框设置一些基本样式
			var style = {
				"width": textPos.w + "px",
				"z-index": Model.orderList.length+2, //要大于锚点的z-index
				"line-height": Math.round(fontStyle.size * 1.25) + "px",
				"font-size": fontStyle.size + "px",
				"font-family": fontStyle.fontFamily,
				"font-weight": fontStyle.bold ? "bold" : "normal",
				"font-style": fontStyle.italic ? "italic" : "normal",
				"text-align": fontStyle.textAlign,
				"color": "rgb(" + fontStyle.color + ")",
				"text-decoration": fontStyle.underline ? "underline" : "none"
			};
			textarea.css(style);
			ruler.css(style);
			textarea.show();
			//计算得到textBlock的中心坐标
			textPos.x += shape.props.x;
			textPos.y += shape.props.y;
			textarea.val(textBlock.text);
			//绑定事件
			$("#shape_text_edit").unbind().bind("keyup", function(){
				//得到文本的高度
				var text = $(this).val();
				ruler.val(text);
				ruler.scrollTop(99999);
				var textH = ruler.scrollTop();
				textarea.css({
					height: textH
				});
				var blockCenter = {
					x: textPos.x + textPos.w/2,
					y: textPos.y + textPos.h/2
				};
				var top = 0;
				var padding = 0;
				var height = textPos.h;
				if(fontStyle.vAlign == "middle"){
					if(textH > height){
						height = textH;
						top = (blockCenter.y - height/2);
						padding = 0;
					}else{
						top = (blockCenter.y - textPos.h/2);
						padding = (textPos.h - textH)/2;
						height = textPos.h - padding;
					}
				}else if(fontStyle.vAlign == "bottom"){
					if(textH > height){
						height = textH;
						top = (blockCenter.y + textPos.h/2 - height);
						padding = 0;
					}else{
						top = (blockCenter.y - textPos.h/2);
						padding = textPos.h - textH;
						height = textPos.h - padding;
					}
				}else{
					top = (blockCenter.y - textPos.h/2);
					padding = 0;
					if(textH > height){
						height = textH;
					}else{
						height = textPos.h;
					}
				}
				var areaH = padding + height;
				var textCenter = {
					x: textPos.x + textPos.w/2,
					y: top + areaH/2
				};
				var textAngle = shape.props.angle;
				if(textAngle != 0){
					var center = {x: shape.props.x + shape.props.w/2, y: shape.props.y + shape.props.h/2};
					textCenter = Utils.getRotated(center, textCenter, textAngle);
				}
				if(fontStyle.orientation == "horizontal"){
					textAngle = (Math.PI * 1.5 + textAngle) % (Math.PI * 2);
				}
				var deg = Math.round(textAngle / (Math.PI*2) * 360);
				var degStr = "rotate(" + deg + "deg) scale("+Designer.config.scale+")";
				textarea.css({
					width: textPos.w,
					height: height,
					"padding-top": padding,
					left: textCenter.x.toScale() - textPos.w/2 - 2,
					top: textCenter.y.toScale() - areaH/2 - 2,
					"-webkit-transform": degStr,
					"-ms-transform": degStr,
					"-o-transform": degStr,
					"-moz-transform": degStr,
					"transform": degStr
				});
			}).bind("keydown", function(e){
				//Enter保存， Ctrl + Enter换行
				var input = $(this);
				if(e.keyCode == 13 && e.ctrlKey){
					//执行保存
					saveText();
					return false;
				}else if(e.keyCode == 27){
					//Esc取消
					input.unbind().remove();
					$(".text_canvas[forshape="+shape.id+"][ind="+index+"]").show();
				}else if(e.keyCode == 66 && e.ctrlKey){
					//Ctrl + B，加粗
					var newVal = !fontStyle.bold;
					if(shape.textBlock.length == 1){
						shape.fontStyle.bold = newVal;
					}else{
						blockEntity.fontStyle = $.extend(blockEntity.fontStyle, {bold: newVal});
					}
					Model.update(shape);
					var css = newVal ? "bold" : "normal";
					$(this).css("font-weight", css);
					ruler.css("font-weight", css);
					UI.update();
				}else if(e.keyCode == 73 && e.ctrlKey){
					//Ctrl + I，斜体
					var newVal = !fontStyle.italic;
					if(shape.textBlock.length == 1){
						shape.fontStyle.italic = newVal;
					}else{
						blockEntity.fontStyle = $.extend(blockEntity.fontStyle, {italic: newVal});
					}
					Model.update(shape);
					var css = newVal ? "italic" : "normal";
					$(this).css("font-style", css);
					ruler.css("font-style", css);
					UI.update();
				}else if(e.keyCode == 85 && e.ctrlKey){
					//Ctrl + U，下划线
					var newVal = !fontStyle.underline;
					if(shape.textBlock.length == 1){
						shape.fontStyle.underline = newVal;
					}else{
						blockEntity.fontStyle = $.extend(blockEntity.fontStyle, {underline: newVal});
					}
					Model.update(shape);
					var css = newVal ? "underline" : "none";
					$(this).css("text-decoration", css);
					ruler.css("text-decoration", css);
					e.preventDefault();
					UI.update();
				}
			}).bind("blur", function(e){
				saveText();
			}).bind("mousemove", function(e){
				e.stopPropagation();
			}).bind("mousedown", function(e){
				e.stopPropagation();
			}).bind("mouseenter", function(e){
				Designer.op.destroy();
			});
			$("#shape_text_edit").trigger("keyup");
			textarea.select();
			/**
			 * 保存文本编辑
			 */
			function saveText(){
				var newText = $("#shape_text_edit").val();
				if($("#shape_text_edit").length && $("#shape_text_edit").is(":visible")){
					if(newText != blockEntity.text){
						blockEntity.text = newText;
						Model.update(shape);
					}
					Designer.painter.renderShape(shape);
					$("#shape_text_edit").remove();
				}
			}
		},
		/**
		 * 从图形上画线
		 */
		shapeLinkable: function(shape, linkPoint){
			var canvas = $("#designer_canvas");
			var container = $("#canvas_container");
			container.unbind("mousedown.link").bind("mousedown.link", function(downE){
				Designer.op.changeState("linking_from_shape");
				var linkCanvas = null;
				var createdLinker = null;
				var from;
				if(!shape){
					//当不存在shape的情况，为创建自由连接线
					var pos = Utils.getRelativePos(downE.pageX, downE.pageY, canvas);
					from = {
						x: pos.x.restoreScale(),
						y: pos.y.restoreScale(),
						id: null,
						angle: null
					};
				}else{
					from = linkPoint;
					from.id = shape.id;
				}
				//计算连接点的角度
				container.bind("mousemove.link", function(moveE){
					container.css("cursor", "default");
					var now = Utils.getRelativePos(moveE.pageX, moveE.pageY, canvas);
					if(createdLinker == null){
						createdLinker = createLinker(from, now);
						Designer.events.push("linkerCreating", createdLinker);
					}
					Designer.op.moveLinker(createdLinker, "to", now.x, now.y);
					//在mousemove里绑定一个mouseup，目的是为了当鼠标发生了拖动之后，才认为是进行了拖动事件
					$(document).unbind("mouseup.droplinker").bind("mouseup.droplinker", function(){
						//发生了拖动，修改定义
						if(Math.abs(now.x - from.x) > 20 || Math.abs(now.y - from.y) > 20){
							Model.add(createdLinker);
							Designer.events.push("linkerCreated", createdLinker);
							//连线创建后，是否应该选中
//							Utils.unselect();
//							Utils.selectShape(createdLinker.id);
							if(createdLinker.to.id == null && createdLinker.from.id != null){
								//如果创建的连接线，终点没有连接形状，则显示出画板
								Designer.op.linkDashboard(createdLinker);
							}
							Utils.showLinkerCursor();
						}else{
							//拖动没超过20*20，删除
							$("#" + createdLinker.id).remove();
						}
						$(document).unbind("mouseup.droplinker");
					});
				});
				$(document).bind("mouseup.link", function(){
					Designer.op.hideLinkPoint();
					Designer.op.resetState();
					container.unbind("mousedown.link");
					container.unbind("mousemove.link");
					$(document).unbind("mouseup.link");
				});
			});
			
			/**
			 * 创建形状
			 * @param schemaName
			 * @param centerX
			 * @param centerY
			 * @returns
			 */
			function createLinker(from, to){
				var newId = Utils.newId();
				var linker = Utils.copy(Schema.linkerDefaults);
				linker.from = from;
				linker.to = {
					id: null,
					x: to.x,
					y: to.y,
					angle: null
				};
				linker.props = {
					zindex: Model.maxZIndex + 1
				};
				linker.id = newId;
				return linker;
			}
		},
		/**
		 * 编辑连接线文本
		 * @param {} linker
		 */
		linkerEditable: function(linker){
			var canvas = $("#designer_canvas");
			canvas.unbind("dblclick.edit_linker").bind("dblclick.edit_linker", function(){
				Designer.op.editLinkerText(linker);
				canvas.unbind("dblclick.edit_linker");
			});
		},
		/**
		 * 编辑连接线的文本
		 */
		editLinkerText: function(linker){
			Designer.contextMenu.hide();
			var midpoint = Designer.painter.getLinkerMidpoint(linker);
			var ruler = $("#" + linker.id).find(".text_canvas");
			var textarea = $("#linker_text_edit");
			if(textarea.length == 0){
				textarea = $("<textarea id='linker_text_edit'></textarea>").appendTo("#designer_canvas");
			}
			//隐藏原有文本，全透明
			$("#" + linker.id).find(".text_canvas").hide();
			var fontStyle = linker.fontStyle;
			var scale = "scale("+Designer.config.scale+")";
			var lineH = Math.round(fontStyle.size * 1.25);
			//先给输入框设置一些基本样式
			textarea.css({
				"z-index": Model.orderList.length,
				"line-height": lineH + "px",
				"font-size": fontStyle.size + "px",
				"font-family": fontStyle.fontFamily,
				"font-weight": fontStyle.bold ? "bold" : "normal",
				"font-style": fontStyle.italic ? "italic" : "normal",
				"text-align": fontStyle.textAlign,
				"color": "rgb(" + fontStyle.color + ")",
				"text-decoration": fontStyle.underline ? "underline" : "none",
				"-webkit-transform": scale,
				"-ms-transform": scale,
				"-o-transform": scale,
				"-moz-transform": scale,
				"transform": scale
			});
			//修改坐标
			textarea.val(linker.text).show().select();
			textarea.unbind().bind("keyup", function(){
				var newText = $(this).val();
				var text = newText.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br/>");
				ruler.html(text + "<br/>");
				var textW = ruler.width();
				if(textW < 50){
					textW = 50;
				}
				var textH = ruler.height();
				if(textH < lineH){
					textH = lineH;
				}
				textarea.css({
					left: midpoint.x.toScale() - textW/2 - 2,
					top: midpoint.y.toScale() - textH/2 - 2,
					width: textW,
					height: textH
				});
			}).bind("mousedown", function(e){
				e.stopPropagation();
			}).bind("keydown", function(e){
				if(e.keyCode == 13 && e.ctrlKey){
					//执行保存
					saveText();
					return false;
				}else if(e.keyCode == 27){
					//Esc取消
					textarea.unbind().remove();
					Designer.painter.renderLinkerText(linker);
				}else if(e.keyCode == 66 && e.ctrlKey){
					//Ctrl + B，加粗
					var newVal = !linker.fontStyle.bold;
					linker.fontStyle.bold = newVal;
					Model.update(linker);
					var css = newVal ? "bold" : "normal";
					$(this).css("font-weight", css);
					ruler.css("font-weight", css);
					UI.update();
				}else if(e.keyCode == 73 && e.ctrlKey){
					//Ctrl + I，斜体
					var newVal = !linker.fontStyle.italic;
					linker.fontStyle.italic = newVal;
					Model.update(linker);
					var css = newVal ? "italic" : "normal";
					$(this).css("font-style", css);
					ruler.css("font-style", css);
					UI.update();
				}else if(e.keyCode == 85 && e.ctrlKey){
					//Ctrl + U，下划线
					var newVal = !linker.fontStyle.underline;
					linker.fontStyle.underline = newVal;
					Model.update(linker);
					var css = newVal ? "underline" : "none";
					$(this).css("text-decoration", css);
					ruler.css("text-decoration", css);
					e.preventDefault();
					UI.update();
				}
			}).bind("blur", function(){
				saveText();
			});
			textarea.trigger("keyup");
			/**
			 * 保存文本
			 */
			function saveText(){
				var textarea = $("#linker_text_edit");
				if(textarea.length && textarea.is(":visible")){
					var newText = textarea.val();
					if(newText != linker.text){
						linker.text = newText;
						Model.update(linker);
					}
					Designer.painter.renderLinker(linker);
					textarea.remove();
				}
				
			}
		},
		/**
		 * 拖动连接线
		 */
		linkerDraggable: function(linker, point){
			var canvas = $("#designer_canvas");
			var container = $("#canvas_container");
			canvas.bind("mousedown.draglinker", function(downE){
				Utils.hideLinkerControls();
				Designer.op.changeState("dragging_linker");
				var selectedIds = Utils.getSelectedIds();
				var redrawControls = false;
				if(selectedIds.length > 1){
					redrawControls = true;
				}
				container.bind("mousemove.draglinker", function(moveE){
					container.css("cursor", "default");
					var now = Utils.getRelativePos(moveE.pageX, moveE.pageY, canvas);
					Designer.op.moveLinker(linker, point, now.x, now.y);
					if(redrawControls){
						Designer.painter.drawControls(selectedIds);
					}
					$(document).unbind("mouseup.droplinker").bind("mouseup.droplinker", function(){
						$(document).unbind("mouseup.droplinker");
						Model.update(linker);
						Utils.showLinkerControls();
					});
				});
				$(document).bind("mouseup.draglinker", function(){
					Designer.op.hideLinkPoint();
					Designer.op.resetState();
					canvas.unbind("mousedown.draglinker");
					container.unbind("mousemove.draglinker");
					$(document).unbind("mouseup.draglinker");
					Utils.showLinkerControls();
				});
			});
		},
		/**
		 * 链接可以点击
		 */
		linkClickable: function(url, pos){
			var spot = $("#link_spot");
			if(spot.length == 0){
				spot = $("<a id='link_spot' target='_blank'></a>").appendTo("#designer_canvas");
			}
			if(url.trim().toLowerCase().indexOf("http") == -1){
				url = "http://" + url;
			}
			spot.attr("href", url);
			spot.show().css({
				left: pos.x - 50,
				top: pos.y - 50,
				"z-index": Model.orderList.length + 1
			});
		},
		/**
		 * 创建自由的文本
		 */
		textCreatable: function(){
			var canvas = $("#designer_canvas");
			var container = $("#canvas_container");
			container.unbind("mousedown.create_text").bind("mousedown.create_text", function(downE){
				var selector = null;
				if(!downE.ctrlKey){
					Utils.unselect();
				}
				var dLocation = Utils.getRelativePos(downE.pageX, downE.pageY, canvas);
				var location = null;
				container.bind("mousemove.create_text", function(moveE){
					if(selector == null){
						selector = $("<div id='texting_box'></div>").appendTo(canvas);
					}
					var mLocation = Utils.getRelativePos(moveE.pageX, moveE.pageY, canvas);
					location = {
						"z-index": Model.orderList.length,
						left: mLocation.x - 1,
						top: mLocation.y - 1
					};
					if(mLocation.x > dLocation.x){
						location.left = dLocation.x - 1;
					}
					if(mLocation.y > dLocation.y){
						location.top = dLocation.y - 1;
					}
					location.width = Math.abs(mLocation.x - dLocation.x - 2);
					location.height = Math.abs(mLocation.y - dLocation.y - 2);
					selector.css(location);
				});
				$(document).unbind("mouseup.create_text").bind("mouseup.create_text", function(upE){
					if(location != null && location.width >= 20 && location.height >= 20){
						//判断选取范围内的图形
						var shape = Model.create("standardText", location.left.restoreScale(), location.top.restoreScale());
						shape.props.w = location.width.restoreScale();
						shape.props.h = location.height.restoreScale();
						Model.add(shape);
						Designer.painter.renderShape(shape);
						Designer.op.editShapeText(shape);
						Utils.unselect();
						Utils.selectShape(shape.id);
					}
					selector.remove();
					Designer.op.resetState();
					$(document).unbind("mouseup.create_text");
					container.unbind("mousemove.create_text");
				});
				container.unbind("mousedown.create_text");
			});
		},
		canvasDragTimeout: null,
		/**
		 * 拖动画布
		 */
		canvasDraggable: function(){
			var container = $("#canvas_container");
			container.css("cursor", "url(/themes/default/images/diagraming/cursor_hand.png) 8 8, auto");
			if(this.canvasDragTimeout){
				clearTimeout(this.canvasDragTimeout);
			}
			this.canvasDragTimeout = setTimeout(function(){
				container.unbind("mousedown.drag_canvas");
				Designer.op.resetState();
				container.unbind("mousemove.drag_canvas");
				$(document).unbind("mouseup.drag_canvas");
			}, 500);
			container.unbind("mousedown.drag_canvas").bind("mousedown.drag_canvas", function(downE){
				var beginTop = $("#designer_layout").scrollTop();
				var beginLeft = $("#designer_layout").scrollLeft();
				container.bind("mousemove.drag_canvas", function(moveE){
					var offsetX = moveE.pageX - downE.pageX;
					var offsetY = moveE.pageY - downE.pageY;
					$("#designer_layout").scrollLeft(beginLeft - offsetX);
					$("#designer_layout").scrollTop(beginTop - offsetY);
				});
				$(document).unbind("mouseup.drag_canvas").bind("mouseup.drag_canvas", function(upE){
					container.unbind("mousemove.drag_canvas");
					$(document).unbind("mouseup.drag_canvas");
				});
			});
			$(document).unbind("keyup.drag_canvas").bind("keyup.drag_canvas", function(e){
				//放alt键后，取消
				container.unbind("mousedown.drag_canvas");
				Designer.op.resetState();
				$(document).unbind("mouseup.drag_canvas");
				e.preventDefault();
				clearTimeout(this.canvasDragTimeout);
				container.unbind("mousemove.drag_canvas");
			});
		},
		/**
		 * 画布可以随意拖动，不需要Alt键盘
		 */
		canvasFreeDraggable: function(){
			var container = $("#canvas_container");
			container.css("cursor", "url(/themes/default/images/diagraming/cursor_hand.png) 8 8, auto");
			container.unbind("mousedown.drag_canvas").bind("mousedown.drag_canvas", function(downE){
				var beginTop = $("#designer_layout").scrollTop();
				var beginLeft = $("#designer_layout").scrollLeft();
				container.bind("mousemove.drag_canvas", function(moveE){
					var offsetX = moveE.pageX - downE.pageX;
					var offsetY = moveE.pageY - downE.pageY;
					$("#designer_layout").scrollLeft(beginLeft - offsetX);
					$("#designer_layout").scrollTop(beginTop - offsetY);
				});
				$(document).unbind("mouseup.drag_canvas").bind("mouseup.drag_canvas", function(upE){
					container.unbind("mousemove.drag_canvas");
					$(document).unbind("mouseup.drag_canvas");
				});
			});
		},
		/**
		 * 移动图形
		 * @param {} offset 偏移量
		 */
		moveShape: function(shapes, offset){
			var ids = [];
			for(var i = 0; i < shapes.length; i++){
				var shape = shapes[i];
				ids.push(shape.id);
			}
			var restored = Utils.restoreScale(offset);
			for(var i = 0; i < shapes.length; i++){
				var shape = shapes[i];
				if(shape.name == "linker"){
					var linker = shape;
					var from = linker.from;
					var to = linker.to;
					var fromChanged = false;
					var toChanged = false;
					if(!Utils.isSelected(linker.id)){
						if(from.id != null && ids.indexOf(from.id) >= 0){
							//当起点无连接，或者起点形状也被选中了
							linker.from.x += restored.x;
							linker.from.y += restored.y;
							fromChanged = true;
						}
						if(to.id != null && ids.indexOf(to.id) >= 0){
							linker.to.x += restored.x;
							linker.to.y += restored.y;
							toChanged = true;
						}
					}else{
						if(from.id == null || ids.indexOf(from.id) >= 0){
							//当起点无连接，或者起点形状也被选中了
							linker.from.x += restored.x;
							linker.from.y += restored.y;
							fromChanged = true;
						}
						if(to.id == null || ids.indexOf(to.id) >= 0){
							linker.to.x += restored.x;
							linker.to.y += restored.y;
							toChanged = true;
						}
					}
					if(fromChanged && toChanged){
						for(var pi = 0; pi < linker.points.length; pi++){
							var p = linker.points[pi];
							p.x += restored.x;
							p.y += restored.y;
						}
						var shapeBox = $("#" + shape.id);
						var oriPos = shapeBox.position();
						shapeBox.css({
							left: oriPos.left += offset.x,
							top: oriPos.top += offset.y
						});
					}else if(fromChanged || toChanged){
						Designer.painter.renderLinker(linker, true);
					}
				}else{
					relocateShape(shape);
					$(".shape_contour[forshape="+shape.id+"]").css({
						left: shape.props.x.toScale(),
						top: shape.props.y.toScale()
					});
				}
			}
			var linkerIds = Utils.getSelectedLinkerIds();
			//如果选择中只包含一个连接线，不移动选择框
			if(shapes.length == 1 && linkerIds.length == 1){
				return;
			}
			if(linkerIds.length > 0){
				var selectedIds = Utils.getSelectedIds();
				Designer.painter.drawControls(selectedIds);
			}else{
				var controls = $("#shape_controls");
				controls.css({
					left: parseFloat(controls.css("left")) + offset.x,
					top: parseFloat(controls.css("top")) + offset.y
				});
			}
			var controlPos = $("#shape_controls").position();
			Designer.op.showTip("X: " + Math.round(controlPos.left.restoreScale()) + "&nbsp;&nbsp;Y: " + Math.round(controlPos.top.restoreScale()));
			/**
			 * 重新放置图形
			 */
			function relocateShape(shape){
				shape.props.x += restored.x;
				shape.props.y += restored.y;
				var shapeBox = $("#" + shape.id);
				shapeBox.css({
					left: parseFloat(shapeBox.css("left")) + offset.x,
					top: parseFloat(shapeBox.css("top")) + offset.y
				});
			}
		},
		/**
		 * 移动连接线，拖动端点
		 * @param {} linker
		 * @param {} point
		 * @param {} pageX
		 * @param {} pageY
		 */
		moveLinker: function(linker, point, x, y){
			var newPos = null;
			var linkedShape = null;
			var focus = Utils.getShapeByPosition(x, y, true);
			Designer.op.hideLinkPoint();
			if(focus != null){
				var shape = focus.shape;
				Utils.showAnchors(shape);
				linkedShape = shape.id;
				if(focus.type == "bounding"){
					newPos = focus.linkPoint;
					Designer.op.showLinkPoint(Utils.toScale(newPos));
				}else if(focus.type == "shape"){
					//如果鼠标移动到了某一个图形上
					var fixedPoint; //固定点，起点or终点
					var fixedId;
					if(point == "from"){
						fixedPoint = {x: linker.to.x, y: linker.to.y};
						fixedId = linker.to.id;
					}else{
						fixedPoint = {x: linker.from.x, y: linker.from.y};
						fixedId = linker.from.id;
					}
					if(shape.id == fixedId){
						//如果鼠标悬浮的形状为另一端点连接的图形，不自动连接
						Designer.op.hideLinkPoint();
						newPos = {x: x.restoreScale(), y: y.restoreScale()};
						newPos.angle = null;
						linkedShape = null;
					}else{
						var anchors = shape.getAnchors();
						var minDistance = -1;
						var nearestAnchor;
						var shapeCenter = {x: shape.props.x + shape.props.w/2, y: shape.props.y + shape.props.h/2};
						//循环所有锚点，取距离固定点最近的一点
						for ( var ai = 0; ai < anchors.length; ai++) {
							var an = anchors[ai];
							var anchorPos = Utils.getRotated(shapeCenter, {x: shape.props.x + an.x, y: shape.props.y + an.y}, shape.props.angle);
							var anchorDistance = Utils.measureDistance(anchorPos, fixedPoint);
							if(minDistance == -1 || anchorDistance < minDistance){
								minDistance = anchorDistance;
								nearestAnchor = anchorPos;
							}
						}
						var anchorAngle = Utils.getPointAngle(shape.id, nearestAnchor.x, nearestAnchor.y, 7);
						newPos = {
							x: nearestAnchor.x,
							y: nearestAnchor.y,
							angle: anchorAngle
						};
						Designer.op.showLinkPoint(Utils.toScale(newPos));
					}
				}
			}else{
				Designer.op.hideLinkPoint();
				Utils.hideAnchors();
				newPos = {x: x.restoreScale(), y: y.restoreScale()};
				newPos.angle = null;
				linkedShape = null;
			}
			if(point == "from"){
				linker.from.id = linkedShape;
				linker.from.x = newPos.x;
				linker.from.y = newPos.y;
				linker.from.angle = newPos.angle;
				if(linkedShape == null){
					if(newPos.x >= linker.to.x -6 && newPos.x <= linker.to.x + 6){
						linker.from.x = linker.to.x;
					}
					if(newPos.y >= linker.to.y -6 && newPos.y <= linker.to.y + 6){
						linker.from.y = linker.to.y;
					}
				}
			}else{
				linker.to.x = newPos.x;
				linker.to.y = newPos.y;
				linker.to.id = linkedShape;
				linker.to.angle = newPos.angle;
				if(linkedShape == null){
					if(newPos.x >= linker.from.x -6 && newPos.x <= linker.from.x + 6){
						linker.to.x = linker.from.x;
					}
					if(newPos.y >= linker.from.y -6 && newPos.y <= linker.from.y + 6){
						linker.to.y = linker.from.y;
					}
				}
			}
			Designer.painter.renderLinker(linker, true);
		},
		/**
		 * 向一个形状连线时，显示锚点示意
		 */
		showLinkPoint: function(point){
			var canvas = $("<canvas class='link_point_canvas' width=32 height=32></canvas>").appendTo($("#designer_canvas"));
			var ctx = canvas[0].getContext("2d");
			ctx.translate(1, 1);
			ctx.lineWidth = 1;
			ctx.globalAlpha = 0.3;
			ctx.strokeStyle = Designer.config.anchorColor;
			ctx.fillStyle = Designer.config.anchorColor;
			ctx.beginPath();
			ctx.moveTo(0, 15);
			ctx.bezierCurveTo(0, -5, 30, -5, 30, 15);
			ctx.bezierCurveTo(30, 35, 0, 35, 0, 15);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
			canvas.css({
				left: point.x - 16,
				top: point.y - 16,
				"z-index": Model.orderList.length
			}).show();
		},
		/**
		 * 隐藏锚点示意
		 */
		hideLinkPoint: function(){
			$(".link_point_canvas").hide();
		},
		/**
		 * 折线可以拖动
		 */
		brokenLinkerChangable: function(linker, index){
			var container = $("#canvas_container");
			var canvas = $("#designer_canvas");
			var p1 = linker.points[index - 1];
			var p2 = linker.points[index];
			if(p1.x == p2.x){
				container.css("cursor", "e-resize");
				//可左右拖动
			}else{
				container.css("cursor", "n-resize");
				//可上下拖动
			}
			canvas.bind("mousedown.brokenLinker", function(downE){
				Designer.op.changeState("changing_broken_linker");
				//初始坐标，要取相对画布的坐标
				var begin = Utils.getRelativePos(downE.pageX, downE.pageY, canvas);
				var selectedIds = Utils.getSelectedIds();
				container.bind("mousemove.brokenLinker", function(moveE){
					var now = Utils.getRelativePos(moveE.pageX, moveE.pageY, canvas);
					//计算和开始时候的偏移量
					var offset = {
						x: now.x - begin.x, y: now.y - begin.y
					};
					offset = Utils.restoreScale(offset);
					if(p1.x == p2.x){
						p1.x += offset.x;
						p2.x += offset.x;
					}else{
						p1.y += offset.y;
						p2.y += offset.y;
					}
					Designer.painter.renderLinker(linker);
					if(selectedIds.length > 1){
						Designer.painter.drawControls(selectedIds);
					}
					begin = now;
					//在mousemove里绑定一个mouseup，目的是为了当鼠标发生了拖动之后，才认为是进行了拖动事件
					$(document).unbind("mouseup.changed").bind("mouseup.changed", function(){
						Model.update(linker);
						$(document).unbind("mouseup.changed");
					});
				});
				$(document).bind("mouseup.brokenLinker", function(){
					Designer.op.resetState();
					container.unbind("mousemove.brokenLinker");
					canvas.unbind("mousedown.brokenLinker");
					$(document).unbind("mouseup.brokenLinker");
				});
			});
		},
		/**
		 * 删除图形
		 */
		removeShape: function(){
			var selected = Utils.getSelected();
			if(selected.length > 0){
				Utils.unselect();
				//获取吸附的图形，一起删除
				var attachedShapes = Utils.getAttachedShapes(selected);
				selected = selected.concat(attachedShapes);
				var childrenShapes = [];
				for (var i = 0; i < selected.length; i++) {
					var children = Utils.getChildrenShapes(selected[i]);
					childrenShapes = childrenShapes.concat(children);
				}
				selected = selected.concat(childrenShapes);
				Model.remove(selected);
			}
		},
		/**
		 * 打开操作提示
		 * @param {} text
		 */
		showTip: function(text){
			var tip = $("#designer_op_tip");
			if(tip.length == 0){
				tip = $("<div id='designer_op_tip'></div>").appendTo("#designer_canvas");
			}
			tip.stop().html(text);
			var control = $("#shape_controls");
			var pos = control.position();
			tip.css({
				top: pos.top + control.height() + 5,
				left: pos.left + control.width()/2 - tip.outerWidth()/2,
				"z-index": Model.orderList.length
			}).show();
		},
		/**
		 * 隐藏操作提示
		 */
		hideTip: function(){
			$("#designer_op_tip").fadeOut(100);
		},
		/**
		 * 在移动图形过程中，显示对齐线
		 * @param {} p 缩放图形的位置信息
		 * @param {} ids 缩放图形的id集合
		 * @return {} 对齐线的集合
		 */
		snapLine: function(p, ids, isCreate, createdShape){
			var top = p.y;
			var middle = p.y + p.h/2;
			var bottom = p.y + p.h;
			var left = p.x;
			var center = p.x + p.w/2;
			var right = p.x + p.w;
			var radius = 2; //偏移半径
			var result = {v: null, h: null, attach: null};
			var boundaryEvent = null;
			if(isCreate){
				boundaryEvent = createdShape;
			}else{
				boundaryEvent = Model.getShapeById(ids[0]);
			}
			if(ids.length == 1 && boundaryEvent.groupName == "boundaryEvent"){
				//如果是边界事件，就要先寻找可以吸附上的形状
				for(var i = Model.orderList.length - 1; i >= 0; i--){
					var shapeId = Model.orderList[i].id;
					var shape = Model.getShapeById(shapeId);
					if(shape.name != "linker" && shape.id != boundaryEvent.id){
						var shapep = shape.props;
						if(result.attach == null && shapep.angle == 0 
							&& (shape.groupName == "task" || shape.groupName == "callActivity" || shape.groupName == "subProcess")){
							//如果是BPMN边界事件，可以吸附，那么此图形中心和task图形的边界重合时，可吸附
							var shapeRect = {
								x: shapep.x - radius, y: shapep.y - radius,
								w: shapep.w + radius*2, h: shapep.h + radius*2
							};
							if(Utils.pointInRect(center, middle, shapeRect)){
								var shapeTop = shapep.y;
								var shapeBottom = shapep.y + shapep.h;
								var shapeLeft = shapep.x;
								var shapeRight = shapep.x + shapep.w;
								var xAttach = false;
								var yAttach = false;
								if(shapeTop >= middle - radius && shapeTop <= middle + radius){
									p.y = shapeTop - p.h/2;
									yAttach = true;
								}else if(shapeBottom >= middle - radius && shapeBottom <= middle + radius){
									p.y = shapeBottom - p.h/2;
									yAttach = true;
								}
								if(shapeLeft >= center - radius && shapeLeft <= center + radius){
									p.x = shapeLeft - p.w/2;
									xAttach = true;
								}else if(shapeRight >= center - radius && shapeRight <= center + radius){
									p.x = shapeRight - p.w/2;
									xAttach = true;
								}
								if(xAttach || yAttach){
									result.attach = shape;
								}
							}
						}
					}
				}
			}
			if(result.attach == null){
				//如果没有找到可以吸附的图形，则开始寻找可以对齐的图形
				for(var i = Model.orderList.length - 1; i >= 0; i--){
					var shapeId = Model.orderList[i].id;
					var shape = Model.getShapeById(shapeId);
					if(shape.name == "linker" || ids.indexOf(shapeId) >=0
						|| shape.parent){
						continue;
						//排除连接线、已选图形、子图形
					}
					var shapep = shape.props;
					if(result.h == null){
						var shapeTop = shapep.y;
						var shapeMiddle = shapep.y + shapep.h/2;
						var shapeBottom = shapep.y + shapep.h;
						if(shapeMiddle >= middle - radius && shapeMiddle <= middle + radius){
							//水平居中
							result.h = {type: "middle", y: shapeMiddle};
							p.y = shapeMiddle - p.h/2;
						}else if(shapeTop >= top - radius && shapeTop <= top + radius){
							//顶端
							result.h = {type: "top", y: shapeTop};
							p.y = shapeTop;
						}else if(shapeBottom >= bottom - radius && shapeBottom <= bottom + radius){
							//底部
							result.h = {type: "bottom", y: shapeBottom};
							p.y = shapeBottom - p.h;
						}else if(shapeBottom >= top - radius && shapeBottom <= top + radius){
							//目标图形底部和移动图形顶部对齐
							result.h = {type: "top", y: shapeBottom};
							p.y = shapeBottom;
						}else if(shapeTop >= bottom - radius && shapeTop <= bottom + radius){
							//目标图形顶部和移动图形底部对齐
							result.h = {type: "bottom", y: shapeTop};
							p.y = shapeTop - p.h;
						}
					}
					if(result.v == null){
						var shapeLeft = shapep.x;
						var shapeCenter = shapep.x + shapep.w/2;
						var shapeRight = shapep.x + shapep.w;
						if(shapeCenter >= center - radius && shapeCenter <= center + radius){
							//垂直居中
							result.v = {type: "center", x: shapeCenter};
							p.x = shapeCenter - p.w/2;
						}else if(shapeLeft >= left - radius && shapeLeft <= left + radius){
							//左
							result.v = {type: "left", x: shapeLeft};
							p.x = shapeLeft;
						}else if(shapeRight >= right - radius && shapeRight <= right + radius){
							//右
							result.v = {type: "right", x: shapeRight};
							p.x = shapeRight - p.w;
						}else if(shapeRight >= left - radius && shapeRight <= left + radius){
							//目标图形右边和移动图形左边对齐
							result.v = {type: "left", x: shapeRight};
							p.x = shapeRight;
						}else if(shapeLeft >= right - radius && shapeLeft <= right + radius){
							//目标图形顶部和移动图形底部对齐
							result.v = {type: "right", x: shapeLeft};
							p.x = shapeLeft - p.w;
						}
					}
					if(result.h != null && result.v != null){
						break;
					}
				}
			}
			this.hideSnapLine();
			var canvas = $("#designer_canvas");
			if(result.attach != null){
				//如果有可以吸附的图形，在被吸附图形上显示轮廓
				var tip = $("#designer_op_snapline_attach");
				if(tip.length == 0){
					tip = $("<div id='designer_op_snapline_attach'></div>").appendTo(canvas);
				}
				var attach = result.attach;
				var lineWidth = attach.lineStyle.lineWidth;
				tip.css({
					width: (attach.props.w + lineWidth).toScale(),
					height:(attach.props.h + lineWidth).toScale(),
					left: (attach.props.x - lineWidth/2).toScale() - 2,
					top: (attach.props.y - lineWidth/2).toScale() - 2,
					"z-index": $("#" + attach.id).css("z-index")
				}).show();
			}
			if(result.h != null){
				var hLine = $("#designer_op_snapline_h");
				if(hLine.length == 0){
					hLine = $("<div id='designer_op_snapline_h'></div>").appendTo(canvas);
				}
				hLine.css({
					width: canvas.width() + Designer.config.pageMargin * 2,
					left: -Designer.config.pageMargin,
					top: Math.round(result.h.y.toScale()),
					"z-index": Model.orderList.length + 1
				}).show();
			}
			if(result.v != null){
				var vLine = $("#designer_op_snapline_v");
				if(vLine.length == 0){
					vLine = $("<div id='designer_op_snapline_v'></div>").appendTo(canvas);
				}
				vLine.css({
					height: canvas.height() + Designer.config.pageMargin * 2,
					top: -Designer.config.pageMargin,
					left: Math.round(result.v.x.toScale()),
					"z-index": Model.orderList.length + 1
				}).show();
			}
			return result;
		},
		/**
		 * 在缩放图形过程中，显示对齐线
		 * @param {} p 缩放图形的位置信息
		 * @param {} ids 缩放图形的id集合
		 * @param {} dir 缩放的方向
		 * @return {} 对齐线的集合
		 */
		snapResizeLine: function(p, ids, dir){
			var top = p.y;
			var middle = p.y + p.h/2;
			var bottom = p.y + p.h;
			var left = p.x;
			var center = p.x + p.w/2;
			var right = p.x + p.w;
			var radius = 2; //偏移半径
			var result = {v: null, h: null};
			//开始寻找可以对齐的图形
			for(var i = Model.orderList.length - 1; i >= 0; i--){
				var shapeId = Model.orderList[i].id;
				var shape = Model.getShapeById(shapeId);
				if(shape.name == "linker" || ids.indexOf(shapeId) >=0
					|| shape.parent){
					continue;
					//排除连接线、已选图形、子图形
				}
				var shapep = shape.props;
				if(result.h == null && (dir.indexOf("t") >= 0 || dir.indexOf("b") >= 0)){
					var shapeTop = shapep.y;
					var shapeMiddle = shapep.y + shapep.h/2;
					var shapeBottom = shapep.y + shapep.h;
					if(shapeMiddle >= middle - radius && shapeMiddle <= middle + radius){
						//水平居中
						result.h = {type: "middle", y: shapeMiddle};
						if(dir.indexOf("t") >= 0){
							p.h = (bottom - shapeMiddle) * 2;
							p.y = bottom - p.h;
						}else{
							p.h = (shapeMiddle - p.y) * 2;
						}
					}else if(dir.indexOf("t") >= 0 && shapeTop >= top - radius && shapeTop <= top + radius){
						//顶端
						result.h = {type: "top", y: shapeTop};
						p.y = shapeTop;
						p.h = bottom - shapeTop;
					}else if(dir.indexOf("b") >= 0 && shapeBottom >= bottom - radius && shapeBottom <= bottom + radius){
						//底部
						result.h = {type: "bottom", y: shapeBottom};
						p.h = shapeBottom - top;
					}else if(dir.indexOf("t") >= 0 && shapeBottom >= top - radius && shapeBottom <= top + radius){
						//目标图形底部和移动图形顶部对齐
						result.h = {type: "top", y: shapeBottom};
						p.y = shapeBottom;
						p.h = bottom - shapeBottom;
					}else if(dir.indexOf("b") >= 0 && shapeTop >= bottom - radius && shapeTop <= bottom + radius){
						//目标图形顶部和移动图形底部对齐
						result.h = {type: "bottom", y: shapeTop};
						p.h = shapeTop - p.y;
					}
				}
				if(result.v == null && (dir.indexOf("l") >= 0 || dir.indexOf("r") >= 0)){
					var shapeLeft = shapep.x;
					var shapeCenter = shapep.x + shapep.w/2;
					var shapeRight = shapep.x + shapep.w;
					if(shapeCenter >= center - radius && shapeCenter <= center + radius){
						//垂直居中
						result.v = {type: "center", x: shapeCenter};
						if(dir.indexOf("l") >= 0){
							p.w = (right - shapeCenter) * 2;
							p.x = right - p.w;
						}else{
							p.w = (shapeCenter - p.x) * 2;
						}
					}else if(dir.indexOf("l") >= 0 && shapeLeft >= left - radius && shapeLeft <= left + radius){
						//左
						result.v = {type: "left", x: shapeLeft};
						p.x = shapeLeft;
						p.w = right - shapeLeft;
					}else if(dir.indexOf("r") >= 0 && shapeRight >= right - radius && shapeRight <= right + radius){
						//右
						result.v = {type: "right", x: shapeRight};
						p.w = shapeRight - p.x;
					}else if(dir.indexOf("l") >= 0 && shapeRight >= left - radius && shapeRight <= left + radius){
						//目标图形右边和移动图形左边对齐
						result.v = {type: "left", x: shapeRight};
						p.x = shapeRight;
						p.w = right - shapeRight;
					}else if(dir.indexOf("r") >= 0 && shapeLeft >= right - radius && shapeLeft <= right + radius){
						//目标图形顶部和移动图形底部对齐
						result.v = {type: "right", x: shapeLeft};
						p.w = shapeLeft - p.x;
					}
				}
				if(result.h != null && result.v != null){
					break;
				}
			}
			this.hideSnapLine();
			var canvas = $("#designer_canvas");
			if(result.h != null){
				var hLine = $("#designer_op_snapline_h");
				if(hLine.length == 0){
					hLine = $("<div id='designer_op_snapline_h'></div>").appendTo(canvas);
				}
				hLine.css({
					width: canvas.width() + Designer.config.pageMargin * 2,
					left: -Designer.config.pageMargin,
					top: Math.round(result.h.y.toScale()),
					"z-index": Model.orderList.length + 1
				}).show();
			}
			if(result.v != null){
				var vLine = $("#designer_op_snapline_v");
				if(vLine.length == 0){
					vLine = $("<div id='designer_op_snapline_v'></div>").appendTo(canvas);
				}
				vLine.css({
					height: canvas.height() + Designer.config.pageMargin * 2,
					top: -Designer.config.pageMargin,
					left: Math.round(result.v.x.toScale()),
					"z-index": Model.orderList.length + 1
				}).show();
			}
			return result;
		},
		/**
		 * 隐藏对齐线
		 */
		hideSnapLine: function(){
			$("#designer_op_snapline_h").hide();
			$("#designer_op_snapline_v").hide();
			$("#designer_op_snapline_attach").hide();
		},
		/**
		 * 打开连接图形的画板
		 * @param {} x X坐标
		 * @param {} y Y坐标
		 * @param {} category 分类
		 */
		linkDashboard: function(linker){
			var fromShape = Model.getShapeById(linker.from.id); //拿到起点形状
			var category = fromShape.category; //拿到起点形状的分类
			if($("#panel_" + category).length != 0){
				//如果此分类在当前形状面板中，则可以带出此分类的画板
				var board = $("#shape_dashboard_" + category);
				if(board.length == 0){
					//此分类的画板不存在，则初始化
					board = $("<div id='shape_dashboard_"+category+"' class='shape_dashboard menu'></div>").appendTo("#designer_canvas");
					/**
					 * 添加图形DOM元素
					 */
					function appendPanelItem(shape, group){
						var html = "<div class='dashboard_box' shapeName='" + shape.name + "'><canvas title='"+shape.title+"' title_pos='right' class='panel_item' width='"+(Designer.config.panelItemWidth)+"' height='"+(Designer.config.panelItemHeight)+"'></canvas></div>";
						var panelBox = $(html).appendTo(board);
						if(group){
							panelBox.append("<div class='group_icon link_shape_icon' group='"+group+"'></div>");
						}
						var canvas = panelBox.children()[0];
						//绘制图形
						Designer.painter.drawPanelItem(canvas, shape.name);
					}
					for(var key in Schema.shapes){
						var shape = Schema.shapes[key];
						if(shape.category == category){
							var attribute = shape.attribute;
							if(attribute.visible && attribute.linkable){
								//图形是可见的，并且是可以连线的
								if(!shape.groupName){
									appendPanelItem(shape);
								}else{
									var groupShapes = SchemaGroup.getGroup(shape.groupName);
									if(groupShapes[0] == shape.name){
										appendPanelItem(shape, shape.groupName);
									}
								}
							}
						}
					}
					board.bind("mousemove", function(e){
						e.stopPropagation();
					}).bind("mousedown", function(e){
						e.stopPropagation();
					});
				}
				board.css({
					left: linker.to.x.toScale(),
					top: linker.to.y.toScale(),
					"z-index": Model.orderList.length
				}).show();
				board.find(".link_shape_icon").unbind().bind("mousedown", function(e){
					e.stopPropagation();
					var group = $(this).attr("group");
					var pos = $(this).parent().position();
					var boardPos = board.position();
					var left = pos.left + boardPos.left + $(this).parent().outerWidth() - 10;
					var top = pos.top + boardPos.top + $(this).parent().outerHeight();
					Designer.op.groupDashboard(group, left, top, function(name){
						linkShape(name);
						board.hide();
						$(document).unbind("mousedown.dashboard");
					});
				}).bind("click", function(e){
					e.stopPropagation();
				});
				board.children(".dashboard_box").unbind().bind("click", function(){
					board.hide();
					$(document).unbind("mousedown.dashboard");
					var current = $(this);
					var name = current.attr("shapeName");
					linkShape(name);
				});
				$(document).bind("mousedown.dashboard", function(){
					board.hide();
					$(document).unbind("mousedown.dashboard");
				});
				/**
				 * 链接一个形状
				 */
				function linkShape(name){
					var shape = Schema.shapes[name];
					var toAngle = Utils.getEndpointAngle(linker, "to");
					var dir = Utils.getAngleDir(toAngle);
					var anchors = shape.getAnchors();
					var anchor;
					if(dir == 1){
						//箭头向下，连接图形上方
						var minY = null;
						for ( var ai = 0; ai < anchors.length; ai++) {
							var an = anchors[ai];
							if(minY == null || an.y < minY){
								minY = an.y;
								anchor = an;
							}
						}
					}else if(dir == 2){
						//箭头向左，连接图形右方
						var maxX = null;
						for ( var ai = 0; ai < anchors.length; ai++) {
							var an = anchors[ai];
							if(maxX == null || an.x > maxX){
								maxX = an.x;
								anchor = an;
							}
						}
					}else if(dir == 3){
						//箭头向上，连接图形下方
						var maxY = null;
						for ( var ai = 0; ai < anchors.length; ai++) {
							var an = anchors[ai];
							if(maxY == null || an.y > maxY){
								maxY = an.y;
								anchor = an;
							}
						}
					}else if(dir == 4){
						//箭头向右，连接图形左方
						var minX = null;
						for ( var ai = 0; ai < anchors.length; ai++) {
							var an = anchors[ai];
							if(minX == null || an.x < minX){
								minX = an.x;
								anchor = an;
							}
						}
					}
					var newShape = Model.create(name, linker.to.x - anchor.x, linker.to.y - anchor.y);
					Designer.painter.renderShape(newShape);
					MessageSource.beginBatch();
					//发送形状创建事件
					if(newShape.onCreated){
						newShape.onCreated();
					}
					Designer.events.push("created", newShape);
					Model.add(newShape);
					//重构连接线
					var anchorAngle = Utils.getPointAngle(newShape.id, linker.to.x, linker.to.y, 7);
					linker.to.id = newShape.id;
					linker.to.angle = anchorAngle;
					Designer.painter.renderLinker(linker, true);
					Model.update(linker);
					MessageSource.commit();
					Utils.unselect();
					Utils.selectShape(newShape.id);
					Designer.op.editShapeText(newShape);
				}
			}
		},
		/**
		 * 打开分组面板
		 */
		groupDashboard: function(groupName, left, top, onSelected){
			$(".group_dashboard").hide();
			var board = $("#shape_group_dashboard_" + groupName);
			if(board.length == 0){
				//此分类的画板不存在，则初始化
				board = $("<div id='shape_group_dashboard_"+groupName+"' class='group_dashboard menu'></div>").appendTo("#designer_canvas");
				var groupShapes = SchemaGroup.getGroup(groupName);
				for (var i = 0; i < groupShapes.length; i++) {
					var name = groupShapes[i];
					var shape = Schema.shapes[name];
					if(shape.attribute.visible){
						var box = $("<div class='dashboard_box' shapeName='" + name + "'><canvas title='"+shape.title+"' title_pos='right' width='"+(Designer.config.panelItemWidth)+"' height='"+(Designer.config.panelItemHeight)+"'></canvas></div>").appendTo(board);
						var canvas = box.children("canvas")[0];
						Designer.painter.drawPanelItem(canvas, shape.name);
					}
				}
				board.bind("mousedown", function(e){
					e.stopPropagation();
				});
			}
			board.css({
				left: left,
				top: top,
				"z-index": Model.orderList.length + 1
			}).show();
			$(".dashboard_box").unbind().bind("click", function(){
				var shapeName = $(this).attr("shapeName");
				onSelected(shapeName);
				board.hide();
				$(document).unbind("mousedown.group_dashboard");
			});
			$(document).bind("mousedown.group_dashboard", function(){
				board.hide();
				$(document).unbind("mousedown.group_dashboard");
			});
			return board;
		},
		/**
		 * 打开一个图形分组，用于创建图形
		 * @param {} groupName
		 * @param {} event
		 */
		showPanelGroup: function(groupName, event, target){
			event.stopPropagation();
			var board = $("#group_dashboard_" + groupName);
			$(".group_dashboard").hide();
			if(board.length == 0){
				//此分类的画板不存在，则初始化
				board = $("<div id='group_dashboard_"+groupName+"' class='group_dashboard menu'></div>").appendTo("#designer");
				var groupShapes = SchemaGroup.getGroup(groupName);
				for (var i = 0; i < groupShapes.length; i++) {
					var name = groupShapes[i];
					var shape = Schema.shapes[name];
					if(shape.attribute.visible){
						var box = $("<div class='panel_box' shapeName='" + name + "'><canvas title='"+shape.title+"' title_pos='right' width='"+(Designer.config.panelItemWidth)+"' height='"+(Designer.config.panelItemHeight)+"'></canvas></div>").appendTo(board);
						var canvas = box.children("canvas")[0];
						Designer.painter.drawPanelItem(canvas, shape.name);
					}
				}
				board.css("position", "fixed");
			}
			var shapeBox = $(target).parent();
			var offset = shapeBox.offset();
			board.show();
			var top = offset.top + shapeBox.height();
			if(top + board.outerHeight() > $(window).height()){
				top = $(window).height() - board.outerHeight();
			}
			board.css({
				left: offset.left - 7,
				top: top
			});
			$(document).bind("mousedown.group_board", function(){
				board.hide();
				$(document).unbind("mousedown.group_board");
			});
		},
		/**
		 * 修改形状的属性
		 */
		changeShapeProps: function(shape, props){
			function changeLinkerPoint(point){
				if(typeof props.x != "undefined"){
					point.x += (props.x - shape.props.x);
				}
				if(typeof props.y != "undefined"){
					point.y += (props.y - shape.props.y);
				}
				if(typeof props.w != "undefined" || typeof props.h != "undefined" || typeof props.angle != "undefined"){
					var p = $.extend({}, shape.props, props);
					//得到图形原始的中心点
					var shapeCenter = {
						x: shape.props.x + shape.props.w/2,
						y: shape.props.y + shape.props.h/2
					};
					//得到未旋转情况下，连接线端点与图形的比例，即把坐标先旋转回去
					var rotateBack = Utils.getRotated(shapeCenter, point, -shape.props.angle);
					var w = shape.props.w;
					var h = shape.props.h;
					if(typeof props.w != "undefined"){
						point.x = shape.props.x + (rotateBack.x - shape.props.x) / shape.props.w * props.w;
						w = props.w;
					}else{
						point.x = rotateBack.x;
					}
					if(typeof props.h != "undefined"){
						point.y = shape.props.y + (rotateBack.y - shape.props.y) / shape.props.h * props.h;
						h = props.h;
					}else{
						point.y = rotateBack.y;
					}
					var newCenter = {
						x: shape.props.x + w/2,
						y: shape.props.y + h/2
					};
					var rotated = Utils.getRotated(newCenter, point, p.angle);
					point.x = rotated.x;
					point.y = rotated.y;
				}
				if(typeof props.angle != "undefined"){
					point.angle += props.angle - shape.props.angle;
				}
			}
			var changedlinkers = [];
			var shapeLinkers = Model.getShapeLinkers(shape.id);
			if(shapeLinkers && shapeLinkers.length > 0){
				for(var index = 0; index < shapeLinkers.length; index++){
					var id = shapeLinkers[index];
					var linker = Model.getShapeById(id);
					if(shape.id == linker.from.id){
						changeLinkerPoint(linker.from);
					}
					if(shape.id == linker.to.id){
						changeLinkerPoint(linker.to);
					}
				}
				changedlinkers =  shapeLinkers;
			}
			$.extend(shape.props, props);
			Designer.painter.renderShape(shape);
			Utils.showLinkerCursor();
			UI.showShapeOptions();
			return changedlinkers;
		}
	},
	/**
	 * 事件对象以及处理函数
	 * @type {}
	 */
	events: {
		push: function(eventName, eventObject){
			var eventListener = this.listeners[eventName];
			if(eventListener){
				return eventListener(eventObject);
			}
			return null;
		},
		listeners: {},
		addEventListener: function(listenEventName, execCallback){
			this.listeners[listenEventName] = execCallback;
		}
	},
	/**
	 * 剪贴板
	 * @type {}
	 */
	clipboard: {
		/**
		 * 剪贴板存储对象
		 * @type {}
		 */
		elements: [],
		/**
		 * 预置的id映射，在copy之后，预置paste时会使用的新id，控制连接线所需
		 * @type {}
		 */
		presetedIds: {},
		/**
		 * 预置id映射
		 */
		presetIds: function(){
			this.presetedIds = {};
			for(var i = 0; i < this.elements.length; i++){
				//初始化一些属性为默认值
				var shape = this.elements[i];
				this.presetedIds[shape.id] = Utils.newId();
				//建立新的group映射
				if(shape.group && !this.presetedIds[shape.group]){
					this.presetedIds[shape.group] = Utils.newId();
				}
			}
		},
		/**
		 * 状态标识，标识在粘贴时，是否需要改变位置
		 * @type {Boolean}
		 */
		plus: true,
		/**
		 * 复制，copy一份存到剪贴板中
		 */
		copy: function(){
			this.elements = [];
			var selected = Utils.getSelected();
			var familyShapes = Utils.getFamilyShapes(selected);
			selected = selected.concat(familyShapes);
			selected.sort(function compare(a, b){
		 		return a.props.zindex - b.props.zindex;
		 	});
			for(var i = 0; i < selected.length; i++){
				var shape = Utils.copy(selected[i]);
				if(shape.name == "linker"){
					//如果是连接线，要处理一下端点连接的图形
					if(shape.from.id != null){
						if(!Utils.isSelected(shape.from.id)){
							shape.from.id = null;
							shape.from.angle = null;
						}
					}
					if(shape.to.id != null){
						if(!Utils.isSelected(shape.to.id)){
							shape.to.id = null;
							shape.to.angle = null;
						}
					}
				}
				this.elements.push(shape);
			}
			this.elements.sort(function compare(a, b){
		 		return a.props.zindex - b.props.zindex;
		 	});
			this.presetIds();
			this.plus = true;
			Designer.events.push("clipboardChanged", this.elements.length);
		},
		/**
		 * 复制，copy一份存到剪贴板中
		 */
		cut: function(){
			this.copy();
			Designer.op.removeShape();
			this.plus = false; //如果是cut操作，第一次粘贴，不改变位置
		},
		/**
		 * 粘贴
		 */
		paste: function(x, y){
			if(this.elements.length == 0){
				return;
			}
			var offsetX = 20;
			var offsetY = 20;
			if(typeof x != "undefined"){
				var bounding = Utils.getShapesBounding(this.elements);
				offsetX = x - bounding.x - bounding.w/2;
				offsetY = y - bounding.y - bounding.h/2;
			}
			var changedShapes = [];
			var changedIds = [];
			//先创建图形，再创建连接线，因为连接线可能会依赖图形
			for(var i = 0; i < this.elements.length; i++){
				var shape = this.elements[i];
				if(shape.name != "linker"){
					var newShape;
					//初始化一些属性为默认值
					var shape = this.elements[i];
					shape.props.zindex = Model.maxZIndex + (i+1);
					var newId = this.presetedIds[shape.id];
					if(this.plus || typeof x != "undefined"){
						shape.props.x += offsetX;
						shape.props.y += offsetY;
					}
					newShape = Utils.copy(shape);
					for (var j = 0; j < newShape.dataAttributes.length; j++) {
						var attr = newShape.dataAttributes[j];
						attr.id = Utils.newId();
					}
					newShape.id = newId;
					//构建新的children和parent关联
					if(newShape.children){
						for(var ci = 0; ci < newShape.children.length; ci++){
							var childId = newShape.children[ci];
							newShape.children[ci] = this.presetedIds[childId];
						}
					}
					if(newShape.parent){
						newShape.parent = this.presetedIds[newShape.parent];
					}
					changedShapes.push(newShape);
					changedIds.push(newId);
					if(shape.group){
						var newGroup = this.presetedIds[shape.group];
						newShape.group = newGroup;
					}
				}
			}
			for(var i = 0; i < this.elements.length; i++){
				var shape = this.elements[i];
				if(shape.name == "linker"){
					var newShape;
					//初始化一些属性为默认值
					shape.props.zindex = Model.maxZIndex + (i+1);
					var newId = this.presetedIds[shape.id];
					if(this.plus || typeof x != "undefined"){
						shape.from.x += offsetX;
						shape.from.y += offsetY;
						shape.to.x += offsetX;
						shape.to.y += offsetY;
						for(var pi = 0; pi < shape.points.length; pi++){
							var p = shape.points[pi];
							p.x += offsetX;
							p.y += offsetY;
						}
					}
					newShape = Utils.copy(shape);
					if(!newShape.dataAttributes){
						newShape.dataAttributes = [];
					}
					for (var j = 0; j < newShape.dataAttributes.length; j++) {
						var attr = newShape.dataAttributes[j];
						attr.id = Utils.newId();
					}
					if(shape.from.id != null){
						newShape.from.id = this.presetedIds[shape.from.id];
					}
					if(shape.to.id != null){
						newShape.to.id = this.presetedIds[shape.to.id];
					}
					newShape.id = newId;
					changedShapes.push(newShape);
					changedIds.push(newId);
					if(shape.group){
						var newGroup = this.presetedIds[shape.group];
						newShape.group = newGroup;
					}
				}
			}
			Model.addMulti(changedShapes);
			for(var i = 0; i < changedShapes.length; i++){
				var shape = changedShapes[i];
				Designer.painter.renderShape(shape);
			}
			Model.build();
			//重新内置一下id
			this.presetIds();
			Utils.unselect();
			Utils.selectShape(changedIds);
			this.plus = true;
		},
		/**
		 * 复用
		 */
		duplicate: function(){
			this.copy();
			this.paste();
		},
		/**
		 * copy样式到格式刷
		 */
		brush: function(){
			var selected = Utils.getSelected();
			if(selected.length == 0){
				return;
			}
			//格式刷中的样式，把连接线与形状样式区分开
			var brushStyles = {
				fontStyle: {},
				lineStyle: {},
				fillStyle: null,
				shapeStyle: null
			};
			for(var i = 0; i < selected.length; i++){
				var shape = selected[i];
				if(shape.name == "linker"){
					$.extend(brushStyles.lineStyle, shape.lineStyle);
					$.extend(brushStyles.fontStyle, shape.fontStyle);
				}else{
					if(brushStyles.fillStyle == null){
						brushStyles.fillStyle = {};
					}
					if(brushStyles.shapeStyle == null){
						brushStyles.shapeStyle = {};
					}
					$.extend(brushStyles.lineStyle, shape.lineStyle);
					$.extend(brushStyles.fontStyle, shape.fontStyle);
					$.extend(brushStyles.shapeStyle, shape.shapeStyle);
					$.extend(brushStyles.fillStyle, shape.fillStyle);
				}
			}
			$("#bar_brush").button("select");
			//打开帮助
			var help = $("#designer_op_help");
			if(help.length == 0){
				help = $("<div id='designer_op_help'></div>").appendTo("#designer_viewport");
			}
			help.html("Select shape to set style from brush<br/>Esc to cancel").show();
			$(document).unbind("keydown.cancelbrush").bind("keydown.cancelbrush", function(e){
				//按Esc取消，并且停止brush
				if(e.keyCode == 27){
					$("#bar_brush").button("unselect");
					help.hide();
					$(document).unbind("keydown.cancelbrush");
					Utils.selectCallback = null;
					$("#bar_brush").button("disable");
				}
			});
			//设置选择后的回调事件，设置样式
			Utils.selectCallback = function(){
				var copyTo = Utils.getSelected();
				for(var i = 0; i < copyTo.length; i++){
					var shape = copyTo[i];
					var textOrientation = shape.fontStyle.orientation;
					$.extend(shape.lineStyle, brushStyles.lineStyle);
					$.extend(shape.fontStyle, brushStyles.fontStyle);
					if(shape.name != "linker"){
						shape.lineStyle = brushStyles.lineStyle;
						delete shape.lineStyle.beginArrowStyle;
						delete shape.lineStyle.endArrowStyle;
						shape.fontStyle.orientation = textOrientation; //orientation属性是不允许修改的
						if(brushStyles.fillStyle != null){
							shape.fillStyle = brushStyles.fillStyle;
						}
						if(brushStyles.shapeStyle != null){
							shape.shapeStyle = brushStyles.shapeStyle;
						}
					}else{
						delete shape.fontStyle.orientation;
						delete shape.fontStyle.vAlign;
					}
					Designer.painter.renderShape(shape);
				}
				Model.updateMulti(copyTo);
			}
		}
	},
	/**
	 * 方法定义
	 */
	addFunction: function(fnName, fnBody){
		if(Designer[fnName]){
			throw "Duplicate function name!";
		}else{
			this[fnName] = fnBody;
		}
	},
	/**
	 * 绘制器
	 */
	painter: {
		/**
		 * 绘制器动作处理定义
		 */
		actions: {
			move: function(data){
				this.moveTo(data.x, data.y);
			},
			line: function(data){
				this.lineTo(data.x, data.y);
			},
			curve: function(data){
				this.bezierCurveTo(data.x1, data.y1, data.x2, data.y2, data.x, data.y);
			},
			quadraticCurve: function(data){
				this.quadraticCurveTo(data.x1, data.y1, data.x, data.y);
			},
			close: function(){
				this.closePath();
			}
		},
		/**
		 * 设置虚线段
		 */
		setLineDash: function(ctx, segments){
			if (!ctx.setLineDash) {
			    ctx.setLineDash = function(){}
			}
			ctx.setLineDash(segments);
			ctx.mozDash = segments;
			ctx.webkitLineDash = segments;
		},
		/**
		 * 绘制路径
		 * @param {} 画布上下文
		 * @param {} shape 图形完整定义
		 * @param {} shape 是否是要绘制图形面板的图形
		 */
		renderShapePath: function(ctx, shape, isPanelIcon, delayCallback){
			var paths;
			if(isPanelIcon && shape.drawIcon){
				paths = shape.drawIcon(shape.props.w, shape.props.h);
			}else{
				paths = shape.getPath();
			}
			this.renderPath(ctx, shape, paths, isPanelIcon, delayCallback);
		},
		/**
		 * 绘制路径
		 * @param {} ctx
		 * @param {} shape
		 * @param {} paths
		 * @param {} delayCallback 填充回调函数，用于在图片延迟加载之后
		 */
		renderPath: function(ctx, shape, paths, isPanelIcon, delayCallback){
			for(var i = 0; i < paths.length; i++){
				var cmd = paths[i];
				ctx.save();
				ctx.beginPath();
				var lineStyle = $.extend({}, shape.lineStyle, cmd.lineStyle);
				var fillStyle = $.extend({}, shape.fillStyle, cmd.fillStyle);
				for (var j = 0; j < cmd.actions.length; j++) {
					var cmdAction = cmd.actions[j];
					this.actions[cmdAction.action].call(ctx, cmdAction);
				}
				//填充
				this.fillShape(shape, ctx, fillStyle, delayCallback);
				//画线
				if(lineStyle.lineWidth){
					ctx.lineWidth = lineStyle.lineWidth;
					ctx.strokeStyle = "rgb("+lineStyle.lineColor+")";
					if(lineStyle.lineStyle == "dashed"){
						//虚线
						if(isPanelIcon){
							this.setLineDash(ctx, [lineStyle.lineWidth * 4, lineStyle.lineWidth * 2])
						}else{
							this.setLineDash(ctx, [lineStyle.lineWidth * 6, lineStyle.lineWidth * 3]);
						}
					}else if(lineStyle.lineStyle == "dot"){
						//点线
						this.setLineDash(ctx, [lineStyle.lineWidth, lineStyle.lineWidth * 2]);
					}else if(lineStyle.lineStyle == "dashdot"){
						//点线
						this.setLineDash(ctx, [lineStyle.lineWidth * 6, lineStyle.lineWidth * 2, lineStyle.lineWidth, lineStyle.lineWidth * 2]);
					}
					ctx.stroke();				
				}
				ctx.restore();
			}
		},
		drawImage: function(ctx, cmd){
			var image = $(".shape_img[src='" + cmd.image + "']");
			if(image.length == 0){
				image = $("<img class='shape_img' loaded='0' src=''/>").appendTo("#shape_img_container");
				image.bind("load.drawshape", function(){
					//如果图片不存在，需要在图片加载完后，回调
					ctx.drawImage(image[0], cmd.x ,cmd.y, cmd.w, cmd.h);
					$(this).attr("loaded", "1");
				});
				image.attr("src", cmd.image);
			}else if(image.attr("loaded") == "0"){
				image.bind("load.drawshape", function(){
					//如果图片不存在，需要在图片加载完后，回调
					ctx.drawImage(image[0], cmd.x ,cmd.y, cmd.w, cmd.h);
				});
			}else{
				ctx.drawImage(image[0], cmd.x ,cmd.y, cmd.w, cmd.h);
			}
		},
		/**
		 * 绘制图形面板图形
		 * @param canvas
		 * @param schemeName
		 */
		drawPanelItem: function(canvas, shapeName){
			var ctx = canvas.getContext("2d");
			var shape = Utils.copy(Schema.shapes[shapeName]);
			var props = {
				x: 0,
				y: 0,
				w: shape.props.w,
				h: shape.props.h,
				angle: shape.props.angle
			};
			ctx.clearRect(0, 0, Designer.config.panelItemWidth, Designer.config.panelItemHeight);
			//计算图标的宽高以及位移
			if(props.w >= Designer.config.panelItemWidth || props.h >= Designer.config.panelItemWidth){
				if(shape.props.w >= shape.props.h){
					props.w = Designer.config.panelItemWidth - shape.lineStyle.lineWidth * 2;
					props.h = parseInt(shape.props.h / shape.props.w * props.w);
				}else{
					props.h = Designer.config.panelItemHeight - shape.lineStyle.lineWidth * 2;
					props.w = parseInt(shape.props.w / shape.props.h * props.h);
				}
			}
			shape.props = props;
			ctx.save();
			ctx.lineJoin = "round";
			ctx.globalAlpha = shape.shapeStyle.alpha;
			var translateX = (Designer.config.panelItemWidth - props.w)/2;
			var translateY = (Designer.config.panelItemHeight - props.h)/2;
			ctx.translate(translateX, translateY);
			ctx.translate(props.w/2, props.h/2);
			ctx.rotate(props.angle);
			ctx.translate(-(props.w/2), -(props.h/2));
			this.renderShapePath(ctx, shape, true, function(){
				Designer.painter.drawPanelItem(canvas, shapeName);
			});
			//绘制BPMN Marker
			this.renderMarkers(ctx, shape, true);
			ctx.restore();
		},
		/**
		 * 绘制形状
		 * 顺序：背景 -> 文字 -> 边框
		 * @param {} shapeObj
		 */
		renderShape: function(shape){
			if(shape.name == "linker"){
				this.renderLinker(shape);
				return;
			}
			var shapeBox = $("#" + shape.id);
			if(shapeBox.length == 0){
				//如果不存在，要执行创建
				var superCanvas = $("#designer_canvas");
				shapeBox = $("<div id='"+shape.id+"' class='shape_box'><canvas class='shape_canvas'></canvas></div>").appendTo(superCanvas);
			}
			//得到图形旋转后的矩形边界
			var box = Utils.getShapeBox(shape);
			//修改图形画布的宽高，坐标等信息
			var canvasWidth = (box.w + 20).toScale();
			var canvasHeight = (box.h + 20).toScale();
			shapeBox.find(".shape_canvas").attr({
				width: canvasWidth,
				height: canvasHeight
			});
			shapeBox.css({
				left: (box.x - 10).toScale() + "px",
				top: (box.y - 10).toScale() + "px",
				width: canvasWidth,
				height: canvasHeight
			});
			//对图形执行绘制
			var ctx = shapeBox.find(".shape_canvas")[0].getContext("2d");
			ctx.clearRect(0, 0, shape.props.w + 20, shape.props.h + 20);
			ctx.scale(Designer.config.scale, Designer.config.scale);
			ctx.translate(10, 10);
			ctx.translate(shape.props.x - box.x, shape.props.y - box.y);
			ctx.translate(shape.props.w/2, shape.props.h/2);
			ctx.rotate(shape.props.angle);
			ctx.translate(-(shape.props.w/2), -(shape.props.h/2));
			var style = shape.lineStyle;
			ctx.globalAlpha = shape.shapeStyle.alpha;
			ctx.lineJoin = "round";
			this.renderShapePath(ctx, shape, false, function(){
				var sid = shape.id;
				var s = Model.getShapeById(sid);
				Designer.painter.renderShape(s);
			});
			//绘制BPMN Marker
			this.renderMarkers(ctx, shape);
//			//再绘制一节，用来响应鼠标，默认为画法最后一节
			var paths = shape.getPath();
			var respondPath = Utils.copy(paths[paths.length - 1]);
			respondPath.fillStyle = {type: "none"};
			respondPath.lineStyle = {lineWidth: 0};
			var respondPaths = [respondPath];
			this.renderPath(ctx, shape, respondPaths);
			//绘制文本
			this.renderText(shape, box);
			this.renderDataAttributes(shape, box);
		},
		/**
		 * 填充图形
		 */
		fillShape: function(shape, ctx, fillStyle, delayCallback){
			ctx.save();
			//填充
			if(fillStyle.type != "none" && typeof fillStyle.alpha != "undefined"){
				ctx.globalAlpha = fillStyle.alpha;
			}
			if(fillStyle.type == "solid"){
				ctx.fillStyle = "rgb("+fillStyle.color+")";
				ctx.fill();
			}else if(fillStyle.type == "gradient"){
				var gradient;
				if(fillStyle.gradientType == "linear"){
					//创建线性渐变
					gradient = GradientHelper.createLinearGradient(shape, ctx, fillStyle);
				}else{
					//创建径向渐变
					gradient = GradientHelper.createRadialGradient(shape, ctx, fillStyle);
				}
				ctx.fillStyle = gradient;
				ctx.fill();
			}else if(fillStyle.type == "image"){
				var url;
				if(fillStyle.fileId.indexOf("/images/") >= 0){
					url = fillStyle.fileId;
				}else{
					url = "/file/id/"+fillStyle.fileId+"/diagram_user_image";
				}
				var image = $(".shape_img[src='" + url + "']");
				if(image.length == 0){
					image = $("<img class='shape_img' loaded='0' src=''/>").appendTo("#shape_img_container");
					image.bind("load.drawshape", function(){
						//如果图片不存在，需要在图片加载完后，回调
						$(this).attr("loaded", "1");
						if(delayCallback){
							delayCallback();
						}
					});
					image.attr("src", url);
				}else if(image.attr("loaded") == "0"){
					image.bind("load.drawshape", function(){
						//如果图片不存在，需要在图片加载完后，回调
						if(delayCallback){
							delayCallback();
						}
					});
				}else{
					drawImage(image);
				}
			}
			ctx.restore();
			function drawImage(image){
				ctx.save();
				ctx.clip();
//				ctx.globalCompositeOperation = "destination-over";
				if(fillStyle.display == "fit"){
					//自适应
					var imgW = image.width();
					var imgH = image.height();
					var imgScale = imgW/imgH;
					var shapeScale = shape.props.w/shape.props.h;
					if(imgScale > shapeScale){
						var drawW = shape.props.w;
						var x = 0;
						var drawH = drawW / imgScale;
						var y = shape.props.h/2 - drawH/2;
						ctx.drawImage(image[0], x ,y, drawW, drawH);
					}else{
						var drawH = shape.props.h;
						var y = 0;
						var drawW = drawH * imgScale;
						var x = shape.props.w/2 - drawW/2;
						ctx.drawImage(image[0], x ,y, drawW, drawH);
					}
				}else if(fillStyle.display == "stretch"){
					//铺满
					ctx.drawImage(image[0], 0 ,0, shape.props.w, shape.props.h);
				}else if(fillStyle.display == "original"){
					//原始尺寸
					var imgW = image.width();
					var imgH = image.height();
					var x = shape.props.w/2 - imgW/2;
					var y = shape.props.h/2 - imgH/2;
					ctx.drawImage(image[0], x ,y, imgW, imgH);
				}else if(fillStyle.display == "tile"){
					//平铺
					var x = 0;
					var imgW = image.width();
					var imgH = image.height();
					while(x < shape.props.w){
						var y = 0;
						while(y < shape.props.h){
							ctx.drawImage(image[0], x ,y, imgW, imgH);
							y += imgH;
						}
						x += imgW;
					}
				}else if(fillStyle.display == "static"){
					//静态定位
					var x = 0;
					var imgW = image.width();
					var imgH = image.height();
					ctx.drawImage(image[0], fillStyle.imageX , fillStyle.imageY, imgW, imgH);
				}else{
					//fill，默认，等比填充
					var imgW = image.width();
					var imgH = image.height();
					var imgScale = imgW/imgH;
					var shapeScale = shape.props.w/shape.props.h;
					if(imgScale > shapeScale){
						//图片的宽高比例大于图形的，及图形相对于图片，高比较小，以高为基准
						var drawH = shape.props.h;
						var y = 0;
						var drawW = drawH * imgScale;
						var x = shape.props.w/2 - drawW/2;
						ctx.drawImage(image[0], x ,y, drawW, drawH);
					}else{
						var drawW = shape.props.w;
						var x = 0;
						var drawH = drawW / imgScale;
						var y = shape.props.h/2 - drawH/2;
						ctx.drawImage(image[0], x ,y, drawW, drawH);
					}
				}
				ctx.restore();
			}
		},
		/**
		 * 绘制图形上的文本
		 * @param {} shape
		 */
		renderText: function(shape, shapeBox){
			var shapeContainer = $("#" + shape.id);
			var tbs = shape.getTextBlock();
			shapeContainer.find(".text_canvas").remove();
			for(var i = 0; i < tbs.length; i++){
				var textBlock = tbs[i];
				var textarea = shapeContainer.find(".text_canvas[ind="+i+"]");
				if(textarea.length == 0){
					textarea = $("<textarea class='text_canvas' forshape='"+shape.id+"' ind='"+i+"'></textarea>").appendTo(shapeContainer);
					textarea.bind("focus", function(){
						$(this).blur();
					});
				}
				textarea.attr("readonly", "readonly");
				if(!textBlock.text || textBlock.text.trim() == ""){
					textarea.css({
						height: "0px",
						width: "0px"
					}).hide();
					continue;
				}
				var fontStyle = $.extend({}, shape.fontStyle, textBlock.fontStyle);
				var style = {
					"line-height": Math.round(fontStyle.size * 1.25) + "px",
					"font-size": fontStyle.size + "px",
					"font-family": fontStyle.fontFamily,
					"font-weight": fontStyle.bold ? "bold" : "normal",
					"font-style": fontStyle.italic ? "italic" : "normal",
					"text-align": fontStyle.textAlign,
					"color": "rgb(" + fontStyle.color + ")",
					"text-decoration": fontStyle.underline ? "underline" : "none",
					"opacity": shape.shapeStyle.alpha
				};
				textarea.css(style);
				//设置位置
				textarea.show();
				var pos = textBlock.position;
				//计算文本内容的高度
				if(fontStyle.orientation == "horizontal"){
					//如果水平显示文本，做一次宽高颠倒，实质上是逆时针旋转45度
					var blockCenter = {
						x: pos.x + pos.w/2,
						y: pos.y + pos.h/2
					};
					pos = {
						x: blockCenter.x - pos.h/2,
						y: blockCenter.y - pos.w/2,
						w: pos.h,
						h: pos.w
					};
				}
				textarea.css({width: pos.w});
				//得到文本的高度
				textarea.height(0);
				textarea.val(textBlock.text);
				textarea.scrollTop(99999);
				var textH = textarea.scrollTop();
				var top = 0;
				if(fontStyle.vAlign == "middle"){
					top = (pos.y + pos.h/2 - textH/2);
				}else if(shape.fontStyle.vAlign == "bottom"){
					top = (pos.y + pos.h - textH);
				}else{
					top = pos.y;
				}
				var textCenter = {
					x: pos.x + pos.w/2,
					y: top + textH/2
				};
				var textAngle = shape.props.angle;
				if(textAngle != 0){
					var center = {x: shape.props.w/2, y: shape.props.h/2};
					textCenter = Utils.getRotated(center, textCenter, textAngle);
				}
				if(fontStyle.orientation == "horizontal"){
					textAngle = (Math.PI * 1.5 + textAngle) % (Math.PI * 2);
				}
				var deg = Math.round(textAngle / (Math.PI*2) * 360);
				var degStr = "rotate(" + deg + "deg) scale("+Designer.config.scale+")";
				var tWidth = pos.w;
				var tHeight = textH;
				textarea.css({
					width: tWidth,
					height: tHeight,
					left: (textCenter.x + (shape.props.x - shapeBox.x) + 10).toScale() - pos.w/2,
					top: (textCenter.y + (shape.props.y - shapeBox.y) + 10).toScale() - textH/2,
					"-webkit-transform": degStr,
					"-ms-transform": degStr,
					"-o-transform": degStr,
					"-moz-transform": degStr,
					"transform": degStr
				});
			}
		},
		/**
		 * 计算文本有多少行
		 * @param {} text
		 */
		calculateTextLines: function(text, textBlock, ctx){
			//先以\n划分段落
			var w = textBlock.w;
			var h = textBlock.h;
			var lines = [];
			var paragraphs = text.split(/\n/);
			for(var i = 0; i < paragraphs.length; i++){
				var p = paragraphs[i];
				var metric = ctx.measureText(p);
				if(metric.width <= w){
					//如果一个段落一行可以显示
					lines.push(p);
				}else{
					//如果一个段落一行不可以显示，以空格划分，并换行
					var words = p.split(/\s/);
					var line = "";
					for(var j = 0; j < words.length; j++){
						var word = words[j];
						if(j != words.length - 1){
							word += " ";
						}
						//如果一个词一行会超出，则强制换行
						var wordWidth = ctx.measureText(word).width;
						if(wordWidth > w){
							for(var wi = 0; wi < word.length; wi++){
								var testLine = line + word[wi];
								var testWidth = ctx.measureText(testLine).width;
								//如果内容超过了，就计算下一行
								if(testWidth > w){
									lines.push(line);
									line = word[wi];
								}else{
									line = testLine;
								}
							}
						}else{
							var testLine = line + word;
							var testWidth = ctx.measureText(testLine).width;
							//如果内容超过了，就计算下一行
							if(testWidth > w){
								lines.push(line);
								line = word;
							}else{
								line = testLine;
							}
						}
					}
					if(line != ""){
						lines.push(line);
					}
				}
			}
			return lines;
		},
		/**
		 * 绘制图形上的Marker
		 * @param {} ctx
		 * @param {} shape
		 */
		renderMarkers: function(ctx, shape, isPanelIcon){
			if(shape.attribute && shape.attribute.markers && shape.attribute.markers.length > 0){
				var markers = shape.attribute.markers;
				var size = Schema.config.markerSize;
				var spacing = 4;
				if(isPanelIcon){
					size = 10;
				}
				var offset = shape.attribute.markerOffset;
				if(isPanelIcon){
					offset = 5;
				}
				//绘制Marker的开始x坐标
				var markersWidth = markers.length * size + (markers.length - 1) * spacing;
				var x = shape.props.w / 2 - markersWidth / 2;
				for (var i = 0; i < markers.length; i++) {
					var markerName = markers[i];
					ctx.save();
					ctx.translate(x, shape.props.h - size - offset);
					var markerPaths = Schema.markers[markerName].call(shape, size);
					this.renderPath(ctx, shape, markerPaths);
					ctx.restore();
					x += size + spacing;
				}
			}
		},
		/**
		 * 绘制图形的数据属性
		 */
		renderDataAttributes: function(shape, shapeBox){
			$("#" + shape.id).children(".attr_canvas").remove();
			if(!shape.dataAttributes || shape.dataAttributes.length == 0){
				return;
			}
			var shapeCenter = {
				x: shape.props.w/2,
				y: shape.props.h/2
			};
			for (var i = 0; i < shape.dataAttributes.length; i++) {
				var attr = shape.dataAttributes[i];
				if(attr.showType == "none"){
					continue;
				}
				var text = "";
				var icon = "";
				if(attr.showName){
					text = attr.name + ": ";
				}
				if(attr.showType == "text"){
					text += attr.value;
				}else if(attr.showType == "icon"){
					icon = attr.icon;
				}
				if(text == "" && icon == ""){
					continue;
				}
				renderAttribute(attr, text, icon);
			}
			function renderAttribute(attr, text, icon){
				var horizontal = attr.horizontal;
				var vertical = attr.vertical;
				var canvas = $("<canvas id='attr_canvas_"+attr.id+"' class='attr_canvas'></canvas>").appendTo($("#" + shape.id));
				var ctx = canvas[0].getContext("2d");
				var font = "12px ";
				font += shape.fontStyle.fontFamily;
				ctx.font = font;
				var w = ctx.measureText(text).width;
				var h = 20;
				if(icon != ""){
					w += 20;
				}
				var x, y;
				//给x坐标加上2像素的偏移量，离线条有2像素的间隙
				if(horizontal == "mostleft"){
					x = -w - 2;
				}else if(horizontal == "leftedge"){
					x = -w / 2;
				}else if(horizontal == "left"){
					x = 2;
				}else if(horizontal == "center"){
					x = (shape.props.w - w)/2;
				}else if(horizontal == "right"){
					x = shape.props.w - w - 2;
				}else if(horizontal == "rightedge"){
					x = shape.props.w - w/2;
				}else{
					x = shape.props.w + 2;
				}
				if(vertical == "mosttop"){
					y = -h;
				}else if(vertical == "topedge"){
					y = -h / 2;
				}else if(vertical == "top"){
					y = 0;
				}else if(vertical == "middle"){
					y = (shape.props.h - h)/2;
				}else if(vertical == "bottom"){
					y = shape.props.h - h;
				}else if(vertical == "bottomedge"){
					y = shape.props.h - h/2;
				}else{
					y = shape.props.h;
				}
				//文本的坐标信息
				var textBox = {
					x: x,
					y: y,
					w: w,
					h: h
				};
				//旋转后的坐标信息
				var rotated = Utils.getRotatedBox(textBox, shape.props.angle, shapeCenter);
				canvas.attr({
					width: rotated.w.toScale(), height: rotated.h.toScale()
				});
				ctx.font = font;
				//相对于图形容器的坐标，因为之前的坐标都是相对于图形的，所以要加上图形与图形容器的偏移量
				var relativeX = (rotated.x+(shape.props.x - shapeBox.x)+10).toScale();
				var relativeY = (rotated.y+(shape.props.y - shapeBox.y)+10).toScale();
				canvas.css({
					left: relativeX, top: relativeY
				});
				ctx.scale(Designer.config.scale, Designer.config.scale);
				//围绕画布中心做旋转
				ctx.translate(rotated.w/2, rotated.h/2);
				ctx.rotate(shape.props.angle);
				ctx.translate(-rotated.w/2, -rotated.h/2);
				ctx.translate((rotated.w - textBox.w)/2, (rotated.h - textBox.h)/2);
				ctx.globalAlpha = shape.shapeStyle.alpha;
				if(attr.type == "link"){
					ctx.fillStyle = "#4183C4";
				}else{
					ctx.fillStyle = "#333";
				}
				ctx.textBaseline = "middle";
				ctx.fillText(text, 0, h/2);
				if(icon != ""){
					var location = "/images/data-attr/"+icon+".png";
					var image = $(".shape_img[src='" + location + "']");
					if(image.length == 0){
						image = $("<img class='shape_img' loaded='false' src='"+location+"'/>").appendTo("#shape_img_container");
					}
					if(image.attr("loaded") == "true"){
						//如果图片没加载完，不执行重绘
						ctx.drawImage(image[0], textBox.w-20 ,0, 20, 20);
					}else{
						image.bind("load.drawshape", function(){
							//如果图片没加载完，需要在图片加载完后，回调
							$(this).attr("loaded", "true");
							ctx.drawImage(image[0], textBox.w-20 ,0, 20, 20);
						});
					}
				}
				ctx.beginPath();
				ctx.rect(0, 0, w, h);
				ctx.closePath();
			}
		},
		/**
		 * 绘制连接线
		 * @param {} linker 连接线对象
		 */
		renderLinker: function(linker, pointChanged){
			if(pointChanged){
				//如果渲染时，连接线的点发成了改变，重新查找
				linker.points = Utils.getLinkerPoints(linker);
			}
			//重新获取一下points，有些错误图形可能没有points
			if(linker.linkerType == "curve" || linker.linkerType == "broken"){
				if(!linker.points || linker.points.length == 0){
					linker.points = Utils.getLinkerPoints(linker);
				}
			}
			//找到连接线上的点
			var points = linker.points;
			var from = linker.from;
			var to = linker.to;
			//先决定矩形容器的坐标、宽高信息
			var minX = to.x;
			var minY = to.y;
			var maxX = from.x;
			var maxY = from.y;
			if(to.x < from.x){
				minX = to.x;
				maxX = from.x;
			}else{
				minX = from.x;;
				maxX = to.x;
			}
			if(to.y < from.y){
				minY = to.y;
				maxY = from.y;
			}else{
				minY = from.y;;
				maxY = to.y;
			}
			for(var i = 0; i < points.length; i++){
				var point = points[i];
				if(point.x < minX){
					minX = point.x;
				}else if(point.x > maxX){
					maxX = point.x;
				}
				if(point.y < minY){
					minY = point.y;
				}else if(point.y > maxY){
					maxY = point.y;
				}
			}
			var box = {
				x: minX,
				y: minY,
				w: maxX - minX,
				h: maxY - minY
			}
			var linkerBox = $("#" + linker.id);
			if(linkerBox.length == 0){
				//如果不存在，要执行创建
				var superCanvas = $("#designer_canvas");
				linkerBox = $("<div id='"+linker.id+"' class='shape_box linker_box'><canvas class='shape_canvas'></canvas></div>").appendTo(superCanvas);
			}
			var linkerCanvas = linkerBox.find(".shape_canvas");
			linkerCanvas.attr({
				width: (box.w + 20).toScale(),
				height: (box.h + 20).toScale()
			});
			linkerBox.css({
				left: (box.x - 10).toScale(),
				top: (box.y - 10).toScale(),
				width: (box.w + 20).toScale(),
				height: (box.h + 20).toScale()
			});
			//执行绘制连线
			var ctx = linkerCanvas[0].getContext("2d");
			ctx.scale(Designer.config.scale, Designer.config.scale);
			ctx.translate(10, 10);
			//定义绘制样式
			var style = linker.lineStyle;
			ctx.lineWidth = style.lineWidth;
			ctx.strokeStyle = "rgb("+style.lineColor+")";
			ctx.fillStyle = "rgb("+style.lineColor+")";
			ctx.save();
			var begin = {x: from.x - box.x, y: from.y - box.y};
			var end = {x: to.x - box.x, y: to.y - box.y};
			ctx.save();
			//开始绘制连线
			if(style.lineStyle == "dashed"){
				//虚线
				this.setLineDash(ctx, [style.lineWidth * 8, style.lineWidth * 4]);
			}else if(style.lineStyle == "dot"){
				//点线
				this.setLineDash(ctx, [style.lineWidth, style.lineWidth * 2]);
			}else if(style.lineStyle == "dashdot"){
				//点线
				this.setLineDash(ctx, [style.lineWidth * 8, style.lineWidth * 3, style.lineWidth, style.lineWidth * 3]);
			}
			ctx.beginPath();
			ctx.moveTo(begin.x, begin.y);
			if(linker.linkerType == "curve"){
				var cp1 = points[0];
				var cp2 = points[1];
				ctx.bezierCurveTo(cp1.x - box.x, cp1.y - box.y, cp2.x - box.x, cp2.y - box.y, end.x, end.y);
			}else{
				for(var i = 0; i < points.length; i++){
					//如果是折线，会有折点
					var linkerPoint = points[i];
					ctx.lineTo(linkerPoint.x - box.x, linkerPoint.y - box.y);
				}
				ctx.lineTo(end.x, end.y);
			}
			var selected = Utils.isSelected(linker.id);
			if(selected){
				//如果是选中了，绘制阴影
				ctx.shadowBlur = 4;
				ctx.shadowColor = "#833";
				if(linker.linkerType == "curve" && Utils.getSelectedIds().length == 1){
					//连接线为曲线，并且只选中了一条
				}
			}
			ctx.stroke();
			ctx.restore(); //还原虚线样式和阴影
			//开始绘制箭头
			var fromAngle = Utils.getEndpointAngle(linker, "from");
			drawArrow(begin, fromAngle, from.id, style.beginArrowStyle, linker, from.angle);
			var toAngle = Utils.getEndpointAngle(linker, "end");
			drawArrow(end, toAngle, to.id, style.endArrowStyle, linker, to.angle);
			ctx.restore();
			//绘制文字
			this.renderLinkerText(linker);
			/**
			 * 绘制箭头
			 */
			function drawArrow(point, pointAngle, linkShapeId, style, linker, linkerAngle){
				if(style == "normal"){
					//箭头
					var arrowLength = 12; //箭头长度
					var arrowAngle = Math.PI / 5;  //箭头角度
					var hypotenuse = arrowLength / Math.cos(arrowAngle); //箭头斜边长度
					var leftArrowX = point.x - hypotenuse * Math.cos(pointAngle - arrowAngle);
					var leftArrowY = point.y - hypotenuse * Math.sin(pointAngle - arrowAngle);
					var rightArrowX = point.x - hypotenuse * Math.sin(Math.PI / 2 - pointAngle - arrowAngle);
					var rightArrowY = point.y - hypotenuse * Math.cos(Math.PI / 2 - pointAngle - arrowAngle);
					ctx.beginPath();
					ctx.moveTo(leftArrowX, leftArrowY);
					ctx.lineTo(point.x, point.y);
					ctx.lineTo(rightArrowX, rightArrowY);
					ctx.stroke();
				}else if(style == "solidArrow"){
					//实心箭头
					var arrowLength = 12; //箭头长度
					var arrowAngle = Math.PI / 10;  //箭头角度
					var hypotenuse = arrowLength / Math.cos(arrowAngle); //箭头斜边长度
					var leftArrowX = point.x - hypotenuse * Math.cos(pointAngle - arrowAngle);
					var leftArrowY = point.y - hypotenuse * Math.sin(pointAngle - arrowAngle);
					var rightArrowX = point.x - hypotenuse * Math.sin(Math.PI / 2 - pointAngle - arrowAngle);
					var rightArrowY = point.y - hypotenuse * Math.cos(Math.PI / 2 - pointAngle - arrowAngle);
					ctx.beginPath();
					ctx.moveTo(point.x, point.y);
					ctx.lineTo(leftArrowX, leftArrowY);
					ctx.lineTo(rightArrowX, rightArrowY);
					ctx.lineTo(point.x, point.y);
					ctx.closePath();
					ctx.fill();
					ctx.stroke();
				}else if(style == "dashedArrow"){
					//空心箭头
					ctx.save();
					var arrowLength = 12; //箭头长度
					var arrowAngle = Math.PI / 10;  //箭头角度
					var hypotenuse = arrowLength / Math.cos(arrowAngle); //箭头斜边长度
					var leftArrowX = point.x - hypotenuse * Math.cos(pointAngle - arrowAngle);
					var leftArrowY = point.y - hypotenuse * Math.sin(pointAngle - arrowAngle);
					var rightArrowX = point.x - hypotenuse * Math.sin(Math.PI / 2 - pointAngle - arrowAngle);
					var rightArrowY = point.y - hypotenuse * Math.cos(Math.PI / 2 - pointAngle - arrowAngle);
					ctx.beginPath();
					ctx.moveTo(point.x, point.y);
					ctx.lineTo(leftArrowX, leftArrowY);
					ctx.lineTo(rightArrowX, rightArrowY);
					ctx.lineTo(point.x, point.y);
					ctx.closePath();
					ctx.fillStyle = "white";
					ctx.fill();
					ctx.stroke();
					ctx.restore();
				}else if(style == "solidCircle"){
					//实心圆
					ctx.save();
					var circleRadius = 4;
					var circleX = point.x - circleRadius * Math.cos(pointAngle);
					var circleY = point.y - circleRadius * Math.sin(pointAngle);
					ctx.beginPath();
					ctx.arc(circleX, circleY, circleRadius, 0, Math.PI * 2, false);
					ctx.closePath();
					ctx.fill();
					ctx.stroke();
					ctx.restore();
				}else if(style == "dashedCircle"){
					//空心圆
					ctx.save();
					var circleRadius = 4;
					var circleX = point.x - circleRadius * Math.cos(pointAngle);
					var circleY = point.y - circleRadius * Math.sin(pointAngle);
					ctx.beginPath();
					ctx.arc(circleX, circleY, circleRadius, 0, Math.PI * 2, false);
					ctx.closePath();
					ctx.fillStyle = "white";
					ctx.fill();
					ctx.stroke();
					ctx.restore();
				}else if(style == "solidDiamond"){
					//实心菱形
					ctx.save();
					var arrowLength = 8; //箭头长度
					var arrowAngle = Math.PI / 7;  //箭头角度
					var hypotenuse = arrowLength / Math.cos(arrowAngle); //箭头斜边长度
					var leftArrowX = point.x - hypotenuse * Math.cos(pointAngle - arrowAngle);
					var leftArrowY = point.y - hypotenuse * Math.sin(pointAngle - arrowAngle);
					var rightArrowX = point.x - hypotenuse * Math.sin(Math.PI / 2 - pointAngle - arrowAngle);
					var rightArrowY = point.y - hypotenuse * Math.cos(Math.PI / 2 - pointAngle - arrowAngle);
					//菱形在线上的一点的坐标
					var lineX = point.x - arrowLength * 2 * Math.cos(pointAngle);
					var lineY = point.y - arrowLength * 2 * Math.sin(pointAngle);
					ctx.beginPath();
					ctx.moveTo(point.x, point.y);
					ctx.lineTo(leftArrowX, leftArrowY);
					ctx.lineTo(lineX, lineY);
					ctx.lineTo(rightArrowX, rightArrowY);
					ctx.lineTo(point.x, point.y);
					ctx.closePath();
					ctx.fill();
					ctx.stroke();
					ctx.restore();
				}else if(style == "dashedDiamond"){
					//空心菱形
					ctx.save();
					var arrowLength = 8; //箭头长度
					var arrowAngle = Math.PI / 7;  //箭头角度
					var hypotenuse = arrowLength / Math.cos(arrowAngle); //箭头斜边长度
					var leftArrowX = point.x - hypotenuse * Math.cos(pointAngle - arrowAngle);
					var leftArrowY = point.y - hypotenuse * Math.sin(pointAngle - arrowAngle);
					var rightArrowX = point.x - hypotenuse * Math.sin(Math.PI / 2 - pointAngle - arrowAngle);
					var rightArrowY = point.y - hypotenuse * Math.cos(Math.PI / 2 - pointAngle - arrowAngle);
					//菱形在线上的一点的坐标
					var lineX = point.x - arrowLength * 2 * Math.cos(pointAngle);
					var lineY = point.y - arrowLength * 2 * Math.sin(pointAngle);
					ctx.beginPath();
					ctx.moveTo(point.x, point.y);
					ctx.lineTo(leftArrowX, leftArrowY);
					ctx.lineTo(lineX, lineY);
					ctx.lineTo(rightArrowX, rightArrowY);
					ctx.lineTo(point.x, point.y);
					ctx.closePath();
					ctx.fillStyle = "white";
					ctx.fill();
					ctx.stroke();
					ctx.restore();
				}else if(style == "cross"){
					//交叉
					var arrowW = 6; //交叉线的宽度
					var arrowL = 14;
					var offsetX = arrowW * Math.cos(Math.PI / 2 - pointAngle);
					var offsetY = arrowW * Math.sin(Math.PI / 2 - pointAngle);
					var x1 = point.x + offsetX;
					var y1 = point.y - offsetY;
					var lineX = point.x - arrowL * Math.cos(pointAngle);
					var lineY = point.y - arrowL * Math.sin(pointAngle);
					var x2 = lineX - offsetX;
					var y2 = lineY + offsetY;
					ctx.beginPath();
					ctx.moveTo(x1, y1);
					ctx.lineTo(x2, y2);
					ctx.stroke();
				}
				if(linkShapeId && style != "solidCircle" && style != "dashedCircle"){
					var linkShape = Model.getShapeById(linkShapeId);
					if(linkShape){
						ctx.save();
						ctx.translate(point.x, point.y);
						ctx.rotate(linkerAngle);
						ctx.translate(-point.x, -point.y);
						var clearX = point.x - linkShape.lineStyle.lineWidth/2;
						var clearY = point.y - linker.lineStyle.lineWidth*1.2;
						var clearW = linker.lineStyle.lineWidth * 2;
						var clearH = linker.lineStyle.lineWidth * 1.8;
						var clearSize = 1;
						var clearingX = clearX;
						while(clearingX <= clearX + clearW){
							var clearingY = clearY;
							while(clearingY <= clearY + clearH){
								ctx.clearRect(clearingX, clearingY, 1.5, 1.5);
								clearingY += clearSize;
							}
							clearingX += clearSize;
						}
						ctx.restore();
					}
				}
			}
		},
		/**
		 * 绘制连接线的文本
		 * @param {} linker
		 */
		renderLinkerText: function(linker){
			var linkerContainer = $("#" + linker.id);
			var canvas = linkerContainer.find(".text_canvas");
			if(canvas.length == 0){
				canvas = $("<div class='text_canvas linker_text'></div>").appendTo(linkerContainer);
			}
			var fontStyle = linker.fontStyle;
			var scale = "scale("+Designer.config.scale+")";
			var style = {
				"line-height": Math.round(fontStyle.size * 1.25) + "px",
				"font-size": fontStyle.size + "px",
				"font-family": fontStyle.fontFamily,
				"font-weight": fontStyle.bold ? "bold" : "normal",
				"font-style": fontStyle.italic ? "italic" : "normal",
				"text-align": fontStyle.textAlign,
				"color": "rgb(" + fontStyle.color + ")",
				"text-decoration": fontStyle.underline ? "underline" : "none",
				"-webkit-transform": scale,
				"-ms-transform": scale,
				"-o-transform": scale,
				"-moz-transform": scale,
				"transform": scale
			};
			canvas.css(style);
			if(linker.text == null || linker.text == ""){
				canvas.hide();
				return;
			}
			//设置位置
			canvas.show();
			var text = linker.text.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br/>");
			canvas.html(text + "<br/>");
			var midpoint = this.getLinkerMidpoint(linker);
			var containerPos = linkerContainer.position();
			canvas.css({
				left: midpoint.x.toScale() - containerPos.left - canvas.width()/2,
				top: midpoint.y.toScale() - containerPos.top - canvas.height()/2
			});
		},
		/**
		 * 获取到连接线的中点坐标
		 * @param {} linker
		 */
		getLinkerMidpoint: function(linker){
			var point = {};
			if(linker.linkerType == "normal"){
				//直线时，根据公式：B(t) = (1-t)P0 + tP1，t=0.5时，在线中点
				point = {
					x: 0.5*linker.from.x + 0.5*linker.to.x,
					y: 0.5*linker.from.y + 0.5*linker.to.y
				}
			}else if(linker.linkerType == "curve"){
				//曲线时，根据公式：B(t) = P0(1-t)^3 + 3P1t(1-t)^2 + 3P2t^2(1-t) + P3t^3，t=0.5时，在线中点
				var p0 = linker.from;
				var p1 = linker.points[0];
				var p2 = linker.points[1];
				var p3 = linker.to;
				point = {
					x: p0.x*0.125 + p1.x*0.375 + p2.x*0.375 + p3.x*0.125,
					y: p0.y*0.125 + p1.y*0.375 + p2.y*0.375 + p3.y*0.125
				}
			}else{
				//折线时，计算每一笔的长度，找中点
				var points = [];
				points.push(linker.from);
				points = points.concat(linker.points);
				points.push(linker.to);
				//先求连接线的全长
				var totalLength = 0;
				for(var pi = 1; pi < points.length; pi++){
					var p1 = points[pi - 1];
					var p2 = points[pi];
					//计算一段的长
					var d = Utils.measureDistance(p1, p2);
					totalLength += d;
				}
				var halfLength = totalLength / 2; //连接线长度的一半
				var growLength = 0;
				for(var pi = 1; pi < points.length; pi++){
					var p1 = points[pi - 1];
					var p2 = points[pi];
					//计算一段的长
					var d = Utils.measureDistance(p1, p2);
					var temp = growLength + d;
					if(temp > halfLength){
						//如果某一段的长度大于一半了，则中点在此段上
						var t = (halfLength - growLength) / d;
						point = {
							x: (1-t)*p1.x + t*p2.x,
							y: (1-t)*p1.y + t*p2.y
						}
						break;
					}
					growLength = temp;
				}
			}
			return point;
		},
		/**
		 * 保存控件的状态
		 * @type {}
		 */
		controlStatus: {
			resizeDir: [],
			rotatable: true
		},
		/**
		 * 绘制图形控制框
		 */
		drawControls: function(shapeIds){
			var control = $("#shape_controls");
			if(control.length == 0){
				//创建控件容器
				var canvas = $("#designer_canvas");
				//如果第一次选择框不存在，进行绘制，执行绑定事件等初始化
				control = $("<div id='shape_controls'></div>").appendTo(canvas);
				//添加选择区域的画布
				control.append("<canvas id='controls_bounding'></canvas>");
				//添加上下左右四个控制点
				control.append("<div class='shape_controller' index='0' resizeDir='tl'></div>");
				control.append("<div class='shape_controller' index='1' resizeDir='tr'></div>");
				control.append("<div class='shape_controller' index='2' resizeDir='br'></div>");
				control.append("<div class='shape_controller' index='3' resizeDir='bl'></div>");
				control.append("<div class='shape_controller' resizeDir='l'></div>");
				control.append("<div class='shape_controller' resizeDir='t'></div>");
				control.append("<div class='shape_controller' resizeDir='r'></div>");
				control.append("<div class='shape_controller' resizeDir='b'></div>");
				Designer.op.shapeResizable();
				//添加旋转控制点
				control.append("<canvas class='shape_rotater' width='41px' height='40px'></canvas>");
				Designer.op.shapeRotatable();
				//分组图形切换箭头
				control.append("<div class='group_icon change_shape_icon'></div>");
				Designer.op.groupShapeChangable();
				$(".shape_controller").css({
					"border-color": Designer.config.anchorColor,
					width: Designer.config.anchorSize - 2,
					height: Designer.config.anchorSize - 2
				});
			}
			$(".shape_controller").css({
				//Z轴坐标比选择轮廓大1
				"z-index": Model.orderList.length
			});
			$(".change_shape_icon").hide();
			control.show();
			var angle = 0;
			var pos;
			var dir;
			if(shapeIds.length == 1){
				//如果只有一个图形（有一个图形时，此图形不会是连接线，在调用时都做了判断）
				var shape = Model.getShapeById(shapeIds[0]);
				pos = shape.props;
				angle = shape.props.angle;
				//只有一个图形时，根据图形配置决定缩放方向
				dir = shape.resizeDir;
				if(shape.groupName && SchemaGroup.groupExists(shape.groupName)){
					$(".change_shape_icon").show();
				}
			}else{
				pos = Utils.getControlBox(shapeIds);
				dir = ["tl", "tr", "br", "bl"];
			}
			var rotatable = true;
			for (var i = 0; i < shapeIds.length; i++) {
				var id = shapeIds[i];
				var shape = Model.getShapeById(id);
				if(shape.attribute && shape.attribute.rotatable == false){
					//如果有一个图形不允许旋转，则整体都不允许
					rotatable = false;
				}
				if((shape.resizeDir && shape.resizeDir.length == 0) || (shape.parent && shapeIds.length > 1)){
					//如果有图形不能缩放，或者如果包含子图形，不允许缩放
					dir = [];
				}
			}
			this.controlStatus.rotatable = rotatable;
			this.controlStatus.resizeDir = dir;
			this.rotateControls(pos, angle);
			return control;
		},
		/**
		 * 旋转控制器
		 * @param {} pos 控制器的坐标信息{x, y, w, h}
		 * @param {} angle 旋转角度
		 */
		rotateControls: function(pos, angle){
			var control = $("#shape_controls");
			var box = Utils.getRotatedBox(pos, angle);
			var boxW = box.w.toScale();
			var boxH = box.h.toScale();
			control.css({
				left: box.x.toScale(),
				top: box.y.toScale(),
				width: boxW,
				height: boxH,
				//Z轴坐标为当前最大
				"z-index": Model.orderList.length
			});
			var canvasW = boxW + 20;
			var canvasH = boxH + 20;
			var bounding = $("#controls_bounding");
			bounding.attr({
				width: canvasW,
				height: canvasH
			});
			var ctx = bounding[0].getContext("2d");
			ctx.lineJoin = "round";
			if(this.controlStatus.resizeDir.length == 0){
				//没有缩放点，要加粗选择器边框，以用来示意选中
				ctx.lineWidth = 2;
				ctx.strokeStyle = Designer.config.selectorColor;
				ctx.globalAlpha = 0.8;
			}else{
				ctx.lineWidth = 1;
				ctx.strokeStyle = Designer.config.selectorColor;
				ctx.globalAlpha = 0.5;
			}
			ctx.save();
			ctx.clearRect(0, 0, canvasW, canvasH);
			ctx.translate(canvasW/2, canvasH/2);
			ctx.rotate(angle);
			ctx.translate(-canvasW/2, -canvasH/2);
			ctx.translate(9.5, 9.5);
			var rect = {
				x: Math.round((pos.x - box.x).toScale()),
				y: Math.round((pos.y - box.y).toScale()),
				w: Math.floor(pos.w.toScale() + 1),
				h: Math.floor(pos.h.toScale() + 1)
			};
			ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
			ctx.restore();
			/**顺时针控制四个缩放控制点*/
			var origin = 0 - Designer.config.anchorSize / 2;
			var style = {};
			pos = Utils.toScale(pos);
			box = Utils.toScale(box);
			var selectorCenter = {
				x: (pos.x + pos.w/2), y: pos.y + pos.h/2
			};
			control.children(".shape_controller").hide(); //先全部隐藏
			for (var i = 0; i < this.controlStatus.resizeDir.length; i++) {
				var dir = this.controlStatus.resizeDir[i];
				var dirDom = $(".shape_controller[resizeDir="+dir+"]");
				dirDom.show();
				var controlX, controlY;
				if(dir.indexOf("l") >= 0){
					controlX = pos.x;
				}else if(dir.indexOf("r") >= 0){
					controlX = pos.x + pos.w;
				}else{
					controlX = pos.x + pos.w/2;
				}
				if(dir.indexOf("t") >= 0){
					controlY = pos.y;
				}else if(dir.indexOf("b") >= 0){
					controlY = pos.y + pos.h;
				}else{
					controlY = pos.y + pos.h/2;
				}
				var rotated = Utils.getRotated(selectorCenter, {x: controlX, y: controlY}, angle);
				dirDom.css({
					left: rotated.x - box.x + origin,
					top: rotated.y - box.y + origin
				});
			}
			//控制四个缩放控制点的缩放形式
			var unit = Math.PI/8;
			//根据角度判断鼠标显示形式，每45度一个范围
			control.children(".shape_controller").removeClass("s n e w");
			if(angle > unit && angle <= unit*3){
				//右上方范围内
				control.children("div[resizeDir=tl]").addClass("n");
				control.children("div[resizeDir=tr]").addClass("e");
				control.children("div[resizeDir=br]").addClass("s");
				control.children("div[resizeDir=bl]").addClass("w");
				control.children("div[resizeDir=l]").addClass("n w");
				control.children("div[resizeDir=r]").addClass("s e");
				control.children("div[resizeDir=b]").addClass("s w");
				control.children("div[resizeDir=t]").addClass("n e");
			}else if(angle > unit*3 && angle <= unit*5){
				//右方范围内
				control.children("div[resizeDir=tl]").addClass("n e");
				control.children("div[resizeDir=tr]").addClass("s e");
				control.children("div[resizeDir=br]").addClass("s w");
				control.children("div[resizeDir=bl]").addClass("n w");
				control.children("div[resizeDir=l]").addClass("n");
				control.children("div[resizeDir=r]").addClass("s");
				control.children("div[resizeDir=b]").addClass("w");
				control.children("div[resizeDir=t]").addClass("e");
			}else if(angle > unit*5 && angle <= unit*7){
				//右下方范围
				control.children("div[resizeDir=tl]").addClass("e");
				control.children("div[resizeDir=tr]").addClass("s");
				control.children("div[resizeDir=br]").addClass("w");
				control.children("div[resizeDir=bl]").addClass("n");
				control.children("div[resizeDir=l]").addClass("n e");
				control.children("div[resizeDir=r]").addClass("s w");
				control.children("div[resizeDir=b]").addClass("n w");
				control.children("div[resizeDir=t]").addClass("s e");
			}else if(angle > unit*7 && angle <= unit*9){
				//下方范围
				control.children("div[resizeDir=tl]").addClass("s e");
				control.children("div[resizeDir=tr]").addClass("s w");
				control.children("div[resizeDir=br]").addClass("n w");
				control.children("div[resizeDir=bl]").addClass("n e");
				control.children("div[resizeDir=l]").addClass("e");
				control.children("div[resizeDir=r]").addClass("w");
				control.children("div[resizeDir=b]").addClass("n");
				control.children("div[resizeDir=t]").addClass("s");
			}else if(angle > unit*9 && angle <= unit*11){
				//左下方范围
				control.children("div[resizeDir=tl]").addClass("s");
				control.children("div[resizeDir=tr]").addClass("w");
				control.children("div[resizeDir=br]").addClass("n");
				control.children("div[resizeDir=bl]").addClass("e");
				control.children("div[resizeDir=l]").addClass("s e");
				control.children("div[resizeDir=r]").addClass("n w");
				control.children("div[resizeDir=b]").addClass("n e");
				control.children("div[resizeDir=t]").addClass("s w");
			}else if(angle > unit*11 && angle <= unit*13){
				//左方范围
				control.children("div[resizeDir=tl]").addClass("s w");
				control.children("div[resizeDir=tr]").addClass("n w");
				control.children("div[resizeDir=br]").addClass("n e");
				control.children("div[resizeDir=bl]").addClass("s e");
				control.children("div[resizeDir=l]").addClass("s");
				control.children("div[resizeDir=r]").addClass("n");
				control.children("div[resizeDir=b]").addClass("e");
				control.children("div[resizeDir=t]").addClass("w");
			}else if(angle > unit*13 && angle <= unit*15){
				//左上方范围
				control.children("div[resizeDir=tl]").addClass("w");
				control.children("div[resizeDir=tr]").addClass("n");
				control.children("div[resizeDir=br]").addClass("e");
				control.children("div[resizeDir=bl]").addClass("s");
				control.children("div[resizeDir=l]").addClass("s w");
				control.children("div[resizeDir=r]").addClass("n e");
				control.children("div[resizeDir=b]").addClass("s e");
				control.children("div[resizeDir=t]").addClass("n w");
			}else{
				control.children("div[resizeDir=tl]").addClass("n w");
				control.children("div[resizeDir=tr]").addClass("n e");
				control.children("div[resizeDir=br]").addClass("s e");
				control.children("div[resizeDir=bl]").addClass("s w");
				control.children("div[resizeDir=l]").addClass("w");
				control.children("div[resizeDir=r]").addClass("e");
				control.children("div[resizeDir=b]").addClass("s");
				control.children("div[resizeDir=t]").addClass("n");
			}
			/**设置旋转点*/
			if(this.controlStatus.rotatable){
				var rotater = control.find(".shape_rotater");
				rotater.show();
				//计算旋转点的坐标
				var rotaterCenter = {
					x: pos.x + pos.w/2, y: pos.y - 20
				};
				//得到按一定角度旋转后的中心坐标
				var rotatedCenter = Utils.getRotated(selectorCenter, rotaterCenter, angle);
				//设置坐标，相对于容器
				rotater.css({
					top: rotatedCenter.y - 20 - box.y,
					left: rotatedCenter.x - 20.5 - box.x
				});
				var rotaterCtx = rotater[0].getContext("2d");
				rotaterCtx.lineWidth = 1;
				rotaterCtx.strokeStyle = Designer.config.selectorColor;
				rotaterCtx.fillStyle = "white";
				rotaterCtx.save();
				rotaterCtx.clearRect(0, 0, 41, 40);
				//旋转
				rotaterCtx.translate(20.5, 20);
				rotaterCtx.rotate(angle);
				rotaterCtx.translate(-20.5, -20);
				rotaterCtx.beginPath();
				rotaterCtx.moveTo(20.5, 20);
				rotaterCtx.lineTo(20.5, 40);
				rotaterCtx.stroke();
				rotaterCtx.beginPath();
				rotaterCtx.arc(20.5, 20, Designer.config.rotaterSize/2, 0, Math.PI*2);
				rotaterCtx.closePath();
				rotaterCtx.fill();
				rotaterCtx.stroke();
				rotaterCtx.restore();
			}else{
				control.find(".shape_rotater").hide();
			}
		}
	}
};

/**
 * 对象模型
 * @type {}
 */
var Model = {
	/**
	 * 图形定义
	 * @type {}
	 */
	define: {},
	/**
	 * 持久化的图形定义
	 * @type {}
	 */
	persistence: {},
	/**
	 * 排序后的对象列表
	 * @type {}
	 */
	orderList: [],
	/**
	 * 最大Z轴
	 * @type {Number}
	 */
	maxZIndex: 0,
	/**
	 * 连接线映射，维护一个形状上连接了哪些连接线
	 * @type {}
	 */
	linkerMap: {
		map: {},
		/**
		 * 添加连接线映射
		 */
		add: function(shapeId, linkerId){
			if(!this.map[shapeId]){
				this.map[shapeId] = [];
			}
			if(this.map[shapeId].indexOf(linkerId) < 0){
				this.map[shapeId].push(linkerId);			
			}
		},
		/**
		 * 删除连接线映射
		 */
		remove: function(shapeId, linkerId){
			if(this.map[shapeId]){
				Utils.removeFromArray(this.map[shapeId], linkerId);
			}
		},
		/**
		 * 清空
		 */
		empty: function(){
			this.map = {};
		}
	},
	/**
	 * 组合映射，维护一个组内包含哪些形状
	 * @type {}
	 */
	groupMap: {
		map: {},
		/**
		 * 添加组合映射
		 */
		add: function(groupId, shapeIds){
			this.map[groupId] = shapeIds;
		},
		/**
		 * 给一个映射中添加元素
		 * @param {} groupId
		 * @param {} shapeId
		 */
		push: function(groupId, shapeId){
			if(!this.map[groupId]){
				this.map[groupId] = [];
			}
			this.map[groupId].push(shapeId);
		},
		/**
		 * 删除组合
		 */
		remove: function(groupId){
			delete this.map[groupId];
		},
		/**
		 * 清空
		 */
		empty: function(){
			this.map = {};
		}
	},
	/**
	 * 创建图形
	 */
	create: function(name, x, y){
		var newId = Utils.newId();
		var newShape = Utils.copy(Schema.shapes[name]);
		newShape.id = newId;
		newShape.props.x = x;
		newShape.props.y = y;
		newShape.props.zindex = Model.maxZIndex + 1;
		newShape.props = $.extend(true, {}, Schema.shapeDefaults.props, newShape.props);
		for (var i = 0; i < newShape.dataAttributes.length; i++) {
			var attr = newShape.dataAttributes[i];
			attr.id = Utils.newId();
		}
		Designer.events.push("create", newShape);
		return newShape;
	},
	/**
	 * 添加形状
	 * @param {} shape
	 */
	add: function(shape, popMsg){
		this.addMulti([shape], popMsg);
	},
	/**
	 * 添加多个形状
	 * @param {} shapes
	 */
	addMulti: function(shapes, popMsg){
		if(typeof popMsg == "undefined"){
			popMsg = true;
		}
		var addShapes = [];
		for (var i = 0; i < shapes.length; i++) {
			var shape = shapes[i];
			addShapes.push(Utils.copy(shape));
			this.define.elements[shape.id] = Utils.copy(shape);
			//重新创建，以免互相影响
			this.persistence.elements[shape.id] = Utils.copy(shape);
		}
		this.build();
		if(popMsg){
			MessageSource.send("create", addShapes);
		}
	},
	/**
	 * 更新形状定义
	 * @param {} shape
	 */
	update: function(shape){
		this.updateMulti([shape]);
	},
	/**
	 * 更新多个形状定义
	 * @param {} shapes
	 */
	updateMulti: function(shapes){
		var updateShapes = [];
		var oriShapes = [];
		for (var i = 0; i < shapes.length; i++) {
			var shape = shapes[i];
			if(this.define.elements[shape.id]){
				//判断更新的图形是否还存在，可能有在修改过程中被他人删除的情况
				this.define.elements[shape.id] = Utils.copy(shape);
				//添加更新以前的图形
				oriShapes.push(Utils.copy(this.getPersistenceById(shape.id)));
				//添加更新后的图形
				updateShapes.push(Utils.copy(shape));
				//持久化图形
				this.persistence.elements[shape.id] = Utils.copy(shape);
			}
		}
		this.build();
		var msgContent = {shapes: oriShapes, updates: updateShapes};
		MessageSource.send("update", msgContent);
	},
	/**
	 * 删除形状
	 * @param {} shapes
	 */
	remove: function(shapes, removeChildren){
		if(typeof removeChildren == "undefined"){
			removeChildren = true;
		}
		if(removeChildren){
			shapes = Designer.events.push("beforeRemove", shapes);
		}
		var removed = [];
		var changedIds = [];
		var changed = [];
		var shapeRange = [];
		var linkerRange = [];
		if(shapes.length == 0){
			return false;
		}
		for(var i = 0; i < shapes.length; i++){
			var shape = shapes[i];
			if(shape.name == "linker"){
				linkerRange.push(shape.id);
			}else{
				shapeRange.push(shape.id);
			}
		}
		for(var i = 0; i < shapes.length; i++){
			var shape = shapes[i];
			removed.push(Utils.copy(shape));
			$("#" + shape.id).remove();
			//从定义中删除
			delete this.define.elements[shape.id];
			delete this.persistence.elements[shape.id];
			this.groupMap.remove(shape.group);
			//从linkerMap中删除
			if(shape.name == "linker"){
				if(shape.from.id != null){
					this.linkerMap.remove(shape.from.id, shape.id);
				}
				if(shape.to.id != null){
					this.linkerMap.remove(shape.to.id, shape.id);
				}
			}else{
				if(shape.parent && shapeRange.indexOf(shape.parent) < 0){
					var parent = Model.getShapeById(shape.parent);
					if(parent){
						Utils.removeFromArray(parent.children, shape.id);
						if(changedIds.indexOf(shape.parent) < 0){
							changedIds.push(shape.parent);
							changed.push(parent);
						}
					}
				}
				//删除形状上连接的连接线
				var linkerIds = this.getShapeLinkers(shape.id);
				if(linkerIds && linkerIds.length > 0){
					for(var index = 0; index < linkerIds.length; index++){
						var id = linkerIds[index];
						if(linkerRange.indexOf(id) < 0){
							//此条连接线不包含在要删除的范围内
							var lin = this.getShapeById(id);
							if(lin.from.id != null && lin.from.id == shape.id){
								lin.from.id = null;
								lin.from.angle = null;
							}
							if(lin.to.id != null && lin.to.id == shape.id){
								lin.to.id = null;
								lin.to.angle = null;
							}
							if(changedIds.indexOf(id) < 0){
								changedIds.push(id);
								changed.push(lin)
							}
						}
					}
				}
				delete this.linkerMap.map[shape.id];
			}
		}
		this.build();
		//发送消息
		MessageSource.beginBatch();
		MessageSource.send("remove", removed);
		//抛出事件
		if(removeChildren){
			var related = Designer.events.push("removed", {shapes: shapes, changedIds: changedIds, range: shapeRange});
			if(related && related.length){
				changed = changed.concat(related);
			}
		}
		if(changed.length > 0){
			this.updateMulti(changed);
		}
		MessageSource.commit();
		return true;
	},
	/**
	 * 修改页面样式
	 * @param {} pageStyle
	 */
	updatePage: function(pageStyle, current){
		var newStyle = $.extend(Model.define.page, pageStyle);
		var msg = {
			page: Utils.copy(Model.persistence.page),
			update: Utils.copy(newStyle)
		};
		Model.persistence.page = Utils.copy(newStyle);
		MessageSource.send("updatePage", msg);
	 	Designer.initialize.initCanvas();
	},
	/**
	 * 通过形状ID获取形状
	 * @param {} shapeId
	 */
	getShapeById: function(shapeId){
		return this.define.elements[shapeId];
	},
	/**
	 * 通过形状ID获取持久化的形状
	 * @param {} shapeId
	 */
	getPersistenceById: function(shapeId){
		return this.persistence.elements[shapeId];
	},
	/**
	 * 对OrderList进行重新排序
	 */
	build: function(){
		this.orderList = [];
		this.linkerMap.empty();
		//先将图形都放到orderList中
		for(var shapeId in Model.define.elements){
			var shape = Model.getShapeById(shapeId);
			this.orderList.push({id: shape.id, zindex: shape.props.zindex});
			//构建linkerMap
			if(shape.name == "linker"){
				//如果是连接线，要更新连接线映射
				if(shape.from.id != null){
					this.linkerMap.add(shape.from.id, shape.id);
				}
				if(shape.to.id != null){
					this.linkerMap.add(shape.to.id, shape.id);
				}
			}
			//构建groupMap
			if(shape.group){
				this.groupMap.push(shape.group, shape.id);
			}
		}
		//对orderList排序
		this.orderList.sort(function compare(a, b){
	 		return a.zindex - b.zindex;
	 	});
	 	//修改形状的z-index
	 	for(var i = 0; i < Model.orderList.length; i++){
			var shapeId = Model.orderList[i].id;
			$("#" + shapeId).css("z-index", i);
 		}
	 	var index = 0;
	 	if(this.orderList.length > 0){
	 		index = this.orderList[this.orderList.length - 1].zindex;
	 	}
	 	this.maxZIndex = index;
	},
	/**
	 * 获取形状上的连接线
	 * @param {} shapeId
	 * @return {}
	 */
	getShapeLinkers: function(shapeId){
		return this.linkerMap.map[shapeId];
	},
	/**
	 * 获取一个组合的形状id
	 * @param {} groupId
	 * @return {}
	 */
	getGroupShapes: function(groupId){
		return this.groupMap.map[groupId];
	},
	/**
	 * 更换图形
	 * @param {} targetShape
	 * @param {} shapeName
	 */
	changeShape: function(targetShape, shapeName){
		var schemaShape = Schema.shapes[shapeName];
		targetShape.name = shapeName;
		targetShape.title = schemaShape.shapeName;
		targetShape.attribute = schemaShape.attribute;
		targetShape.dataAttributes = schemaShape.dataAttributes;
		targetShape.path = schemaShape.path;
		targetShape.textBlock = schemaShape.textBlock;
		targetShape.anchors = schemaShape.anchors;
		Schema.initShapeFunctions(targetShape);
		Designer.painter.renderShape(targetShape);
	}
};

/**
 * 工具类
 * @type {}
 */
var Utils = {
	getDomById: function(id){
		return document.getElementById(id);
	},
	newId: function(){
		var random = Math.random();
		var newId = (random + new Date().getTime());
		return newId.toString(16).replace(".", "");
	},
	/**
	 * 获取某一位置下的形状容器
	 */
	getShapeByPosition: function(x, y, findLinkpoint){
		var focusShapes = [];
		for(var i = Model.orderList.length - 1; i >= 0; i--){
			var shapeId = Model.orderList[i].id;
			var shapeBox = $("#" + shapeId);
			var shape = Model.getShapeById(shapeId);
			//计算出相对于图形画布的x,y坐标
			var shapeBoxPos = shapeBox.position();
			var relativeX = x - shapeBoxPos.left;
			var relativeY = y - shapeBoxPos.top;
			var canvasRect = {x: shapeBoxPos.left, y: shapeBoxPos.top, w: shapeBox.width(), h: shapeBox.height()};
			var shapeCanvas = shapeBox.find(".shape_canvas")[0];
			var shapeCtx = shapeCanvas.getContext("2d");
			var inCanvas = this.pointInRect(x, y, canvasRect);
			if(shape.name == "linker"){
				if(!inCanvas){
					continue;
				}
				if(findLinkpoint){
					continue;
				}
				//如果图形是连接线
				//先判断是否在连线的端点上
				var radius = 10;
				radius = radius.toScale();
				var rect = {x: x - radius, y: y - radius, w: radius * 2, h: radius * 2};
				if(this.pointInRect(shape.to.x.toScale(), shape.to.y.toScale(), rect)){
					var result = {type: "linker_point", point: "end", shape: shape};
					focusShapes.push(result);
					continue;
				}else if(this.pointInRect(shape.from.x.toScale(), shape.from.y.toScale(), rect)){
					var result = {type: "linker_point", point: "from", shape: shape};
					focusShapes.push(result);
					continue;
				}else{
					//判断是否在连接线的文本上
					var textCanvas = shapeBox.find(".text_canvas");
					var textCanvasPos = textCanvas.position();
					var rect = {x: textCanvasPos.left, y: textCanvasPos.top, w: textCanvas.width(), h: textCanvas.height()};
					if(this.pointInRect(relativeX, relativeY, rect)){
						var result = {type: "linker_text", shape: shape};
						focusShapes.push(result);
						continue;
					}
					//判断是否在连接线上，判断坐标点放射出的两条直线是否与线相交
					radius = 7;
					radius = radius.toScale();
					var inLinker = this.pointInLinker({x: x.restoreScale(), y: y.restoreScale()}, shape, radius);
					if(inLinker > -1){
						var result = {type: "linker", shape: shape, pointIndex: inLinker};
						focusShapes.push(result);
						continue;
					}
				}
			}else{
				if(inCanvas && shape.locked && !findLinkpoint){
					//如果图形被锁定了，不做边界判断
					if(shapeCtx.isPointInPath(relativeX, relativeY)){
						var result = {type: "shape", shape: shape};
						focusShapes.push(result);
					}
					continue;
				}
				var radius = 7; //矩形放射半径
				if(inCanvas){
					//先判断是否在图形的锚点上
					radius = radius.toScale();
					var rect = {x: x - radius, y: y - radius, w: radius * 2, h: radius * 2};
					var shapeCenter = {x: shape.props.x + shape.props.w/2, y: shape.props.y + shape.props.h/2};
					var anchors = shape.getAnchors();
					var result = null;
					for ( var ai = 0; ai < anchors.length; ai++) {
						var an = anchors[ai];
						an = this.getRotated(shapeCenter, {x: shape.props.x + an.x, y: shape.props.y + an.y}, shape.props.angle);
						//所以在判断锚点是否在鼠标矩形范围中时
						if(Utils.pointInRect(an.x.toScale(), an.y.toScale(), rect)){
							var angle = Utils.getPointAngle(shapeId, an.x, an.y, radius);
							an.angle = angle;
							result = {type: "bounding", shape: shape, linkPoint: an};
							if(shapeCtx.isPointInPath(relativeX, relativeY)){
								result.inPath = true;
							}
							break;
						}
					}
					if(result != null){
						focusShapes.push(result);
						continue;
					}
				}
				//判断是否在数据属性上
				if(shape.dataAttributes){
					var result = null;
					for (var di = 0; di < shape.dataAttributes.length; di++) {
						var attr = shape.dataAttributes[di];
						if(attr.type == "link" && attr.showType && attr.showType != "none"){
							var attrCanvas = shapeBox.children("#attr_canvas_" + attr.id);
							if(attrCanvas.length > 0){
								var attrPos = attrCanvas.position();
								var relateToAttrX = relativeX - attrPos.left;
								var relateToAttrY = relativeY - attrPos.top;
								var attrCtx = attrCanvas[0].getContext("2d");
								if(attrCtx.isPointInPath(relateToAttrX, relateToAttrY)){
									result = {type: "dataAttribute", shape: shape, attribute: attr};
									break;
								}
							}
						}
					}
					if(result != null){
						focusShapes.push(result);
						continue;
					}
				}
				if(!inCanvas){
					continue;
				}
				//判断是否在图形内
				if(shapeCtx.isPointInPath(relativeX, relativeY)){
					//如果当前坐标在形状内，显示为移动
					if(findLinkpoint){
						var anchors = shape.getAnchors();
						if(anchors && anchors.length){
							var result = {type: "shape", shape: shape};
							focusShapes.push(result);
							continue;
						}else{
							continue;
						}
					}else{
						var result = {type: "shape", shape: shape};
						focusShapes.push(result);
						continue;
					}
				}else if(!shape.attribute || typeof shape.attribute.linkable == "undefined" || shape.attribute.linkable){
					//判断坐标是否在图形边界上
					//获取点相对于图形的角度
					var angle = Utils.getPointAngle(shapeId, x.restoreScale(), y.restoreScale(), radius);
					if(angle != null){
						var result = null;
						var linkPoint = {angle: angle};
						for(var step = 1; step <= radius; step++){
							//向角度相反方向，以半径为最长，逐渐移动
							if(angle == 0){
								//点角度在左边
								linkPoint.x = relativeX + step;
								linkPoint.y = relativeY;
							}else if(angle < Math.PI / 2){
								//点角度在左上角区域
								linkPoint.x = relativeX + step * Math.cos(angle);
								linkPoint.y = relativeY + step * Math.sin(angle);
							}else if(angle == Math.PI / 2){
								//点角度在正上方
								linkPoint.x = relativeX;
								linkPoint.y = relativeY + step;
							}else if(angle < Math.PI){
								//点角度为在右上角区域
								linkPoint.x = relativeX - step * Math.sin(angle - Math.PI / 2);
								linkPoint.y = relativeY + step * Math.cos(angle - Math.PI / 2);
							}else if(angle == Math.PI / 2){
								//点角度在正右边
								linkPoint.x = relativeX - step;
								linkPoint.y = relativeY;
							}else if(angle < Math.PI / 2 * 3){
								//点角度为在右下角区域
								linkPoint.x = relativeX - step * Math.cos(angle - Math.PI);
								linkPoint.y = relativeY - step * Math.sin(angle - Math.PI);
							}else if(angle == Math.PI / 2 * 3){
								//点角度在正右边
								linkPoint.x = relativeX;
								linkPoint.y = relativeY - step;
							}else{
								//点角度为在左下角区域
								linkPoint.x = relativeX + step * Math.sin(angle - Math.PI / 2 * 3);
								linkPoint.y = relativeY - step * Math.cos(angle - Math.PI / 2 * 3);
							}
							if(shapeCtx.isPointInPath(linkPoint.x, linkPoint.y)){
								linkPoint.x += shapeBoxPos.left;
								linkPoint.y += shapeBoxPos.top;
								linkPoint.x = linkPoint.x.restoreScale();
								linkPoint.y = linkPoint.y.restoreScale();
								result = {type: "bounding", shape: shape, linkPoint: linkPoint};
								break;
							}
						}
						if(result != null){
							focusShapes.push(result);
							continue;
						}
					}
				}
			}
		}
		var result = null;
		if(focusShapes.length == 1){
			result = focusShapes[0];
		}if(focusShapes.length > 1 && findLinkpoint){
			result = focusShapes[0];
		}else if(focusShapes.length > 1){
			//鼠标在多个图形上，需要有判断规则
			var first = focusShapes[0];
			if(first.type == "bounding" && first.type != "linker_point" && first.type != "linker"){
				//鼠标在连接线端点上，并且
				return first;
			}
			var inLinker = []; //在连线上
			var endPoint = []; //在连接线端点
			var inBounding = []; //在形状边界上
			for(var i = 0; i < focusShapes.length; i++){
				var focus = focusShapes[i];
				if(focus.type == "bounding"){
					inBounding.push(focus);				
				}else if(focus.type == "linker"){
					inLinker.push(focus);				
				}else if(focus.type == "linker_point"){
					endPoint.push(focus);				
				}
			}
			if(inBounding.length > 0 && endPoint.length > 0){
				//在某图形的边界上，并且在某连接线的端点上，判断一下是否在形状内部
				for(var i = 0; i < inBounding.length; i++){
					var focus = inBounding[i];
					if(focus.inPath){
						result = focus;
						break;
					}
				}
			}
			if(result == null && endPoint.length > 0){
				//如果并没有在形状内部，取最上层的连接线
				endPoint.sort(function compare(a, b){
					if(Utils.isSelected(a.shape.id) && !Utils.isSelected(b.shape.id)){
						return -1;
					}else if(!Utils.isSelected(a.shape.id) && Utils.isSelected(b.shape.id)){
						return 1;
					}else{
						return b.shape.props.zindex - a.shape.props.zindex;
					}
			 	});
				result = endPoint[0];
			}
			if(result == null && inLinker.length > 0){
				//如果并没有在形状内部，取最上层的连接线
				inLinker.sort(function compare(a, b){
					if(Utils.isSelected(a.shape.id) && !Utils.isSelected(b.shape.id)){
						return -1;
					}else if(!Utils.isSelected(a.shape.id) && Utils.isSelected(b.shape.id)){
						return 1;
					}else{
						return b.shape.props.zindex - a.shape.props.zindex;
					}
			 	});
				result = inLinker[0];
			}
			if(result == null){
				result = focusShapes[0];
			}
		}
		return result;
	},
	/**
	 * 判断两条线段是否相交
	 * @param {} p1
	 * @param {} p2
	 * @param {} p3
	 * @param {} p4
	 * @return {}
	 */
	checkCross: function(p1, p2, p3, p4){
		var flag = false;
		var d = (p2.x-p1.x)*(p4.y-p3.y) - (p2.y-p1.y)*(p4.x-p3.x);
		if(d!=0){
			var r = ((p1.y-p3.y)*(p4.x-p3.x)-(p1.x-p3.x)*(p4.y-p3.y))/d;
            var s = ((p1.y-p3.y)*(p2.x-p1.x)-(p1.x-p3.x)*(p2.y-p1.y))/d;
            if((r>=0) && (r <= 1) && (s >=0) && (s<=1)){
                flag = true;
            }
        }
    	return flag;
//			var d1=((p2.x-p1.x)*(p3.y-p1.y)-(p2.y-p1.y)*(p3.x-p1.x))*((p2.x-p1.x)*(p4.y-p1.y)-(p2.y-p1.y)*(p4.x-p1.x));
//		    var d2=((p4.x-p3.x)*(p1.y-p3.y)-(p4.y-p3.y)*(p1.x-p3.x))*((p4.x-p3.x)*(p2.y-p3.y)-(p4.y-p3.y)*(p2.x-p3.x));
//		    return d1<=0&&d2<=0;
		//计算向量叉乘
//			function crossMul(v1, v2) {
//				return v1.x * v2.y - v1.y * v2.x;
//			}
//			var v1 = {x: p1.x - p3.x, y: p1.y - p3.y};
//			var v2 = {x: p2.x - p3.x, y: p2.y - p3.y};
//			var v3 = {x: p4.x - p3.x, y: p4.y - p3.y};
//			var v = crossMul(v1, v3) * crossMul(v2, v3);
//			v1 = {x: p3.x - p1.x, y: p3.y - p1.y};
//			v2 = {x: p4.x - p1.x, y: p4.y - p1.y};
//			v3 = {x: p2.x - p1.x, y: p2.y - p1.y};
//			return (v <= 0 && crossMul(v1, v3) * crossMul(v2, v3)<=0) ? true : false;
	},
	/**
	 * 判断两个矩形是否重叠
	 * @param {} rect1
	 * @param {} rect2
	 */
	rectCross: function(rect1, rect2){
		var minX1 = rect1.x;
		var maxX1 = rect1.x + rect1.w;
		var minY1 = rect1.y;
		var maxY1 = rect1.y + rect1.h;
		var minX2 = rect2.x;
		var maxX2 = rect2.x + rect2.w;
		var minY2 = rect2.y;
		var maxY2 = rect2.y + rect2.h;
		if(((minX1 < maxX2) && (minX2 < maxX1))&&((minY1 < maxY2) && (minY2 < maxY1))){
			return true;
		}else{
			return false;
		}
	},
	/**
	 * 一个矩形是否在另一个矩形中
	 * @param {} rect1
	 * @param {} containerRect 容器矩形
	 * @return {Boolean}
	 */
	rectInRect: function(rect, containerRect){
		var p1 = {x: rect.x, y: rect.y};
		var p2 = {x: rect.x + rect.w, y: rect.y};
		var p3 = {x: rect.x + rect.w, y: rect.y + rect.h};
		var p4 = {x: rect.x, y: rect.y + rect.h};
		if(this.pointInRect(p1.x, p1.y, containerRect) && this.pointInRect(p2.x, p2.y, containerRect)
			&& this.pointInRect(p3.x, p3.y, containerRect) && this.pointInRect(p4.x, p4.y, containerRect)){
			return true;
		}else{
			return false;
		}
	},
	/**
	 * 一个点是否在一个多边形中
	 */
	pointInPolygon: function(point, polygon){
		var p1,p2,p3,p4;
	    p1 = point;
	    p2= {x: - 1000000, y: point.y};
	    var count = 0;
	    //对每条边都和射线作对比，判断是否相交
	    for(var i = 0; i < polygon.length - 1; i++){
	        p3 = polygon[i];
	        p4 = polygon[i+1];
	        if(Utils.checkCross(p1, p2, p3, p4) == true){
	            count++;
	        }
	    }
	    p3 = polygon[polygon.length - 1];
	    p4 = polygon[0];
	    if(Utils.checkCross(p1, p2 , p3, p4) == true){
	        count++;
	    }
	    return (count % 2 == 0) ? false : true;
	},
	/**
	 * 一个点是否在一个矩形中
	 */
	pointInRect: function(px, py, rect){
		if(px >= rect.x && px <= rect.x + rect.w
			&& py >= rect.y && py <= rect.y + rect.h){
			return true;
		}
		return false;
	},
	/**
	 * 判断点是否在连接线上
	 * @return 如果没在线上，返回-1，否则返回相交点的索引
	 */
	pointInLinker: function(point, linker, radius){
		var points = this.getLinkerLinePoints(linker);
		//在x轴上放射两个点(一条线)
		var linex1 = {x: point.x - radius, y: point.y};
		var linex2 = {x: point.x + radius, y: point.y};
		//在y轴上放射两个点(一条线)
		var liney1 = {x: point.x, y: point.y - radius};
		var liney2 = {x: point.x, y: point.y + radius};
		for(var pi = 1; pi < points.length; pi++){
			var p1 = points[pi - 1];
			var p2 = points[pi];
			var cross = this.checkCross(linex1, linex2, p1, p2);
			if(cross){
				return pi;
			}
			cross = this.checkCross(liney1, liney2, p1, p2);
			if(cross){
				return pi;
			}
		}
		return -1;
	},
	/**
	 * 获取连接线长度
	 * @param {} linker
	 */
	getLinkerLength: function(linker){
		var points = this.getLinkerLinePoints(linker);
		var len = 0;
		for(var pi = 1; pi < points.length; pi++){
			var p1 = points[pi - 1];
			var p2 = points[pi];
			//计算一段的长
			var d = Utils.measureDistance(p1, p2);
			len += d;
		}
		return len;
	},
	/**
	 * 获取一个坐标范围内的形状
	 */
	getShapesByRange: function(range){
		var result = [];
		for(var shapeId in Model.define.elements){
			var shape = Model.getShapeById(shapeId);
			var p = shape.props;
			if(shape.name == "linker"){
				//如果连线的几个点都在范围内，则属于
				p = this.getLinkerBox(shape);
			}else{
				p = this.getShapeBox(shape);
			}
			if(this.pointInRect(p.x, p.y, range)
				&& this.pointInRect(p.x + p.w, p.y, range)
				&& this.pointInRect(p.x + p.w, p.y + p.h, range)
				&& this.pointInRect(p.x, p.y + p.h, range)){
				//如果形状某个点在范围内，则属于
				result.push(shape.id);
			}
		}
		return result;
	},
	/**
	 * 创建图形的轮廓
	 */
	getControlBox: function(shapeIds){
		var pos = {
			x1: null, y1: null, x2: null, y2: null
		};
		//计算选择框的坐标与宽高
		for (var index = 0; index < shapeIds.length; index++) {
			var shapeId = shapeIds[index];
			var shape = Model.getShapeById(shapeId);
			var p;
			if(shape.name == "linker"){
				p = this.getLinkerBox(shape);
			}else{
				p = this.getShapeBox(shape);
			}
			if(pos.x1 == null || p.x < pos.x1){
				pos.x1 = p.x;
			}
			if(pos.y1 == null || p.y < pos.y1){
				pos.y1 = p.y;
			}
			if(pos.x2 == null || p.x + p.w > pos.x2){
				pos.x2 = p.x + p.w;
			}
			if(pos.y2 == null || p.y + p.h > pos.y2){
				pos.y2 = p.y + p.h;
			}
		}
		//创建选择框
		var control = {
			x: pos.x1,
			y: pos.y1,
			w: pos.x2 - pos.x1,
			h: pos.y2 - pos.y1
		}
		return control;
	},
	/**
	 * 获取图形的轮廓
	 */
	getShapesBounding: function(shapes){
		var pos = {
			x1: null, y1: null, x2: null, y2: null
		};
		//计算轮廓的坐标与宽高
		for (var index = 0; index < shapes.length; index++) {
			var shape = shapes[index];
			var p;
			if(shape.name == "linker"){
				p = this.getLinkerBox(shape);
			}else{
				p = shape.props;
			}
			if(pos.x1 == null || p.x < pos.x1){
				pos.x1 = p.x;
			}
			if(pos.y1 == null || p.y < pos.y1){
				pos.y1 = p.y;
			}
			if(pos.x2 == null || p.x + p.w > pos.x2){
				pos.x2 = p.x + p.w;
			}
			if(pos.y2 == null || p.y + p.h > pos.y2){
				pos.y2 = p.y + p.h;
			}
		}
		//创建轮廓
		var bounding = {
			x: pos.x1,
			y: pos.y1,
			w: pos.x2 - pos.x1,
			h: pos.y2 - pos.y1
		}
		return bounding;
	},
	/**
	 * 获取形状的绘制上下文对象
	 * @param {} shapeId
	 */
	getShapeContext: function(shapeId){
		var shapeBox = Utils.getDomById(shapeId);
		return shapeBox.getElementsByTagName("canvas")[0].getContext("2d");
	},
	/**
	 * 选中的图形数组
	 * @type {}
	 */
	selectIds: [],
	/**
	 * 选中形状
	 * @param {} shapeIds 选中图形的id
	 * @param {} withCallback 是否施行回调
	 */
	selectShape: function(shapeIds, withCallback){
		//如果是字符串，则为选择一个
		if(typeof shapeIds == "string"){
			var shapeId = shapeIds;
			shapeIds = [];
			shapeIds.push(shapeId);
		}
		if(shapeIds.length <= 0){
			return;
		}
		var selectIds = Utils.mergeArray([], shapeIds); //构建一个新的数组
		//先进行循环，找到与图形组合的图形，一并选中
		for (var i = 0; i < shapeIds.length; i++) {
			var shape = Model.getShapeById(shapeIds[i]);
			if(shape.group){
				var groupedShapeIds = Model.getGroupShapes(shape.group);
				Utils.mergeArray(selectIds, groupedShapeIds);
			}
		}
		//重新构建一下，如果子元素不允许缩放，选中子元素时，让其选中父元素
		var ids = [];
		for (var i = 0; i < selectIds.length; i++) {
			var id = selectIds[i];
			var shape = Model.getShapeById(id);
			if(shape.parent && shape.resizeDir.length == 0 && ids.indexOf(shape.parent) < 0){
				ids.push(shape.parent);
			}else if(ids.indexOf(id) < 0){
				ids.push(id);
			}
		}
		shapeIds = ids;
		Utils.removeAnchors();
		Utils.selectIds = [];
		//设置选中状态
		for (var index = 0; index < shapeIds.length; index++) {
			var shapeId = shapeIds[index];
			var shape = Model.getShapeById(shapeId);
			Utils.selectIds.push(shapeId);
			if(shape.name == "linker"){
				if(this.isLocked(shape.id)){
					//锁定，显示叉号
					Utils.showLockers(shape);
				}else{
					Designer.painter.renderLinker(shape);
				}
			}else{
				if(this.isLocked(shape.id)){
					//锁定，显示叉号
					Utils.showLockers(shape);
				}else{
					Utils.showAnchors(shape);
				}
			}
		}
		//拿到选中的图形，不包括锁定的，给这些图形绘制控制器
		var ids = Utils.getSelectedIds();
		var onlyOneLinker = false
		if(ids.length == 1){
			var first = Model.getShapeById(ids[0]);
			if(first.name == "linker"){
				onlyOneLinker = true;
				Utils.showLinkerControls();
			}
		}
		if(ids.length > 0 && !onlyOneLinker){
			var control = Designer.painter.drawControls(ids);
		}
		if(typeof withCallback == "undefined"){
			withCallback = true
		}
		if(this.selectCallback && withCallback){
			this.selectCallback();
		}
		Designer.events.push("selectChanged");
		this.showLinkerCursor();
	},
	/**
	 * 选择后回调，比如格式刷
	 * @type {}
	 */
	selectCallback: null,
	/**
	 * 取消选择
	 */
	unselect: function(){
		var ids = this.selectIds;
		this.selectIds = [];
		for (var i = 0; i < ids.length; i++) {
			var shapeId = ids[i];
			var shape = Model.getShapeById(shapeId);
			if(shape.name == "linker"){
				Designer.painter.renderLinker(shape);
			}
		}
		$("#shape_controls").hide();
		Utils.removeLockers();
		Utils.removeAnchors();
		Designer.events.push("selectChanged");
		this.hideLinkerCursor();
		this.hideLinkerControls();
	},
	/**
	 * 获取选中的图形定义，只获取没有被锁定的
	 */
	getSelected: function(){
		var result = [];
		for (var i = 0; i < this.selectIds.length; i++) {
			var shapeId = this.selectIds[i];
			if(!Utils.isLocked(shapeId)){
				var define = Model.getShapeById(shapeId);
				result.push(define);
			}
		}
		return result;
	},
	/**
	 * 获取选中的图形id，只获取没有被锁定的
	 */
	getSelectedIds: function(){
		var result = [];
		for (var i = 0; i < this.selectIds.length; i++) {
			var shapeId = this.selectIds[i];
			if(!Utils.isLocked(shapeId)){
				result.push(shapeId);	
			}
		}
		return result;
	},
	/**
	 * 获取选中的连接线
	 */
	getSelectedLinkers: function(){
		var result = [];
		for (var i = 0; i < this.selectIds.length; i++) {
			var shapeId = this.selectIds[i];
			if(!Utils.isLocked(shapeId)){
				var define = Model.getShapeById(shapeId);
				if(define.name == "linker"){
					result.push(define);
				}
			}
		}
		return result;
	},
	/**
	 * 获取选中的连接线的id
	 */
	getSelectedLinkerIds: function(){
		var result = [];
		for (var i = 0; i < this.selectIds.length; i++) {
			var shapeId = this.selectIds[i];
			if(!Utils.isLocked(shapeId)){
				var define = Model.getShapeById(shapeId);
				if(define.name == "linker"){
					result.push(shapeId);
				}
			}
		}
		return result;
	},
	/**
	 * 获取选中的形状的id
	 */
	getSelectedShapeIds: function(){
		var result = [];
		for (var i = 0; i < this.selectIds.length; i++) {
			var shapeId = this.selectIds[i];
			if(!Utils.isLocked(shapeId)){
				var define = Model.getShapeById(shapeId);
				if(define.name != "linker"){
					result.push(shapeId);
				}
			}
		}
		return result;
	},
	/**
	 * 获取选中的并且被锁定的的id集合
	 */
	getSelectedLockedIds: function(){
		var result = [];
		for (var i = 0; i < this.selectIds.length; i++) {
			var shapeId = this.selectIds[i];
			if(Utils.isLocked(shapeId)){
				result.push(shapeId);
			}
		}
		return result;
	},
	/**
	 * 获取选中的组
	 * @return {}
	 */
	getSelectedGroups: function(){
		var result = [];
		for (var i = 0; i < this.selectIds.length; i++) {
			var shapeId = this.selectIds[i];
			var shape = Model.getShapeById(shapeId);
			if(shape.group && result.indexOf(shape.group) < 0){
				result.push(shape.group);
			}
		}
		return result;
	},
	/**
	 * 判断一个图形是否被选中
	 * @param {} shapeId
	 * @return {}
	 */
	isSelected: function(shapeId){
		if(this.selectIds.indexOf(shapeId) >= 0 && !this.isLocked(shapeId)){
			//被选中了，并且没有锁定
			return true;
		}
		return false;
	},
	/**
	 * 判断一个图形是否被锁定
	 * @param {} shapeId
	 * @return {Boolean}
	 */
	isLocked: function(shapeId){
		if(Model.getShapeById(shapeId).locked){
			return true;
		}else{
			return false;
		}
	},
	/**
	 * 连接线右边的动画计时器
	 * @type {}
	 */
	linkerCursorTimer: null,
	/**
	 * 显示从一个形状上连出的连接线上的游标
	 */
	showLinkerCursor: function(){
		this.hideLinkerCursor();
		var ids = Utils.getSelectedIds();
		if(ids.length == 1){
			var shape = Model.getShapeById(ids[0]);
			if(shape.name != "linker"){
				//只有一个图形，并且不是连接线，显示从图形上连出来的连接线上的游标
				var linkerIds = Model.linkerMap.map[shape.id];
				if(linkerIds && linkerIds.length){
					var cursors = [];
					for(var i = 0; i < linkerIds.length; i++){
						var linkerId = linkerIds[i];
						var linker = Model.getShapeById(linkerId);
						if(shape.id != linker.from.id || !linker.to.id){
							continue;
						}
						//得到连线的总长度
						var len = this.getLinkerLength(linker).toScale();
						var points = [];
						if(linker.linkerType == "broken"){
							//如果是折线，计算每一个点在整条线上的t值
							points.push({x: linker.from.x.toScale(), y: linker.from.y.toScale(), t: 0});
							for(var pi = 0; pi < linker.points.length; pi++){
								var p = linker.points[pi];
								points.push({x: p.x.toScale(), y: p.y.toScale()});
							}
							points.push({x: linker.to.x.toScale(), y: linker.to.y.toScale()});
							var d = 0;
							for(var pi = 1; pi < points.length; pi++){
								var p1 = points[pi - 1];
								var p2 = points[pi];
								//计算一段的长，和一段在总长度上所占的t值
								d += Utils.measureDistance(p1, p2);
								p2.t = d/len;
							}
						}
						var curCount = Math.floor(len / 120) + 1;
						//每一帧移动1像素，除以线条长度，得到每一次移动的t值
						var tStep = 3/len;
						var maxT = (Math.ceil(len / 120) * 120) / len;
						var curPos = 0;
						while(curPos < len){
							//得到连线上所有的游标对象
							var cur = {
								t: curPos / len,
								step: tStep,
								linker: linker,
								points: points,
								maxT: maxT
							};
							cursors.push(cur);
							curPos += 120;
						}
					}
					this.playLinkerCursor(cursors);
				}
			}
		}
	},
	/**
	 * 移动连接线上的游标
	 */
	playLinkerCursor: function(cursors){
		for(var i = 0; i < cursors.length; i++){
			var cursor = cursors[i];
			var dom = $("<div class='linker_cursor'></div>").appendTo("#designer_canvas");
			var linker = cursor.linker;
			var size = (linker.lineStyle.lineWidth + 2).toScale();
			if(size < 5){
				size = 5;
			}
			var half = size/2;
			cursor.half = half;
			cursor.dom = dom;
			dom.css({
				width: size,
				height: size,
				"-webkit-border-radius": half,
				"-moz-border-radius": half,
				"-ms-border-radius": half,
				"-o-border-radius": half,
				"border-radius": half,
				"z-index": $("#" + linker.id).css("z-index")
			});
		}
		this.linkerCursorTimer = setInterval(function(){
			for(var i = 0; i < cursors.length; i++){
				var cursor = cursors[i];
				var linker = cursor.linker;
				if(cursor.t >= cursor.maxT){
					cursor.t = 0;
					cursor.dom.show();
				}
				var t = cursor.t;
				if(linker.linkerType == "broken"){
					for(var pi = 1; pi < cursor.points.length; pi++){
						var p1 = cursor.points[pi - 1];
						var p2 = cursor.points[pi];
						if(t >= p1.t && t < p2.t){
							//游标在两点之间，计算在此条线段上的t值
							var pt = (t - p1.t) / (p2.t - p1.t);
							var x = (1-pt)*p1.x + pt*p2.x;
							var y = (1-pt)*p1.y + pt*p2.y;
							cursor.dom.css({
								left: x - cursor.half,
								top: y - cursor.half
							});
							break;
						}
					}
				}else if(linker.linkerType == "curve"){
					//曲线时，根据公式：B(t) = P0(1-t)^3 + 3P1t(1-t)^2 + 3P2t^2(1-t) + P3t^3，t=0.5时，在线中点
					var p0 = linker.from;
					var p1 = linker.points[0];
					var p2 = linker.points[1];
					var p3 = linker.to;
					var x = p0.x.toScale()*Math.pow((1-t), 3) + p1.x.toScale()*t*Math.pow((1-t), 2)*3 + p2.x.toScale()*Math.pow(t, 2)*(1-t)*3 + p3.x.toScale()*Math.pow(t, 3);
					var	y = p0.y.toScale()*Math.pow((1-t), 3) + p1.y.toScale()*t*Math.pow((1-t), 2)*3 + p2.y.toScale()*Math.pow(t, 2)*(1-t)*3 + p3.y.toScale()*Math.pow(t, 3);
					cursor.dom.css({
						left: x - cursor.half,
						top: y - cursor.half
					});
				}else{
					var x = (1-t)*linker.from.x.toScale() + t*linker.to.x.toScale();
					var y = (1-t)*linker.from.y.toScale() + t*linker.to.y.toScale();
					cursor.dom.css({
						left: x - cursor.half,
						top: y - cursor.half
					});
				}
				cursor.t += cursor.step;
				if(cursor.t >= 1){
					cursor.dom.hide();
				}
			}
		}, 30);
	},
	/**
	 * 隐藏连接线游标
	 */
	hideLinkerCursor: function(){
		if(this.linkerCursorTimer){
			clearInterval(this.linkerCursorTimer);
		}
		$(".linker_cursor").remove();
	},
	/**
	 * 绘制连接线上的控件
	 */
	showLinkerControls: function(){
		this.hideLinkerControls();
		var ids = Utils.getSelectedIds();
		var linker = null;
		if(ids.length == 1){
			var shape = Model.getShapeById(ids[0]);
			if(shape.name == "linker" && shape.linkerType == "curve"){
				linker = shape;
			}
		}
		if(linker == null){
			return;
		}
		function createControl(linker, ty){
			//计算点之间的距离，即为线条的长度
			var fixed = null;
			var cursor = null;
			if(ty == "from"){
				fixed = linker.from;
				cursor = linker.points[0];
			}else{
				fixed = linker.to;
				cursor = linker.points[1];
			}
			var len = Utils.measureDistance(fixed, cursor).toScale() - 6; //固定点和活动点的距离
			//两条线的中点
			var mid = {
				x: (0.5*fixed.x + 0.5*cursor.x).toScale(),
				y: (0.5*fixed.y + 0.5*cursor.y).toScale()
			};
			var angle = Utils.getAngle(fixed, cursor) + Math.PI / 2;
			var line = $("<div class='linker_control_line'></div>").appendTo("#designer_canvas");
			var point = $("<div class='linker_control_point'></div>").appendTo("#designer_canvas");
			var deg = Math.round(angle / (Math.PI*2) * 360);
			var degStr = "rotate(" + deg + "deg)";
			line.css({
				left: mid.x,
				top: mid.y - len/2,
				height: len,
				"z-index": Model.orderList.length,
				"-webkit-transform": degStr,
				"-ms-transform": degStr,
				"-o-transform": degStr,
				"-moz-transform": degStr,
				"transform": degStr
			});
			point.css({
				left: cursor.x.toScale() - 4,
				top: cursor.y.toScale() - 4,
				"z-index": Model.orderList.length
			});
			point.attr("ty", ty);
			point.unbind().bind("mousedown", function(downE){
				linker = Model.getShapeById(linker.id);
				var cursor = null;
				if(ty == "from"){
					cursor = linker.points[0];
				}else{
					cursor = linker.points[1];
				}
				downE.stopPropagation();
				point.addClass("moving");
				Designer.op.changeState("changing_curve");
				$(document).bind("mousemove.change_curve", function(e){
					var pos = Utils.getRelativePos(e.pageX, e.pageY, $("#designer_canvas"));
					cursor.x = pos.x;
					cursor.y = pos.y;
					Designer.painter.renderLinker(linker);
					Model.define.elements[linker.id] = linker;
					Utils.showLinkerControls();
					$(".linker_control_point[ty="+point.attr("ty")+"]").addClass("moving");
					//放在mousemove中进行绑定，意义是在发生了拖动后，才会触发mouseup事件
					$(document).unbind("mouseup.changed_curve").bind("mouseup.changed_curve", function(e){
						Model.update(linker);
						$(document).unbind("mouseup.changed_curve")
					});
				});
				$(document).unbind("mouseup.change_curve").bind("mouseup.change_curve", function(e){
					$(document).unbind("mouseup.change_curve");
					$(document).unbind("mousemove.change_curve");
					$(".linker_control_point").removeClass("moving");
					Designer.op.resetState();
				});
			});
			return point;
		}
		createControl(linker, "from");
		createControl(linker, "to");
	},
	/**
	 * 隐藏连接线上的控件
	 */
	hideLinkerControls: function(){
		$(".linker_control_line").remove();
		$(".linker_control_point").remove();
	},
	/**
	 * 显示锚点
	 * @param shape 形状对象
	 */
	showAnchors: function(shape){
		if($(".shape_contour[forshape="+shape.id+"]").length > 0){
			return;
		}
		//创建图形的矩形轮廓
		var contour = $("<div class='shape_contour' forshape='"+shape.id+"'></div>").appendTo($("#designer_canvas"));
		contour.css({
			left: shape.props.x.toScale(),
			top: shape.props.y.toScale(),
			//Z轴坐标比选择轮廓大1
			"z-index": Model.orderList.length + 1
		});
		if(!Utils.isSelected(shape.id)){
			contour.addClass("hovered_contour");
		}
		//将锚点添加到轮廓中去
		var wh = Designer.config.anchorSize - 2;
		var anchorStyle = {
			"border-color": Designer.config.anchorColor,
			"border-radius": Designer.config.anchorSize /2,
			width: wh,
			height: wh
		};
		var anchors = shape.getAnchors();
		var shapeCenter = {x: shape.props.w/2, y:shape.props.h/2};
		var angle = shape.props.angle;
		for ( var ai = 0; ai < anchors.length; ai++) {
			var an = anchors[ai];
			var anchorDom = $("<div class='shape_anchor'></div>").appendTo(contour);
			var rotated = this.getRotated(shapeCenter, an, angle);
			anchorStyle.left = rotated.x.toScale() - Designer.config.anchorSize / 2;
			anchorStyle.top = rotated.y.toScale() - Designer.config.anchorSize / 2;
			anchorDom.css(anchorStyle);
		}
	},
	/**
	 * 隐藏锚点
	 * 此处只隐藏鼠标悬浮时的锚点
	 */
	hideAnchors: function(){
		$(".hovered_contour").remove();
	},
	/**
	 * 隐藏锚点
	 * 隐藏所有锚点
	 */
	removeAnchors: function(){
		$(".shape_contour").remove();
	},
	/**
	 * 对锁定的图形，显示叉号
	 * @param shape 形状对象
	 */
	showLockers: function(shape){
		var shapeBox = $("#" + shape.id);
		var pos = shapeBox.position();
		//创建锁定点
		function createLocker(){
			var locker = $("<canvas class='shape_locker' width='10px' height='10px'></canvas>").appendTo(shapeBox);
			var ctx = locker[0].getContext("2d");
			ctx.strokeStyle="#777"
			ctx.lineWidth=1;
			var w = 9;
			ctx.beginPath();
			ctx.moveTo(2,2);
			ctx.lineTo(w,w);
			ctx.moveTo(2,w);
			ctx.lineTo(w,2);
			ctx.stroke();
			return locker;
		}
		//设置锁定点
		function setLocker(p){
			var locker = createLocker();
			locker.css({
				left: p.x.toScale() - pos.left - 5,
				top: p.y.toScale() - pos.top - 5
			});
		}
		if(shape.name != "linker"){
			var p = shape.props;
			var center = {x: p.x + p.w/2, y: p.y + p.h/2};
			var p1 = this.getRotated(center, {x: p.x, y: p.y}, shape.props.angle);
			setLocker(p1);
			var p2 = this.getRotated(center, {x: p.x + p.w, y: p.y}, shape.props.angle);
			setLocker(p2);
			var p3 = this.getRotated(center, {x: p.x + p.w, y: p.y + p.h}, shape.props.angle);
			setLocker(p3);
			var p4 = this.getRotated(center, {x: p.x, y: p.y + p.h}, shape.props.angle);
			setLocker(p4);
		}else{
			setLocker(shape.from);
			setLocker(shape.to);
		}
	},
	/**
	 * 隐藏锚点
	 * 隐藏所有锚点
	 */
	removeLockers: function(){
		$(".shape_locker").remove();
	},
	/**
	 * 测量两点间距离
	 * @param {} p1
	 * @param {} p2
	 * @return {}
	 */
	measureDistance: function(p1, p2){
		var h = p2.y - p1.y;
		var w = p2.x - p1.x;
		return Math.sqrt(Math.pow(h, 2) + Math.pow(w, 2));
	},
	/**
	 * 从数组中删除一个元素
	 * @param {} array
	 * @param {} element
	 */
	removeFromArray: function(array, element){
		var index = array.indexOf(element);
		if(index >= 0){
			array.splice(index, 1);
		}
		return array;
	},
	/**
	 * 添加到数据，不允许重复
	 * @param {} array
	 * @param {} element
	 * @return {}
	 */
	addToArray: function(array, element){
		var index = array.indexOf(element);
		if(index < 0){
			array.push(element);
		}
		return array;
	},
	/**
	 * 合并两个数组
	 * @param {} arr1
	 * @param {} arr2
	 */
	mergeArray: function(arr1, arr2){
		for (var i = 0; i < arr2.length; i++) {
			var ele = arr2[i];
			if(arr1.indexOf(ele) < 0){
				arr1.push(ele);
			}
		}
		return arr1;
	},
	/**
	 * 获取一个点坐标外围呈圆形的N个点
	 * @param {} x
	 * @param {} y
	 */
	getCirclePoints: function(x, y, r){
		var angle = Math.PI / 18; //每10度一个点
		var points = [];
		//从左边的点开始，顺时针方向
		for(var i = 0; i < 36; i++){
			var pointAngle = angle * i;
			var p = {
				x: x - Math.cos(pointAngle) * r,
				y: y - Math.sin(pointAngle) * r,
				angle: pointAngle
			};
			points.push(p);
		}
		return points;
	},
	/**
	 * 获取连接点相对于形状的角度
	 */
	getPointAngle: function(shapeId, x, y, r){
		var shapeBoxPos = $("#" + shapeId).position();
		var shapeCtx = Utils.getShapeContext(shapeId);
		//把x, y换算成相对于画布的相对坐标
		x = x.toScale() - shapeBoxPos.left;
		y = y.toScale() - shapeBoxPos.top;
		var circle = this.getCirclePoints(x, y, r);
		var len = circle.length;
		var exists = false;
		//先循环分别判断每个点是否在图形内
		for(var i = 0; i < len; i++){
			var p = circle[i];
			if(shapeCtx.isPointInPath(p.x, p.y)){
				p.inPath = true;
				exists = true;
			}else{
				p.inPath = false;
			}
		}
		if(exists == false){
			//如果没有在图形内的点，则认为当前坐标不在图形边界上，直接return null
			return null;
		}
		var begin = null;
		var end = null;
		for(var i = 0; i < len; i++){
			var p = circle[i];
			if(!p.inPath){
				//如果当前点不在图形内，判断旁边是否有点是在图形内的
				if(begin == null){
					var pre = circle[(i - 1 + len) % len];
					if(pre.inPath){
						//如果此点前面的点在图形中，则此点为第一个在图形外的点
						begin = p.angle;
					}
				}
				if(end == null){
					var next = circle[(i + 1 + len) % len];
					if(next.inPath){
						//如果此点前面的点在图形中，则此点为第一个在图形外的点
						end = p.angle;
					}
				}
				if(begin != null && end != null){
					break;
				}
			}
		}
		//取两个夹角的一半，由于有时end的角度要小于begin的角度，所以要加Math.PI，然后再模
		var diff = (Math.PI * 2 + end - begin) % (Math.PI * 2) / 2;
		//由于有时begin + 夹角的角度要小于begin的角度，所以要加Math.PI，然后再模
		var angle = (begin + diff) % (Math.PI * 2);
		return angle;
	},
	/**
	 * 获取角度的方向，分为上1右2下3左4
	 */
	getAngleDir: function(angle){
		var pi = Math.PI;
		if(angle >= pi / 4 && angle < pi / 4 * 3){
			return 1;//上
		}else if(angle >= pi / 4 * 3 && angle < pi / 4 * 5){
			return 2;//右
		}else if(angle >= pi / 4 * 5 && angle < pi / 4 * 7){
			return 3;//下
		}else{
			return 4;//左
		}
	},
	/**
	 * 获取连接线上的几个控制点点
	 */
	getLinkerPoints: function(linker){
		var points = [];
		if(linker.linkerType == "broken"){
			var pi = Math.PI;
			var from = linker.from;
			var to = linker.to;
			var xDistance = Math.abs(to.x - from.x);
			var yDistance = Math.abs(to.y - from.y);
			var minDistance = 30; //最小距离，比如起点向上，终点在下方，则先要往上画minDistance的距离
			//折线，取折点
			if(from.id != null && to.id != null){
				//起点和终点都连接了形状
				var fromDir = this.getAngleDir(from.angle); //起点方向
				var toDir = this.getAngleDir(to.angle); //终点方向
				var fixed, active, reverse; //固定点、移动点、是否需要逆序
				//以起点为判断依据，可以涵盖所有情况
				if(fromDir == 1 && toDir == 1){
					//情况1：两个点都向上
					if(from.y < to.y){
						fixed = from;
						active = to;
						reverse = false;
					}else{
						fixed = to;
						active = from;
						reverse = true;
					}
					var fixedProps = Model.getShapeById(fixed.id).props;
					var activeProps = Model.getShapeById(active.id).props;
					if(active.x >= fixedProps.x - minDistance && active.x <= fixedProps.x + fixedProps.w + minDistance){
						var x;
						if(active.x < fixedProps.x + fixedProps.w / 2){
							x = fixedProps.x - minDistance;
						}else{
							x = fixedProps.x + fixedProps.w + minDistance;
						}
						var y = fixed.y - minDistance;
						points.push({x: fixed.x, y: y});
						points.push({x: x, y: y});
						y = active.y - minDistance;
						points.push({x: x, y: y});
						points.push({x: active.x, y: y});
					}else{
						var y = fixed.y - minDistance;
						points.push({x: fixed.x, y: y});
						points.push({x: active.x, y: y});
					}
				}else if(fromDir == 3 && toDir == 3){
					//情况2：两个点都向下
					if(from.y > to.y){
						fixed = from;
						active = to;
						reverse = false;
					}else{
						fixed = to;
						active = from;
						reverse = true;
					}
					var fixedProps = Model.getShapeById(fixed.id).props;
					var activeProps = Model.getShapeById(active.id).props;
					if(active.x >= fixedProps.x - minDistance && active.x <= fixedProps.x + fixedProps.w + minDistance){
						var y = fixed.y + minDistance;
						var x;
						if(active.x < fixedProps.x + fixedProps.w / 2){
							x = fixedProps.x - minDistance;
						}else{
							x = fixedProps.x + fixedProps.w + minDistance;
						}
						points.push({x: fixed.x, y: y});
						points.push({x: x, y: y});
						y = active.y + minDistance;
						points.push({x: x, y: y});
						points.push({x: active.x, y: y});
					}else{
						var y = fixed.y + minDistance;
						points.push({x: fixed.x, y: y});
						points.push({x: active.x, y: y});
					}
				}else if(fromDir == 2 && toDir == 2){
					//情况3：两点都向右
					if(from.x > to.x){
						fixed = from;
						active = to;
						reverse = false;
					}else{
						fixed = to;
						active = from;
						reverse = true;
					}
					var fixedProps = Model.getShapeById(fixed.id).props;
					var activeProps = Model.getShapeById(active.id).props;
					if(active.y >= fixedProps.y - minDistance && active.y <= fixedProps.y + fixedProps.h + minDistance){
						var x = fixed.x + minDistance;
						var y;
						if(active.y < fixedProps.y + fixedProps.h / 2){
							y = fixedProps.y - minDistance;
						}else{
							y = fixedProps.y + fixedProps.h + minDistance;
						}
						points.push({x: x, y: fixed.y});
						points.push({x: x, y: y});
						x = active.x + minDistance;
						points.push({x: x, y: y});
						points.push({x: x, y: active.y});
					}else{
						var x = fixed.x + minDistance;
						points.push({x: x, y: fixed.y});
						points.push({x: x, y: active.y});
					}
				}else if(fromDir == 4 && toDir == 4){
					//情况4：两点都向左
					if(from.x < to.x){
						fixed = from;
						active = to;
						reverse = false;
					}else{
						fixed = to;
						active = from;
						reverse = true;
					}
					var fixedProps = Model.getShapeById(fixed.id).props;
					var activeProps = Model.getShapeById(active.id).props;
					if(active.y >= fixedProps.y - minDistance && active.y <= fixedProps.y + fixedProps.h + minDistance){
						var x = fixed.x - minDistance;
						var y;
						if(active.y < fixedProps.y + fixedProps.h / 2){
							y = fixedProps.y - minDistance;
						}else{
							y = fixedProps.y + fixedProps.h + minDistance;
						}
						points.push({x: x, y: fixed.y});
						points.push({x: x, y: y});
						x = active.x - minDistance;
						points.push({x: x, y: y});
						points.push({x: x, y: active.y});
					}else{
						var x = fixed.x - minDistance;
						points.push({x: x, y: fixed.y});
						points.push({x: x, y: active.y});
					}
				}else if((fromDir == 1 && toDir == 3) || (fromDir == 3 && toDir == 1)){
					//情况5：一个点向上，一个点向下
					if(fromDir == 1){
						fixed = from;
						active = to;
						reverse = false;
					}else{
						fixed = to;
						active = from;
						reverse = true;
					}
					var fixedProps = Model.getShapeById(fixed.id).props;
					var activeProps = Model.getShapeById(active.id).props;
					if(active.y <= fixed.y){
						var y = fixed.y - yDistance / 2;
						points.push({x: fixed.x, y: y});
						points.push({x: active.x, y: y});
					}else{
						var fixedRight = fixedProps.x + fixedProps.w;
						var activeRight = activeProps.x + activeProps.w;
						var y = fixed.y - minDistance;
						var x;
						if(activeRight >= fixedProps.x && activeProps.x <= fixedRight){
							//x轴重叠的情况
							var half = fixedProps.x + fixedProps.w / 2;
							if(active.x < half){
								//从左边绕
								x = fixedProps.x < activeProps.x ? fixedProps.x - minDistance : activeProps.x - minDistance;
							}else{
								//从右边绕
								x = fixedRight > activeRight ? fixedRight + minDistance : activeRight + minDistance;
							}
							if(activeProps.y < fixed.y){
								y = activeProps.y - minDistance;
							}
						}else{
							if(active.x < fixed.x){
								x = activeRight + (fixedProps.x - activeRight) / 2;
							}else{
								x = fixedRight + (activeProps.x - fixedRight) / 2;
							}
						}
						points.push({x: fixed.x, y: y});
						points.push({x: x, y: y});
						y = active.y + minDistance;
						points.push({x: x, y: y});
						points.push({x: active.x, y: y});
					}
				}else if((fromDir == 2 && toDir == 4) || (fromDir == 4 && toDir == 2)){
					//情况6：一个点向右，一个点向左
					if(fromDir == 2){
						fixed = from;
						active = to;
						reverse = false;
					}else{
						fixed = to;
						active = from;
						reverse = true;
					}
					var fixedProps = Model.getShapeById(fixed.id).props;
					var activeProps = Model.getShapeById(active.id).props;
					if(active.x > fixed.x){
						var x = fixed.x + xDistance / 2;
						points.push({x: x, y: fixed.y});
						points.push({x: x, y: active.y});
					}else{
						var fixedBottom = fixedProps.y + fixedProps.h;
						var activeBottom = activeProps.y + activeProps.h;
						var x = fixed.x + minDistance;
						var y;
						if(activeBottom >= fixedProps.y && activeProps.y <= fixedBottom){
							//y轴重叠的情况
							var half = fixedProps.y + fixedProps.h / 2;
							if(active.y < half){
								//从上边绕
								y = fixedProps.y < activeProps.y ? fixedProps.y - minDistance : activeProps.y - minDistance;
							}else{
								//从下边绕
								y = fixedBottom > activeBottom ? fixedBottom + minDistance : activeBottom + minDistance;
							}
							if(activeProps.x + activeProps.w > fixed.x){
								x = activeProps.x + activeProps.w + minDistance;
							}
						}else{
							if(active.y < fixed.y){
								y = activeBottom + (fixedProps.y - activeBottom) / 2;
							}else{
								y = fixedBottom + (activeProps.y - fixedBottom) / 2;
							}
						}
						points.push({x: x, y: fixed.y});
						points.push({x: x, y: y});
						x = active.x - minDistance;
						points.push({x: x, y: y});
						points.push({x: x, y: active.y});
					}
				}else if((fromDir == 1 && toDir == 2) || (fromDir == 2 && toDir == 1)){
					//情况7：一个点向上，一个点向右
					if(fromDir == 2){
						fixed = from;
						active = to;
						reverse = false;
					}else{
						fixed = to;
						active = from;
						reverse = true;
					}
					var fixedProps = Model.getShapeById(fixed.id).props;
					var activeProps = Model.getShapeById(active.id).props;
					if(active.x > fixed.x && active.y > fixed.y){
						points.push({x: active.x, y: fixed.y});
					}else if(active.x > fixed.x && activeProps.x > fixed.x){
						var x;
						if(activeProps.x - fixed.x < minDistance * 2){
							x = fixed.x + (activeProps.x - fixed.x) / 2;
						}else{
							x = fixed.x + minDistance;
						}
						var y = active.y - minDistance;
						points.push({x: x, y: fixed.y});
						points.push({x: x, y: y});
						points.push({x: active.x, y: y});
					}else if(active.x <= fixed.x && active.y > fixedProps.y + fixedProps.h){
						var fixedBottom = fixedProps.y + fixedProps.h;
						var x = fixed.x + minDistance;
						var y
						if(active.y - fixedBottom < minDistance * 2){
							y = fixedBottom + (active.y - fixedBottom) / 2;
						}else{
							y = active.y - minDistance;
						}
						points.push({x: x, y: fixed.y});
						points.push({x: x, y: y});
						points.push({x: active.x, y: y});
					}else{
						var x;
						var activeRight = activeProps.x + activeProps.w;
						if(activeRight > fixed.x){
							x = activeRight + minDistance;
						}else{
							x = fixed.x + minDistance;
						}
						var y;
						if(active.y < fixedProps.y){
							y = active.y - minDistance;
						}else{
							y = fixedProps.y - minDistance;
						}
						points.push({x: x, y: fixed.y});
						points.push({x: x, y: y});
						points.push({x: active.x, y: y});
					}
				}else if((fromDir == 1 && toDir == 4) || (fromDir == 4 && toDir == 1)){
					//情况8：一个点向上，一个点向左
					if(fromDir == 4){
						fixed = from;
						active = to;
						reverse = false;
					}else{
						fixed = to;
						active = from;
						reverse = true;
					}
					var fixedProps = Model.getShapeById(fixed.id).props;
					var activeProps = Model.getShapeById(active.id).props;
					var activeRight = activeProps.x + activeProps.w;
					if(active.x < fixed.x && active.y > fixed.y){
						points.push({x: active.x, y: fixed.y});
					}else if(active.x < fixed.x && activeRight < fixed.x){
						var x;
						if(fixed.x - activeRight < minDistance * 2){
							x = activeRight + (fixed.x - activeRight) / 2;
						}else{
							x = fixed.x - minDistance;
						}
						var y = active.y - minDistance;
						points.push({x: x, y: fixed.y});
						points.push({x: x, y: y});
						points.push({x: active.x, y: y});
					}else if(active.x >= fixed.x && active.y > fixedProps.y + fixedProps.h){
						var fixedBottom = fixedProps.y + fixedProps.h;
						var x = fixed.x - minDistance;
						var y
						if(active.y - fixedBottom < minDistance * 2){
							y = fixedBottom + (active.y - fixedBottom) / 2;
						}else{
							y = active.y - minDistance;
						}
						points.push({x: x, y: fixed.y});
						points.push({x: x, y: y});
						points.push({x: active.x, y: y});
					}else{
						var x;
						if(activeProps.x < fixed.x){
							x = activeProps.x - minDistance;
						}else{
							x = fixed.x - minDistance;
						}
						var y;
						if(active.y < fixedProps.y){
							y = active.y - minDistance;
						}else{
							y = fixedProps.y - minDistance;
						}
						points.push({x: x, y: fixed.y});
						points.push({x: x, y: y});
						points.push({x: active.x, y: y});
					}
				}else if((fromDir == 2 && toDir == 3) || (fromDir == 3 && toDir == 2)){
					//情况9：一个点向右，一个点向下
					if(fromDir == 2){
						fixed = from;
						active = to;
						reverse = false;
					}else{
						fixed = to;
						active = from;
						reverse = true;
					}
					var fixedProps = Model.getShapeById(fixed.id).props;
					var activeProps = Model.getShapeById(active.id).props;
					if(active.x > fixed.x && active.y < fixed.y){
						points.push({x: active.x, y: fixed.y});
					}else if(active.x > fixed.x && activeProps.x > fixed.x){
						var x;
						if(activeProps.x - fixed.x < minDistance * 2){
							x = fixed.x + (activeProps.x - fixed.x) / 2;
						}else{
							x = fixed.x + minDistance;
						}
						var y = active.y + minDistance;
						points.push({x: x, y: fixed.y});
						points.push({x: x, y: y});
						points.push({x: active.x, y: y});
					}else if(active.x <= fixed.x && active.y < fixedProps.y){
						var x = fixed.x + minDistance;
						var y
						if(fixedProps.y - active.y < minDistance * 2){
							y = active.y + (fixedProps.y - active.y) / 2;
						}else{
							y = active.y + minDistance;
						}
						points.push({x: x, y: fixed.y});
						points.push({x: x, y: y});
						points.push({x: active.x, y: y});
					}else{
						var x;
						var activeRight = activeProps.x + activeProps.w;
						if(activeRight > fixed.x){
							x = activeRight + minDistance;
						}else{
							x = fixed.x + minDistance;
						}
						var y;
						if(active.y > fixedProps.y + fixedProps.h){
							y = active.y + minDistance;
						}else{
							y = fixedProps.y + fixedProps.h + minDistance;
						}
						points.push({x: x, y: fixed.y});
						points.push({x: x, y: y});
						points.push({x: active.x, y: y});
					}
				}else if((fromDir == 3 && toDir == 4) || (fromDir == 4 && toDir == 3)){
					//情况10：一个点向下，一个点向左
					if(fromDir == 4){
						fixed = from;
						active = to;
						reverse = false;
					}else{
						fixed = to;
						active = from;
						reverse = true;
					}
					var fixedProps = Model.getShapeById(fixed.id).props;
					var activeProps = Model.getShapeById(active.id).props;
					var activeRight = activeProps.x + activeProps.w;
					if(active.x < fixed.x && active.y < fixed.y){
						points.push({x: active.x, y: fixed.y});
					}else if(active.x < fixed.x && activeRight < fixed.x){
						var x;
						if(fixed.x - activeRight < minDistance * 2){
							x = activeRight + (fixed.x - activeRight) / 2;
						}else{
							x = fixed.x - minDistance;
						}
						var y = active.y + minDistance;
						points.push({x: x, y: fixed.y});
						points.push({x: x, y: y});
						points.push({x: active.x, y: y});
					}else if(active.x >= fixed.x && active.y < fixedProps.y){
						var x = fixed.x - minDistance;
						var y
						if(fixedProps.y - active.y < minDistance * 2){
							y = active.y + (fixedProps.y - active.y) / 2;
						}else{
							y = active.y + minDistance;
						}
						points.push({x: x, y: fixed.y});
						points.push({x: x, y: y});
						points.push({x: active.x, y: y});
					}else{
						var x;
						if(activeProps.x < fixed.x){
							x = activeProps.x - minDistance;
						}else{
							x = fixed.x - minDistance;
						}
						var y;
						if(active.y > fixedProps.y + fixedProps.h){
							y = active.y + minDistance;
						}else{
							y = fixedProps.y + fixedProps.h + minDistance;
						}
						points.push({x: x, y: fixed.y});
						points.push({x: x, y: y});
						points.push({x: active.x, y: y});
					}
				}
				if(reverse){
					points.reverse();
				}
			}else if(from.id != null || to.id != null){
				//只有起点或终点连接了形状
				//连接了形状的端点被认为是固定点，另一点被认为是活动的点
				var fixed, active, reverse, angle;
				if(from.id != null){
					fixed = from;
					active = to;
					reverse = false;
					angle = from.angle
				}else{
					fixed = to;
					active = from;
					reverse = true; //如果固定点是终点，需要把得到的点逆序，因为绘制时是从起点开始的，而此处计算获得的点将是从终点开始
					angle = to.angle
				}
				var props = Model.getShapeById(fixed.id).props;
				if(angle >= pi / 4 && angle < pi / 4 * 3){
					//起点角度为向上
					if(active.y < fixed.y){
						//终点在起点图形上方
						if(xDistance >= yDistance){
							//如果终点离起点的水平距离较远，最终方向为水平，此情况下只有一个折点
							points.push({x: fixed.x, y: active.y});
						}else{
							//如果终点离起点的垂直距离较远，最终方向为向上，此情况下有两个折点
							var half = yDistance / 2;
							points.push({x: fixed.x, y: fixed.y - half});
							points.push({x: active.x, y: fixed.y - half});
						}
					}else{
						//终点在起点水平平行或下方的位置
						points.push({x: fixed.x, y: fixed.y - minDistance}); //先向上画一笔
						if(xDistance >= yDistance){
							//如果终点离起点的水平距离较远，最终方向为水平
							if(active.x >= props.x - minDistance && active.x <= props.x + props.w + minDistance){
								//如果终点在x轴上的坐标，在图形范围内，在判断终点与形状是偏左还是偏右
								var shapeHalf = props.x + props.w / 2;
								if(active.x < shapeHalf){
									//偏左，第二点在形状左上角
									points.push({x: props.x - minDistance, y: fixed.y - minDistance});
									points.push({x: props.x - minDistance, y: active.y});
								}else{
									points.push({x: props.x + props.w + minDistance, y: fixed.y - minDistance});
									points.push({x: props.x + props.w + minDistance, y: active.y});
								}
							}else{
								//如果终点在x轴上的坐标，在图形范围外，此时有三个点
								if(active.x < props.x){
									points.push({x: active.x + minDistance, y: fixed.y - minDistance});
									points.push({x: active.x + minDistance, y: active.y});
								}else{
									points.push({x: active.x - minDistance, y: fixed.y - minDistance});
									points.push({x: active.x - minDistance, y: active.y});
								}
							}
						}else{
							//如果终点离起点的垂直距离较远，最终方向为向下
							if(active.x >= props.x - minDistance && active.x <= props.x + props.w + minDistance){
								//如果终点在x轴上的坐标，在图形范围内，此时有四个点
								//在判断终点与形状是偏左还是偏右
								var shapeHalf = props.x + props.w / 2;
								if(active.x < shapeHalf){
									//偏左，第二点在形状左上角
									points.push({x: props.x - minDistance, y: fixed.y - minDistance});
									points.push({x: props.x - minDistance, y: active.y - minDistance});
									points.push({x: active.x, y: active.y - minDistance});
								}else{
									points.push({x: props.x + props.w + minDistance, y: fixed.y - minDistance});
									points.push({x: props.x + props.w + minDistance, y: active.y - minDistance});
									points.push({x: active.x, y: active.y - minDistance});
								}
							}else{
								//如果终点在x轴上的坐标，在图形范围外，此时有两个点
								points.push({x: active.x, y: fixed.y - minDistance});
							}
						}
					}
				}else if(angle >= pi / 4 * 3 && angle < pi / 4 * 5){
					//起点角度为向右
					if(active.x > fixed.x){
						//终点在起点图形右方
						if(xDistance >= yDistance){
							//如果终点离起点的水平距离较远，最终方向为水平，此情况下有两个折点
							var half = xDistance / 2;
							points.push({x: fixed.x + half, y: fixed.y});
							points.push({x: fixed.x + half, y: active.y});
						}else{
							//如果终点离起点的垂直距离较远，最终方向为垂直，此情况下只有一个折点
							points.push({x: active.x, y: fixed.y});
						}
					}else{
						points.push({x: fixed.x + minDistance, y: fixed.y});
						if(xDistance >= yDistance){
							//如果终点离起点的水平距离较远，最终方向为水平
							if(active.y >= props.y - minDistance && active.y <= props.y + props.h + minDistance){
								//如果终点在y轴上的坐标，在图形范围内，在判断终点与形状是偏上还是偏下
								var shapeHalf = props.y + props.h / 2;
								if(active.y < shapeHalf){
									//偏上，第二点在形状右上角
									points.push({x: fixed.x + minDistance, y: props.y - minDistance});
									points.push({x: active.x + minDistance, y: props.y - minDistance});
									points.push({x: active.x + minDistance, y: active.y});
								}else{
									points.push({x: fixed.x + minDistance, y: props.y + props.h + minDistance});
									points.push({x: active.x + minDistance, y: props.y + props.h + minDistance});
									points.push({x: active.x + minDistance, y: active.y});
								}
							}else{
								points.push({x: fixed.x + minDistance, y: active.y});
							}
						}else{
							//如果终点离起点的垂直距离较远，最终方向为向下
							if(active.y >= props.y - minDistance && active.y <= props.y + props.h + minDistance){
								var shapeHalf = props.y + props.h / 2;
								if(active.y < shapeHalf){
									points.push({x: fixed.x + minDistance, y: props.y - minDistance});
									points.push({x: active.x, y: props.y - minDistance});
								}else{
									points.push({x: fixed.x + minDistance, y: props.y + props.h + minDistance});
									points.push({x: active.x, y: props.y + props.h + minDistance});
								}
							}else{
								if(active.y < fixed.y){
									points.push({x: fixed.x + minDistance, y: active.y + minDistance});
									points.push({x: active.x, y: active.y + minDistance});
								}else{
									points.push({x: fixed.x + minDistance, y: active.y - minDistance});
									points.push({x: active.x, y: active.y - minDistance});
								}
							}
						}
					}
				}else if(angle >= pi / 4 * 5 && angle < pi / 4 * 7){
					//起点角度为向下
					if(active.y > fixed.y){
						if(xDistance >= yDistance){
							points.push({x: fixed.x, y: active.y});
						}else{
							var half = yDistance / 2;
							points.push({x: fixed.x, y: fixed.y + half});
							points.push({x: active.x, y: fixed.y + half});
						}
					}else{
						points.push({x: fixed.x, y: fixed.y + minDistance}); 
						if(xDistance >= yDistance){
							if(active.x >= props.x - minDistance && active.x <= props.x + props.w + minDistance){
								var shapeHalf = props.x + props.w / 2;
								if(active.x < shapeHalf){
									points.push({x: props.x - minDistance, y: fixed.y + minDistance});
									points.push({x: props.x - minDistance, y: active.y});
								}else{
									points.push({x: props.x + props.w + minDistance, y: fixed.y + minDistance});
									points.push({x: props.x + props.w + minDistance, y: active.y});
								}
							}else{
								if(active.x < props.x){
									points.push({x: active.x + minDistance, y: fixed.y + minDistance});
									points.push({x: active.x + minDistance, y: active.y});
								}else{
									points.push({x: active.x - minDistance, y: fixed.y + minDistance});
									points.push({x: active.x - minDistance, y: active.y});
								}
							}
						}else{
							if(active.x >= props.x - minDistance && active.x <= props.x + props.w + minDistance){
								var shapeHalf = props.x + props.w / 2;
								if(active.x < shapeHalf){
									points.push({x: props.x - minDistance, y: fixed.y + minDistance});
									points.push({x: props.x - minDistance, y: active.y + minDistance});
									points.push({x: active.x, y: active.y + minDistance});
								}else{
									points.push({x: props.x + props.w + minDistance, y: fixed.y + minDistance});
									points.push({x: props.x + props.w + minDistance, y: active.y + minDistance});
									points.push({x: active.x, y: active.y + minDistance});
								}
							}else{
								points.push({x: active.x, y: fixed.y + minDistance});
							}
						}
					}
				}else{
					//起点角度为向左
					if(active.x < fixed.x){
						if(xDistance >= yDistance){
							var half = xDistance / 2;
							points.push({x: fixed.x - half, y: fixed.y});
							points.push({x: fixed.x - half, y: active.y});
						}else{
							points.push({x: active.x, y: fixed.y});
						}
					}else{
						points.push({x: fixed.x - minDistance, y: fixed.y});
						if(xDistance >= yDistance){
							if(active.y >= props.y - minDistance && active.y <= props.y + props.h + minDistance){
								var shapeHalf = props.y + props.h / 2;
								if(active.y < shapeHalf){
									points.push({x: fixed.x - minDistance, y: props.y - minDistance});
									points.push({x: active.x - minDistance, y: props.y - minDistance});
									points.push({x: active.x - minDistance, y: active.y});
								}else{
									points.push({x: fixed.x - minDistance, y: props.y + props.h + minDistance});
									points.push({x: active.x - minDistance, y: props.y + props.h + minDistance});
									points.push({x: active.x - minDistance, y: active.y});
								}
							}else{
								points.push({x: fixed.x - minDistance, y: active.y});
							}
						}else{
							//如果终点离起点的垂直距离较远，最终方向为向下
							if(active.y >= props.y - minDistance && active.y <= props.y + props.h + minDistance){
								var shapeHalf = props.y + props.h / 2;
								if(active.y < shapeHalf){
									points.push({x: fixed.x - minDistance, y: props.y - minDistance});
									points.push({x: active.x, y: props.y - minDistance});
								}else{
									points.push({x: fixed.x - minDistance, y: props.y + props.h + minDistance});
									points.push({x: active.x, y: props.y + props.h + minDistance});
								}
							}else{
								if(active.y < fixed.y){
									points.push({x: fixed.x - minDistance, y: active.y + minDistance});
									points.push({x: active.x, y: active.y + minDistance});
								}else{
									points.push({x: fixed.x - minDistance, y: active.y - minDistance});
									points.push({x: active.x, y: active.y - minDistance});
								}
							}
						}
					}
				}
				if(reverse){
					points.reverse();
				}
			}else{
				//折线的起点和终点都没有角度(没有连接形状)
				if(xDistance >= yDistance){
					//如果宽大于高，连接线整体方向为水平
					var half = (to.x - from.x) / 2;
					points.push({x: from.x + half, y: from.y});
					points.push({x: from.x + half, y: to.y});
				}else{
					//否则为垂直
					var half = (to.y - from.y) / 2;
					points.push({x: from.x, y: from.y + half});
					points.push({x: to.x, y: from.y + half});
				}
			}
		}else if(linker.linkerType == "curve"){
			var from = linker.from;
			var to = linker.to;
			var distance = this.measureDistance(from, to);
			var cDistance = distance * 0.4; //控制点的距离，等于起始点距离的1/5
			/**
			 * 获取控制点坐标
			 */
			function getControlPoint(point, another){
				if(point.id != null){
					return {
						x: point.x - cDistance * Math.cos(point.angle),
						y: point.y - cDistance * Math.sin(point.angle)
					};
				}else{
					var yDistance = Math.abs(point.y - another.y);
					var xDiatance = Math.abs(point.x - another.x);
					var curveAngle = Math.atan(yDistance / xDiatance);
					var result = {};
					if(point.x <= another.x){
						result.x = point.x + cDistance * Math.cos(curveAngle);
					}else{
						result.x = point.x - cDistance * Math.cos(curveAngle);
					}
					if(point.y <= another.y){
						result.y = point.y + cDistance * Math.sin(curveAngle);
					}else{
						result.y = point.y - cDistance * Math.sin(curveAngle);
					}
					return result;
				}
			}
			points.push(getControlPoint(from, to));
			points.push(getControlPoint(to, from));
		}
		return points;
	},
	/**
	 * 获取连接线上的点
	 * @param {} linker
	 * @return {}
	 */
	getLinkerLinePoints: function(linker){
		var points = [];
		if(linker.linkerType != "curve"){
			//当是直线或曲线时，判断是否相交
			points.push(linker.from);
			points = points.concat(linker.points);
		}else{
			//当连接线是曲线时的判断逻辑
			//把曲线划分成N根直线
			var step = 0.05;
			var t = 0;
			while(t <= 1){
				var p = {
					x: (1-t)*(1-t)*(1-t)*linker.from.x + 3*(1-t)*(1-t)*t*linker.points[0].x + 3*(1-t)*t*t*linker.points[1].x + t*t*t*linker.to.x,
					y: (1-t)*(1-t)*(1-t)*linker.from.y + 3*(1-t)*(1-t)*t*linker.points[0].y + 3*(1-t)*t*t*linker.points[1].y + t*t*t*linker.to.y
				}
				points.push(p);
				t += step;
			}
		}
		points.push(linker.to);
		return points;
	},
	/**
	 * 获取连接线的边界
	 * @param {} linker
	 */
	getLinkerBox: function(linker){
		var points = this.getLinkerLinePoints(linker);
		var minX = points[0].x;
		var minY = points[0].y;
		var maxX = points[0].x;
		var maxY = points[0].y;
		for(var i = 0; i < points.length; i++){
			var point = points[i];
			if(point.x < minX){
				minX = point.x;
			}else if(point.x > maxX){
				maxX = point.x;
			}
			if(point.y < minY){
				minY = point.y;
			}else if(point.y > maxY){
				maxY = point.y;
			}
		}
		var box = {
			x: minX,
			y: minY,
			w: maxX - minX,
			h: maxY - minY
		}
		return box;
	},
	/**
	 * 获取形状的边界
	 */
	getShapeBox: function(shape){
		var props = shape.props;
		var angle = shape.props.angle;
		return this.getRotatedBox(props, angle);
	},
	/**
	 * 获取一个矩形旋转一定角度后的边界容器
	 * @param {} pos 控制器的坐标信息{x, y, w, h}
	 * @param {} angle 旋转角度
	 * @param {} center 旋转围绕的中心点，选填，如果不设置，默认人为pos中心点
	 */
	getRotatedBox: function(pos, angle, center){
		if(angle == 0){
			return pos;
		}else{
			//没有设置中心点，取形状的中心点
			if(!center){
				center = {
					x: pos.x + pos.w/2,
					y: pos.y + pos.h/2
				};
			}
			var p1 = this.getRotated(center, {x: pos.x, y: pos.y}, angle);
			var p2 = this.getRotated(center, {x: pos.x + pos.w, y: pos.y}, angle);
			var p3 = this.getRotated(center, {x: pos.x + pos.w, y: pos.y + pos.h}, angle);
			var p4 = this.getRotated(center, {x: pos.x, y: pos.y + pos.h}, angle);
			var minX = Math.min(p1.x, p2.x, p3.x, p4.x);
			var maxX = Math.max(p1.x, p2.x, p3.x, p4.x);
			var minY = Math.min(p1.y, p2.y, p3.y, p4.y);
			var maxY = Math.max(p1.y, p2.y, p3.y, p4.y);
			return {
				x: minX,
				y: minY,
				w: maxX - minX,
				h: maxY - minY
			};
		}
	},
	/**
	 * 获取一个点围绕某一个点旋转一定角度后的坐标
	 * @param {} center 中心点、固定点
	 * @param {} point 被旋转的点
	 * @param {} angle 旋转的角度
	 */
	getRotated: function(center, point, angle){
		//先得到两点的距离，即圆形运动的半径
		var r = this.measureDistance(center, point);
		if(r == 0 || angle == 0){
			//半径为0，则两点共点，不计算
			return point;
		}
		//获取此点与过中心的垂直线的角度
		var pointAngle = Math.atan(Math.abs(point.x - center.x) / Math.abs(center.y - point.y));
		if(point.x >= center.x && point.y >= center.y){
			pointAngle = Math.PI - pointAngle;
		}else if(point.x <= center.x && point.y >= center.y){
			pointAngle = Math.PI + pointAngle;
		}else if(point.x <= center.x && point.y <= center.y){
			pointAngle = Math.PI*2 - pointAngle;
		}
		pointAngle = pointAngle % (Math.PI*2);
		//计算相对于过中心的垂直线的旋转角度
		var rotateAngle = (pointAngle + angle) % (Math.PI*2);
		var result = {
			x: center.x + Math.sin(rotateAngle)*r,
			y: center.y - Math.cos(rotateAngle)*r
		};
		return result;
	},
	/**
	 * 获取图形的锚点在连接线上的集合
	 * @param {} shape
	 */
	getShapeAnchorInLinker: function(shape){
		var anchors = shape.getAnchors();
		var anchorPoints = [];
		var center = {x: shape.props.x + shape.props.w/2, y: shape.props.y + shape.props.h/2};
		for ( var ai = 0; ai < anchors.length; ai++) {
			var an = anchors[ai];
			var point = {
				x: an.x + shape.props.x,
				y: an.y + shape.props.y
			};
			var rotated = this.getRotated(center, point, shape.props.angle);
			anchorPoints.push(rotated);
		}
		var result = [];
		var radius = 2;
		for(var i = Model.orderList.length - 1; i >= 0; i--){
			//先循环所有的图形，拿到Linker，逐一进行判断
			var id = Model.orderList[i].id;
			var modelShape = Model.getShapeById(id);
			if(modelShape.name != "linker"){
				continue;
			}
			var linker = modelShape;
			var item = null;
			//先判断是否有锚点在连接线的端点上，前提是此端点未连接形状
			radius = 3;
			for ( var ai = 0; ai < anchorPoints.length; ai++) {
				var anchorPoint = anchorPoints[ai];
				var rect = {x: anchorPoint.x - radius, y: anchorPoint.y - radius, w: radius * 2, h: radius * 2};
				if(linker.from.id == null && this.pointInRect(linker.from.x, linker.from.y, rect)){
					item = {linker: linker, anchors: [anchorPoint], type: "from"};
					break;
				}
				if(linker.to.id == null && this.pointInRect(linker.to.x, linker.to.y, rect)){
					item = {linker: linker, anchors: [anchorPoint], type: "to"};
					break;
				}
			}
			radius = 2;
			if(item == null){
				//如果没有锚点在连接线的端点上
				//再判断是否有锚点在连接线的线上
				for ( var ai = 0; ai < anchorPoints.length; ai++) {
					var anchorPoint = anchorPoints[ai];
					var inLinker = Utils.pointInLinker(anchorPoint, linker, radius);
					if(inLinker > -1){
						//此锚点在连接线上
						if(item == null){
							item = {linker: linker, anchors: [], type: "line"};
						}
						item.anchors.push(anchorPoint);
					}
				}
			}
			if(item != null){
				result.push(item);
			}
		}
		return result;
	},
	/**
	 * 获取连接线端点的角度，计算是线自身，用于绘制箭头
	 * @param {} linker
	 * @param {} pointType
	 * @return {}
	 */
	getEndpointAngle: function(linker, pointType){
		var point;
		if(pointType == "from"){
			point = linker.from;
		}else{
			point = linker.to;
		}
		var last; //连线的最后一点，以此点和端点来绘制箭头
		if(linker.linkerType == "normal"){
			if(pointType == "from"){
				last = linker.to;
			}else{
				last = linker.from;
			}
		}else if(linker.linkerType == "broken"){
			if(pointType == "from"){
				last = linker.points[0];
			}else{
				last = linker.points[linker.points.length - 1];
			}
		}else{
			var arrowLength = 12;
			var t;
			var distance = Utils.measureDistance(linker.from, linker.to);
			if(pointType == "from"){
				t = arrowLength / distance;
			}else{
				t = 1 - arrowLength / distance;
			}
			last = {
				x: (1-t)*(1-t)*(1-t)*linker.from.x + 3*(1-t)*(1-t)*t*linker.points[0].x + 3*(1-t)*t*t*linker.points[1].x + t*t*t*linker.to.x,
				y: (1-t)*(1-t)*(1-t)*linker.from.y + 3*(1-t)*(1-t)*t*linker.points[0].y + 3*(1-t)*t*t*linker.points[1].y + t*t*t*linker.to.y
			}
		}
		return this.getAngle(last, point);
	},
	/**
	 * 获取两点的角度
	 * @param {} last
	 * @param {} point
	 */
	getAngle: function(last, point){
		var pointAngle = Math.atan(Math.abs(last.y - point.y)/Math.abs(last.x - point.x)); //线的角度
		if(point.x <= last.x && point.y > last.y){
			pointAngle = Math.PI - pointAngle;
		}else if(point.x < last.x && point.y <= last.y){
			pointAngle = Math.PI + pointAngle;
		}else if(point.x >= last.x && point.y < last.y){
			pointAngle = Math.PI*2 - pointAngle;
		}
		return pointAngle;
	},
	/**
	 * 获取较深一级的颜色
	 * @param {} rgbStr r,g,b
	 * @return {}
	 */
	getDarkerColor: function(rgbStr, change){
		if(!change){
			change = 13;
		}
		var rgb = rgbStr.split(",");
		var r = parseInt(rgb[0]);
		var g = parseInt(rgb[1]);
		var b = parseInt(rgb[2]);
		var newR = Math.round(r - r/255 * change);
		if(newR < 0){
			newR = 0;
		}
		var newG = Math.round(g - g/255 * change);
		if(newG < 0){
			newG = 0;
		}
		var newB = Math.round(b - b/255 * change);
		if(newB < 0){
			newB = 0;
		}
		return newR + "," + newG + "," + newB;
	},
	/**
	 * 获取更深一级的颜色
	 * @param {} rgbStr r,g,b
	 * @return {}
	 */
	getDarkestColor: function(rgbStr){
		return this.getDarkerColor(rgbStr, 26);
	},
	/**
	 * 把一个对象的数值属性缩放
	 */
	toScale: function(obj){
		var result = {};
		for(var key in obj){
			result[key] = obj[key]
			if(typeof obj[key] == "number"){
				result[key] = result[key].toScale();
			}
		}
		return result;
	},
	/**
	 * 把一个对象的数值属性按缩放比例恢复
	 */
	restoreScale: function(obj){
		var result = {};
		for(var key in obj){
			result[key] = obj[key]
			if(typeof obj[key] == "number"){
				result[key] = result[key].restoreScale();
			}
		}
		return result;
	},
	/**
	 * 获取选中图形以外的连接线
	 */
	getOutlinkers: function(shapes){
		var outlinkers = [];
		var outlinkerIds = [];
		for(var i = 0; i < shapes.length; i++){
			var shape = shapes[i];
			if(shape.name != "linker"){
				//从linkerMap中取到形状上的连接线
				var linkerIds = Model.getShapeLinkers(shape.id);
				if(linkerIds && linkerIds.length > 0){
					for(var index = 0; index < linkerIds.length; index++){
						var id = linkerIds[index];
						if(!this.isSelected(id) && outlinkerIds.indexOf(id) < 0){
							//只获取未选中的
							outlinkers.push(Model.getShapeById(id));
							outlinkerIds.push(id);
						}
					}
				}
			}
		}
		return outlinkers;
	},
	/**
	 * 获取图形的父级、子级、兄弟图形（未选中的）
	 * @param {} shapes
	 * @return {}
	 */
	getFamilyShapes: function(shapes){
		var familyShapes = [];
		for(var i = 0; i < shapes.length; i++){
			var shape = shapes[i];
			if(shape.name != "linker"){
				if(shape.parent){
					var parent = Model.getShapeById(shape.parent);
					if(!Utils.isSelected(shape.parent)){
						//父图形
						familyShapes.push(parent);
					}
					//兄弟图形
					var brothers = this.getChildrenShapes(parent);
					familyShapes = familyShapes.concat(brothers);
				}
				//子级的
				var childrenShapes = this.getChildrenShapes(shape);
				familyShapes = familyShapes.concat(childrenShapes);
			}
		}
		return familyShapes;
	},
	/**
	 * 获取图形子级的图形（未选中的）
	 * @param {} shape
	 */
	getChildrenShapes: function(shape){
		var childrenShapes = [];
		if(shape.children && shape.children.length > 0){
			for (var i = 0; i < shape.children.length; i++) {
				var childId = shape.children[i];
				if(!Utils.isSelected(childId)){
					childrenShapes.push(Model.getShapeById(childId));
				}
			}
		}
		return childrenShapes;
	},
	/**
	 * 判断两个图形是否是家族图形
	 * @param {} shape1
	 * @param {} shape2
	 */
	isFamilyShape: function(shape1, shape2){
		if(shape1.parent == shape2.id){
			return true;
		}else if(shape1.id == shape2.parent){
			return true;
		}else if(shape1.parent && shape1.parent == shape2.parent){
			return true;
		}
		return false;
	},
	/**
	 * 获取容器图形中包含的图形（未选中的）
	 * @param {} shapes
	 */
	getContainedShapes: function(shapes){
		var containedShapes = [];
		var containedIds = [];
		for(var i = 0; i < shapes.length; i++){
			var shape = shapes[i];
			if(shape.name != "linker" && shape.attribute && shape.attribute.container){
				var shapeContained = getContained(shape);
				containedShapes = containedShapes.concat(shapeContained);
			}
		}
		/**
		 * 获取一个容器图形包含的图形
		 */
		function getContained(shape){
			var contained = [];
			for(var i = Model.orderList.length - 1; i >= 0; i--){
				var shapeId = Model.orderList[i].id;
				//不是自己，并且没有选中，并且不是容器
				if(shape.id != shapeId && !Utils.isSelected(shapeId) && containedIds.indexOf(shapeId) < 0){
					var testShape = Model.getShapeById(shapeId);
					//并且不是容器
					if(!testShape.attribute || typeof testShape.attribute.container == "undefined" || testShape.attribute.container == false){
						//并且不是家族图形
						if(!Utils.isFamilyShape(testShape, shape)){
							//被判断图形的中心为依据
							var rotatedProps = Utils.getShapeBox(testShape);
							if(Utils.rectInRect(rotatedProps, shape.props)){
								contained.push(testShape);
								containedIds.push(shapeId);
							}
						}
					}
				}
			}
			return contained;
		}
		return containedShapes;
	},
	/**
	 * 获取BPMN吸附的图形（未选中的）
	 */
	getAttachedShapes: function(shapes){
		var ids = [];
		for(var i = 0; i < shapes.length; i++){
			ids.push(shapes[i].id);
		}
		var attachedShapes = [];
		for(var i = 0; i < shapes.length; i++){
			var shape = shapes[i];
			if(shape.groupName == "task" || shape.groupName == "callActivity" || shape.groupName == "subProcess"){
				var attached = [];
				for(var j = Model.orderList.length - 1; j >= 0; j--){
					var shapeId = Model.orderList[j].id;
					var testShape = Model.getShapeById(shapeId);
					if(testShape.attachTo == shape.id && !Utils.isSelected(shapeId) && ids.indexOf(shapeId) < 0){
						attached.push(testShape);
					}
				}
				attachedShapes = attachedShapes.concat(attached);
			}
		}
		return attachedShapes;
	},
	/**
	 * 复制一个对象
	 * @param {} obj
	 */
	copy: function(obj){
		return $.extend(true, {}, obj);
	},
	/**
	 * 排列图形的子图形
	 * 创建子图形，缩放子图形，删除子图形时会用到
	 */
	rangeChildren: function(shape){
		var changed = [];
		if(shape.children && shape.children.length > 0){
			if(shape.name == "verticalPool"){
				var changeChild = [];
				var serparators = [];
				for (var i = 0; i < shape.children.length; i++) {
					var childId = shape.children[i];
					var child = Model.getShapeById(childId);
					if(child.name == "horizontalSeparator"){
						serparators.push(child);
					}else{
						changeChild.push(child);
					}
				}
				//进行排序
				changeChild.sort(function(a, b){
					return a.props.x - b.props.x;
				});
				var x = shape.props.x;
				for (var i = 0; i < changeChild.length; i++) {
					var child = changeChild[i];
					child.props.x = x;
					Designer.painter.renderShape(child);
					changed.push(child);
					x += child.props.w;
				}
				//排列分隔符
				serparators.sort(function(a, b){
					return a.props.y - b.props.y;
				});
				var y = shape.props.y + 40;
				for (var i = 0; i < serparators.length; i++) {
					var child = serparators[i];
					var bottom = child.props.y + child.props.h;
					child.props.w = shape.props.w;
					child.props.y = y;
					var h = bottom - y;
					child.props.h = h;
					Designer.painter.renderShape(child);
					changed.push(child);
					y += h;
				}
			}else if(shape.name == "horizontalPool"){
				var changeChild = [];
				var serparators = [];
				for (var i = 0; i < shape.children.length; i++) {
					var childId = shape.children[i];
					var child = Model.getShapeById(childId);
					if(child.name == "verticalSeparator"){
						serparators.push(child);
					}else{
						changeChild.push(child);
					}
				}
				//进行排序
				changeChild.sort(function(a, b){
					return a.props.y - b.props.y;
				});
				var y = shape.props.y;
				for (var i = 0; i < changeChild.length; i++) {
					var child = changeChild[i];
					child.props.y = y;
					Designer.painter.renderShape(child);
					changed.push(child);
					y += child.props.h;
				}
				//排列分隔符
				serparators.sort(function(a, b){
					return a.props.x - b.props.x;
				});
				var x = shape.props.x + 40;
				for (var i = 0; i < serparators.length; i++) {
					var child = serparators[i];
					var right = child.props.x + child.props.w;
					child.props.h = shape.props.h;
					child.props.x = x;
					var w = right - x;
					child.props.w = w;
					Designer.painter.renderShape(child);
					changed.push(child);
					x += w;
				}
			}
		}
		return changed;
	},
	/**
	 * 绝对坐标转为相对坐标
	 * @param {} pageX
	 * @param {} pageY
	 * @param {} related
	 * @return {}
	 */
	getRelativePos: function(pageX, pageY, related){
		var relatedOffset = related.offset();
		if(relatedOffset == null){
			relatedOffset = {left: 0, top: 0};
		}
		return {
			x: pageX - relatedOffset.left + related.scrollLeft(),
			y: pageY - relatedOffset.top + related.scrollTop()
		};
	}
};

/**
 * 渐变帮助类
 * @type {}
 */
var GradientHelper = {
	/**
	 * 创建渐变
	 * @param {} shape
	 * @param {} ctx
	 */
	createLinearGradient: function(shape, ctx, fillStyle){
		var p = shape.props;
		//线性渐变
		var begin;
		var end;
		var angle;
		if(p.w > p.h){
			begin = {x: 0, y: p.h/2};
			end = {x: p.w, y: p.h/2};
			angle = (fillStyle.angle + Math.PI/2) % (Math.PI*2);
		}else{
			begin = {x: p.w/2, y: 0};
			end = {x: p.w/2, y: p.h};
			angle = fillStyle.angle;
		}
		if(angle != 0){
			var center = {x: p.w/2, y: p.h/2};
			begin = Utils.getRotated(center, begin, angle);
			end = Utils.getRotated(center, end, angle);
			if(begin.x < 0){
				begin.x = 0;
			}
			if(begin.x > shape.props.w){
				begin.x = shape.props.w;
			}
			if(begin.y < 0){
				begin.y = 0;
			}
			if(begin.y > shape.props.h){
				begin.y = shape.props.h;
			}
			if(end.x < 0){
				end.x = 0;
			}
			if(end.x > shape.props.w){
				end.x = shape.props.w;
			}
			if(end.y < 0){
				end.y = 0;
			}
			if(end.y > shape.props.h){
				end.y = shape.props.h;
			}
		}
		var gradient = ctx.createLinearGradient(begin.x, begin.y, end.x, end.y);
		gradient.addColorStop(0, "rgb(" + fillStyle.beginColor + ")");
		gradient.addColorStop(1,"rgb(" + fillStyle.endColor + ")");
		return gradient;
	},
	/**
	 * 创建径向渐变
	 * @param {} shape
	 * @param {} ctx
	 */
	createRadialGradient: function(shape, ctx, fillStyle){
		var p = shape.props;
		var length = p.h;
		if(p.w < p.h){
			length = p.w;
		}
		var gradient = ctx.createRadialGradient(p.w/2, p.h/2, 10, p.w/2, p.h/2, length*fillStyle.radius);
		gradient.addColorStop(0, "rgb(" + fillStyle.beginColor + ")");
		gradient.addColorStop(1,"rgb(" + fillStyle.endColor + ")");
		return gradient;
	},
	/**
	 * 获取较淡的颜色
	 */
	getLighterColor: function(rgbStr){
		var change = 60;
		var rgb = rgbStr.split(",");
		var r = parseInt(rgb[0]);
		var g = parseInt(rgb[1]);
		var b = parseInt(rgb[2]);
		var newR = Math.round(r + (255-r)/255 * change);
		if(newR > 255){
			newR = 255;
		}
		var newG = Math.round(g + (255-g)/255 * change);
		if(newG > 255){
			newG = 255;
		}
		var newB = Math.round(b + (255-b)/255 * change);
		if(newB > 255){
			newB = 255;
		}
		return newR + "," + newG + "," + newB;
	},
	/**
	 * 获取较深的颜色
	 * @param {} rgbStr
	 * @return {}
	 */
	getDarkerColor: function(rgbStr){
		var change = 60;
		var rgb = rgbStr.split(",");
		var r = parseInt(rgb[0]);
		var g = parseInt(rgb[1]);
		var b = parseInt(rgb[2]);
		var newR = Math.round(r - r/255 * change);
		if(newR < 0){
			newR = 0;
		}
		var newG = Math.round(g - g/255 * change);
		if(newG < 0){
			newG = 0;
		}
		var newB = Math.round(b - b/255 * change);
		if(newB < 0){
			newB = 0;
		}
		return newR + "," + newG + "," + newB;
	}
};

/**
 * 消息源对象
 * @type {}
 */
var MessageSource = {
	/**
	 * 是否打开批处理
	 * @type {Boolean}
	 */
	batchSize: 0,
	/**
	 * 消息批处理对象
	 * @type {}
	 */
	messages: [],
	/**
	 * 消息是否进入撤销堆栈
	 * @type {Boolean}
	 */
	withUndo: true,
	/**
	 * 在发生某些变化时，是否添加消息
	 * @type {Boolean}
	 */
	withMessage: true,
	/**
	 * 在发生某些变化时，是否修改Dock状态
	 * @type {Boolean}
	 */
	withDock: true,
	/**
	 * 事件堆栈，即撤销堆栈，后进先出
	 * @type {}
	 */
	undoStack: {
		stack: [],
		/**
		 * 往撤销堆栈中添加消息
		 * @param {} ele
		 * @param Boolean clearRedo 是否清空恢复堆栈，新的消息都会清空；只有当进行恢复时，会像撤销堆栈中添加消息，此情况下不清空恢复堆栈
		 */
		push: function(ele, clearRedo){
			this.stack.push(ele);
			if(typeof clearRedo == "undefined"){
				clearRedo = true;
			}
			//撤销堆栈入栈，清空恢复堆栈
			if(clearRedo){
				MessageSource.redoStack.stack = [];
			}
			//抛出堆栈变化事件
			Designer.events.push("undoStackChanged", this.stack.length);
		},
		pop: function(){
			var stackLength = this.stack.length;
			if(stackLength == 0){
				return null;
			}
			var messages = this.stack[stackLength - 1];
			//删除
			this.stack.splice(stackLength - 1, 1);
			//压入恢复堆栈
			MessageSource.redoStack.push(messages);
			//抛出堆栈变化事件
			Designer.events.push("undoStackChanged", this.stack.length);
			return messages;
		}
	},
	/**
	 * 恢复队列，后进先出
	 * @type {}
	 */
	redoStack: {
		stack: [],
		push: function(ele){
			this.stack.push(ele);
			//抛出堆栈变化事件
			Designer.events.push("redoStackChanged", this.stack.length);
		},
		pop: function(){
			var stackLength = this.stack.length;
			if(stackLength == 0){
				return null;
			}
			var messages = this.stack[stackLength - 1];
			//删除
			this.stack.splice(stackLength - 1, 1);
			//压入撤销堆栈，不清空恢复堆栈
			MessageSource.undoStack.push(messages, false);
			//抛出堆栈变化事件
			Designer.events.push("redoStackChanged", this.stack.length);
			return messages;
		}
	},
	/**
	 * 开始批处理
	 */
	beginBatch: function(){
		this.batchSize++;
	},
	/**
	 * 提交批处理
	 */
	commit: function(){
		this.batchSize--;
		this.submit();
	},
	/**
	 * 提交消息
	 */
	submit: function(){
		if(this.batchSize == 0 && this.messages.length != 0){
			//更新Dock窗口
			if(this.withDock){
				Dock.update(true);
			}
			if(this.withMessage == false){
				//如果不需要发送消息，比如在接收别人发来的消息时
				this.messages = [];
				return;
			}
			//当没有活动的批处理时，才提交
			if(this.withUndo){
				//将事件压入撤销堆栈
				this.undoStack.push(this.messages);			
			}
			if(chartId != ""){
				var messagesStr = JSON.stringify(this.messages);
				if(role != "trial"){
					$("#saving_tip").text("Saving...");
				}
				var msgObj = {
					action: "command",
					messages: messagesStr,
					ignore: "messages",
					name: userName
				};
				CLB.send(msgObj, function(){
					if(role != "trial"){
						$("#saving_tip").text("All changes saved");
					}
				});
			}
			this.messages = [];
		}
	},
	/**
	 * 发送消息
	 */
	send: function(action, content){
		this.messages.push({action: action, content: content});
		this.submit();
	},
	/**
	 * 接收消息，一次接收多个消息
	 */
	receive: function(messages){
		this.doWithoutMessage(function(){
			//在不需要抛出消息的环境下执行
			MessageSource.executeMessages(messages, true);
			Utils.showLinkerControls();
			Utils.showLinkerCursor();
		});
	},
	/**
	 * 执行撤销
	 */
	undo: function(){
		var messages = this.undoStack.pop();
		if(messages == null){
			return;
		}
		this.doWithoutUndo(function(){
			MessageSource.beginBatch();
			for (var i = 0; i < messages.length; i++) {
				var msg = messages[i];
				if(msg.action == "create"){
					//对于创建，撤销时，执行删除
					Utils.unselect();
					Model.remove(msg.content, false);
				}else if(msg.action == "update"){
					//对于更新，撤销时，执行反更新
					var shapes = msg.content.shapes;
					Model.updateMulti(shapes);
					for (var index = 0; index < shapes.length; index++) {
						var undoShape = shapes[index];
						Designer.painter.renderShape(undoShape);
					}
					//重新选中
					var ids = Utils.getSelectedIds();
					Utils.unselect();
					Utils.selectShape(ids, false);
				}else if(msg.action == "remove"){
					//对于删除，撤销时，执行添加
					var shapes = msg.content;
					Model.addMulti(shapes);
					for (var index = 0; index < shapes.length; index++) {
						var undoShape = shapes[index];
						Designer.painter.renderShape(undoShape);
					}
				}else if(msg.action == "updatePage"){
					//对于更新页面样式，撤销时，执行反更新
					Model.updatePage(msg.content.page);
				}
			}
			MessageSource.commit();
		});
	},
	/**
	 * 执行恢复
	 */
	redo: function(){
		var messages = this.redoStack.pop();
		if(messages == null){
			return;
		}
		this.doWithoutUndo(function(){
			//在不需要添加undo堆栈的环境下执行
			MessageSource.executeMessages(messages, false);
		});
	},
	/**
	 * 执行一组消息，会用于恢复撤销、处理接收到的后台消息
	 * @param {} messages
	 */
	executeMessages: function(messages, initFunction){
		MessageSource.beginBatch();
		for (var i = 0; i < messages.length; i++) {
			var msg = messages[i];
			if(msg.action == "create"){
				var shapes = msg.content;
				if(initFunction){
					for (var index = 0; index < shapes.length; index++) {
						var undoShape = shapes[index];
						if(undoShape.name != "linker"){
							Schema.initShapeFunctions(undoShape);
						}
					}
				}
				Model.addMulti(shapes);
				for (var index = 0; index < shapes.length; index++) {
					var undoShape = shapes[index];
					Designer.painter.renderShape(undoShape);
				}
				Model.build();
			}else if(msg.action == "update"){
				var updates = msg.content.updates;
				for (var index = 0; index < updates.length; index++) {
					var update = updates[index];
					if(initFunction && update.name != "linker"){
						Schema.initShapeFunctions(update);
					}
					Designer.painter.renderShape(update);
				}
				Model.updateMulti(updates);
				//重新选中
				var ids = Utils.getSelectedIds();
				Utils.unselect();
				Utils.selectShape(ids);
			}else if(msg.action == "remove"){
				Utils.unselect();
				Model.remove(msg.content);
			}else if(msg.action == "updatePage"){
				//对于更新页面样式，撤销时，执行反更新
				Model.updatePage(msg.content.update);
			}
		}
		MessageSource.commit();
	},
	/**
	 * 在不需要撤销的环境下执行修改
	 */
	doWithoutUndo: function(func){
		this.withUndo = false;
		func();
		this.withUndo = true;
	},
	/**
	 * 在不需要发送消息的环境下执行修改
	 */
	doWithoutMessage: function(func){
		this.withMessage = false;
		func();
		this.withMessage = true;
	},
	/**
	 * 在不需要修改Dock的环境下执行修改
	 * @param {} func
	 */
	doWithoutUpdateDock: function(func){
		this.withDock = false;
		func();
		this.withDock = true;
	}
};

/**
 * 给数值类型扩展
 */
Number.prototype.toScale = function(){
	//把数值按缩放比例计算
	return this * Designer.config.scale;
};

Number.prototype.restoreScale = function(){
	//把数值按缩放比例恢复
	return this / Designer.config.scale;
};


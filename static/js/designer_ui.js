/**
* 用户界面JS
*/

var UI = {
	init: function(){
		//修改标题
		$(".diagram_title").bind("click", function(){
			if($(this).hasClass("readonly")){
				return;
			}
			var title = $(this).text();
			$(this).hide();
			$("#title_container").append("<input type='text'/>");
			$("#title_container").children("input").val(title).select();
			$("#title_container").children("input").bind("blur", function(){
				changeTitle();
			}).bind("keydown", function(e){
				if(e.keyCode == 13){
					changeTitle();
				}
			});
		});
		function changeTitle(){
			var newTitle = $.trim($("#title_container").children("input").val());
			var oldTitle = $(".diagram_title").text();
			if(newTitle != oldTitle && chartId != ""){
				var msgObj = {
					action: "changeTitle",
					title: newTitle
				};
				CLB.send(msgObj);
			}
			var title = newTitle != "" ? newTitle : oldTitle;
			$("title").text(title + " - ProcessOn");
			$(".diagram_title").text(title).show();
			$("#title_container").children("input").remove();
		}
		/** ############################Toolbar列表############################ */
		//撤销
		$("#bar_undo").button({
			onClick: function(){
				MessageSource.undo();
			}
		});
		//恢复
		$("#bar_redo").button({
			onClick: function(){
				MessageSource.redo();
			}
		});
		//格式刷
		$("#bar_brush").button({
			onClick: function(){
				if($("#bar_brush").button("isSelected")){
					//取消格式刷
					$("#bar_brush").button("unselect");
					$("#designer_op_help").hide();
					$(document).unbind("keydown.cancelbrush");
					Utils.selectCallback = null;
				}else{
					Designer.clipboard.brush();
				}
			}
		});
		//字体
		$("#bar_font_family").button({
			onMousedown: function(){
				$("#font_list").dropdown({
					target: $("#bar_font_family"),
					onSelect: function(item){
						var font = item.text();
						Designer.setFontStyle({fontFamily: font});
						$("#bar_font_family").button("setText", font);
					}
				});
				//选中
				var family = $("#bar_font_family").text().trim();
				$("#font_list").children().each(function(){
					if($(this).text() == family){
						$("#font_list").dropdown("select", $(this));
						return false;
					}
				});
			}
		});
		//字号
		$("#bar_font_size").spinner({
			min: 12,
			max: 100,
			step: 1,
			unit: "px",
			onChange: function(val){
				Designer.setFontStyle({size: val});
			}
		});
		$("#bar_font_size").spinner("setValue", "13px");
		//加粗
		$("#bar_font_bold").button({
			onClick: function(){
				var bold = !$("#bar_font_bold").button("isSelected");
				Designer.setFontStyle({bold: bold});
				$("#bar_font_bold").toggleClass("selected");
			}
		});
		//斜体
		$("#bar_font_italic").button({
			onClick: function(){
				var italic = !$("#bar_font_italic").button("isSelected");
				Designer.setFontStyle({italic: italic});
				$("#bar_font_italic").toggleClass("selected");
			}
		});
		//下划线
		$("#bar_font_underline").button({
			onClick: function(){
				var underline = !$("#bar_font_underline").button("isSelected");
				Designer.setFontStyle({underline: underline});
				$("#bar_font_underline").toggleClass("selected");
			}
		});
		//字体颜色
		$("#bar_font_color").button({
			onMousedown: function(){
				var color = $("#bar_font_color").button("getColor");
				$.colorpicker({
					target: $("#bar_font_color"),
					onSelect: function(color){
						Designer.setFontStyle({color: color});
						$("#bar_font_color").button("setColor", color)
					},
					color: color
				});
			}
		});
		//文本对齐
		$("#bar_font_align").button({
			onMousedown: function(){
				$("#font_align_list").dropdown({
					target: $("#bar_font_align"),
					onSelect: function(item){
						var align = {};
						align[item.attr("cate")] = item.attr("al");
						Designer.setFontStyle(align);
					}
				});
			}
		});
		//填充
		$("#bar_fill").button({
			onMousedown: function(){
				var color = $("#bar_fill").button("getColor");
				$.colorpicker({
					target: $("#bar_fill"),
					onSelect: function(color){
						Designer.setFillStyle({type: "solid", color: color});
						$("#bar_fill").button("setColor", color)
					},
					color: color,
					extend: "<div id='bar_fill_gradient' title='Gradient' class='toolbar_button active'><div class='ico gradient'></div></div><div id='bar_fill_img' title='Image...' class='toolbar_button active'><div class='ico ico_img'></div></div><div id='bar_fill_more' class='toolbar_button active'>More...</div>"
				});
				$("#bar_fill_gradient").unbind().bind("click", function(){
					Designer.setFillStyle({type: "gradient"});
					$("#color_picker").dropdown("close");
				});
				$("#bar_fill_img").unbind().bind("click", function(){
					UI.showImageSelect(function(fileId, w, h){
						Designer.setFillStyle({
							type: "image",
							fileId: fileId,
							imageW: w,
							imageH: h
						});
					});
					$("#color_picker").dropdown("close");
				});
				$("#bar_fill_more").unbind().bind("click", function(){
					Dock.showView("graphic");
					$("#color_picker").dropdown("close");
				});
			}
		});
		//线条颜色
		$("#bar_line_color").button({
			onMousedown: function(){
				var color = $("#bar_line_color").button("getColor");
				$.colorpicker({
					target: $("#bar_line_color"),
					onSelect: function(color){
						Designer.setLineStyle({lineColor: color});
						$("#bar_line_color").button("setColor", color)
					},
					color: color
				});
			}
		});
		//线条宽度
		$("#bar_line_width").button({
			onMousedown: function(){
				$("#line_width_list").dropdown({
					target: $("#bar_line_width"),
					onSelect: function(item){
						var width = parseInt(item.text());
						Designer.setLineStyle({lineWidth: width});
					}
				});
				//选中
				var width = Utils.getSelected()[0].lineStyle.lineWidth;
				$("#line_width_list").children().each(function(){
					if(parseInt($(this).text()) == width){
						$("#line_width_list").dropdown("select", $(this));
					}
				});
			}
		});
		//线条样式
		$("#bar_line_style").button({
			onMousedown: function(){
				$("#line_style_list").dropdown({
					target: $("#bar_line_style"),
					onSelect: function(item){
						var lineStyle = item.attr("line");
						Designer.setLineStyle({lineStyle: lineStyle});
					}
				});
				//选中
				var style = Utils.getSelected()[0].lineStyle.lineStyle;
				var item = $("#line_style_list").children("li[line="+style+"]");
				$("#line_style_list").dropdown("select", item);
			}
		});
		//连接线类型
		$("#bar_linkertype").button({
			onMousedown: function(){
				$("#line_type_list").dropdown({
					target: $("#bar_linkertype"),
					onSelect: function(item){
						var type = item.attr("tp");
						Designer.setLinkerType(type);
						var cls = item.children("div").attr("class");
						$("#bar_linkertype").children("div:eq(0)").attr("class", cls);
					}
				});
			}
		});
		//开始箭头
		$("#bar_beginarrow").button({
			onMousedown: function(){
				$("#beginarrow_list").dropdown({
					target: $("#bar_beginarrow"),
					onSelect: function(item){
						var arrow = item.attr("arrow");
						Designer.setLineStyle({beginArrowStyle: arrow});
						var cls = item.children("div").attr("class");
						$("#bar_beginarrow").children("div:eq(0)").attr("class", cls);
					}
				});
				//选中
				var style = Utils.getSelectedLinkers()[0].lineStyle.beginArrowStyle;
				var item = $("#beginarrow_list").children("li[arrow="+style+"]");
				$("#beginarrow_list").dropdown("select", item);
			}
		});
		//结束箭头
		$("#bar_endarrow").button({
			onMousedown: function(){
				$("#endarrow_list").dropdown({
					target: $("#bar_endarrow"),
					onSelect: function(item){
						var arrow = item.attr("arrow");
						Designer.setLineStyle({endArrowStyle: arrow});
						var cls = item.children("div").attr("class");
						$("#bar_endarrow").children("div:eq(0)").attr("class", cls);
					}
				});
				//选中
				var style = Utils.getSelectedLinkers()[0].lineStyle.endArrowStyle;
				var item = $("#endarrow_list").children("li[arrow="+style+"]");
				$("#endarrow_list").dropdown("select", item);
			}
		});
		//顶层底层
		$("#bar_front").button({
			onClick: function(){
				Designer.layerShapes("front");
			}
		});
		$("#bar_back").button({
			onClick: function(){
				Designer.layerShapes("back");
			}
		});
		//加解锁
		$("#bar_lock").button({
			onClick: function(){
				Designer.lockShapes();
			}
		});
		$("#bar_unlock").button({
			onClick: function(){
				Designer.unlockShapes();
			}
		});
		$("#bar_link").button({
			onClick: function(){
				UI.showInsertLink();
			}
		});
		/** ##############菜单列表############## */
		$("#menu_bar").children().bind("mousedown", function(e){
			var tar = $(this);
			showMenuBarList(tar);
			e.stopPropagation();
		});
		$("#menu_bar").children().bind("mouseenter", function(){
			var tar = $(this);
			if($("#ui_container").find(".options_menu:visible").length > 0){
				showMenuBarList(tar);
			}
		});
		
		function showMenuBarList(menuBar){
			var menuId = menuBar.attr("menu");
			//只读
			if(menuBar.hasClass("readonly")){
				return;
			}
			$("#" + menuId).dropdown({
				target: menuBar,
				onSelect: function(item){
					menuSelected(item);
				}
			});
			if(menuId == "bar_list_page"){
				var item = $("#bar_list_pagesize").children("li[w="+Model.define.page.width+"][h="+Model.define.page.height+"]");
				if(item.length > 0){
					$("#bar_list_pagesize").dropdown("select", item);
				}else{
					$("#bar_list_pagesize").dropdown("select", $("#page_size_custom"));
				}
				$("#page_size_w").spinner("setValue", Model.define.page.width + "px");
				$("#page_size_h").spinner("setValue", Model.define.page.height + "px");
				item = $("#bar_list_padding").children("li[p="+Model.define.page.padding+"]");
				$("#bar_list_padding").dropdown("select", item);
				item = $("#bar_list_gridsize").children("li[s="+Model.define.page.gridSize+"]");
				$("#bar_list_gridsize").dropdown("select", item);
				if(Model.define.page.showGrid){
					$("#bar_list_page").dropdown("select", $("#bar_list_page").children("li[ac=set_page_showgrid]")); 
				}else{
					$("#bar_list_page").dropdown("unselect", $("#bar_list_page").children("li[ac=set_page_showgrid]"));
				}
			}else if(menuId == "bar_list_view"){
				var item = $("#bar_list_view").children(".static[zoom='"+Designer.config.scale+"']");
				if(item.length){
					$("#bar_list_page").dropdown("select", item);
				}
			}
		}
		
		function menuSelected(item){
			var action = item.attr("ac");
			//编辑菜单
			if(action == "rename"){
				$(".diagram_title").trigger("click");
			}else if(action == "close"){
				window.location.href = "/diagraming/back?id=" + chartId;
			}else if(action == "saveAs"){
				UI.showSaveAs();
			}else if(action == "export"){
				$("#export_dialog").dlg();
			}else if(action == "undo"){
				MessageSource.undo();
			}else if(action == "redo"){
				MessageSource.redo();
			}else if(action == "cut"){
				Designer.clipboard.cut();
			}else if(action == "copy"){
				Designer.clipboard.copy();
			}else if(action == "paste"){
				Designer.clipboard.paste();
			}else if(action == "duplicate"){
				Designer.clipboard.duplicate();
			}else if(action == "brush"){
				Designer.clipboard.brush();
			}else if(action == "selectall"){
				Designer.selectAll();
			}else if(action == "delete"){
				Designer.op.removeShape();
			//视图缩放
			}else if(action == "zoom"){
				var zoom = item.attr("zoom");
				if(zoom == "in"){
					Designer.zoomIn();
				}else if(zoom == "out"){
					Designer.zoomOut();
				}else{
					var zoomScale = parseFloat(zoom);
					Designer.setZoomScale(zoomScale);
				}
			//插入
			}else if(action == "insert"){
				var insertType = item.attr("in");
				if(insertType == "text"){
					Designer.op.changeState("creating_free_text");
				}else if(insertType == "image"){
					UI.showImageSelect(function(fileId, w, h){
						UI.insertImage(fileId, w, h);
					});
				}else if(insertType == "line"){
					Designer.op.changeState("creating_free_linker");
				}
			//页面
			}else if(action == "set_page_size"){
				var w = parseInt(item.attr("w"));
				var h = parseInt(item.attr("h"));
				Designer.setPageStyle({width: w, height: h});
			}else if(action == "set_page_padding"){
				var p = parseInt(item.attr("p"));
				Designer.setPageStyle({padding: p})
			}else if(action == "set_page_showgrid"){
				if(item.menuitem("isSelected")){
					item.menuitem("unselect");
					Designer.setPageStyle({showGrid: false});
				}else{
					item.menuitem("select");
					Designer.setPageStyle({showGrid: true});
				}
			}else if(action == "set_page_gridsize"){
				var s = parseInt(item.attr("s"));
				Designer.setPageStyle({gridSize: s})
			}
			//排列
			else if(action == "front"){
				Designer.layerShapes("front");
			}else if(action == "back"){
				Designer.layerShapes("back");
			}else if(action == "forward"){
				Designer.layerShapes("forward");
			}else if(action == "backward"){
				Designer.layerShapes("backward");
			}else if(action == "align_shape"){
				var align = item.attr("al");
				Designer.alignShapes(align);
			}else if(action == "distribute_shape"){
				var type = item.attr("dis");
				Designer.distributeShapes(type);
			}else if(action == "match_size"){
				if(item.attr("custom")){
					Dock.showView("metric");
				}else{
					var type = {};
					var w = item.attr("w");
					var h = item.attr("h");
					if(w){
						type.w = w;
					}
					if(h){
						type.h = h;
					}
					Designer.matchSize(type);
				}
			}else if(action == "lock"){
				Designer.lockShapes();
			}else if(action == "unlock"){
				Designer.unlockShapes();
			}else if(action == "group"){
				Designer.group();
			}else if(action == "ungroup"){
				Designer.ungroup();
			}else if(action == "hotkey"){
				UI.showHotKey();
			}else if(action == "feedback"){
				UI.showFeedBack();
			}else if(action == "getting_started"){
				UI.gettingStart(); 
			}
		}
		$("#page_size_w").spinner({
			min: 200,
			unit: "px",
			step: 100,
			onChange: function(val){
				Designer.setPageStyle({width: val});
			}
		});
		$("#page_size_h").spinner({
			min: 200,
			unit: "px",
			step: 100,
			onChange: function(val){
				Designer.setPageStyle({height: val});
			}
		});
		//给设置页面背景色，放一个colorpicker
		var pickerHtml = $("#color_picker").html();
		var newPicker = $("<div class='menu color_picker extend_menu'>"+pickerHtml+"</div>").appendTo($("#bar_page_color"));
		newPicker.css("right", "-179px");
		newPicker.children(".color_items").children("div").unbind().bind("click", function(){
			var color = $(this).css("background-color");
			color = color.replace(/\s/g, "");
			color = color.substring(4, color.length - 1);
			Designer.setPageStyle({backgroundColor: color});
			$("#bar_list_page").dropdown("close");
		});
		//抛出事件，控制状态
		Designer.events.push("selectChanged", 0);
		Designer.events.push("clipboardChanged", 0);
		Designer.events.push("undoStackChanged", 0);
		Designer.events.push("redoStackChanged", 0);
	},
	/**
	 * 更新UI
	 */
	update: function(){
		var selectedIds = Utils.getSelectedIds();
		var count = selectedIds.length;
		var linkerIds = Utils.getSelectedLinkerIds();
		var linkerCount = linkerIds.length;
		var shapeIds = Utils.getSelectedShapeIds();
		var shapeCount = shapeIds.length;
		var lockedCount = Utils.getSelectedLockedIds().length;
		var groupCount = Utils.getSelectedGroups().length;
		//排列菜单
		var arrangeMenu = $("#bar_list_arrange");
		if(count == 0){
			$(".toolbar").find(".selected").removeClass("selected");
			//没有选中，让某些按钮失效
			if ($("#designer_op_help").is(":visible")) {
				$("#bar_brush").button("enable");
				$("#bar_brush").button("select");
			}else{
				$("#bar_brush").button("disable");
			}
			//字体
			$("#bar_font_family").button("disable");
			$("#bar_font_size").button("disable");
			$("#bar_font_bold").button("disable");
			$("#bar_font_italic").button("disable");
			$("#bar_font_underline").button("disable");
			$("#bar_font_color").button("disable");
			$("#bar_font_align").button("disable");
			//线条
			$("#bar_line_color").button("disable");
			$("#bar_line_width").button("disable");
			$("#bar_line_style").button("disable");
			//顶层底层
			$("#bar_front").button("disable");
			$("#bar_back").button("disable");
			//锁定
			$("#bar_lock").button("disable");
			//编辑菜单
			var editMenu = $("#bar_list_edit");
			editMenu.children("li[ac=cut]").menuitem("disable");
			editMenu.children("li[ac=copy]").menuitem("disable");
			editMenu.children("li[ac=duplicate]").menuitem("disable");
			editMenu.children("li[ac=brush]").menuitem("disable");
			editMenu.children("li[ac=delete]").menuitem("disable");
			//排列菜单
			arrangeMenu.children("li[ac=front]").menuitem("disable");
			arrangeMenu.children("li[ac=back]").menuitem("disable");
			arrangeMenu.children("li[ac=forward]").menuitem("disable");
			arrangeMenu.children("li[ac=backward]").menuitem("disable");
			arrangeMenu.children("li[ac=lock]").menuitem("disable");
		}else{
			//选中，让某些按钮激活
			$("#bar_brush").button("enable");
			if ($("#designer_op_help").is(":visible")) {
				$("#bar_brush").button("select");
			}
			$("#bar_font_family").button("enable");
			$("#bar_font_size").button("enable");
			$("#bar_font_bold").button("enable");
			$("#bar_font_italic").button("enable");
			$("#bar_font_underline").button("enable");
			$("#bar_font_color").button("enable");
			$("#bar_font_align").button("enable");
			//线条
			$("#bar_line_color").button("enable");
			$("#bar_line_width").button("enable");
			$("#bar_line_style").button("enable");
			//顶层底层
			$("#bar_front").button("enable");
			$("#bar_back").button("enable");
			//锁定
			$("#bar_lock").button("enable");
			//编辑菜单
			var editMenu = $("#bar_list_edit");
			editMenu.children("li[ac=cut]").menuitem("enable");
			editMenu.children("li[ac=copy]").menuitem("enable");
			editMenu.children("li[ac=duplicate]").menuitem("enable");
			editMenu.children("li[ac=brush]").menuitem("enable");
			editMenu.children("li[ac=delete]").menuitem("enable");
			//排列菜单
			arrangeMenu.children("li[ac=front]").menuitem("enable");
			arrangeMenu.children("li[ac=back]").menuitem("enable");
			arrangeMenu.children("li[ac=forward]").menuitem("enable");
			arrangeMenu.children("li[ac=backward]").menuitem("enable");
			arrangeMenu.children("li[ac=lock]").menuitem("enable");
			//设置Toolbar样式
			var shape = Model.getShapeById(selectedIds[0]);
			$("#bar_font_family").button("setText", shape.fontStyle.fontFamily);
			$("#bar_font_size").spinner("setValue", shape.fontStyle.size + "px");
			if(shape.fontStyle.bold){
				$("#bar_font_bold").button("select");
			}else{
				$("#bar_font_bold").button("unselect");
			}
			if(shape.fontStyle.italic){
				$("#bar_font_italic").button("select");
			}else{
				$("#bar_font_italic").button("unselect");
			}
			if(shape.fontStyle.underline){
				$("#bar_font_underline").button("select");
			}else{
				$("#bar_font_underline").button("unselect");
			}
			$("#bar_font_color").button("setColor", shape.fontStyle.color);
			$("#bar_line_color").button("setColor", shape.lineStyle.lineColor);
		}
		//通过图形的数量，判读是否可以填充
		if(shapeCount == 0){
			$("#bar_fill").button("disable");
		}else{
			$("#bar_fill").button("enable");
			var shape = Model.getShapeById(shapeIds[0]);
			//图形填充
			if(shape.fillStyle.type == "solid"){
				$("#bar_fill").button("setColor", shape.fillStyle.color);
			}else if(shape.fillStyle.type == "gradient"){
				$("#bar_fill").button("setColor", shape.fillStyle.endColor);
			}
		}
		if(shapeCount != 1){
			$("#bar_link").button("disable");
		}else{
			$("#bar_link").button("enable");
		}
		//通过连接线的数量，判断是否可以修改箭头等
		if(linkerCount == 0){
			$("#bar_linkertype").button("disable");
			$("#bar_beginarrow").button("disable");
			$("#bar_endarrow").button("disable");
		}else{
			$("#bar_linkertype").button("enable");
			$("#bar_beginarrow").button("enable");
			$("#bar_endarrow").button("enable");
			var shape = Model.getShapeById(linkerIds[0]);
			//设置Toolbar的线条样式
			$("#bar_linkertype").children("div:eq(0)").attr("class", "ico linkertype_" + shape.linkerType.toLowerCase());
			$("#bar_beginarrow").children("div:eq(0)").attr("class", "ico ico_arrow larrow_" + shape.lineStyle.beginArrowStyle.toLowerCase());
			$("#bar_endarrow").children("div:eq(0)").attr("class", "ico ico_arrow rarrow_" + shape.lineStyle.endArrowStyle.toLowerCase());
		}
		//通过锁定的数量，判断是否可以解除锁定
		if(lockedCount == 0){
			$("#bar_unlock").button("disable");
			arrangeMenu.children("li[ac=unlock]").menuitem("disable");
		}else{
			$("#bar_unlock").button("enable");
			arrangeMenu.children("li[ac=unlock]").menuitem("enable");
		}
		//是否激活组合、对齐，条件是选中图形要不少于2个
		if(count < 2){
			arrangeMenu.children("li[ac=group]").menuitem("disable");
			$("#bar_arrange_align").menuitem("disable");
		}else{
			arrangeMenu.children("li[ac=group]").menuitem("enable");
			$("#bar_arrange_align").menuitem("enable");
		}
		//是否激活匹配大小，条件是选中形状要不少于2个
		if(shapeCount < 2){
			$("#bar_arrange_match").menuitem("disable");
		}else{
			$("#bar_arrange_match").menuitem("enable");
		}
		//是否激活排列图形菜单，条件是选中图形要不少于3个
		if(count < 3){
			$("#bar_arrange_dist").menuitem("disable");
		}else{
			$("#bar_arrange_dist").menuitem("enable");
		}
		//通过组合的数量，判断是否可以取消组合
		if(groupCount == 0){
			arrangeMenu.children("li[ac=ungroup]").menuitem("disable");
		}else{
			arrangeMenu.children("li[ac=ungroup]").menuitem("enable");
		}
	},
	/**
	 * 打开插入链接
	 */
	showInsertLink: function(){
		$("#link_dialog").dlg();
		var addr = Utils.getSelected()[0].link;
		if(!addr){
			addr = "";
		}
		$("#linkto_addr").val(addr).select();
		$("#linkto_addr").unbind().bind("keydown", function(e){
			if(e.keyCode == 13){
				UI.setLink();
			}
		});
	},
	/**
	 * 设置连接
	 */
	setLink: function(){
		var newLink = $("#linkto_addr").val();
		var shape = Utils.getSelected()[0];
		shape.link = newLink;
		Model.update(shape);
		$('#link_dialog').dlg('close');
	},
	/**
	 * 选中图片后的回调
	 * @type {}
	 */
	imageSelectedCallback: null,
	/**
	 * 打开图片选择
	 */
	showImageSelect: function(callback){
		if(callback){
			this.imageSelectedCallback = callback;
		}else{
			this.imageSelectedCallback = null;
		}
		this.fetchingRequest = null;
		var height = $(window).height() - 200;
		if(height > 550){
			height = 550;
		}else if(height < 200){
			height = 200;
		}
		$(".image_list").height(height);
//		this.showImageSelectContent("upload");
		$("#image_dialog").dlg({
			onClose: function(){
				if(UI.fetchingRequest){
					UI.fetchingRequest.abort();
				}
			}
		});
		//加载用户图片
		if($("#image_select_upload").is(":visible")){
			UI.loadUserImages();
		};
		//左侧分类绑定事件
		$(".image_sources").children().unbind().bind("click", function(){
			UI.showImageSelectContent($(this).attr("ty"));
		});
		//上传
		$("#upload_img_res").empty();
		$("#input_upload_image").unbind().bind("change", function(){
			$("#upload_img_res").html("<span style='color: #666'>Uploading...</span>");
			$("#frm_upload_image").submitForm({
				success: function(result){
					if(result.result == "type_wrong"){
						$("#upload_img_res").html("This file is not an image, please select another one");
					}else if(result.result == "size_wrong"){
						$("#upload_img_res").html("This file's size is incorrect, limit 2M");
					}else if(result.result == "exception"){
						$("#upload_img_res").html("Sorry, can't use this image, please choose another one");
					}else{
						var img = result.image;
						UI.setShapeImage(img.fileId, img.imageW, img.imageH);
					}
				}
			});
		});
		//输入URL
		$("#input_img_url").val("");
		$("#img_url_area").empty();
		var oldUrl = "";
		function urlChanged(){
			var url = $("#input_img_url").val().trim();
			if(url != oldUrl){
				oldUrl = url
				if(url != ""){
					if(url.indexOf("http") < 0){
						url = "http://" + url;
					}
					$("#img_url_area").html("<span class='img_url_loading_tip'>Loading Image Preview...</span>");
					var newImage = $("<img class='img_url_loading' src='"+url+"'/>").appendTo("#img_url_area");
					newImage.unbind().bind("load", function(){
						newImage.show().addClass("img_url_loaded");
						$(".img_url_loading_tip").remove();
					}).bind("error", function(){
						$("#img_url_area").html("<div class='img_url_error'>We can't find the image at that URL.<ul><li>Please check the address for typing errors.</li><li>Make sure the image is public.</li><ul></div>");
					});
				}
			}
		}
		$("#input_img_url").unbind().bind("paste", function(){
			urlChanged();
		}).bind("keyup", function(){
			urlChanged();
		});
		//搜索
		$("#input_img_search").unbind().bind("keydown", function(e){
			if(e.keyCode == 13){
				UI.searchImgByGoogle();
			}
		});
		$("#btn_img_search").unbind().bind("click", function(){
			UI.searchImgByGoogle();
		});
		//完成按钮
		$("#set_image_submit").button("enable");
		$("#set_image_submit").button({
			onClick: function(){
				var currentTab = $(".image_sources").children(".active").attr("ty");
				if(currentTab == "upload"){
					var selectedImg = $("#user_image_items").children(".image_item_selected");
					if(selectedImg.length > 0){
						var fileId = selectedImg.attr("fileId");
						var imageW = selectedImg.attr("w");
						var imageH = selectedImg.attr("h");
						UI.setShapeImage(fileId, imageW, imageH);
					}else{
						$("#image_dialog").dlg("close");
					}
				}else if(currentTab == "url"){
					if($(".img_url_loaded").length > 0){
						var url = $(".img_url_loaded").attr("src");
						UI.setShapeImageByURL(url);
					}else{
						$("#image_dialog").dlg("close");
					}
				}else{
					//搜索
					var selectedImg = $("#google_image_items").children(".image_item_selected");
					if(selectedImg.length > 0){
						var url = selectedImg.attr("u");
						UI.setShapeImageByURL(url);
					}else{
						$("#image_dialog").dlg("close");
					}
				}
			}
		});
		//取消按钮
		$("#set_image_cancel").button({
			onClick: function(){
				$("#image_dialog").dlg("close");
			}
		});
		$("#set_image_text").empty();
	},
	/**
	 * 显示图片设置类型
	 */
	showImageSelectContent: function(type){
		$(".image_list").hide();
		$("#image_select_" + type).show().find("input[type=text]").select();
		$(".image_sources").children().removeClass("active");
		$(".image_sources").children("li[ty="+type+"]").addClass("active");
	},
	/**
	 * 加载用户图片
	 */
	loadUserImages: function(refresh){
		$("#user_image_items").empty();
		$.ajax({
			url: "/user_image/list",
			success: function(data){
				if(data.images){
					for (var i = 0; i < data.images.length; i++) {
						var img = data.images[i];
						UI.appendUserImage(img);
					}
					$("#user_image_items").append("<div style='clear: both'></div>");
				}
			}
		});
		$("#user_image_items").attr("loaded", "true");
	},
	searchIndex: 0,
	searchKeywords: "",
	/**
	 * 通过Google搜索图片
	 */
	searchImgByGoogle: function(){
		var keywords = $("#input_img_search").val();
		if(keywords.trim() != ""){
			$("#google_image_items").empty();
			this.searchKeywords = encodeURI(keywords);
			this.searchIndex = 0;
			this.loadGoogleImg();
		}else{
			$("#input_img_search").focus();
		}
	},
	/**
	 * 加载Google图片 
	 */
	loadGoogleImg: function(){
		$.getScript("https://ajax.googleapis.com/ajax/services/search/images?v=1.0&q="+this.searchKeywords+"&rsz=8&start="+(this.searchIndex * 16)+"&callback=UI.googleImgCallback");
		$.getScript("https://ajax.googleapis.com/ajax/services/search/images?v=1.0&q="+this.searchKeywords+"&rsz=8&start="+(this.searchIndex * 16 + 8)+"&callback=UI.googleImgCallback");
		$(".gg_img_more").remove();
		$("#google_image_items").append("<div class='img_gg_loading_tip'>Loading Images...</div>");
		this.searchIndex++;
	},
	/**
	 * Google搜索回调
	 * @param {} data
	 */
	googleImgCallback: function(data){
		var responseData = data.responseData;
		var results = responseData.results;
		for(var i = 0; i < results.length; i++){
			var item = results[i];
			UI.appendGoogleImage(item);
		}
		$("#google_image_items").append("<div style='clear: both'></div>");
		$(".img_gg_loading_tip").remove();
		$(".gg_img_more").remove();
		if(this.searchIndex <= 3){
			$("#google_image_items").append("<div onclick='UI.loadGoogleImg()' class='gg_img_more toolbar_button active'>Show More Results...</div>");
		}
	},
	/**
	 * 添加一个用户图片
	 */
	appendUserImage: function(img){
		var box = $("<div class='image_item' id='"+img.imageId+"' fileId='"+img.fileId+"' w='"+img.imageW+"' h='"+img.imageH+"'></div>").appendTo($("#user_image_items"));
		box.unbind().bind("click", function(){
			$(".image_item_selected").removeClass('image_item_selected');
			$(this).addClass('image_item_selected');
		}).bind("mouseenter", function(){
			var target = $(this);
			var remove = $("<div class='ico ico_remove_red'></div>").appendTo(target);
			var id = target.attr("id");
			remove.bind("click", function(){
				target.fadeOut();
				$.ajax({
					url: "/user_image/remove",
					data: {imageId: id}
				});
			});
		}).bind("mouseleave", function(){
			$(this).find(".ico_remove_red").remove();
		});
		var location = "/file/id/"+img.fileId+"/diagram_user_image";
		var newImage = $("<img src='"+location+"'/>").appendTo(box);
		newImage.bind("load", function(){
			$(this).css("margin-top", (140 - $(this).height())/2);
		});
	},
	/**
	 * 添加一个Google搜索的图片
	 */
	appendGoogleImage: function(img){
		var title = img.title + " (" + img.width + " × " + img.height + ")";
		var box = $("<div class='image_item' u='"+img.url+"' title='"+title+"'></div>").appendTo($("#google_image_items"));
		box.unbind().bind("click", function(){
			$(".image_item_selected").removeClass('image_item_selected');
			$(this).addClass('image_item_selected');
		});
		var newImage = $("<img src='"+img.tbUrl+"'/>").appendTo(box);
		newImage.bind("load", function(){
			$(this).css("margin-top", (140 - $(this).height())/2);
		});
	},
	/**
	 * 设置形状的背景图片
	 * @param {} source
	 */
	setShapeImage: function(fileId, w, h){
		if(this.imageSelectedCallback){
			this.imageSelectedCallback(fileId, w, h);
		}
		$("#image_dialog").dlg("close");
	},
	/**
	 * 加载URL图片的ajax请求对象
	 * @type {}
	 */
	fetchingRequest: null,
	/**
	 * 通过URL设置图片
	 * @param {} url
	 */
	setShapeImageByURL: function(url){
		$("#set_image_text").removeClass("errored").text("Setting image, please wait...");
		$("#set_image_submit").button("disable");
		UI.fetchingRequest = $.ajax({
			url: "/user_image/reference",
			data: {url: url},
			success: function(result){
				$("#set_image_submit").button("enable");
				if(result.result == "exception"){
					$("#set_image_text").addClass("errored").html("Sorry, can't use this image, please choose another one");
				}else{
					$("#set_image_text").empty();
					var img = result.image;
					UI.setShapeImage(img.fileId, img.imageW, img.imageH);
				}
			}
		});
	},
	/**
	 * 插入图片
	 * @param {} source
	 * @param {} location
	 * @param {} w
	 * @param {} h
	 */
	insertImage: function(fileId, w, h){
		w = parseInt(w);
		h = parseInt(h);
		var layout = $("#designer_layout");
		var centerX = layout.width()/2 + layout.offset().left;
		var centerY = layout.height()/2 + layout.offset().top;
		var pos = Utils.getRelativePos(centerX, centerY, $("#designer_canvas"));
		var shape = Model.create("standardImage", pos.x.restoreScale() - w/2, pos.y.restoreScale() - h/2);
		shape.props.w = w;
		shape.props.h = h;
		shape.fillStyle = {type: "image", fileId: fileId, display: "fill", imageW: w, imageH: h};
		Model.add(shape);
		Designer.painter.renderShape(shape);
		Utils.unselect();
		Utils.selectShape(shape.id);
	},
	/**
	 * 执行导出
	 */
	doExport: function(){
		var definition = JSON.stringify(Model.define);
		$("#export_definition").val(definition);
		$("#export_title").val($(".diagram_title").text());
		$("#export_form").submit();
		$('#export_dialog').dlg('close');
	},
	/**
	 * 展示hotkey列表
	 */
	showHotKey: function(){
		var height = $(window).height() - 175;
		if(height > 500){
			height = 500+"px";
		}
		$("#hotkey_list").dlg();
		$("#hotkey_list").css({"top":"28px"});
		$("#hotkey_list .dialog_content").css({"height":height});
	},
	/**
	 * 显示反馈dialog
	 */
	showFeedBack: function(){
		$("#send_feedback").css({
    		width: "auto",
    		height: "auto"
    	});
		var sendFeedBack = $("#send_feedback");
		sendFeedBack.dlg();
		$("#feedback_email").focus();
		$("#feedback_message").val("");
		$(".feedback_error_email_format").hide();
		$(".feedback_error_msg").hide();
	},
	/**
	 * 发送反馈
	 */
	sendFeedBack: function(dom){
		$(".feedback_error_email_format").hide();
		$(".feedback_error_msg").hide();
		var email = $.trim($("#feedback_email").val());
		var reg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/;
		if(!reg.test(email)){
			$("#feedback_email").focus();
			$(".feedback_error_email_format").show();
			return;
		}
		var feedbackMessage = $.trim($("#feedback_message").val());
		if(feedbackMessage == ""){
			$("#feedback_message").val("").focus();
			$(".feedback_error_msg").show();
			return;
		}
		Util.ajax({
			url:"/support/save_ask",
			data:{
				content: feedbackMessage,
				username: $("#feedback_name").val(),
				email: email,
				url: location.href
			},
	  	    success:function(data){
	  	    	$(".dlg_mask").remove();
				$("#send_feedback").animate({
		    		left: $(window).width(),
		    		top: $(window).height(),
		    		width: 0,
		    		height: 0,
		    		opacty: 0.2
		    	});
	  	    }
		});
	},
	/**
	 * 打开开始向导
	 */
	gettingStart: function(delay){
		this.showStartStep(1);
	},
	showStartStep: function(step, dom){
		$(".mark_content").hide();
		var content = $(".mark"+step+"_content");
		content.show();
		var top;
		var left;
		if(step == 1){
			top = $("#shape_panel").offset().top + 70;
			left = $("#shape_panel").offset().left + $("#shape_panel").width() + 10;
		}else if(step == 2){
			top = $(".row2").offset().top + 30;
			left = $("#menu_bar_insert").offset().left + $("#menu_bar_insert").width() - content.outerWidth()/2;
		}else if(step == 3){
			top = $(".toolbar").offset().top + 40;
			left = 270;
		}else if(step == 4){
			top = $("#dock").offset().top + 10;
			left = $("#dock").offset().left - content.outerWidth() - 10
		}else if(step == "created"){
			top = dom.offset().top + dom.height()/2 - content.outerHeight()/2;
			if(top <= 0){
				top = 0;
			}
			if(top + content.outerHeight() > $(window).height()){
				top = $(window).height() - content.outerHeight();
			}
			left = dom.offset().left + dom.width() + 10;
		}
		content.css({top: top, left: left});
	},
	/**
	 * 关闭开始向导
	 * @param {} dom
	 */
	closeGettingStart: function(dom){
		$(".mark_content").hide();
	},
	/**
	 * Getting Start END--
	 */
	
	showAddColla: function(){
		Util.ajax({
			url: "/collaboration/get_colla_role_list",
			data: {chartId: chartId},
			success: function(data){
				$("#colla_dialog").find(".role_list").html(data).scrollTop(999);
				$("#colla_dialog").removeClass("_update");
				$("#colla_dialog").css({"top": ($(window).height()-$("#colla_dialog").outerHeight())*0.5+"px"});
				$("#colla_dialog").dlg();
				$("#colla_suggest_box").empty();
				$("#add_prompt4").hide();
				$("#add_prompt3").hide();
				$("#add_prompt2").hide();
				$("#add_prompt1").show();
			}
		});
		
		var lastVal = "";
		$("#input_add_colla").val("").unbind().bind("keyup", function(){
			//加载信息
			var value = $(this).val();
			if(value == lastVal){
				return;
			}
			lastVal = value;
			if(value == ""){
				$("#colla_suggest_box").empty();
				$("#add_prompt4").hide();
				$("#add_prompt3").hide();
				$("#add_prompt2").hide();
				$("#add_prompt1").show();
				return;
			}
			Util.ajax({
				url: "/collaboration/get_new_members",
				data: {value: value},
				success: function(data){
					$("#colla_suggest_box").html(data);
					if($("#colla_suggest_box").find("ul").length > 0){
						$("#add_prompt4").hide();
						$("#add_prompt3").hide();
						$("#add_prompt2").show();
						$("#add_prompt1").hide();
					}else{
						$("#add_prompt4").hide();
						$("#add_prompt3").hide();
						$("#add_prompt2").hide();
						$("#add_prompt1").show();
					}
					$(".colla_suggest").find("li").unbind().bind("click", function(){
						$("#add_prompt4").hide();
						$("#add_prompt3").hide();
						$("#add_prompt2").show();
						$("#add_prompt1").hide();
						var value = $.trim($("#input_add_colla").val());
						$(".colla_suggest").find("li").removeClass("seled");
						$(this).addClass("seled");
						var type = $(this).attr("joinType");
						var target = $(this).attr("target");
						if(type == "user"){
							var userName = $(this).attr("username");
							$("#input_add_colla").val(userName);
							$("#add_userid").val(target);
						}else{
							$("#input_add_colla").val(target);
							$("#add_userid").val(target);
						}
						$("#add_type").val(type);
					});
				}
			});
		});
	},
	doAddCollaboration: function(){
		if($(".colla_suggest").length >0){
			if($(".colla_suggest").find(".seled").length == 0){
				$("#add_prompt1").hide();
				$("#add_prompt2").show();
				$("#add_prompt3").hide();
				$("#add_prompt4").hide();
				var top = ($(window).outerHeight()-104)*0.5+100;
				var left = ($(window).outerWidth()-272)*0.5;
				$("#confirm_dlg").removeClass("newSize").css({top: top+"px", left: left+"px"});
				$("#confirm_dlg").addClass("newSize").css({
						top: ($(window).outerHeight()-$("#confirm_dlg").height())*0.5+"px", 
						left: ($(window).outerWidth()-$("#confirm_dlg").width())*0.5+"px",
						display: "block"
				});
			}else{
				var imgSrc = $(".colla_suggest").find(".seled").find("img").attr("src");
				var userFullName = $("#input_add_colla").val();
				if(userFullName.length > 30){
					userFullName = userFullName.substr(0, 30)+"...";
				}
				var target = $("#add_userid").val();
				var role = $("#invit_role").val();
				var type = $("#add_type").val();
				$(".add_new_button").find(".designer_button").text("Sending...");
				var target_item = null;
				if(type == "email"){
					$(".role_list").find(".role_item").each(function(){
						if($(this).attr("type") == type && $(this).attr("target") == target){
							target_item = $(this);
							$(this).find(".inviting_").text("Inviting again");						
						}
					});
				}
				
				var paramOuter = {
					type: type,
					target: target,
					role: role,
					chartId: chartId
				};
				Util.ajax({
					url: "/collaboration/add",
					data: paramOuter,
					success: function(data){
						var result = data.result;
						if(result == "exists"){
							$("#add_prompt2").hide();
							$("#add_prompt1").hide();
							$("#add_prompt4").hide();
							$("#add_prompt3").show();
						}else{
							Util.ajax({
								url: "/collaboration/get_colla_role_list",
								data: {chartId: chartId},
								success: function(data){
									$(".role_list").html(data).scrollTop(999);
								}
							});
						}
						$(".add_new_button").find(".designer_button").text("Send Invitation");
						$("#colla_dialog").addClass("_update")
								  .css({top: ($(window).height()-$("#colla_dialog").outerHeight())*0.5+"px"});
						if(result != "exists"){
							setTimeout(function(){
								$("#add_prompt3").hide();
								$("#add_prompt2").hide();
								$("#add_prompt1").hide();
								$("#add_prompt4").show();
							}, 400);
						}
						setTimeout(function(){
							$("#add_prompt3").hide();
							$("#add_prompt2").hide();
							$("#add_prompt4").hide();
							$("#add_prompt1").show();
							$("#input_add_colla").val("");
							$("#colla_suggest_box").html("");
						}, 1000);
					}
				});
			}
		}
	},
	deleteCollaRole: function(dom){
		var parent = $(dom).parent(".role_item");
		var collaborationId = parent.attr("collaborationId");
		Util.ajax({
			url: "/collaboration/delete",
			data: {collaborationId: collaborationId},
			success: function(data){
				if(data.result == "success") parent.remove();
			}
		});
		
		$("#colla_dialog").addClass("_update")
						  .css({top: ($(window).height()-$("#colla_dialog").outerHeight())*0.5+"px"});
	},
	changeCollaRole: function(collaborationId, dom){
		Util.ajax({
			url: "/collaboration/set_role",
			data: {collaborationId: collaborationId, role: $(dom).val()},
			success: function(data){
				if(data.result == "success"){
					$(dom).parent(".given_role").find(".change_success").stop().animate({"left": "-38px"}, 200).delay(400).animate({"left": "0px"},200);
				}
			}
		});
	},
	/**
	 * 打开图形管理
	 */
	showShapesManage: function(){
		$("#shapes_dialog").dlg();
		$("#shape_manage_list").children("li").unbind().bind("click", function(){
			var chkbox = $(this).find("input");
			var checked = !chkbox.is(":checked");
			chkbox.attr("checked", checked);
			cateChanged(chkbox);
		});
		$("#shape_manage_list").find("input").unbind().bind("click", function(e){
			e.stopPropagation();
			cateChanged($(this));
		}).each(function(){
			var categorys = $(this).val();
			var arr = categorys.split(",");
			var exists = true;
			for(var i = 0; i < arr.length; i++){
				var cate = arr[i];
				if(!CategoryMapping[cate]){
					//此分类下的图形，没有在当前使用中
					exists = false;
					break;
				}
			}
			$(this).attr("checked", exists);
		});
		
		function cateChanged(chk){
			var value = chk.val();
			var arr = value.split(",");
			var chked = chk.is(":checked");
			if(arr.length > 1){
				//是父级节点
				$("#shape_manage_list").find("input").each(function(){
					var cate = $(this).val();
					if(arr.indexOf(cate) >= 0){
						//是选择父级的子节点
						$(this).attr("checked", chked);
					}
				});
			}else{
				//选择的是子节点
				$("#shape_manage_list").find(".cate_parent").each(function(){
					//获取所有的父节点，判断子节点是否都全部选中了
					var cates = $(this).val().split(",");
					var allChked = true;
					for(var i = 0; i < cates.length; i++){
						var cate = cates[i];
						if(!$("#shape_manage_list").find("input[value="+cate+"]").is(":checked")){
							allChked = false;
							break;
						}
					}
					$(this).attr("checked", allChked);
				});
			}
		}
	},
	/**
	 * 保存图形管理
	 */
	saveShapesManage: function(){
		var checked = $("#shape_manage_list").find("input:checked:not(.cate_parent)").map(function(){
			return $(this).val();
		}).get();
		var a = "";
		//发送消息
		var msgObj = {
			action: "changeSchema",
			categories: checked.join(",")
		};
		CLB.send(msgObj);
		Designer.setSchema(checked, function(){
			$('#shapes_dialog').dlg('close');
		});
	},
	/**
	 * 打开用户菜单
	 */
	showUserMenu: function(e){
		e.stopPropagation();
		$("#user_menu").dropdown({
			target: $(".user"),
			position: "right",
			onSelect: function(item){
				var action = item.attr("ac");
				if(action == "dia"){
					location.href = "/diagrams";
				}else if(action == "net"){
					location.href = "/network";
				}else if(action == "out"){
					location.href = "/login/out";
				}
			}
		});
	},
	/**
	 * 打开另存为
	 */
	showSaveAs: function(){
		$("#saveas_dialog").dlg();
		$("#saveas_title").val($(".diagram_title").text()).select();
	},
	doSaveAs: function(){
		if($("#saveas_title").val().trim() == ""){
			$("#saveas_title").focus();
			return;
		}
		$("#hid_saveas_id").val(chartId);
		$("#saveas_form").submit();
		$("#btn_dosaveas").removeAttr("onclick");
	},
	/**
	 * 打开形状的选项
	 * @param {} options
	 */
	showShapeOptions: function(){
		var shapeIds = Utils.getSelectedShapeIds();
		UI.hideShapeOptions();
		if(shapeIds.length == 1){
			//只选中了一个图形，显示图形的选项
			var shape = Model.getShapeById(shapeIds[0]);
			if(shape.name == "uiTab"){
				//UI > Tab标签页
				//先查找当前第几个是激活的tab
				var activeTab = 0;
				for(var i = 0; i < shape.path.length - 1; i++){
					var path = shape.path[i];
					if(typeof path.fillStyle == "undefined"){
						activeTab = i + 1;
						break;
					}
				}
				showOptions(shape, [
					{
						label: "Tabs:",
						type: "spinner",
						value: shape.path.length - 1,
						onChange: function(tabCount){
							console.log("tabcount change");
							//先查找当前第几个是激活的tab
							var activeIndex = 0;
							for(var i = 0; i < shape.path.length - 1; i++){
								var path = shape.path[i];
								if(typeof path.fillStyle == "undefined"){
									activeIndex = i;
									break;
								}
							}
							//先记录最后一节画法
							var last = shape.path[shape.path.length-1];
							if(tabCount != shape.path.length - 1){
								//减少了tab
								if(activeIndex > tabCount - 1){
									activeIndex = tabCount - 1;
									$("#change_uitab_index").spinner("setValue", tabCount);
								}
								shape.path = [];
								var newBlock = [];
								for(var i = 0; i < tabCount; i++){
									var pathCmd = {
										actions: [
											{action: "move", x: "w/"+tabCount+"*"+i, y: "h"},
											{action: "line", x: "w/"+tabCount+"*"+i, y: 7},
											{action: "quadraticCurve", x1: "w/"+tabCount+"*"+i, y1: 0, x: "w/"+tabCount+"*"+i+"+7", y: 0},
											{action: "line", x: "w/"+tabCount+"*"+(i+1)+"-7", y: 0},
											{action: "quadraticCurve", x1: "w/"+tabCount+"*"+(i+1), y1: 0, x: "w/"+tabCount+"*"+(i+1), y: 7},
											{action: "line", x: "w/"+tabCount+"*"+(i+1), y: "h"}
										]
									};
									if(i != activeIndex){
										//如果不是激活的，需要添加深色的填充，画法需要关闭
										pathCmd.fillStyle = {color: "r-20,g-20,b-20"};
										pathCmd.actions.push({action: "close"});
									}
									shape.path.push(pathCmd);
									//调整textBlock
									if(i < shape.textBlock.length){
										var shapeBlock = shape.textBlock[i];
										shapeBlock.position.x = "w/"+tabCount+"*"+i+"+5";
										shapeBlock.position.w = "w/"+tabCount+"-10";
										newBlock.push(shapeBlock);
									}else{
										newBlock.push({
											position: {x: "w/"+tabCount+"*"+i+"+5", y: 5, w: "w/"+tabCount+"-10", h: "h-10"}, text: "Tab "+(i+1)
										});
									}
								}
								shape.textBlock = newBlock;
								shape.path.push(last);
								Schema.initShapeFunctions(shape);
								Model.update(shape);
								Designer.painter.renderShape(shape);
								$("#change_uitab_index").spinner("setOptions", {max: tabCount});
							}
						}
					},{
						id: "change_uitab_index",
						label: "Selected:",
						type: "spinner",
						value: activeTab,
						max: shape.path.length - 1,
						onChange: function(active){
							console.log("select change");
							//先查找当前第几个是激活的tab
							var activeIndex = 0;
							for(var i = 0; i < shape.path.length - 1; i++){
								var path = shape.path[i];
								if(typeof path.fillStyle == "undefined"){
									activeIndex = i;
									break;
								}
							}
							if(activeIndex != active-1){
								//先置灰以前激活的
								shape.path[activeIndex].fillStyle = {color: "r-20,g-20,b-20"};
								shape.path[activeIndex].actions.push({action: "close"});
								//激活设置的
								delete shape.path[active-1].fillStyle;
								shape.path[active-1].actions.splice(6,1)
								//重绘、修改
								Schema.initShapeFunctions(shape);
								Model.update(shape);
								Designer.painter.renderShape(shape);
							}
						}
					}
				]);
			}
		}
		function showOptions(shape, options){
			var box = $("#shape_opt_box");
			if(box.length == 0){
				box = $("<div id='shape_opt_box'><div class='shape_opts'></div><div class='ico dlg_close'></div></div>").appendTo("#designer_canvas");
				box.bind("mousedown", function(e){
					e.stopPropagation();
				});
				box.children(".dlg_close").bind("click", function(e){
					box.hide();
				});
			}
			box.show();
			var pos = Utils.getShapeBox(shape);
			box.css({
				left: pos.x + pos.w + 10,
				top: pos.y,
				"z-index": Model.orderList.length + 1
			});
			var items = box.children(".shape_opts");
			items.empty();
			for(var i = 0; i < options.length; i++){
				var opt = options[i];
				var item = $("<div class='opt'></div>").appendTo(items);
				//标题
				item.append("<label>"+opt.label+"</label>");
				var field = $("<div class='field'></div>").appendTo(item);
				if(opt.type == "spinner"){
					var spinner = $("<div class='spinner active' style='width: 55px;'></div>").appendTo(field);
					if(opt.id){
						spinner.attr("id", opt.id);
					}
					spinner.spinner({
						min: 1,
						max: typeof opt.max != "undefined" ? opt.max : 20,
						step: 1,
						onChange: opt.onChange
					});
					spinner.spinner("setValue", opt.value);
				}
			}
		}
	},
	hideShapeOptions: function(){
		$("#shape_opt_box").hide();
	}
};

/**
 * 右侧的Dock控件
 * @type {}
 */
var Dock = {
	init: function(){
		var layoutW = $("#designer_layout").width();
		var viewW = $("#layout_block").width();
		//总宽度减去可视区域的宽度，得到滚动条宽度
		var navRight = layoutW - viewW;
		$("#dock").css("right", navRight);
		var dockRight = navRight + $("#dock").outerWidth() - 1;
		$(".dock_view").css("right", dockRight);
		if($("#demo_signup").length){
			var signupH = $("#demo_signup").outerHeight();
			$("#dock").css("top", signupH);
			$(".dock_view").css("top", signupH + 10);
		}
		$(".ico_dock_collapse").bind("click", function(){
			$(".dock_view").hide();
			$(".dock_buttons").children().removeClass("selected");
			if(Dock.currentView == "history"){
				Dock.closeHistory();
			}
			Dock.currentView = "";
		});
		$(window).bind("resize.dock", function(){
			if(Dock.currentView == "attribute"){
				Dock.fitAttrList();
			}
		});
		//缩放
		$("#dock_zoom").spinner({
			min: 50,
			max: 200,
			unit: "%",
			step: 10,
			onChange: function(val){
				Designer.setZoomScale(val / 100);
			}
		});
		//线条颜色
		$("#dock_line_color").colorButton({
			onSelect: function(color){
				Designer.setLineStyle({lineColor: color});
			}
		});
		//线条类型
		$("#dock_line_style").button({
			onMousedown: function(){
				$("#line_style_list").dropdown({
					target: $("#dock_line_style"),
					onSelect: function(item){
						var lineStyle = item.attr("line");
						Designer.setLineStyle({lineStyle: lineStyle});
						var cls = item.children("div").attr("class");
						$("#dock_line_style").children(".linestyle").attr("class", cls);
					}
				});
				var style = Utils.getSelected()[0].lineStyle.lineStyle;
				var item = $("#line_style_list").children("li[line="+style+"]");
				$("#line_style_list").dropdown("select", item);
			}
		});
		//线条宽度
		$("#dock_line_width").spinner({
			min: 0,
			max: 10,
			unit: "px",
			step: 1,
			onChange: function(val){
				Designer.setLineStyle({lineWidth: val});
			}
		});
		//填充类型
		$("#dock_fill_type").button({
			onMousedown: function(){
				$("#dock_fill_list").dropdown({
					target: $("#dock_fill_type"),
					onSelect: function(item){
						var type = item.attr("ty");
						$("#dock_fill_type").button("setText", item.text());
						if(type == "image"){
							UI.showImageSelect(function(fileId, w, h){
								Designer.setFillStyle({
									type: "image",
									fileId: fileId,
									imageW: w,
									imageH: h
								});
							});
						}else{
							Designer.setFillStyle({type: type});
							var shapeIds = Utils.getSelectedShapeIds();
							var shape = Model.getShapeById(shapeIds[0]);
							Dock.setFillStyle(shape.fillStyle);
						}
					}
				});
				var type = $("#dock_fill_type").text();
				$("#dock_fill_list").children().each(function(){
					if($(this).text() == type){
						$("#dock_fill_list").dropdown("select", $(this));
						return false;
					}
				});
			}
		});
		//填充颜色
		$("#fill_solid_btn").colorButton({
			onSelect: function(color){
				Designer.setFillStyle({color: color});
			}
		});
		//渐变开始颜色
		$("#fill_gradient_begin").colorButton({
			onSelect: function(color){
				Designer.setFillStyle({beginColor: color});
				$("#fill_gradient_begin").attr("c", color);
			}
		});
		//渐变结束颜色
		$("#fill_gradient_end").colorButton({
			onSelect: function(color){
				Designer.setFillStyle({endColor: color});
				$("#fill_gradient_end").attr("c", color)
			}
		});
		//渐变颜色交换
		$("#gradient_swap").button({
			onClick: function(){
				var begin = $("#fill_gradient_begin").attr("c");
				var end = $("#fill_gradient_end").attr("c");
				$("#fill_gradient_begin").attr("c", end).colorButton("setColor", end);
				$("#fill_gradient_end").attr("c", begin).colorButton("setColor", begin);
				Designer.setFillStyle({beginColor: end, endColor: begin});
			}
		});
		//渐变类型
		$("#gradient_type").button({
			onMousedown: function(){
				$("#gradient_type_list").dropdown({
					target: $("#gradient_type"),
					onSelect: function(item){
						var type = item.attr("ty");
						$("#gradient_type").button("setText", item.text());
						Designer.setFillStyle({gradientType: type});
						$(".gradient_details").hide();
						$("#gradient_type_" + type).show();
						var shapeIds = Utils.getSelectedShapeIds();
						var shape = Model.getShapeById(shapeIds[0]);
						var fillStyle = shape.fillStyle;
						if(type == "linear"){
							$("#gradient_angle").spinner("setValue", Math.round(fillStyle.angle/Math.PI * 180) + "°");
						}else{
							$("#gradient_radius").spinner("setValue", Math.round(fillStyle.radius * 100) + "%");
						}
					}
				});
				var type = $("#gradient_type").text().trim();
				$("#gradient_type_list").children().each(function(){
					if($(this).text() == type){
						$("#gradient_type_list").dropdown("select", $(this));
						return false;
					}
				});
			}
		});
		//线性渐变角度
		$("#gradient_angle").spinner({
			min: 0,
			max: 360,
			unit: "°",
			step: 15,
			onChange: function(val){
				var angle = val / 180 * Math.PI;
				Designer.setFillStyle({angle: angle});
			}
		});
		//径向渐变半径
		$("#gradient_radius").spinner({
			min: 0,
			max: 100,
			unit: "%",
			step: 5,
			onChange: function(val){
				Designer.setFillStyle({radius: val/100});
			}
		});
		//改变背景图片
		$("#fill_change_img").button({
			onClick: function(){
				UI.showImageSelect(function(fileId, w, h){
					Designer.setFillStyle({
						type: "image",
						fileId: fileId,
						imageW: w,
						imageH: h
					});
				});
			}
		});
		//背景图片显示
		$("#fill_img_display").button({
			onMousedown: function(){
				$("#img_display_list").dropdown({
					target: $("#fill_img_display"),
					onSelect: function(item){
						var type = item.attr("ty");
						$("#fill_img_display").button("setText", item.text());
						Designer.setFillStyle({display: type});
					}
				});
			}
		});
		//透明度
		$("#spinner_opacity").spinner({
			min: 0,
			max: 100,
			unit: "%",
			step: 5,
			onChange: function(val){
				Designer.setShapeStyle({alpha: val/100});
			}
		});
		//X坐标
		$("#dock_metric_x").spinner({
			min: -800,
			unit: "px",
			step: 5,
			onChange: function(val){
				Designer.setShapeProps({x: val});
			}
		});
		$("#dock_metric_x").spinner("setValue", "0px");
		//宽度
		$("#dock_metric_w").spinner({
			min: 20,
			unit: "px",
			step: 5,
			onChange: function(val){
				Designer.setShapeProps({w: val});
			}
		});
		//Y坐标
		$("#dock_metric_y").spinner({
			min: -800,
			unit: "px",
			step: 5,
			onChange: function(val){
				Designer.setShapeProps({y: val});
			}
		});
		$("#dock_metric_y").spinner("setValue", "0px");
		//高度
		$("#dock_metric_h").spinner({
			min: 20,
			unit: "px",
			step: 5,
			onChange: function(val){
				Designer.setShapeProps({h: val});
			}
		});
		//角度
		$("#dock_metric_angle").spinner({
			min: 0,
			max: 360,
			unit: "°",
			step: 15,
			onChange: function(val){
				var angle = val / 180 * Math.PI;
				Designer.setShapeProps({angle: angle});
			}
		});
		//画布尺寸
		$("#dock_page_size").button({
			onMousedown: function(){
				$("#page_size_list").dropdown({
					target: $("#dock_page_size"),
					onSelect: function(item){
						var w = parseInt(item.attr("w"));
						var h = parseInt(item.attr("h"));
						Designer.setPageStyle({width: w, height: h});
						$("#dock_page_size").button("setText", item.text());
					}
				});
				var item = $("#page_size_list").children("li[w="+Model.define.page.width+"][h="+Model.define.page.height+"]");
				if(item.length > 0){
					$("#page_size_list").dropdown("select", item);
				}else{
					$("#page_size_list").dropdown("select", $("#dock_size_custom"));
				}
				$("#dock_size_w").spinner("setValue", Model.define.page.width + "px");
				$("#dock_size_h").spinner("setValue", Model.define.page.height + "px");
			}
		});
		$("#dock_size_w").spinner({
			min: 200,
			unit: "px",
			step: 100,
			onChange: function(val){
				Designer.setPageStyle({width: val});
			}
		});
		$("#dock_size_h").spinner({
			min: 200,
			unit: "px",
			step: 100,
			onChange: function(val){
				Designer.setPageStyle({height: val});
			}
		});
		//页面边距
		$("#dock_page_padding").button({
			onMousedown: function(){
				$("#page_padding_list").dropdown({
					target: $("#dock_page_padding"),
					onSelect: function(item){
						var p = parseInt(item.attr("p"));
						Designer.setPageStyle({padding: p})
						$("#dock_page_padding").button("setText", item.text());
					}
				});
				var item = $("#page_padding_list").children("li[p="+Model.define.page.padding+"]");
				$("#page_padding_list").dropdown("select", item);
			}
		});
		//画布背景颜色
		$("#dock_page_color").colorButton({
			position: "center",
			onSelect: function(color){
				Designer.setPageStyle({backgroundColor: color});
			}
		});
		//是否显示网格
		$("#dock_page_showgrid").bind("change", function(){
			var showGrid = $(this).is(":checked");
			Designer.setPageStyle({showGrid: showGrid});
			if(showGrid){
				$("#dock_gridsize_box").show();
			}else{
				$("#dock_gridsize_box").hide();
			}
		});
		//网格大小
		$("#dock_page_gridsize").button({
			onMousedown: function(){
				$("#page_gridsize_list").dropdown({
					target: $("#dock_page_gridsize"),
					onSelect: function(item){
						var s = parseInt(item.attr("s"));
						Designer.setPageStyle({gridSize: s})
						$("#dock_page_gridsize").button("setText", item.text());
					}
				});
				var item = $("#page_gridsize_list").children("li[s="+Model.define.page.gridSize+"]");
				$("#page_gridsize_list").dropdown("select", item);
			}
		});
		//播放速度
		$("#spinner_play_speed").spinner({
			min: 1,
			max: 30,
			unit: "s",
			step: 1,
			value: 5,
			onChange: function(val){
				
			}
		});
		$("#spinner_play_speed").spinner("setValue", "2s");
		//版本播放
		$("#btn_history_play").button({
			onClick: function(){
				if($("#btn_history_play").children().hasClass("ico_pause")){
					Dock.pauseVersions();
				}else{
					Dock.playVersions();
				}
			}
		});
		$("#btn_history_restore").button({
			onClick: function(){
				Dock.restoreVersion();
			}
		});
		this.showView("navigator");
	},
	/**
	 * 当前Dock窗口
	 * @type {String}
	 */
	currentView: "",
	/**
	 * 打开一个Dock窗口
	 * @param {} name
	 */
	showView: function(name){
		if($("#dock_btn_" + name).button("isDisabled")){
			return;
		}
		$(".dock_view").hide();
		$(".dock_view_" + name).show();
		$(".dock_buttons").children().removeClass("selected");
		$("#dock_btn_" + name).addClass("selected");
		if(Dock.currentView == "history" && name != "history"){
			Dock.closeHistory();
		}
		this.currentView = name;
		this.update(true);
	},
	/**
	 * 设置Dock的填充样式
	 * @param {} fillStyle
	 */
	setFillStyle: function(fillStyle){
		$("#dock_fill_type").button("setText", $("#dock_fill_list").children("li[ty="+fillStyle.type+"]").text());
		$(".fill_detail").hide();
		if(fillStyle.type == "solid"){
			$(".fill_detail_solid").show();
			$("#fill_solid_btn").colorButton("setColor", fillStyle.color);
		}else if(fillStyle.type == "gradient"){
			$(".fill_detail_gradient").show();
			//渐变颜色
			$("#fill_gradient_begin").attr("c", fillStyle.beginColor).colorButton("setColor", fillStyle.beginColor);
			$("#fill_gradient_end").attr("c", fillStyle.endColor).colorButton("setColor", fillStyle.endColor);
			//渐变类型
			$("#gradient_type").button("setText", $("#gradient_type_list").children("li[ty="+fillStyle.gradientType+"]").text());
			$(".gradient_details").hide();
			if(fillStyle.gradientType == "linear"){
				$("#gradient_type_linear").show();
				$("#gradient_angle").spinner("setValue", Math.round(fillStyle.angle/Math.PI * 180) + "°");
			}else{
				$("#gradient_type_radial").show();
				$("#gradient_radius").spinner("setValue", Math.round(fillStyle.radius * 100) + "%");
			}
		}else if(fillStyle.type == "image"){
			$(".fill_detail_image").show();
			var display = "fill";
			if(fillStyle.display){
				display = fillStyle.display;
			}
			$("#fill_img_display").button("setText", $("#img_display_list").children("li[ty="+display+"]").text());
		}
	},
	/**
	 * 更新Dock
	 */
	update: function(drawNav){
		if(this.currentView == "navigator"){
			if(drawNav){
				Navigator.draw();
			}
			$("#dock_zoom").spinner("setValue", Math.round(Designer.config.scale * 100) + "%");
		}else if(this.currentView == "graphic"){
			var selectedIds = Utils.getSelectedIds();
			var count = selectedIds.length;
			var shapeIds = Utils.getSelectedShapeIds();
			var shapeCount = shapeIds.length;
			if(count == 0){
				$("#dock_line_color").button("disable");
				$("#dock_line_style").button("disable");
				$("#dock_line_width").button("disable");
			}else{
				$("#dock_line_color").button("enable");
				$("#dock_line_style").button("enable");
				$("#dock_line_width").button("enable");
				var shape = Model.getShapeById(selectedIds[0]);
				$("#dock_line_color").colorButton("setColor", shape.lineStyle.lineColor);
				var lineStyleCls = $("#line_style_list").children("li[line="+shape.lineStyle.lineStyle+"]").children().attr("class");
				$("#dock_line_style").children(".linestyle").attr("class", lineStyleCls);
				$("#dock_line_width").spinner("setValue", shape.lineStyle.lineWidth + "px");
			}
			if(shapeCount == 0){
				$("#dock_fill_type").button("disable");
				$("#spinner_opacity").button("disable");
				Dock.setFillStyle({type: "none"});
			}else{
				$("#dock_fill_type").button("enable");
				$("#spinner_opacity").button("enable");
				var shape = Model.getShapeById(shapeIds[0]);
				Dock.setFillStyle(shape.fillStyle);
				$("#spinner_opacity").spinner("setValue", Math.round(shape.shapeStyle.alpha/1*100) + "%");
			}
		}else if(this.currentView == "metric"){
			var shapeIds = Utils.getSelectedShapeIds();
			var shapeCount = shapeIds.length;
			if(shapeCount == 0){
				$("#dock_metric_x").button("disable");
				$("#dock_metric_w").button("disable");
				$("#dock_metric_y").button("disable");
				$("#dock_metric_h").button("disable");
				$("#dock_metric_angle").button("disable");
			}else{
				var shape = Model.getShapeById(shapeIds[0]);
				$("#dock_metric_x").button("enable").spinner("setValue", Math.round(shape.props.x) + "px");
				$("#dock_metric_w").button("enable").spinner("setValue", Math.round(shape.props.w) + "px");
				$("#dock_metric_y").button("enable").spinner("setValue", Math.round(shape.props.y) + "px");
				$("#dock_metric_h").button("enable").spinner("setValue", Math.round(shape.props.h) + "px");
				$("#dock_metric_angle").button("enable").spinner("setValue", Math.round(shape.props.angle/Math.PI*180) + "°");
			}
		}else if(this.currentView == "page"){
			var page = Model.define.page;
			var w = page.width;
			var h = page.height;
			var sizeItem = $("#page_size_list").children("li[w="+w+"][h="+h+"]");
			var sizeText = "";
			if(sizeItem.length > 0){
				sizeText = sizeItem.text();
			}else{
				sizeText = $("#dock_size_custom").text();
			}
			$("#dock_page_size").button("setText", sizeText);
			$("#dock_page_padding").button("setText", page.padding + "px");
			$("#dock_page_color").colorButton("setColor", page.backgroundColor);
			$("#dock_page_showgrid").attr("checked", page.showGrid);
			if(page.showGrid){
				$("#dock_gridsize_box").show();
			}else{
				$("#dock_gridsize_box").hide();
			}
			var gridText = "";
			var gridItem = $("#page_gridsize_list").children("li[s="+page.gridSize+"]");
			if(gridItem.length > 0){
				var gridText = gridItem.text();
			}
			$("#dock_page_gridsize").button("setText", gridText);
		}else if(this.currentView == "attribute"){
			var selectedIds = Utils.getSelectedIds();
			var count = selectedIds.length;
			if(count != 1){
				$(".attr_list").html("<li class='attr_none'>Select one shape to view data attributes.</li>");
				$(".attr_add").hide();
				this.fitAttrList();
			}else{
				this.setAttributeList();
				$(".attr_add").show();
				//初始化添加
				this.cancelAttrAdd();
			}
		}if(this.currentView == "history"){
			if(drawNav && Dock.historyVersions == null){
				this.loadHistorys();
			}
		}
	},
	/**
	 * 历史版本暂存
	 * @type {}
	 */
	historyVersions: null,
	/**
	 * 加载历史版本
	 */
	loadHistorys: function(){
		if(chartId == ""){
			$("#history_container").html("<div style='padding: 20px 10px;'>You are in a demo state, can't view revision history.</div>")
			return;
		}
		$.ajax({
			url: "/diagraming/history",
			data: {chartId: chartId},
			success: function(data){
				Dock.historyVersions = data;
				if(data.versions.length == 0){
					$("#history_container").html('<div style="padding: 20px 10px;">No reversion history. <br/>Each modification will generate a new version of history for you.</div>');
				}else{
					$("#history_container").html('<ul id="history_versions"></ul>');
					var users = data.users;
					for(var i = 0; i < data.versions.length; i++){
						var v = data.versions[i];
						var newVersion = $('<li vid="'+v.versionId+'" def="'+v.definitionId+'" ind="'+i+'"><div class="version_time">'+v.updateTime+'</div><div class="version_name"></div></li>').appendTo($("#history_versions"));
						var nameContainer = newVersion.children(".version_name");
						for(var j = 0; j < v.userIds.length; j++){
							var userId = v.userIds[j];
							nameContainer.append("<div>"+users[userId]+"</div>");
						}
						var remarkContainer = $("<div class='history_remark'><div class='remark_container'><div class='remark_text'></div><a onclick='Dock.editHistoryRemark(event, \""+v.versionId+"\")' href='javascript:'>Edit annotation</a></div></div>").appendTo(newVersion);
						if(v.remark){
							remarkContainer.find(".remark_text").text(v.remark);
						}
						remarkContainer.append("<div class='edit_container'><textarea class='input_text' onclick='event.stopPropagation()'></textarea><a href='javascript:' class='save'>Save</a>&nbsp;&nbsp;<a href='javascript:' class='cancel'>Cancel</a></div>")
					}
					Dock.resetVersions();
				}
			}
		});
	},
	/**
	 * 重置版本历史
	 */
	resetVersions: function(){
		$("#history_versions").children("li").unbind().bind("click", function(){
			if(Dock.playingTimeout != null){
				return;
			}
			if($(this).hasClass("selected")){
				Dock.closeHistory();
			}else{
				$("#history_versions").children(".selected").removeClass("selected");
				$(this).addClass("selected");
				var defId = $(this).attr("def");
				Dock.showHistoryVersion(defId);
			}
			var current = $("#history_versions").children(".selected");
			if(current.length != 0 && current.attr("ind") != "0"){
				$("#spinner_play_speed").button("enable");
				$("#btn_history_play").button("enable");
				$("#btn_history_restore").button("enable");
			}else{
				$("#spinner_play_speed").button("disable");
				$("#btn_history_play").button("disable");
				$("#btn_history_restore").button("disable");
			}
		});
		$("#history_versions").height("auto");
		var top = $("#history_versions").offset().top;
		var bottom = top + $("#history_versions").height() + 75;
		if(bottom > $(window).height()){
			var height = $(window).height() - top - 75;
			if(height < 140){
				height = 140;
			}
			$("#history_versions").height(height);
		}else{
			$("#history_versions").height("auto");
		}
	},
	/**
	 * 编辑版本注释
	 * @param {} event
	 */
	editHistoryRemark: function(event, versionId){
		event.stopPropagation();
		var versionDom = $("#history_versions").children("li[vid="+versionId+"]");
		versionDom.find(".remark_container").hide();
		var currentRemark = versionDom.find(".remark_text").text();
		var editContainer = versionDom.find(".edit_container");
		editContainer.show();
		editContainer.children("textarea").val(currentRemark).select();
		editContainer.children(".save").bind("click", function(e){
			e.stopPropagation();
			var newRemark = editContainer.children("textarea").val();
			versionDom.find(".remark_text").text(newRemark);
			versionDom.find(".remark_container").show();
			editContainer.hide();
			if(newRemark != currentRemark){
				CLB.send({
					action: "versionRemark",
					remark: newRemark,
					versionId: versionId
				});
			}
		});
		editContainer.children(".cancel").bind("click", function(e){
			e.stopPropagation();
			Dock.cancelHistoryRemark();
		});
	},
	/**
	 * 取消版本注释的编辑
	 */
	cancelHistoryRemark: function(){
		$(".remark_container").show();
		$(".edit_container").hide();
	},
	/**
	 * 展示历史版本
	 */
	showHistoryVersion: function(defId){
		$("#spinner_play_speed").button("disable");
		$("#btn_history_play").button("disable");
		$("#btn_history_restore").button("disable");
		Dock.cancelHistoryRemark();
		$.ajax({
			url: "/diagraming/getdefinition",
			data: {definitionId: defId},
			success: function(data){
				Dock.openHistory(data.definition);
				if($("#history_versions").children(".selected").attr("ind") != "0"){
					$("#spinner_play_speed").button("enable");
					$("#btn_history_play").button("enable");
					$("#btn_history_restore").button("enable");
				}
			}
		});
	},
	/**
	 * 播放版本历史
	 */
	playVersions: function(){
		var current = $("#history_versions").children(".selected");
		if(current.length == 0){
			return;
		}
		var index = parseInt(current.attr("ind"));
		Dock.playOneVersion(--index, 0);
		$("#btn_history_play").children().attr("class", "ico ico_pause");
		$("#btn_history_play").attr("title", "Pause").trigger("mouseenter");
	},
	/**
	 * 终止播放
	 */
	pauseVersions: function(){
		if(this.playingTimeout){
			clearTimeout(this.playingTimeout);
		}
		this.playingTimeout = null;
		$("#btn_history_play").children().attr("class", "ico ico_play");
		$("#btn_history_play").attr("title", "Play from this revision");
		$(".ico_playing").remove();
		var current = $("#history_versions").children(".selected");
		$("#history_versions").children(".playing").removeClass("playing");
		if(current.length != 0 && current.attr("ind") != "0"){
			$("#spinner_play_speed").button("enable");
			$("#btn_history_play").button("enable");
			$("#btn_history_restore").button("enable");
		}else{
			$("#spinner_play_speed").button("disable");
			$("#btn_history_play").button("disable");
			$("#btn_history_restore").button("disable");
		}
	},
	playingTimeout: null,
	/**
	 * 播放一个版本
	 */
	playOneVersion: function(index, msgIndex){
		var current = $("#history_versions").children("li[ind="+index+"]");
		$("#history_versions").children(".selected").removeClass("selected");
		current.addClass("selected").addClass("playing");
		$(".ico_playing").remove();
		current.append("<div class='ico ico_playing'></div>");
		
		var version = Dock.historyVersions.versions[index];
		var messageStr = version.messages[msgIndex];
		var messages = JSON.parse(messageStr);
		MessageSource.receive(messages);
		var top = current.position().top;
		if(top < 0){
			$("#history_versions").scrollTop($("#history_versions").scrollTop() + top);
		}
		var time = $("#spinner_play_speed").spinner("getValue") * 1000;
		if(index == 0 && msgIndex == version.messages.length - 1){
			this.pauseVersions();
		}else{
			if(msgIndex < version.messages.length - 1){
				msgIndex++;
			}else{
				index = index - 1;
				msgIndex = 0;
			}
			this.playingTimeout = setTimeout(function(){
				Dock.playOneVersion(index, msgIndex);
			}, time);
		}
		
	},
	currentDefinition: null,
	/**
	 * 打开一个历史版本
	 */
	openHistory: function(definition){
		if(this.currentDefinition == null){
			this.currentDefinition = $.extend(true, {}, Model.define);
		}
		Utils.unselect();
		Designer.open(definition);
		//取消快捷键
		Designer.hotkey.cancel();
		Designer.op.cancel();
		$("#menu_bar").children().addClass("readonly");
		$(".diagram_title").addClass("readonly");
		$(".dock_buttons").children().addClass("disabled");
		$("#dock_btn_history").removeClass("disabled");
		$(".panel_box").addClass("readonly");
		//中止监听
		CLB.stopListen();
	},
	/**
	 * 关闭历史版本
	 */
	closeHistory: function(){
		if(this.currentDefinition != null){
			Designer.open(this.currentDefinition);
			this.currentDefinition = null;
			this.activeOperation();
		}
	},
	/**
	 * 激活操作
	 */
	activeOperation: function(){
		//重新初始化快捷键
		Designer.hotkey.init();
		Designer.op.init();
		$("#menu_bar").children().removeClass("readonly");
		$(".diagram_title").removeClass("readonly");
		$(".dock_buttons").children().removeClass("disabled");
		$("#dock_btn_history").removeClass("disabled");
		$(".panel_box").removeClass("readonly");
		$("#history_versions").children(".selected").removeClass("selected");
		//继续监听
		CLB.listen();
		Dock.loadHistorys();
	},
	/**
	 * 恢复版本
	 */
	restoreVersion: function(){
		var selected = $("#history_versions").children(".selected");
		if(selected.length){
			MessageSource.beginBatch();
			var elements = Dock.currentDefinition.elements;
			//删除当前的所有
			var removed = [];
			if(elements){
				for(var id in elements){
					removed.push(elements[id]);
				}
			}
			MessageSource.send("remove", removed);
			//更新画布
			var updatePageMsg = {
				page: Utils.copy(Dock.currentDefinition.page),
				update: Utils.copy(Model.define.page)
			};
			MessageSource.send("updatePage", updatePageMsg);
			//添加新图形
			var newElements = Model.define.elements;
			var added = [];
			if(newElements){
				for(var id in newElements){
					added.push(newElements[id]);
				}
			}
			MessageSource.send("create", added);
			MessageSource.commit();
			Dock.activeOperation();
		}
	},
	/**
	 * 设置数据属性列表
	 */
	setAttributeList: function(){
		var selectedIds = Utils.getSelectedIds();
		var shape = Model.getShapeById(selectedIds[0]);
		$(".attr_list").empty();
		if(shape.dataAttributes){
			for (var i = 0; i < shape.dataAttributes.length; i++) {
				var attr = shape.dataAttributes[i];
				var typeText = $("#attr_add_type").children("option[value="+attr.type+"]").text();
				var item = $("<li id='"+attr.id+"' class='attr_item attr_item_"+attr.id+"' onclick=\"Dock.editAttr('"+attr.id+"')\"><div class='attr_name'>"+attr.name+"</div><div class='attr_type'>"+typeText+"</div><div class='attr_value'>"+attr.value+"</div><div style='clear: both'></div></li>").appendTo($(".attr_list"));
				if(attr.category != "default"){
					item.append("<div class='ico ico_attr_delete' onclick=\"Dock.deleteAttr('"+attr.id+"', event)\"></div>");
				}
			}
		}
		this.fitAttrList();
	},
	/**
	 * 让数据属性列表适应
	 */
	fitAttrList: function(){
		var scroll = $(".attr_list").scrollTop();
		$(".attr_list").height("auto");
		var top = $(".attr_list").offset().top;
		var bottom = top + $(".attr_list").height() + 10;
		if(bottom > $(window).height()){
			var height = $(window).height() - top - 10;
			if(height < 140){
				height = 140;
			}
			$(".attr_list").height(height);
		}else{
			$(".attr_list").height("auto");
		}
		$(".attr_list").scrollTop(scroll);
	},
	/**
	 * 打开数据属性添加
	 */
	showAttrAdd: function(){
		$("#attr_add_btn").hide();
		$(".attr_add_items").show();
		$("#attr_add_name").val("").focus();
		$("#attr_add_type").val("string");
		$("#attr_add_type").unbind().bind("change", function(){
			Dock.setAttrValueInput(null, $(this).val());
		});
		Dock.setAttrValueInput(null, "string");
		this.fitAttrList();
	},
	/**
	 * 保存数据属性添加
	 */
	saveAttrAdd: function(){
		var name = $("#attr_add_name").val();
		if(name == ""){
			$("#attr_add_name").focus();
			return;
		}
		var type = $("#attr_add_type").val();
		var value = $("#attr_add_value_arera").children().val();
		var newAttr = {
			name: name,
			type: type,
			value: value
		};
		Designer.addDataAttribute(newAttr);
		this.setAttributeList();
		//初始化添加区域
		this.showAttrAdd();
	},
	/**
	 * 取消数据属性添加
	 */
	cancelAttrAdd: function(){
		$("#attr_add_btn").show();
		$(".attr_add_items").hide();
		this.fitAttrList();
	},
	/**
	 * 编辑数据属性
	 * @param {} attrId
	 */
	editAttr: function(attrId){
		var item = $(".attr_item_" + attrId);
		if(item.hasClass("attr_editing")){
			return;
		}
		if($(".attr_editing").length > 0){
			var editingId = $(".attr_editing").attr("id");
			this.saveAttrEdit(editingId);
		}
		item = $(".attr_item_" + attrId);
		item.addClass("attr_editing");
		var attr = Designer.getDataAttrById(attrId);
		//属性值输入
		var input = this.setAttrValueInput(attr, attr.type);
		input.val(attr.value).select();
		if(attr.category != "default"){
			//属性名和类型输入
			var nameDiv = item.children(".attr_name");
			nameDiv.empty();
			var nameInput = $("<input type='text' class='input_text' style='width: 88px'/>").appendTo(nameDiv);
			nameInput.val(attr.name).select();
			var typeDiv = item.children(".attr_type");
			typeDiv.empty();
			var select = $("<select class='input_select' style='width: 60px'></select>").appendTo(typeDiv);
			select.html($("#attr_add_type").html()).val(attr.type);
			select.bind("change", function(){
				Dock.setAttrValueInput(attr, $(this).val());
			});
		}
		//添加显示设置
		var displayArea = $("<div class='attr_edit_display'></div>").appendTo(item);
		//显示为的按钮
		displayArea.append("<div class='dock_label'>Display As:</div>");
		displayArea.append("<div id='attr_edit_showtype' class='toolbar_button active btn_inline' style='width: 75px;'><div class='text_content'></div><div class='ico ico_dropdown'></div></div>");
		displayArea.append("<div style='clear: both'></div>");
		//显示参数区域
		displayArea.append("<div class='attr_display_options'></div>");
		this.appendDisplayItems();
		var showType = "none";
		if(attr.showType){
			showType = attr.showType;
		}
		this.setAttrDisplay(showType);
		$("#attr_edit_showtype").attr("ty", showType).button({
			onMousedown: function(){
				$("#attr_display_list").dropdown({
					target: $("#attr_edit_showtype"),
					onSelect: function(item){
						var type = item.attr("ty");
						$("#attr_edit_showtype").attr("ty", type).button("setText", item.text());
						Dock.setAttrDisplay(type);
					}
				});
				var type = $("#attr_edit_showtype").text().trim();
				$("#attr_display_list").children().each(function(){
					if($(this).text() == type){
						$("#attr_display_list").dropdown("select", $(this));
						return false;
					}
				});
			}
		});
		$("#attr_edit_showtype").attr("ty", showType).button("setText", $("#attr_display_list").children("li[ty="+showType+"]").html());
		if(showType != "none"){
			$("#attr_display_name").attr("checked", attr.showName);
			if(showType == "icon"){
				this.setAttrIcon(attr.icon);
			}
		}
		var horizontal = "mostright";
		if(attr.horizontal){
			horizontal = attr.horizontal;
		}
		var vertical = "mostbottom";
		if(attr.vertical){
			vertical = attr.vertical;
		}
		$("#attr_location_h").button("setText", $("#attr_location_h_list").children("li[loc="+horizontal+"]").html());
		$("#attr_location_h").attr("loc", horizontal);
		$("#attr_location_v").button("setText", $("#attr_location_v_list").children("li[loc="+vertical+"]").html());
		$("#attr_location_v").attr("loc", vertical);
		//添加保存按钮
		item.append("<div class='attr_edit_btns'><div id='save_edit_attr' class='toolbar_button active'>OK</div><div id='cancel_edit_attr' class='toolbar_button active' style='margin-left: 5px;'>Cancel</div></div>");
		$("#save_edit_attr").bind("click", function(e){
			e.stopPropagation();
			Dock.saveAttrEdit(attrId);
		});
		$("#cancel_edit_attr").bind("click", function(e){
			e.stopPropagation();
			Dock.setAttributeList();
		})
	},
	/**
	 * 设置数据属性值的输入
	 * @param {} attr
	 * @param {} type
	 */
	setAttrValueInput: function(attr, type){
		var valueArea;
		if(attr != null){
			//如果为null，则是添加时调用，否则为修改
			valueArea = $(".attr_editing").children(".attr_value");
		}else{
			valueArea = $("#attr_add_value_arera");
		}
		valueArea.empty();
		var result;
		if(type == "boolean"){
			result = $("<select class='input_select'><option value=''></option><option value='true'>true</option><option value='false'>false</option></select>").appendTo(valueArea);;
		}else if(type == "list"){
			result = $("<select class='input_select'></select>").appendTo(valueArea);
			if(attr.listItems){
				for (var i = 0; i < attr.listItems.length; i++) {
					var listItem = attr.listItems[i];
					result.append("<option value='"+listItem+"'>"+listItem+"</option>");
				}
			}
		}else{
			result = $("<input type='text' class='input_text'/>").appendTo(valueArea);
		}
		if(attr == null){
			valueArea.children().css("width", "260px");
		}else{
			valueArea.children().css("width", "128px");
		}
		return result;
	},
	/**
	 * 添加数据显示的编辑项
	 */
	appendDisplayItems: function(){
		var optionsArea = $(".attr_display_options");
		//详细区域，包括是否显示name，图标
		var detailArea = $("<div class='opt_area'></div>").appendTo(optionsArea);
		detailArea.append("<input id='attr_display_name' type='checkbox'/><label for='attr_display_name'>Show Name</label>");
		//选择图标的Button
		var iconButtonArea = $("<div id='attr_icon_area' style='padding-top:5px;'></div>").appendTo(detailArea);
		iconButtonArea.append("<div class='dock_label'>Icon:</div>");
		iconButtonArea.append("<div id='attr_display_icon' ico='' class='toolbar_button active btn_inline' style='width: 50px'><div class='text_content'></div><div class='ico ico_dropdown'></div></div>");
		iconButtonArea.append("<div style='clear: both'></div>");
		if($("#attr_icon_list").children("li").html() == ""){
			//初始化图标选择
			var html = "";
			var index = 1;
			while(index <= 49 ){
				if(index == 30){
					//30时，要空出一格
					html += "<div></div>";
				}
				html += "<div onmousedown='Dock.setAttrIcon("+index+")' class='attr_icon_item'></div>";
				index++;
			}
			$("#attr_icon_list").children("li").html(html);
		}
		//位置设置区域
		var locationArea = $("<div class='opt_area location_area'></div>").appendTo(optionsArea);
		locationArea.append("<div>Display Location:</div>");
		locationArea.append("<div class='dock_label'>Horizontal:</div>");
		locationArea.append("<div id='attr_location_h' class='toolbar_button active btn_inline' loc='mostright'><div class='text_content location_content'><div><span style='left: 11px'></span></div>Most Right</div><div class='ico ico_dropdown'></div></div>");
		locationArea.append("<div style='clear: both'></div>");
		locationArea.append("<div class='dock_label'>Vertical:</div>");
		locationArea.append("<div id='attr_location_v' class='toolbar_button active btn_inline' loc='mostbottom'><div class='text_content location_content'><div><span style='top: 11px'></span></div>Most Bottom</div><div class='ico ico_dropdown'></div></div>");
		locationArea.append("<div style='clear: both'></div>");
		optionsArea.append("<div style='clear: both'></div>");
		$("#attr_display_icon").button({
			onMousedown: function(){
				$("#attr_icon_list").dropdown({
					target: $("#attr_display_icon")
				});
			}
		});
		$("#attr_location_h").button({
			onMousedown: function(){
				$("#attr_location_h_list").dropdown({
					target: $("#attr_location_h"),
					onSelect: function(item){
						$("#attr_location_h").button("setText", item.html());
						$("#attr_location_h").attr("loc", item.attr("loc"));
					}
				});
			}
		});
		$("#attr_location_v").button({
			onMousedown: function(){
				$("#attr_location_v_list").dropdown({
					target: $("#attr_location_v"),
					onSelect: function(item){
						$("#attr_location_v").button("setText", item.html());
						$("#attr_location_v").attr("loc", item.attr("loc"));
					}
				});
			}
		});
	},
	/**
	 * 根据数据属性显示类型，设置操作界面
	 * @param {} type
	 */
	setAttrDisplay: function(type){
		if(type == "none"){
			$(".attr_display_options").hide();
		}else{
			$(".attr_display_options").show();
			if(type == "icon"){
				$("#attr_icon_area").show();
			}else{
				$("#attr_icon_area").hide();
			}
		}
	},
	/**
	 * 设置数据属性的显示图标
	 * @param {} icon
	 */
	setAttrIcon: function(icon){
		$("#attr_display_icon").attr("ico", icon).button("setText", "");
		if(icon){
			$("#attr_display_icon").button("setText", "<img src='/images/data-attr/"+icon+".png'/>");
		}
	},
	/**
	 * 保存数据属性编辑
	 * @param {} attrId
	 */
	saveAttrEdit: function(attrId){
		var item = $(".attr_item_" + attrId);
		if(!item.hasClass("attr_editing")){
			return;
		}
		var attr = Designer.getDataAttrById(attrId);
		if(attr.category != "default"){
			var name = item.children(".attr_name").children("input").val();
			if(name == ""){
				item.children(".attr_name").children("input").focus();
				return;
			}
			attr.name = name;
			attr.type = item.children(".attr_type").children("select").val();
		}
		attr.value = item.children(".attr_value").children().val();
		var showType = $("#attr_edit_showtype").attr("ty");
		attr.showType = showType;
		if(showType != "none"){
			attr.showName = $("#attr_display_name").is(":checked");
			attr.horizontal = $("#attr_location_h").attr("loc");
			attr.vertical = $("#attr_location_v").attr("loc");
			if(showType == "icon"){
				attr.icon = $("#attr_display_icon").attr("ico");
			}
		}
		//BPMN数据属性规则
		var selectedIds = Utils.getSelectedIds();
		var shape = Model.getShapeById(selectedIds[0]);
		if(attr.category == "default" && shape.category == "bpmn"){
			if(!shape.attribute){
				shape.attribute = {};
			}
			if(!shape.attribute.markers){
				shape.attribute.markers = [];
			}
			var markers = shape.attribute.markers;
			if(attr.name == "loopCharacteristics"){
				Utils.removeFromArray(markers, "loop");
				Utils.removeFromArray(markers, "sequential");
				Utils.removeFromArray(markers, "parallel");
				if(attr.value == "StandardLoopCharacteristics"){
					//显示循环
					Utils.addToArray(markers, "loop");
				}else if(attr.value == "MultipleLoopCharacteristics"){
					var sequantial = Designer.getDefaultDataAttrByName("isSequantial");
					if(sequantial != null){
						if(sequantial.value == "true"){
							//显示三条横线
							Utils.addToArray(markers, "sequential");
						}else{
							//显示三条竖线
							Utils.addToArray(markers, "parallel");
						}
					}
				}
			}else if(attr.name == "isSequantial"){
				Utils.removeFromArray(markers, "sequential");
				Utils.removeFromArray(markers, "parallel");
				var loop = Designer.getDefaultDataAttrByName("loopCharacteristics");
				if(loop != null && loop.value == "MultipleLoopCharacteristics"){
					if(attr.value=="true"){
						//显示三条横线
						Utils.addToArray(markers, "sequential");
					}else{
						//显示三条竖线
						Utils.addToArray(markers, "parallel");
					}
				}
			}else if(attr.name == "isForCompensation"){
				//显示两个左箭头
				Utils.removeFromArray(markers, "compensation");
				if(attr.value=="true"){
					Utils.addToArray(markers, "compensation");
				}
			}else if(attr.name == "isCollection" || attr.name == "ParticipantMultiplicity"){
				Utils.removeFromArray(markers, "parallel");
				if(attr.value=="true"){
					//显示三条竖线
					Utils.addToArray(markers, "parallel");
				}
			}else if(attr.name == "loopType"){
				Utils.removeFromArray(markers, "loop");
				Utils.removeFromArray(markers, "sequential");
				Utils.removeFromArray(markers, "parallel");
				if(attr.value=="Standard"){
					//显示循环
					Utils.addToArray(markers, "loop");
				}else if(attr.value=="MultiInstanceSequential"){
					//显示三条横线
					Utils.addToArray(markers, "sequential");
				}else if(attr.value=="MultiInstanceParallel"){
					//显示三条竖线
					Utils.addToArray(markers, "parallel");
				}
			}
		}
		Designer.updateDataAttribute(attr);
		this.setAttributeList();
	},
	/**
	 * 删除数据属性
	 * @param {} attrId
	 */
	deleteAttr: function(attrId, event){
		event.stopPropagation();
		var item = $(".attr_item_" + attrId);
		item.remove();
		this.fitAttrList();
		Designer.deleteDataAttribute(attrId);
	},
	/**
	 * 进入全屏
	 */
	fullScreen: function(element, presentation){
		if (element.requestFullscreen) {
			element.requestFullscreen();
		} else if (element.mozRequestFullScreen) {
			element.mozRequestFullScreen();
		} else if (element.webkitRequestFullscreen) {
			element.webkitRequestFullscreen();
		} else {
			//无法进入全屏，提示错误
			if(presentation){
				$("#fullscreen_tip").find(".t").text("Since your browser's limitations, can't enter presentation view.");
			}else{
				$("#fullscreen_tip").find(".t").text("Can't enter full screen, you can press F11 to enter.");
			}
			$("#fullscreen_tip").fadeIn();
		}
	},
	/**
	 * 进入演示视图
	 */
	enterPresentation: function(){
		$("#designer").bind('webkitfullscreenchange', function(e) {
			Dock.manageFullScreen();
		});
		$(document).bind('mozfullscreenchange', function(e) {
			Dock.manageFullScreen();
		}).bind('fullscreenchange', function(e) {
			Dock.manageFullScreen();
		});
		this.fullScreen(Utils.getDomById("designer"), true);
		
	},
	/**
	 * 进入全屏视图
	 */
	enterFullScreen: function(){
		this.fullScreen(document.documentElement);
	},
	manageFullScreen: function(){
		var designer = Utils.getDomById("designer");
		if(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement){
			//如果进入全屏状态
			$("#shape_panel").addClass("readonly");
			$("#designer_viewport").addClass("readonly");
			$(window).unbind("resize.designer");
			$("#designer_layout").height(window.screen.height);
			//取消快捷键
			Designer.hotkey.cancel();
			Designer.op.cancel();
			//隐藏Dock
			$("#dock").hide();
			$(".dock_view").hide();
			Designer.contextMenu.destroy();
			Designer.op.canvasFreeDraggable();
		}else{
			$("#shape_panel").removeClass("readonly");
			$("#designer_viewport").removeClass("readonly");
			Designer.initialize.initLayout();
			Designer.hotkey.init();
			Designer.op.init();
			$("#dock").show();
			if(Dock.currentView != ""){
				Dock.showView(Dock.currentView);
			}
			Designer.contextMenu.init();
			$("#designer").unbind('webkitfullscreenchange');
			$("#designer").unbind('mozfullscreenchange').unbind('fullscreenchange');
		}
	}
};

/**
 * 鹰眼导航
 * @type {}
 */
var Navigator = {
	/**
	 * 初始化
	 */
	init: function(){
		$("#designer_layout").bind("scroll", function(){
			Navigator.setView();
		});
		//绑定拖动
		$("#navigation_eye").bind("mousedown", function(downE){
			var eye = $(this);
			var beginPos = eye.position();
			//先取消滚动事件
			$("#designer_layout").unbind("scroll");
			var layout = $("#designer_layout");
			var beginTop = layout.scrollTop();
			var beginLeft = layout.scrollLeft();
			//设计器画布
			var designerCanvas = $("#designer_canvas");
	 		var canvasW = designerCanvas.width();
	 		var canvasH = designerCanvas.height();
	 		//鹰眼视图画布
	 		var canvas = $("#navigation_canvas");
	 		var navW = canvas.width();
			var navH = canvas.height();
			//宽高比例
			var scaleW = canvasW / navW;
			var scaleH = canvasH / navH;
			$(document).bind("mousemove.navigator", function(moveE){
				var offsetX = moveE.pageX - downE.pageX;
				var offsetY = moveE.pageY - downE.pageY;
				var newLeft = beginLeft + offsetX * scaleW;
				layout.scrollLeft(newLeft);
				var newTop = beginTop + offsetY * scaleH;
				layout.scrollTop(newTop);
				eye.css({
					left: beginPos.left + offsetX,
					top: beginPos.top + offsetY
				});
			});
			$(document).bind("mouseup.navigator", function(moveE){
				$(document).unbind("mousemove.navigator");
				$(document).unbind("mouseup.navigator");
				Navigator.setView();
				//重新绑定
				$("#designer_layout").bind("scroll", function(){
					Navigator.setView();
				});
			});
		});
		$("#navigation_canvas").bind("click", function(e){
			var pos = Utils.getRelativePos(e.pageX, e.pageY, $(this));
			//设计器画布
			var designerCanvas = $("#designer_canvas");
	 		var canvasW = designerCanvas.width();
	 		var canvasH = designerCanvas.height();
	 		//鹰眼视图画布
	 		var canvas = $("#navigation_canvas");
	 		var navW = canvas.width();
			var navH = canvas.height();
			//宽高比例
			var scaleW = canvasW / navW;
			var scaleH = canvasH / navH;
			//得到点击位置，相对于设计器画布的坐标
			var canvasX = pos.x * scaleW;
			var canvasY = pos.y * scaleH;
			//把点击坐标，置于屏幕中心
			var layout = $("#designer_layout");
			var margin = Designer.config.pageMargin;
			layout.scrollLeft(canvasX + margin - layout.width()/2);
			layout.scrollTop(canvasY + margin - layout.height()/2);
		});
		this.setView();
	},
	/**
	 * 绘制鹰眼视图
	 */
	draw: function(){
		if(this.drawNavigationTimeout){
			window.clearTimeout(this.drawNavigationTimeout);
		}
		this.drawNavigationTimeout = setTimeout(function(){
			var canvas = $("#navigation_canvas");
			var ctx = canvas[0].getContext("2d");
			ctx.save();
			ctx.clearRect(0, 0, canvas.width(), canvas.height());
			ctx.scale(canvas.width() / Model.define.page.width, canvas.height() / Model.define.page.height);
			//从最底层开始绘制图形
			for(var i = 0; i < Model.orderList.length; i++){
				var shapeId = Model.orderList[i].id;
				var shape = Model.getShapeById(shapeId);
				ctx.save();
				if(shape.name != "linker"){
					//对图形执行绘制
					var p = shape.props;
					var style = shape.lineStyle;
					ctx.translate(p.x, p.y);
					ctx.translate(p.w/2, p.h/2);
					ctx.rotate(p.angle);
					ctx.translate(-(p.w/2), -(p.h/2));
					ctx.globalAlpha = shape.shapeStyle.alpha;
					Designer.painter.renderShapePath(ctx, shape);
				}else{
					var linker = shape;
					var style = linker.lineStyle;
					var points = linker.points;
					var from = linker.from;
					var to = linker.to;
					ctx.beginPath();
					ctx.moveTo(from.x, from.y);
					if(linker.linkerType == "curve"){
						var cp1 = points[0];
						var cp2 = points[1];
						ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, to.x, to.y);
					}else{
						for(var j = 0; j < points.length; j++){
							//如果是折线，会有折点
							var linkerPoint = points[j];
							ctx.lineTo(linkerPoint.x, linkerPoint.y);
						}
						ctx.lineTo(to.x, to.y);
					}
					ctx.lineWidth = style.lineWidth;
					ctx.strokeStyle = "rgb("+style.lineColor+")";
					ctx.stroke();
				}
				ctx.restore();
	 		}
	 		ctx.restore();
	 		Navigator.setView();
	 		this.drawNavigationTimeout = null;
		}, 100);
	},
	/**
	 * 设置鹰眼视图
	 */
	setView: function(){
 		var navigator = $("#navigation_eye");
 		//设计器可见视图
 		var layout = $("#designer_layout");
 		var viewW = layout.width();
 		var viewH = layout.height();
 		//鹰眼视图画布
 		var canvas = $("#navigation_canvas");
 		var navW = canvas.width();
		var navH = canvas.height();
		//设计器画布
 		var designerCanvas = $("#designer_canvas");
 		var canvasW = designerCanvas.width();
 		var canvasH = designerCanvas.height();
 		var margin = Designer.config.pageMargin;
 		//得到设计器画布在可视窗口中的left, top
		var visibleLeft = margin - layout.scrollLeft();
		var visibleRight = visibleLeft + canvasW;
		if(visibleLeft < 0){
			visibleLeft = 0;
		}else if(visibleLeft > viewW){
			visibleLeft = viewW;
		}
		if(visibleRight > viewW){
			visibleRight = viewW;
		}else if(visibleRight < 0){
			visibleRight = 0;
		}
		var visibleTop = margin - layout.scrollTop();
		var visibleBottom = visibleTop + canvasH;
		if(visibleTop < 0){
			visibleTop = 0;
		}else if(visibleTop > viewH){
			visibleTop = viewH;
		}
		if(visibleBottom > viewH){
			visibleBottom = viewH;
		}else if(visibleBottom < 0){
			visibleBottom = 0;
		}
		var visibleW = visibleRight - visibleLeft;
		var visibleH = visibleBottom - visibleTop;
		if(visibleW == 0 || visibleH == 0){
			//画布已经不可见
			navigator.hide();
		}else{
			//换算成鹰眼视图中的left, top
			var navLeft = layout.scrollLeft() - margin;
			if(navLeft < 0){
				navLeft = 0;
			}
			navLeft = navLeft * (navW / canvasW);
			var navTop = layout.scrollTop() - margin;
			if(navTop < 0){
				navTop = 0;
			}
			navTop = navTop * (navH / canvasH);
			var navViewW = visibleW * (navW / canvasW);
			var navViewH = visibleH * (navH / canvasH);
	 		navigator.css({
	 			left: navLeft-1,
	 			top: navTop-1,
	 			width: navViewW,
	 			height: navViewH
	 		}).show();
		}
	}
};
/**
 * jQuery的扩展
 */
(function($) {
	/**
	 * 按钮
	 */
	$.fn.button = function(options){
		if(typeof options == "string"){
			if(options == "disable"){
				$(this).addClass("disabled");
				$(this).find("input").attr("disabled", true);
			}else if(options == "enable"){
				$(this).removeClass("disabled");
				$(this).find("input").attr("disabled", false);
			}else if(options == "isDisabled"){
				return $(this).hasClass("disabled");
			}else if(options == "isSelected"){
				return $(this).hasClass("selected");
			}else if(options == "unselect"){
				$(this).removeClass("selected");
			}else if(options == "select"){
				$(this).addClass("selected");
			}else if(options == "setText"){
				$(this).children(".text_content").html(arguments[1]);
			}else if(options == "setColor"){
				$(this).children(".btn_color").css("background-color", "rgb(" + arguments[1] + ")");
			}else if(options == "getColor"){
				var color = $(this).children(".btn_color").css("background-color").replace(/\s/g, "");
				return color.substring(4, color.length - 1);
			}
			return $(this);
		}
		var target = $(this);
		target.unbind("click");
		target.unbind("mousedown")
		if(options.onClick){
			target.bind("click", function(){
				if(target.button("isDisabled")){
					return;
				}
				options.onClick();
			});
		}
		if(options.onMousedown){
			target.bind("mousedown", function(e){
				if(target.button("isDisabled")){
					return;
				}
				options.onMousedown();
				e.stopPropagation();
			});
		}
	};
	var currentMenu = null;
	//下拉控件
	$.fn.dropdown = function(options){
		var menu = $(this);
		menu.find(".ico_selected").remove();
		if(typeof options == "string"){
			if(options == "close"){
				menu.hide();
				currentMenu.target.removeClass("selected");
				$(document).unbind("mousedown.ui_dropdown");
				currentMenu = null;
			}else if(options == "select"){
				arguments[1].prepend("<div class='ico ico_selected'></div>");
			}
			return;
		}
		if(currentMenu != null){
			/**
			 * 如果当前有其他菜单是打开的，则要先关闭
			 */
			currentMenu.menu.dropdown("close");
		}
		var menu = $(this);
		var tar = options.target;
		currentMenu = {
			target: tar,
			menu: menu
		};
		var offset = tar.offset();
		tar.addClass("selected");
		menu.show();
		var left;
		if(options.position == "center"){
			left = offset.left + tar.outerWidth()/2 - menu.outerWidth()/2;
		}else if(options.position == "right"){
			left = offset.left + tar.outerWidth() - menu.outerWidth();
		}else{
			left = offset.left;
		}
		var top = offset.top + tar.outerHeight();
		if(top + menu.outerHeight() > $(window).height()){
			top = $(window).height() - menu.outerHeight();
		}
		menu.css({
			top: top,
			left: left
		});
		if(typeof options.zindex != "undefined"){
			menu.css("z-index", options.zindex);
		}
		menu.unbind("mousedown").bind("mousedown", function(e){
			e.stopPropagation();
		});
		if(typeof options.bind == "undefined" || options.bind == true){
			menu.find("li:not(.devider,.menu_text)").unbind().bind("click", function(){
				var item = $(this);
				if(!item.menuitem("isDisabled") && item.children(".extend_menu").length == 0){
					if(options.onSelect){
						options.onSelect(item);
					}
					menu.dropdown("close");
				}
			});
		}
		$(document).bind("mousedown.ui_dropdown", function(){
			menu.dropdown("close");
		});
	};
	//调色板
	$.colorpicker = function(options){
		var picker = $("#color_picker");
		picker.find(".selected").removeClass("selected");
		if(!picker.attr("init")){
			//没有经过初始化
			picker.find("div").each(function(){
				var color = $(this).css("background-color");
				color = color.replace(/\s/g, "");
				color = color.substring(4, color.length - 1);
				$(this).attr("col", color);
			});
			picker.attr("init", true);
		}
		var opt = $.extend({}, options, {bind: false});
		picker.dropdown(opt);
		picker.children(".color_items").children("div").unbind().bind("click", function(){
			if(options.onSelect){
				var color = $(this).css("background-color");
				color = color.replace(/\s/g, "");
				color = color.substring(4, color.length - 1);
				options.onSelect(color);
			}
			$("#color_picker").dropdown("close");
		});
		if(options.color){
			picker.find("div[col='"+options.color+"']").addClass("selected");
		}
		$("#color_picker").children(".color_extend").remove();
		if(options.extend){
			$("#color_picker").append("<div class='color_extend'>"+options.extend+"</div>")
		}
	};
	//颜色按钮
	$.fn.colorButton = function(opt){
		var tar = $(this);
		if(typeof opt == "string"){
			if(opt == "setColor"){
				tar.children(".picker_btn_holder").css("background-color", "rgb(" + arguments[1] + ")");
			}
			return;
		}
		tar.html("<div class='picker_btn_holder'></div><div class='ico ico_colordrop'></div>");
		tar.bind("mousedown", function(e){
			if(tar.button("isDisabled")){
				return;
			}
			e.stopPropagation();
			var options = $.extend({}, opt);
			options.target = tar;
			options.onSelect = function(color){
				tar.colorButton("setColor", color);
				if(opt.onSelect){
					opt.onSelect(color);
				}
			};
			var color = $(this).children(".picker_btn_holder").css("background-color");
			color = color.replace(/\s/g, "");
			color = color.substring(4, color.length - 1);
			options.color = color;
			$.colorpicker(options);
		});
	};
	/**
	 * 数字框
	 * min: 0, max: 360, unit: "°", step: 15,
	 */
	$.fn.spinner = function(opt){
		var spinner = $(this);
		if(typeof opt == "string"){
			if(opt == "getValue"){
				var result = spinner.find("input").val();
				result = parseInt(result);
				return result;
			}else if(opt == "setValue"){
				spinner.find("input").val(arguments[1]);
				spinner.attr("old", arguments[1]);
			}else if(opt == "setOptions"){
				var newOpt = arguments[1];
				if(typeof newOpt.min != "undefined"){
					spinner.attr("min", newOpt.min);
				}
				if(typeof newOpt.max != "undefined"){
					spinner.attr("max", newOpt.max);
				}
			}
			return;
		}
		spinner.html("<div class='spinner_input'><input/></div><div class='buttons'><div class='spinner_up'></div><div class='spinner_down'></div></div>");
		var defaults = {
			step: 1,
			unit: ""
		};
		opt = $.extend(defaults, opt);
		//将max和min配置放到行内属性中，可以支持动态修改
		if(typeof opt.min != "undefined"){
			spinner.attr("min", opt.min);
		}
		if(typeof opt.max != "undefined"){
			spinner.attr("max", opt.max);
		}
		var inputBox = spinner.children(".spinner_input");
		var input = inputBox.find("input");
		spinner.spinner("setValue", opt.min + opt.unit);
		spinner.find(".spinner_up").bind("click", function(){
			if(spinner.button("isDisabled")){
				return;
			}
			var now = spinner.spinner("getValue");
			var newVal = now + opt.step;
			setSpinnerValue(spinner, newVal, opt);
		});
		spinner.find(".spinner_down").bind("click", function(){
			if(spinner.button("isDisabled")){
				return;
			}
			var now = spinner.spinner("getValue");
			var newVal = now - opt.step;
			setSpinnerValue(spinner, newVal, opt);
		});
		input.bind("keydown", function(e){
			if(e.keyCode == 13){
				var newVal = parseInt($(this).val());
				if(isNaN(newVal)){
					newVal = opt.min;
				}
				setSpinnerValue(spinner, newVal, opt);
			}
		}).bind("focus", function(e){
			$(this).select();
			$(this).bind("mouseup", function(e){
				e.preventDefault();
				$(this).unbind("mouseup");
			});
			var box = $(this).parent().parent();
			if(!box.hasClass("active")){
				box.addClass("active inset");
			}
		}).bind("blur", function(e){
			var box = $(this).parent().parent();
			if(box.hasClass("inset")){
				box.removeClass("active inset");
			}
		});
	};
	function setSpinnerValue(spinner, value, opt){
		if(spinner.attr("max")){
			var max = parseInt(spinner.attr("max"));
				if(value > max){
				value = max;
			}
		}
		if(spinner.attr("min")){
			var min = parseInt(spinner.attr("min"));
			if(value < min){
				value = min;
			}
		}
		var oldValue = spinner.attr("old");
		var newValue = value + opt.unit;
		if(oldValue != newValue){
			if(opt.onChange){
				opt.onChange(value);
			}
		}
		spinner.spinner("setValue", value + opt.unit);
	}
	/**
	 * 菜单项
	 */
	$.fn.menuitem = function(options){
		var target = $(this);
		if(typeof options == "string"){
			if(options == "disable"){
				target.addClass("disabled");
			}else if(options == "enable"){
				target.removeClass("disabled");
			}else if(options == "isDisabled"){
				return target.hasClass("disabled");
			}else if(options == "isSelected"){
				return target.children(".ico_selected").length > 0;
			}else if(options == "unselect"){
				return target.children(".ico_selected").remove();
			}else if(options == "select"){
				return target.prepend("<div class='ico ico_selected'></div>")
			}
		}
	};
	/**
	 * 窗口
	 */
	$.fn.dlg = function(options){
		var dlg = $(this);
		if(typeof options == "string"){
			if(options == "close"){
				dlg.children(".dlg_close").trigger("click");
			}
			return;
		}
		var defaults = {closable: true};
		options = $.extend(defaults, options);
		var close = dlg.children(".dlg_close");
		if(close.length == 0){
			close = $("<div class='ico dlg_close'></div>").appendTo(dlg);
		}
		if(options.closable == false){
			close.hide();
		}else{
			close.show();
		}
		$(".dlg_mask").remove();
		$("body").append("<div class='dlg_mask'></div>")
		close.unbind().bind("click", function(){
			dlg.hide();
			$(".dlg_mask").remove();
			if(options && options.onClose){
				options.onClose();
			}
			$(document).unbind("keydown.closedlg");
			dlg.find("input,textarea,select").unbind("keydown.closedlg");
		});
		dlg.css({
			left: ($(window).width() - dlg.outerWidth())/2,
			top: ($(window).height() - dlg.outerHeight())/2
		});
		dlg.show();
		if(options.closable){
			dlg.find("input,textarea,select").unbind("keydown.closedlg").bind("keydown.closedlg", function(e){
				if(e.keyCode == 27){
					dlg.children(".dlg_close").trigger("click");
				}
			});
			$(document).unbind("keydown.closedlg").bind("keydown.closedlg", function(e){
				if(e.keyCode == 27){
					dlg.children(".dlg_close").trigger("click");
				}
			});
		}
		dlg.children(".dialog_header").unbind("mousedown.drag_dlg").bind("mousedown.drag_dlg", function(e){
			var target = $(this).parent();
			var downX = e.pageX;
			var downY = e.pageY;
			var downLeft = target.offset().left;
			var downTop = target.offset().top;
			$(document).bind("mousemove.drag_dlg", function(e){
				var left = e.pageX - downX + downLeft;
				var top = e.pageY - downY + downTop;
				target.offset({
					left: left,
					top: top
				});
			});
			$(document).bind("mouseup.drag_dlg", function(e){
				$(document).unbind("mousemove.drag_dlg");
				$(document).unbind("mouseup.drag_dlg");
			});
		});
	};
})(jQuery);

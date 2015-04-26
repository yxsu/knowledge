/**
 * Created by Yuxin Su on 2014/11/4.
 */

var Tikz = {
    flag: {
        id: "name=",
        width: "minimum width=",
        height: "minimum height="
    },
    regexp: {
        id: /name=([a-z\d]+)/g,
        width: /minimum width=(\d+)/g,
        height: /minimum height=(\d+)/g,
        center: /\((\d+), (\d+)\)/g,
        text: /{(.*)}/g
    },
    readElements: function (content) {
        var statements = content.split(";");
        var elements = {};
        for (var id in statements) {
            var command = statements[id];
            if (/^\\node\[rectangle/.test(command)) {
                var shape = this.setRectangleToShape(command);
                elements[shape.id] = shape;
            }
        }
        return elements;
    },
    getRectangleFromShape: function (shape) {
        if (shape.name !== 'rectangle') {
            throw new EvalError("Input shape is not a rectangle");
        }
        var result = '\\node[rectangle, draw, ';
        //add size
        result += Tikz.flag.width + shape.props.w + ', '
        result += Tikz.flag.height + shape.props.h + ', '
        //add ID
        result += this.flag.id + shape.id + '] '
        //add position
        var center = {
            x: shape.props.x + shape.props.w / 2,
            y: shape.props.y + shape.props.h / 2
        }
        result += '(' + center.x + ', ' + center.y + ')';
        //add text
        result += '{' + String.fromCharCode.apply(null, shape.textBlock[0].text) + '};';
        return result
    },
    setRectangleToShape: function (content) {

        //extract useful information
        //id
        var reg_result = this.regexp.id.exec(content);
        if(typeof reg_result == null) {
            throw new Error("ID of rectangle not found");
        }
        var id = reg_result[1];
        //position and size
        reg_result = this.regexp.width.exec(content);
        if(typeof reg_result == null) {
            throw new Error("Width of rectangle not found");
        }
        var width = parseInt(reg_result[1]);
        reg_result = this.regexp.height.exec(content);
        if(typeof reg_result == null) {
            throw new Error("Height of rectangle not found");
        }
        var height = parseInt(reg_result[1]);
        reg_result = this.regexp.center.exec(content);
        if(typeof reg_result == null) {
            throw new Error("center point of rectangle not found");
        }
        var center_x = parseInt(reg_result[1]);
        var center_y = parseInt(reg_result[2]);
        //set shape attribute
        var newShape = Utils.copy(Schema.shapes["rectangle"]);
        newShape.id = id;
        newShape.props.x = center_x - width / 2;
        newShape.props.y = center_y - height / 2;
        newShape.props.w = width;
        newShape.props.h = height;
        newShape.props.zindex = Model.maxZIndex + 1;
        newShape.props = $.extend(true, {}, Schema.shapeDefaults.props, newShape.props);
        //add text
        reg_result = this.regexp.text.exec(content);
        if(typeof reg_result == null) {
            throw new Error("Text of rectangle not found");
        }
        var text = reg_result[1];
        var textBlock = newShape.textBlock[0];
        var code_list = new Array(text.length);
        for(var i = 0; i < code_list.length; i++) {
            code_list[i] = text.charCodeAt(i);
        }
        textBlock.text = code_list;
        return newShape;
    },

    getRoundRectangle: function (shape) {

    },
    getlink: function (shape) {

    }
};
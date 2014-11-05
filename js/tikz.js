/**
 * Created by Yuxin Su on 2014/11/4.
 */

var Tikz = {
    flag: {
        id: "name="
    },
    regexp: {
        id: new RegExp(Tikz.flag.id + "[a-z\\d]+")
    },
    readElements: function(content) {
        var statements = content.split(";");
        var elements = {};
        for(var id in statements) {
            var command = statements[id];
            if(/^\\node\[rectangle/.test(command)) {
                var shape = this.setRectangleToShape(command);
                elements[shape.id] = shape;
            }
        }
        return elements;
    },
    getRectangleFromShape: function(shape) {
        if(shape.name !== 'rectangle'){
            throw new EvalError("Input shape is not a rectangle");
        }
        var result = '\\node[rectangle, draw, ';
        //add size
        result += 'minimum width='+shape.props.w+', '
        result += 'minimum height='+shape.props.h+ ', '
        //add ID
        result += this.flag.id + shape.id + '] '
        //add position
        var center = {
            x: shape.props.x + shape.props.w / 2,
            y: shape.props.y + shape.props.h / 2
        }
        result += '(' + center.x +', ' + center.y +')';
        //add text
        result += '{' + String.fromCharCode.apply(null, shape.textBlock[0].text) + '};';
        return result
    },
    setRectangleToShape: function(content) {
        //extract useful information
        //id
        var id = content.match(this.regexp.id)[0].substring(this.flag.id.length);
        //set shape attribute
        var newShape = Utils.copy(Schema.shapes["rectangle"]);
        newShape.id = id;
        newShape.props.x = x;
        newShape.props.y = y;
        newShape.props.zindex = Model.maxZIndex + 1;
        newShape.props = $.extend(true, {}, Schema.shapeDefaults.props, newShape.props);
        return newShape;
    },

    getRoundRectangle: function(shape) {

    },
    getlink: function(shape) {

    }
}
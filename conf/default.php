<?php
/**
 * Default settings for the mind plugin
 *
 * @author Yuxin Su <suyuxin@outlook.com>
 */
$prefix = '/dokuwiki/lib/plugins/mind/js/';

$conf['url'] = array(
    $prefix . 'util.js',
    $prefix . 'schema.js',
    $prefix . 'standard.js',
    $prefix . 'designer_core.js',
    $prefix . 'designer_ui.js',
    $prefix . 'designer_event.js',
    $prefix . 'designer_function.js',
);
$conf['config'] = '
var definition = {
    "page":{
        "showGrid":true,
        "padding":0,
        "gridSize":15,
        "width":1500,
        "height":1500,
        "backgroundColor":"255,255,255"
    },
    "elements": {},
    "title" : "empty"
};';
$conf['configfile'] = "";


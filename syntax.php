<?php
/**
 * DokuWiki Plugin Mind (Syntax Component)
 *
 * @license GPL 2 http://www.gnu.org/licenses/gpl-2.0.html
 * @author  Yuxin Su <suyuxin@outlook.com>
 */

// must be run within Dokuwiki
if(!defined('DOKU_INC')) define('DOKU_INC',realpath(dirname(__FILE__).'/../../').'/');
if(!defined('DOKU_PLUGIN')) define('DOKU_PLUGIN',DOKU_INC.'lib/plugins/');

require_once DOKU_PLUGIN.'syntax.php';

class syntax_plugin_mind extends DokuWiki_Syntax_Plugin {

    /**
     * What about paragraphs?
     */
    function getPType(){
        return 'normal';
    }

    /**
     * What kind of syntax are we?
     */
    function getType(){
        return 'substition';
    }

    /**
     * Where to sort in?
     */
    function getSort(){
        return 200;
    }

    /**
     * Connect pattern to lexer
     */
    function connectTo($mode) {
        $this->Lexer->addSpecialPattern('<mind.*?>\n.*?\n</mind>',$mode,'plugin_mind');
    }

    public function handle($match, $state, $pos, &$handler){
        // Just pass it through...
        $match = str_replace("\n","",$match);
        if(preg_match('/\<mind\>(.*)\<\/mind\>/',$match,$result)){
            return $result[1];
        }
        return $match;
    }

    public function render($mode, &$renderer, $data) {
        if($mode != 'xhtml') return false;
        $renderer->doc .= '<script type="text/javascript">';
        $renderer->doc .= 'definition.elements='.$data .';</script>';
        $renderer->doc .= '<div id="designer_viewport">
			<div style="width: 400px; height: 400px; padding: 25px; cursor: default;" id="canvas_container">
				<div style="background-color: rgb(242, 242, 242);" id="designer_canvas">
					<canvas height="400" width="400" id="designer_grids"></canvas>
		        </div>
            </div></div>';
        return true;
    }
}
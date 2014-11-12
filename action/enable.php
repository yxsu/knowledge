<?php
/**
 * DokuWiki Plugin mind (Action Component)
 *
 * @license GPL 2 http://www.gnu.org/licenses/gpl-2.0.html
 * @author  Yuxin Su <suyuxin@outlook.com>
 */

// must be run within Dokuwiki
if (!defined('DOKU_INC')) die();

if (!defined('DOKU_LF')) define('DOKU_LF', "\n");
if (!defined('DOKU_TAB')) define('DOKU_TAB', "\t");
if (!defined('DOKU_PLUGIN')) define('DOKU_PLUGIN',DOKU_INC.'lib/plugins/');

require_once DOKU_PLUGIN.'action.php';

class action_plugin_mind_enable extends DokuWiki_Action_Plugin {

    // Register our handler for the TPL_METAHEADER_OUTPUT event
    public function register(Doku_Event_Handler &$controller) {
       $controller->register_hook('TPL_METAHEADER_OUTPUT', 'BEFORE', $this, 'handle_tpl_metaheader_output');
    }

    // Add <script> blocks to the headers:
    //  load Mind and one to configure it
    //  Also add one block per configfile, if any are specified
    //  See http://docs.mathjax.org/en/latest/configuration.html#using-in-line-configuration-options
    public function handle_tpl_metaheader_output(Doku_Event &$event, $param) {
        // Create main config block
        $event->data['script'][] = array(
			'type'    => 'text/javascript',
			'_data'   => $this->getConf('config'),
		);

        // Load mind itself
        $files = $this->getConf('url');
        foreach ($files as $f) {
            $event->data['script'][] = array(
                'type'    => 'text/javascript',
                'charset' => 'utf-8',
                'src'     => $f,
                '_data'   => '',
            );
        }
    }

}

// vim:ts=4:sw=4:et:

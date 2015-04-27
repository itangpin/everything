/**
 * Created by pin on 4/14/15.
 * Events: ['panelChange']
 */

define([
    'everything',
    'toolbar',
    'event',
    'editor',
    'setting',
    'angular'], function (Everything,
                          Toolbar,
                          EventMgr,
                          Editor,
                          Setting) {
    var APP = {};
    APP.status = {
        editor: {
            launched: false
        },
        list: {}
    };
    APP.init = function () {
        // if it is inside chrome app
        if(chrome.storage){
            this.type = 'chrome';
        }else{
            this.type = 'web';
        }
        this.eventMgr = new EventMgr();
        // initiat toolbar
        this.toolbar = new Toolbar({
            container: '#toolbar',
            switcherEl: [
                {
                    button: '#writing-btn',
                    panel: '#panel-writing',
                    name: 'writing'
                },
                {
                    button: '#list-btn',
                    panel: '#container',
                    name: 'list'
                },
                {
                    button: '#setting-btn',
                    panel: '#panel-setting',
                    name: 'setting'
                }
            ],
            panelClass: '.panel',
            buttonClass: '.button',
            eventMgr: this.eventMgr
        });
        // init editor
        this.editor = new Editor({
            titleEl: $('.editor-title')[0],
            contentEl: $('.editor-content')[0]
        });
        this.status.editor.launched = true;
        // init setting
        this.setting = Setting;
        this.setting.init({type:this.type});
        this.listenEvents();
    };
    APP.listenEvents = function () {
        var self = this;
        // panel change event
        this.eventMgr.addListener('panelChange', function (data) {
            if (data.panel == 'writing') {
                self.editor.onPanelActive(data);
            }
        });
    };
    /**
     * Launch editor from the data of a given node
     * @param {Node}node
     */
    APP.launchEditorFromNode = function (node) {
        this.toolbar.switchPanel('writing');
        this.editor.launchEditorFromNode(node);
    };
    return APP;
});

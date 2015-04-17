/**
 * Created by pin on 4/14/15.
 * Events: ['panelChange']
 */

define([
    'everything',
    'toolbar',
    'event',
    'editor'], function (Everything,
                         Toolbar,
                         EventMgr,
                         Editor) {
    var APP = {};
    APP.init = function () {
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
        this.listenEvents();
    };
    APP.listenEvents = function () {
        var self = this;
        // panel change event
        this.eventMgr.addListener('panelChange', function (data) {
            if(data.panel == 'writing'){
                self.editor = new Editor({
                    titleEl: $('.editor-title')[0],
                    contentEl: $('.editor-content')[0]
                });
                self.editor.onPanelActive(data);
            }
        });
    };
    return APP;
});

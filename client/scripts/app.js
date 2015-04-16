/**
 * Created by pin on 4/14/15.
 * Events: ['panelChange']
 */

define(['everything','toolbar','event'],function(Everything,Toolbar, Event){
    var APP = {};
    APP.eventMgr = new Event();
    APP.init = function(){
        // initiat toolbar
        this.toolbar = new Toolbar({
            container: '#toolbar',
            switcherEl: [
                {
                    button: '#writing-btn',
                    panel : '#panel-writing',
                    name: 'writing'
                },
                {
                    button: '#list-btn',
                    panel : '#container',
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
    APP.listenEvents = function(){
        this.eventMgr.addListener('panelChange', function(data){

        });
    };
    return APP;
});

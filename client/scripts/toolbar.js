/**
 * Created by pin on 4/14/15.
 */

define(function(){

    var Toolbar = function(option){
        this.container = document.querySelector(option.container);
        this.switcherEl = option.switcherEl;
        this.panelClass = option.panelClass;
        this.buttonClass = option.buttonClass;
        this.eventMgr = option.eventMgr;
        this.panels = {};
        this.init();
    };
    Toolbar.prototype.init = function(){
        var self = this;
        this.switcherEl.forEach(function(v){
            self.panels[v.name] = v;
            self.container.querySelector(v.button).addEventListener('click', function(e){
                self.switchPanel(v.name);
                self.eventMgr.fire('panelChange', {panel: v.name, from: 'toolbar'});
            });
        });
    };
    Toolbar.prototype.on = function(type, el, handler){
        this.buttons.push(el);
        var self = this;
        handler.forEach(function(v){
            self.container.querySelector(el).addEventListener(v.type, v.callback);
        });
    };
    Toolbar.prototype.switchPanel = function(panelName){
        var p = this.panels[panelName];
        if(this.currentPanel == p){
            return;
        }
        var panel = p.panel,
            button = p.button;
        $(this.panelClass).hide();
        $(panel).show();
        $(this.buttonClass).removeClass('hi');
        $(button).addClass('hi');
        this.currentPanel = p;
    };

    return Toolbar;
});

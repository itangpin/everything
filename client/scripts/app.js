/**
 * Created by pin on 4/14/15.
 */

define(['everything','toolbar'],function(Everything,Toolbar){
    var APP = {};
    APP.init = function(){
        this.toolbar = new Toolbar({
            container: '#toolbar',
            switcherEl: [
                {
                    button: '#writing-btn',
                    panel : '#editor-container'
                },
                {
                    button: '#list-btn',
                    panel : '#container'
                }
            ],
            panelClass: '.panel',
            buttonClass: '.button'
        });
    };
    return APP;
});

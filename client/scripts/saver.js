define(function(require, exports, module){
    var Saver = function(app){
        this.app = app;
    };
    Saver.prototype.save = function(){
        this.saveLocalStorage();
    };
    Saver.prototype.saveLocalStorage = function(){
        var value = this.app.getRootValue();
        window.localStorage.setItem('value',JSON.stringify(value));
    };
    module.exports = Saver;
});
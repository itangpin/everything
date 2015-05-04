define(function(){
    var Saver = function(app){
        this.app = app;
        if(chrome.storage){
            // chrome app
            this.type = 'chrome';
        }else{
            // normal web app
            this.type = 'normal';
        }
    };
    Saver.prototype.save = function(){
        if(this.type == 'normal'){
            this.saveLocalStorage();
        }else if(this.type == 'chrome'){
            this.saveChromeStorage();
        }
    };
    Saver.prototype.saveLocalStorage = function(){
        var value = this.app.getRootValue();
        window.localStorage.setItem('value',JSON.stringify(value));
    };
    Saver.prototype.saveChromeStorage = function(){
        var value = this.app.getRootValue();
        chrome.storage.local.set({'value':value},function(){
            console.log('data saved');
        });
    };
    return Saver;
});
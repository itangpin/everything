define(function () {
    var Saver = function (app) {
        this.app = app;
        if (chrome.storage) {
            // chrome app
            this.type = 'chrome';
        } else {
            // normal web app
            this.type = 'normal';
        }
    };
    Saver.prototype.save = function () {
        if (this.type == 'normal') {
            this.saveLocalStorage();
        } else if (this.type == 'chrome') {
            this.saveChromeStorage();
        }
        var self = this
        $.ajax({
            type: "POST",
            url: '/api/data/replaceall',
            data: JSON.stringify({data:self.app.getRootValue()}),
            contentType:"application/json; charset=utf-8",
            dataType: 'json'
        })
    };
    Saver.prototype.saveLocalStorage = function () {
        var value = this.app.getRootValue();
        window.localStorage.setItem('value', JSON.stringify(value));
    };
    Saver.prototype.saveChromeStorage = function () {
        var value = this.app.getRootValue();
        chrome.storage.local.set({'value': value}, function () {
            console.log('data saved');
        });
    };
    Saver.prototype.saveServer = function(){
        var value = this.app.getRootValue();
        $.ajax({
            type: 'POST',
            url: '/api/'
        })
    }
    return Saver;
});
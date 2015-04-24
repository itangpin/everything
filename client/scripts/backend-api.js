/**
 * Created by pin on 4/24/15.
 */
define(function(){
    var api = function(option){
        // 'web' or 'chrome'
        this.type = option.type;
        if(this.type == 'chrome'){
            this.domain = option.domain;
            this.urlPrefix = this.domain;
        }else{
            this.urlPrefix = '';
        }
    };

    api.prototype = {
        checkSignin: function(){
            return $.get(this.urlPrefix+'/api/user/status');
        }
    };
    api.prototype.constructor = api;

    return api;
});

/**
 * @author 唐品(Tang Pin)
 * Created on 3/10/15.
 */

define(function(){
    var Package = function(app){
        this.packages = {};
        this.app = app;
        this.init();
    };

    Package.prototype.init = function(){
        // load all the packages in the package folder

    };
    Package.prototype.add = function(packName,pack){
        this.packages[packName]=pack;
        if($.isFunction(pack.init)){
            pack.init(this.app);
        }
    };
    Package.prototype.get = function(packaName){
        return this.packages[packaName];
    };

    return Package;
});

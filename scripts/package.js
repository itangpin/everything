/**
 * @author 唐品(Tang Pin)
 * Created on 3/10/15.
 */

define(function(require, exports, module){
    var Package = function(){
        this.packages = {};
        this.init();
    };

    Package.prototype.init = function(){
        // load all the packages in the package folder

    };
    Package.prototype.add = function(packName,pack){
        this.packages[packName]=pack;
    };
    Package.prototype.get = function(packaName){
        return this.packages[packaName];
    };

    module.exports = Package;
});

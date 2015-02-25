/**
 * @author 唐品 (Tang Pin)
 * created at 2015-2-13
 */
define(function(require,exports,module){

    var Node = require('./node.js');

    var Everything = function(data,option){
        if(!option.container){
            // create a container
            this.createContainer();
        }
        this.container = option.container;

        this.instancingNode(data);
    };

    Everything.prototype.createContainer = function(){

    };

    Everything.prototype.instancingNode = function(data){
        var rootNode = new Node(data,null,{
            type:'append',
            el: this.container
        });
        rootNode.setRoot();
    };

    module.exports = Everything;
});

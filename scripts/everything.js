/**
 * @author 唐品 (Tang Pin)
 * created at 2015-2-13
 */
define(function(require,exports,module){

    var Node = require('./node.js');
    var History = require('./history.js');

    var Everything = function(data,option){
        if(!option.container){
            // create a container
            this.createContainer();
        }
        this.frame = option.container;
        this.history = new History();
        this._create(data);
    };

    Everything.prototype.createContainer = function(){

    };

    Everything.prototype._create= function(data){
        var app = this;
        var rootNode = new Node(data,app);
        rootNode.adjustDom({
            type:'append',
            el: this.frame
        });
        rootNode.setRoot();

        // create one global event listener to handle all events from all nodes
        var onEvent = function(event){
            app.onEvent(event);
        };
        var events = ['click', 'keydown'];
        $.each(events, function(index, value){
            app.frame.addEventListener(value, onEvent);
        });
    };

    /**
     * Handle events on the application element
     */
    Everything.prototype.onEvent = function(event){
        event.preventDefault();
        if(event.type == 'keydown'){
            //onKeydown();
        }
        var onkeydown = function(){
            // TODO
            // moving the focus to the next element
            // search for content
            // undo redo
        };

        var node = Node.getNodeFromTarget(event.target);
        if(node){
            node.onEvent(event);
        }
    };

    /**
     * Store history when a node is moved, removed, duplicated, etc.
     * @param {String} action action name
     * @param {Object} option
     */
    Everything.prototype.onAction = function(action,option){
        // add action to history
        if(this.history){
            this.history.add(action,option);
        }
        // trigger Extension callbacks
    };


    module.exports = Everything;
});

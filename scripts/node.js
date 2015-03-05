/**
 * @author 唐品 (Tang Pin)
 * created at 2015-2-8
 */
define(function(require, exports, module){
    var util = require('./util.js');

    var Node = function(data,parent,position,option,app){
        this.data = data;
        this.parent = parent;
        // app is the instance of the application
        // which hold the status of the apllication
        this.app = app;
        this.id = util.uuid();
        this._create(position);
    };

    Node.getNodeFromTarget = function(target){
        while (target) {
            if (target.node) {
                return target.node;
            }
            target = target.parentNode;
        }

        return undefined;
    };

    Node.prototype.children = [];
    Node.prototype.childrenMap  ={};
    Node.prototype.isRootNode = false;

    Node.prototype._create = function(position){
        var self = this;
        this._createDom();
        //this._bindEvent();

        // add the created Node to the DOM
        if(position){
            switch (position.type){
                case 'after':
                    insertAfter(position.el);
                    break;
                case 'append':
                    appendInside(position.el);
                    break;
                default:
                    break;
            }
        }else{
            this.parent.appendChild(this.row);
        }

        function insertAfter(el){
            $(el).after(self.row);
        }
        function appendInside(el){
            $(el).append(self.row);
        }
    };
    /**
     * Create the dom of the Node
     * @private
     */
    Node.prototype._createDom = function(){
        // the outer
        var row = document.createElement('div');
        row.className = "project";
        row.setAttribute('projectId',this.id);
        // used when finding node from event target(target.node)
        row.node = this;
        this.row = row;
        // function button
        var linkOuter = document.createElement('a');
        linkOuter.className = 'function-btn';
        var button = document.createElement('span');
        button.className = "function-dot-1";
        var button2= document.createElement('span');
        button2.className = "function-dot-2";
        button.appendChild(button2);
        linkOuter.appendChild(button);
        this.row.appendChild(linkOuter);
        this.buttonElement = linkOuter;
        // content
        var content = document.createElement('div');
        content.className = "project-content";
        this.contentElement = content;
        this.contentElement.setAttribute('contentEditable', true);
        this.row.appendChild(content);
        // children
        var children = document.createElement('div');
        children.className = 'children';
        this.childrenElement = children;
        this.row.appendChild(children);
        // todo: remove 'write here'
        if(this.data){
            this.setValue(this.data);
        }else{
            this.setValue('write here...');
        }
    };

    /**
     * Handle events
     * @param {event object} event event object from browser
     */
    Node.prototype.onEvent = function(event){
        var type = event.type;
        var target = event.target || event.srcElement;

        // Keyboard events
        if(type == 'keydown'){
            var keyNum = event.keyCode;
            // Enter
            if(keyNum==3){
                event.preventDefault();
                // create new line
                this.createSiblingNodeAfter();
                return false;
            }
            // Tab
            if(9 == e.keyCode){
                e.preventDefault();
                // Shift + Tab
                if(e.shiftKey){
                    this.unindent();
                }else{
                    this.indent();
                }
                return false;
            }
            // Delete
            if(46 == e.keyCode){
                e.preventDefault();
                self.parent.removeChild(self.id);
                return false;
            }
            // Backspace on an 'empty' node
            if(8 == e.keyCode){
                if(self.getContent() == ""){
                    self.parent.removeChild(self.id);
                }
            }
        }

        // Mouse click events
        if(type == 'click'){
            if(target == this.buttonElement
                || target == this.buttonElement.childNodes[0]
                || target == this.buttonElement.childNodes[1]){
                this.collapse();
            }
        }

    };

    /**
     * Set content and children of the node,
     * @param {String|Array|Object} value content of the Node
     */
    Node.prototype.setValue = function(value){
        if(_.isArray(value)){
            value = {
                content: "",
                children: value
            };
            this.data = value;
            this.setValue(value);
            return;
        }
        if(_.isString(value)){
            this.setContent(value);
            return;
        }
        if(value.content!=undefined && _.isArray(value.children)){
            this.setContent(value.content || "");
            if(value.children){
                this.setChildren(value.children);
            }
        }

    };

    /**
     * Set the content
     * @param value
     */
    Node.prototype.setContent= function(value){
        if(_.isString(value)){
            this.content = value;
            this.contentElement.innerHTML = this.content;
        }
    };

    /**
     * Set parent Node
     * @param {Node}parent
     */
    Node.prototype.setParent = function(parent){
        this.parent = parent;
    };

    /**
     * Set the children Nodes
     * @param {Array} children
     */
    Node.prototype.setChildren = function(children){
        var self = this;
        if(_.isArray(children) && children.length) {
            _.each(children, function(element,index,list) {
                self.createChild(element);
            });
            // change style of the function dot if has children
            this.row.className += " hasChild";
        }
    };

    Node.prototype.getContent = function(){
        this.content = this.contentElement.innerHTML;
        return this.content;
    };

    /**
     * Hide content of the Node,
     * show only the children.
     * Used when create root Node .etc
     */
    Node.prototype.setRoot = function(){
        this.row.className += " onlychildren";
        this.isRootNode = true;
    };




/* ============================================================
 *                   Actions to move nodes
 * ============================================================*/

    /**
     * Get sibling node before/after this node,
     * get parent node,
     * get child nodes
     * @param position
     */
    Node.prototype.getRelativeNode = function(position){
        switch (position){
            case 'before':
                var prevNodeElement = this.row.previousSibling;
                if(prevNodeElement){
                    var prevNodeId = prevNodeElement.getAttribute('projectId');
                    return this.parent.findChildById(prevNodeId);
                }else{
                    return null;
                }
                break;
        }
    };
    /**
     * Add a Node as a sibling Node right after this node
     * @param {Node} node node to moved
     */
    Node.prototype.addSiblingNodeBefore = function(node){
        if(this.isRootNode){
            // rootNode is a placeholder
            return;
        }
        if(node.isRootNode){
            node.isRootNode = false;
        }
        if(!beforeWhich){

        }
        node.parent.removeChild(node.id);
        node.parent = this.parent;
        this.parent.addChild(node);
        // TODO
        // add updateDom method to Node
        $(this.row).before(node.row);
    };
    /**
     * Add a Node as a sibling Node right before this node
     * @param node
     */
    Node.prototype.addSiblingNodeAfter = function(node){
        var nodeAfterThis = this.getRelativeNode('before');
        if(nodeAfterThis != null){
            nodeAfterThis.addSiblingNodeBefore(node);
        }else{
            // this is the last child of its parent node
            this.parent.appendChild(node);
        }
    };

    /**
     * Create an empty Node after this node
     */
    Node.prototype.createSiblingNodeAfter = function(){
        var siblingNode = new Node(null,this.parent,{type:'after',el:this.row},this.app);
        this.parent.addChild(siblingNode);
        siblingNode.focusRange();
    };

    /**
     * Create a child Node
     * @param {object} data
     */
    Node.prototype.createChild = function(data){
        var childNode = new Node(data,this,{type:'append',el:this.childrenElement},this.app);
        this.children.push(childNode);
        this.childrenMap[childNode.id] =  childNode;
        childNode.focusRange();
    };
    /**
     * Append a child Node at the tailer of the Node
     * @param child
     */
    Node.prototype.appendChild = function(child){
        this.childrenElement.appendChild(child.row);
        this.children.push(child);
        this.childrenMap[child.id] = child;
    };
    /**
     * Add a node to the children node map
     */
    Node.prototype.addChild = function(child){
        this.children.push(child);
        this.childrenMap[child.id] = child;
    };

    /**
     * Remove specific child
     * @param id id of the child Node
     */
    Node.prototype.removeChild = function(id){
        var childNode = this.childrenMap[id];
        //TODO 有问题
        //childNode.row.parentNode.removeChild(childNode.row);
        this.children = _.filter(this.children,function(child){
            return child.id!=id;
        });
        this.childrenMap[id] = undefined;
        childNode.row.parentNode.removeChild(childNode.row);
    };

    /**
     * Tell if the Node has children
     */
    Node.prototype.hasChild = function(){
        return this.children.length;
    };

    /* ============================================================
     *         Actions triggered by event handler 'onAction'
     * ============================================================*/

    Node.prototype._onInsertBefore = function(data){
        var Node = new Node();
    };
    /**
     *  focus on the element
     * todo: need to be rewrite
     */
    Node.prototype.focusRange = function(){
        var el = this.contentElement;
        var range = document.createRange();
        var sel = window.getSelection();
        range.setStart(el,0);
        range.setEnd(el,1);
        sel.removeAllRanges();
        sel.addRange(range);
        el.focus();
    };

    /**
     * Indent the Node,
     * turn the  node into a child node of the sibling node before it.
     */
    Node.prototype.indent = function(){
        // if is not the first node
        if(this.row.previousSibling){
            var prevNodeElement = this.row.previousSibling;
            var prevNodeId = prevNodeElement.getAttribute('projectId');
            var prevNode = this.parent.findChildById(prevNodeId);
            prevNode.appendChild(this);
            this.parent = prevNode;
        }
    };

    Node.prototype.unindent= function(){
        if(!this.parent){
            return;
        }
        this.parent.addSiblingNodeAfter(this);
        //TODO 有问题
        // this.parent.removeChild(this.id);
    };

    Node.prototype.getPrevNode = function(){
        if(!this.prevNodeElement || !this.prevNode){
            if(this.row.previousSibling){
                this.prevNodeElement = this.row.previousSibling;
                var prevNodeId = this.prevNodeElement.getAttribute('projectId');
                this.prevNode = this.parent.findChildById(prevNodeId);
                return this.getPrevNode();
            }else{
                // no previousSibling
                return false;
            }
        }else{
            return {
                'el':   this.prevNodeElement,
                'node': this.prevNode
            }
        }
    };
    /**
     * Collapse the children of the Node
     * @param {boolean} recursion
     */
    Node.prototype.collapse = function(recursion){
        if(!this.hasChild()){
            return;
        }
        // $(this.childrenElement).slideToggle(200);
        var self = this;
        if($(this.childrenElement).hasClass('collapse')){
           $(self.row).removeClass('collapse');
           $(this.childrenElement).animate({height:this.childrenHeight}, 200, function(){
                   $(this).removeClass('collapse');
                   $(this).removeAttr('style');
           });
        }else{
           this.childrenHeight = $(this.childrenElement).height();
           $(self.row).addClass('collapse');
           $(this.childrenElement).animate({height:0},200,function(){
               $(this).addClass('collapse');
           });
        }

    };

    Node.prototype._destroy = function(){
        //this.row.parentNode.removeChild(this.row);
    };
    Node.prototype.findChildById = function(id){
        return this.childrenMap[id];
    };


    module.exports = Node;

});

/**
 * @author 唐品 (Tang Pin)
 * created at 2015-2-8
 */
define(function(require, exports, module){
    var util = require('./util.js');

    var Node = function(data,app,option){
        this.data = data;
        // app is the instance of the application
        // which hold the status of the apllication
        this.app = app;
        var package = data.package;
        if(package && package.length>0 && $.isArray(package)){
            this.packageNameList = data.package;
            this.initPackages(this.packageNameList);
        }
        this.id = util.uuid();
        this._createDom();
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

    /**
     * Reset index of each child
     */
    Node.prototype._updateDomIndexes = function(){
        var children = this.children;
        if(children.length){
            children.forEach(function(child, index){
                child.index = index;
                child.row.setAttribute('childIndex',index);
            });
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

        // tell packages they are ready to  handle DOM
        this._onDomReady();

        // todo: remove 'write here'
        if(this.data){
            this.setValue(this.data);
        }else{
            this.setValue('');
        }
    };

    /**
     * Add the created Node to the DOM
     * @param position
     */
    Node.prototype.adjustDom = function(position){
        var self = this;

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
            this.parent.appendChild(this.row);z
        }

        function insertAfter(el){
            $(el).after(self.row);
        }
        function appendInside(el){
            $(el).append(self.row);
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
            if(keyNum==13 && event.ctrlKey){
                event.preventDefault();
                if(event.shiftKey){
                    this._onInsertBefore({});
                }else{
                    // create new line
                    this.createSiblingNodeAfter();
                }
                return false;
            }
            // Tab
            if(9 == event.keyCode){
                event.preventDefault();
                // Shift + Tab
                if(event.shiftKey){
                    this.unindent();
                }else{
                    this.indent();
                }
                return false;
            }
            // Delete
            if(46 == event.keyCode){
                event.preventDefault();
                this.parent.removeChild(self);
                return false;
            }
            // Backspace on an 'empty' node
            if(8 == event.keyCode){
                if(this.getContent() == ""){
                    this.parent.removeChild(this);
                }
            }
            // ctrl + o
            // activate editor
            if(79 == event.keyCode && event.ctrlKey){
                this._onEditorInit();
            }
        }

        // Mouse click events
        if(type == 'click'){
            if(target == this.buttonElement
                || target == this.buttonElement.childNodes[0]
                || target == this.buttonElement.childNodes[0].childNodes[0]){
                this.collapse();
            }
        }

    };


    Node.prototype.initPackages = function(packageNameList){
        var thisNode = this;
        this.packages = this.app.getPackages(packageNameList);
        $.each(this.packages, function(index, value){
            $.extend(thisNode, value);
        });
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
                self._createChild(element);
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
            case 'after':
                if(this.parent){
                    var afterNode = this.parent.children[this.index];
                    if(afterNode){
                        return afterNode;
                    }else{
                        return null;
                    }
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
            // you can't add a sibling node for rootNode
            // that's why we call it a ROOT node
            return;
        }
        if(node.isRootNode){
            // it's not a rootNode anymore after you move it
            node.isRootNode = false;
        }
        if(node.parent){
            node.parent.removeChild(node);
        }
        node.setParent(this.parent);
        this.parent._addChild(node);
        // TODO
        // add updateDom method to Node
        $(this.row).before(node.row);
    };
    /**
     * Add a Node as a sibling Node right before this node
     * @param node
     */
    Node.prototype.addSiblingNodeAfter = function(node){
        var nodeAfterThis = this.getRelativeNode('after');
        if(nodeAfterThis != null){
            nodeAfterThis.addSiblingNodeBefore(node);
        }else{
            // this is the last child of its parent node
            this.parent.appendChild(node);
        }
    };

    Node.prototype.addChildNodeAtHead = function(node){

    };
    Node.prototype.addChildNodeAtTail= function(){

    };
    /**
     * Create an empty Node after this node
     */
    Node.prototype.createSiblingNodeAfter = function(){
        var siblingNode = new Node({},this.app);
        siblingNode.setParent(this.parent);
        siblingNode.adjustDom({type:'after',el:this.row});
        this.parent._addChild(siblingNode);
        siblingNode.focus();
    };

/* ============================================================
 *                   Actions of child nodes
 * ============================================================*/

    /**
     * Create a child Node
     * called when initiating this node's child nodes
     * @private
     * @param {object} data
     */
    Node.prototype._createChild = function(data){
        var childNode = new Node(data,this.app);
        childNode.setParent(this);
        childNode.adjustDom({type:'append',el:this.childrenElement});
        childNode.index = this.children.length;
        this._addChild(childNode);
        childNode.focus();
    };
    /**
     * Append a child Node at the tail of the Node
     * @param child
     */
    Node.prototype.appendChild = function(child){
        this.childrenElement.appendChild(child.row);
        this._addChild(child);
        child.index = this.children.length;
    };
    /**
     * Add a node to the children node map
     * @private
     */
    Node.prototype._addChild = function(child){
        this.children.push(child);
        this.childrenMap[child.id] = child;
    };

    /**
     * Remove specific child
     * @param id id of the child Node
     */
    Node.prototype.removeChild = function(node){
        var childNode = this.childrenMap[node.id];
        //TODO 有问题
        //childNode.row.parentNode.removeChild(childNode.row);
        this.children = _.filter(this.children,function(child){
            return child.id != node.id;
        });
        this.childrenMap[node.id] = undefined;
        childNode.row.parentNode.removeChild(childNode.row);
        this._updateDomIndexes();
    };

    /**
     * Tell if the Node has children
     */
    Node.prototype.hasChild = function(){
        return this.children.length;
    };


    /* ============================================================
     *                   Event Handlers
     * ============================================================*/

    /**
     * Insert a new Node before this node
     * @param {Object} data data to initiating a node
     */
    Node.prototype._onInsertBefore = function(data){
        var newNode = new Node(data,this.app);
        newNode.setParent(null);
        this.addSiblingNodeBefore(newNode);
        newNode.focus();
        // add the action to the History(redoMgr)
    };

    /**
     * Insert a new Node after this node
     * @param {Object} data data to initiating a node
     */
    Node.prototype._onInsertAfter = function(data){
        var newNode = new Node(data, this.app);
        newNode.setParent(null);
        this.addSiblingNodeAfter(newNode);
        newNode.focus();
        // add the action to the History
        this.app.onAction('insertAfter',{
            'node':newNode,
            'afterNode':this,
            'parent':this.parent
        });
    }
    /**
     * Indent the Node,
     * turn the  node into a child node of the sibling node before it.
     */
    Node.prototype._onIndent = function(){
        // if this node is not the first node
        var prevNode = this.getRelativeNode('before');
        if(prevNode){
            prevNode.appendChild(this);
            this.setParent(prevNode);
        }
    };
    /**
     *
     */
    Node.prototype._onUnshift = function(data){
        var newNode = new Node(data, this.app);
        newNode.setParent(this);

    };

    /**
     * Events handler to be over written by Packages
     * TODO
     * replace it with Event Manager
     * @private
     */
    Node.prototype._onDomReady = function(){};


    /**
     * Focus on the element
     * TODO: need to be rewrite
     */
    Node.prototype.focus = function(){
        var el = this.contentElement;
        var range = document.createRange();
        var sel = window.getSelection();
        if(this.contentElement.innerHTML.length){
            range.setStart(el,0);
            range.setEnd(el,1);
        }else{
            range.setStart(el,0);
            range.setEnd(el,0);
        }
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
    Node.prototype.collapseAnimating = false;
    Node.prototype.collapse = function(recursion){
        if(this.collapseAnimating){return;}
        this.collapseAnimating = true;
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
                   self.collapseAnimating = false;
           });
        }else{
           this.childrenHeight = $(this.childrenElement).height();
           $(self.row).addClass('collapse');
           $(this.childrenElement).animate({height:0},200,function(){
               $(this).addClass('collapse');
               self.collapseAnimating = false;
           });
        }

    };


    Node.prototype.expand = function(){};

    Node.prototype._destroy = function(){
        //this.row.parentNode.removeChild(this.row);
    };
    Node.prototype.findChildById = function(id){
        return this.childrenMap[id];
    };


    module.exports = Node;

});

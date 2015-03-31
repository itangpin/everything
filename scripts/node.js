/**
 * @author 唐品 (Tang Pin)
 * created at 2015-2-8
 */
define(function(require, exports, module){
    var util = require('./util.js');

    var Node = function(value,app){
        this.value = value;
        this.app = app;
        //var package = value.package;
        //if(package && package.length>0 ){
        //    this.packageNameList = value.package;
        //    this.initPackages(this.packageNameList);
        //}
        if(this.app.packages.length > 0){
            this.init_packages();
        }
        this.childs = [];
        this.childrenMap = {};
        this.isRootNode = false;
        this.id = util.uuid();
        this._createDom();
        this.getPath();
        this.highlighted = false;
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

    /**
     * Reset index of each child
     */
    Node.prototype._updateDomIndexes = function(){
        var childs = this.childs;
        if(childs.length){
            childs.forEach(function(child, index){
                child.index = index;
                child.row.setAttribute('childIndex',index);
            });
        }
    };

    Node.prototype.getPath = function(){
        this.path = [];
        var node = this;
        while(node){
            if(node.parent){
                this.path.unshift(node.parent);
            }
            node = node.parent;
        }
        return this.path;
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
        if(this.value){
            this.setValue(this.value);
        }else{
            this.setValue('');
        }
    };

    Node.prototype.refreshDom = function(){
        this.childs = [];
        this.childrenMap = {};
        this._createDom();
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
            // Ctrl + Enter
            if(keyNum==13 && event.ctrlKey){
                event.preventDefault();
                this.createSiblingNodeAfter();
                return false;
            }
            // Shift + Enter
            if(keyNum==13 && event.shiftKey){
                event.preventDefault();
                this._onInsertBefore({});
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
                this.parent.removeChildAndDom(this);
                return false;
            }
            // Backspace on an 'empty' node
            if(8 == event.keyCode){
                if(this.getContent() == ""){
                    this.parent.removeChildAndDom(this);
                }
            }
            // move events
            if(this.app.mode == "move"){
            }
        }

        // Mouse click events
        if(type == 'click'){
            if(target == this.buttonElement
                || target == this.buttonElement.childNodes[0]
                || target == this.buttonElement.childNodes[0].childNodes[0]){
                if(!event.altKey){
                    this._onZoomIn();
                }else{
                    this.collapse();
                }

            }
            if(target == this.contentElement){
                this.app.setCurentNode(this);
            }
        }

        if( type == 'keyup' ||
            type == 'paste'||
            type == 'cut' ) {
            // update value
            this.onValueChange();
        }



        // send events to packages' handler
        this.packageEventsHandle(event);
    };

    /* ============================================================
     *                   Package Management
     * ============================================================*/

    /**
     * Let handlers from packages handle events
     * @param events
     */
    Node.prototype.packageEventsHandle = function(events){
        var thisNode = this;
        if(this.packageEvents && this.packageEvents.length){
            $.each(this.packageEvents, function(index,value){
                value.call(thisNode,events);
            });
        }
    };
    /**
     * Extend the node instance with package instance
     * @param packageNameList
     */
    Node.prototype.init_packages = function(){
        var thisNode = this;
        this.packageEvents = this.packageEvents || [];
        this.packages = this.app.getPackages();
        this.value.packageValue = this.value.packageValue || {};

        $.each(this.packages, function(index, value){
            $.extend(thisNode, value.node);
            thisNode.packageEvents.push(value.onEvent);
        });
    };

    /* ============================================================
     *                   Data  Export && Import
     * ============================================================*/
    Node.prototype.onValueChange = function(){
        if(this.app.creating){
            return;
        }
        this.updateValue();
        if(this.parent){
            this.parent.onValueChange();
        }

        this.app.onAction('valueChange',{
            node:this
        });
    };
    Node.prototype.updateValue = function(){
        this.value = this.getValue();
    };
    /**
     * Get value, value is a JSON structure
     */
    Node.prototype.getValue = function(){
        var thisNode = this;
        this.value.content = this.contentElement.innerHTML;
        this.value.packageValue = this.value.packageValue;
        if(this.hasChild()){
            this.value.children = [];
            this.childs.forEach(function(v){
                thisNode.value.children.push(v.getValue());
            });
        }
        return this.value;
    };


    /**
     * Set content and children of the node,
     * @param {String|Array|Object} value content of the Node
     */
    Node.prototype.setValue = function(value){
        if($.isArray(value)){
            // root node's value is an array
            value = {
                content: "",
                children: value
            };
            this.value = value;
            this.setValue(this.value);
            return;
        }
        if($.type(value) == "string"){
            this.value = {
                content: value
            };
            this.setValue(this.value);
            return;
        }

        if(value.content != undefined){
            this.setContent(value.content || "");
        }
        if(value.children && value.children.length > 0){
            this.setChildren(value.children);
        }

    };

    /**
     * Set the content
     * @param value
     */
    Node.prototype.setContent= function(value){
        // TODO
        // replace http link text with a real link
        if($.type(value)=="string"){
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
     * @param {Array} children value array to create children
     */
    Node.prototype.setChildren = function(children){
        var self = this;
        if($.isArray(children) && children.length) {
            children.forEach(function(value,index){
                self._createChild(value);
            });
            // change style of the function dot if has children
            this.row.className += " hasChild";
        }
    };

    /**
     * Get the content of the row
     */
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
                    var afterNode = this.parent.childs[this.index+1];
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
        this.onValueChange(this.parent);
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
        this.onValueChange(this.parent);
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
        siblingNode.focus(siblingNode.contentElement);
        this.onValueChange(this.parent);
    };

/* ============================================================
 *                   Actions of child nodes
 * ============================================================*/

    /**
     * Create a child Node
     * called when initiating this node's child nodes
     * @private
     * @param {object} value
     */
    Node.prototype._createChild = function(value){
        var childNode = new Node(value,this.app);
        childNode.setParent(this);
        childNode.adjustDom({type:'append',el:this.childrenElement});
        childNode.index = this.childs.length;
        this._addChild(childNode);
        childNode.focus(childNode.contentElement);
        this.onValueChange(this.parent);
    };
    /**
     * Append a child Node at the tail of the Node
     * @param child
     */
    Node.prototype.appendChild = function(child){
        this.childrenElement.appendChild(child.row);
        this._addChild(child);
        child.index = this.childs.length;
        this.onValueChange(this.parent);
    };
    /**
     * Add a node to the children node map
     * @private
     */
    Node.prototype._addChild = function(childNode){
        this.childs.push(childNode);
        this.childrenMap[childNode.id] = childNode;
        this.onValueChange(this.parent);
    };

    /**
     * Remove specific child
     * @param {Node}node of the child Node
     */
    Node.prototype.removeChild = function(node){
        var childNode = this.childrenMap[node.id];
        this.childs = this.childs.filter(function(child){
            return child.id != node.id;
        });
        //childNode.row.parentNode.removeChild(childNode.row);
        this.childrenMap[node.id] = undefined;
        this._updateDomIndexes();
        this.onValueChange(this.parent);
    };

    Node.prototype.removeChildAndDom = function(node){
        var childNode = this.childrenMap[node.id];
        if(childNode.row.parentNode){
            childNode.row.parentNode.removeChild(childNode.row);
        }
        this.removeChild(node);
    };

    /**
     * Tell if the Node has children
     */
    Node.prototype.hasChild = function(){
        return this.childs.length;
    };


    /* ============================================================
     *                   Event Handlers
     * ============================================================*/

    /**
     * Insert a new Node before this node
     * @param {Object} value value to initiating a node
     */
    Node.prototype._onInsertBefore = function(value){
        var newNode = new Node(value,this.app);
        newNode.setParent(null);
        this.addSiblingNodeBefore(newNode);
        newNode.focus(newNode.contentElement);
        this.onValueChange(this.parent);
        // add the action to the History(redoMgr)
    };

    /**
     * Insert a new Node after this node
     * @param {Object} value value to initiating a node
     */
    Node.prototype._onInsertAfter = function(value){
        var newNode = new Node(value, this.app);
        newNode.setParent(null);
        this.addSiblingNodeAfter(newNode);
        newNode.focus(newNode);
        // add the action to the History
        this.app.onAction('insertAfter',{
            'node':newNode,
            'afterNode':this,
            'parent':this.parent
        });
        this.onValueChange(this.parent);
    };
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
        this.onValueChange(this.parent);
    };
    /**
     *
     */
    Node.prototype._onUnshift = function(value){
        var newNode = new Node(value, this.app);
        newNode.setParent(this);
        this.onValueChange(this.parent);
    };
    Node.prototype._onZoomIn = function(){
        this.app.onAction('zoomin',{
            node:this
        });
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
    Node.prototype.focus = function(el){
        //var el = this.contentElement;
        var range = document.createRange();
        var sel = window.getSelection();
        if(el.innerHTML.length){
            range.setStart(el,1);
            range.setEnd(el,1);
        }else{
            range.setStart(el,0);
            range.setEnd(el,0);
        }
        sel.removeAllRanges();
        sel.addRange(range);
        el.focus();
    };
    Node.prototype.blur = function(){
        this.contentElement.blur();
    };

    /**
     * Indent the Node,
     * turn the  node into a child node of the sibling node before it.
     */
    Node.prototype.indent = function(){
        // if is not the first node
        if(this.row.previousSibling){
            var prevNode = this.getRelativeNode('before');
            this.parent.removeChildAndDom(this);
            prevNode.appendChild(this);
            this.parent = prevNode;
            this.focus(this.contentElement);
        }
        this.onValueChange(this.parent);
    };

    Node.prototype.unindent= function(){
        if(!this.parent){
            return;
        }
        this.parent.addSiblingNodeAfter(this);
        //TODO 有问题
        // this.parent.removeChild(this.id);
        this.onValueChange(this.parent);
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

    /**
     * Highlight node with background color when
     * app is at 'move' mode
     * @type {Function}
     */
    Node.prototype.highlight = function(){
        this.highlighted = true;
        this.contentElement.classList.add('highlight');
    };
    Node.prototype.noHighlight = function(){
        this.highlighted = false;
        this.contentElement.classList.remove('highlight');
    };

    Node.prototype.move = function(event){
        event.preventDefault();
        // move to next node
        var nextNode = this.getRelativeNode('after');
        if(nextNode){
            this.noHighlight();
            nextNode.highlight();
            this.app.setCurentNode(nextNode);
        }
        return false;
    };


    module.exports = Node;
});

/**
 * @author 唐品 (Tang Pin)
 * created at 2015-2-8
 */
define(['util'],function(util){

    var Node = function(value,app,parent){
        this.value = value;
        this.formatValue();
        this.app = app;
        this.parent = parent
        this.childs = [];
        this.childrenMap = {};
        this.isRootNode = false;
        this.id = util.uuid();
        // let packages extend the node and listen for events
        if(this.app.packages.length > 0){
            this.initPackages();
        }
        this._createDom();
        this.getPath();
        this.highlighted = false;
    };

    /*=============================================================
     *                    Static Methods
     ==============================================================*/
    /**
     * Get the node instance by the event.target
     * The application would use it to determin
     * which node to dispatch events to
     * @param target
     * @returns {*}
     */
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

    /**
     * Re-calculate the path of the node's parents
     */
    Node.prototype.refreshPath = function(){
        this.path = [];
        var node = this;
        while(node){
            if(node.parent){
                this.path.unshift(node.parent);
            }
            node = node.parent;
        }
    };
    /**
     * Get the path of the node
     * last element of the array is the closest parent of the node
     * @returns {Array}
     */
    Node.prototype.getPath = function(){
        this.refreshPath();
        return this.path;
    };

    /**
     * Create the dom of the Node
     * @private
     */
    Node.prototype._createDom = function(){
        // the round dot
        var dot = crel('a',{class:'dot'},
            crel('span',{class:'b'},
                crel('span',{class:'s'}))
        );
        // text content
        var content = crel('div',{class:'project-content',contentEditable:true});
        // children wrapper
        var children = crel('div',{class:'children'});
        var row = crel('div',{class:'project', projectId:this.id}, dot, content, children);
        // used when finding node from event target(target.node)
        row.node = this;
        this.buttonElement = dot;
        this.contentElement = content;
        this.childrenElement = children;
        this.row = row;

        this.setValue();
        // tell packages they are ready to  handle DOM
        this._onDomReady();
    };

    /**
     * Rerender DOM structure with current data
     */
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
     * Handle events
     * @param {event object} event event object from browser
     */
    Node.prototype.onEvent = function(event){
        var type = event.type;
        var target = event.target || event.srcElement;

        // Keyboard events
        if(type == 'keydown'){
            var keyNum = event.keyCode;
            // Ctrl + Enter new line
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
                    event.preventDefault()
                    this.parent.removeChildAndDom(this);
                }
                return false
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

        // content change
        if(event.type == 'input'){
            //this.onValueChange();
            this.onContentValueChange()
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
    Node.prototype.initPackages = function(){
        var thisNode = this;

        this.packageEvents = this.packageEvents || [];
        this.packages = this.app.getPackages();
        this.value.packageValue = this.value.packageValue || {};

        $.each(this.packages, function(index, value){
            if(value.node){
                $.extend(thisNode, value.node);
            }
            if(value.onEvent){
                thisNode.packageEvents.push(value.onEvent);
            }

        });
    };

    /* ============================================================
     *                   Data  Export && Import
     * ============================================================*/
    /**
     * Value change handler,
     * triggered be multiple events
     */
    Node.prototype.onValueChange = function(){
        if(this.app.creating){
            return;
        }
        this.updateValue();
        // notify parent node one of its child has changed
        if(this.parent){
            this.parent.onChildValueChange(this)
        }
        this.app.onAction('valueChange',{
            node:this
        });
    };
    Node.prototype.onContentValueChange = function(){
        this.value.content = this.contentElement.innerHTML
        if(this.parent){
            this.parent.onChildValueChange(this)
        }
    }
    /**
     * Handler for child node value change event
     * @param node
     */
    Node.prototype.onChildValueChange = function(node){
        this.value.children[node.index] = node.value
        if(this.parent){
            this.parent.onChildValueChange(this)
        }
        this.app.onAction('valueChange', {
            node: this
        })
    }
    Node.prototype.updateValue = function(){
        this.value.content = this.contentElement.innerHTML
    };
    /**
     * Get value, value is a JSON structure
     */
    Node.prototype.getValue = function(node){
        var thisNode = this;
        this.value.content = this.contentElement.innerHTML;
        this.value.children = [];
        if(this.hasChild()){
            this.childs.forEach(function(v){
                thisNode.value.children.push(v.getValue());
            });
        }
        return this.value;
    };

    /**
     * Format the value into complete style
     */
    Node.prototype.formatValue = function(){
        if(Array.isArray(this.value)){
            // root node's value is an array
            this.value = {
                content: "",
                children: this.value,
                packageValue: {}
            };
            return this.value;
        }
        if((typeof this.value == 'string') || this.value.constructor == String){
            // string means no child nodes and no packageValue
            this.value = {
                content:this.value,
                children:[],
                packageValue:{}
            };
        }
        if(!this.value.content){
            this.value.content = "";
        }
        if(!this.value.children){
            this.value.children = [];
        }
    };

    /**
     * Set content and children of the node,
     * @param {String|Array|Object} value content of the Node
     */
    Node.prototype.setValue = function(value){
        if(value){
            // reset value
            this.value = value;
            this.formatValue();
        }
        if(this.value){
            this.formatValue()
            this._setContent(this.value.content);
            this.setChildren(this.value.children);
        }else{
            // create the node with null data
            this.setValue('');
        }
        // set children value changed status
        // when value first setted, it's all false
        this.childValueChanged = []
        var self = this
        this.value.children.forEach(function(value, index){
            self.childValueChanged[index] = false
        })
    };

    /**
     * Set the content
     * @param value
     * @private
     */
    Node.prototype._setContent= function(value){
        if((typeof value == 'string') || value.constructor == String){
            this.content = value;
            this.contentElement.innerHTML = this.content;
        }
    };
    /**
     * Change content.(For external use)
     * @param value
     */
    Node.prototype.setContent = function(value){
        if((typeof value == 'string') || value.constructor == String){
            this.content = value;
            this.contentElement.innerHTML = this.content;
            this.onValueChange();
        }
    }

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
        if(Array.isArray(children) && children.length>0) {
            children.forEach(function(value){
                self._createChild(value);
            });
            // change style of the dot if has children
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
        this.row.classList.add('root');
        this.isRootNode = true;
    };

    /**
     * Tell the node which child of it
     * has its value changed
     * @param node
     */
    Node.prototype.childValueChanged = function(node){
        this.childValueChanged[node.index] = true
    }




/* ============================================================
 *                   Actions to move nodes
 * ============================================================*/

    /**
     * Create an empty Node after this node
     */
    Node.prototype.createSiblingNodeAfter = function(){
        var siblingNode = new Node({},this.app, this.parent);
        siblingNode.setParent(this.parent);
        siblingNode.adjustDom({type:'after',el:this.row});
        // for temp use. Replace it with node.index later
        var indexTmp = this.parent.childs.indexOf(this)
        this.parent._addChild(siblingNode,indexTmp+1);
        if(this.parent.parent){
            this.parent.parent.onChildValueChange(this.parent)
        }
        siblingNode.focus(siblingNode.contentElement);
    };
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
        this.parent._updateDomIndexes();
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
        this.parent._updateDomIndexes();
        this.onValueChange(this.parent);
    };

    Node.prototype.addChildNodeAtHead = function(node){

    };
    Node.prototype.addChildNodeAtTail= function(){

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
        var childNode = new Node(value, this.app, this);
        childNode.adjustDom({type:'append',el:this.childrenElement});
        this.childs.push(childNode)
        childNode.index = this.childs.length-1;
        this.childrenMap[childNode.id] = childNode;
        childNode.focus(childNode.contentElement);
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
     * @childNode {Node} node to be add
     * @position {Number} position to insert into array
     * @private
     */
    Node.prototype._addChild = function(childNode,position){
        if(position){
            this.value.children.splice(position,0,childNode.value)
            this.childs.splice(position,0,childNode)
            childNode.index = position
        }else{
            // creating the list
            this.value.children.push(childNode.value)
            this.childs.push(childNode);
            childNode.index = this.childs.indexOf(childNode)
            childNode.row.setAttribute('index', childNode.index)
        }
        this.childrenMap[childNode.id] = childNode;
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
        var newNode = new Node(value,this.app,this.parent);
        newNode.setParent(this.parent);
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

    return Node;
});

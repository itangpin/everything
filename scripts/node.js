/**
 * @author 唐品 (Tang Pin)
 * created at 2015-2-8
 */
define(function(require, exports, module){
    var util = require('./util.js');

    var Node = function(data,parent,position,option){
        this.data = data;
        this.parent = parent;
        this.id = util.uuid();
        this._create(position);
    };

    Node.prototype.children = [];
    Node.prototype.childrenMap  ={};
    Node.prototype.isRootNode = false;

    Node.prototype._create = function(position){
        var self = this;
        this._createDom();
        this._bindEvent();

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
        this.row = row;
        // function button
        var button = document.createElement('span');
        button.className = 'function-btn';
        this.row.appendChild(button);
        this.buttonElement = button;
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
     * Bind keyboard event, mouse event, etc. to the application
     * @private
     */
    Node.prototype._bindEvent = function(){
        // TODO: delegate all the events together
        var self = this;
        // function button
        $(".function-btn").on('click', function(){

        });

        $(this.buttonElement).on('click', function(){
            self.collapse(true);
        });
        // create new line
        $(this.contentElement).on('keydown', function(e){
            console.log(e.keyCode);
            // add a new sibling node
            if(13 == e.keyCode){
                e.preventDefault();
                console.log('add sibling node');
                self.addSiblingNodeAfter();
                return false;
            }
            // add a child node, tab key
            if(9 == e.keyCode){
                e.preventDefault();
                // todo: replace console.log with util.log
                console.log('indent node');
                self.indent();
                return false;
            }
            if(46 == e.keyCode){
                e.preventDefault();
                self.parent.removeChild(self.id);
                return false;
            }
            if(8 == e.keyCode){
                if(self.getContent() == ""){
                    self.parent.removeChild(self.id);
                }
            }
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
        if(_.isArray(children)) {
            _.each(children, function(element,index,list) {
                self.createChild(element);
            });
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


    /**
     * Add a sibling Node right after this node
     */
    Node.prototype.addSiblingNodeAfter = function(){
        var siblingNode = new Node(null,this.parent,{type:'after',el:this.row});
        this.parent.addChild(siblingNode);
        siblingNode.focusRange();
    };

    /**
     * Create a child Node
     * @param {object} data
     */
    Node.prototype.createChild = function(data){
        var childNode = new Node(data,this,{type:'append',el:this.childrenElement});
        this.children.push(childNode);
        this.childrenMap[childNode.id] =  childNode;
        childNode.focusRange();
    };
    /**
     * Append a child Node
     * @param child
     */
    Node.prototype.appendChild = function(child){
        this.childrenElement.appendChild(child.row);
        this.children.push(child);
        this.childrenMap[child.id] = child;
    };
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
        childNode.row.parentNode.removeChild(childNode.row);
        this.children = _.filter(this.children,function(child){
            return child.id!=id;
        });
        this.childrenMap[id] = undefined;
        //childNode.row.parent.removeChild(childNode.row);
    };

    /**
     * focus on the element
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

    };

    /**
     * Collapse the children of the Node
     * @param {boolean} recursion
     */
    Node.prototype.collapse = function(recursion){
        $(this.childrenElement).slideToggle(200);
        //if($(this.childrenElement).hasClass('collapse')){
        //    $(this.childrenElement).animate({height:this.childrenHeight}, 100, function(){
        //            $(this).removeClass('collapse');
        //            $(this).removeAttr('style');
        //    });
        //}else{
        //    this.childrenHeight = $(this.childrenElement).height();
        //    $(this.childrenElement).animate({height:0},100,function(){
        //        $(this).addClass('collapse');
        //    });
        //}

    };

    Node.prototype._destroy = function(){
        //this.row.parentNode.removeChild(this.row);
    };
    Node.prototype.findChildById = function(id){
        return this.childrenMap[id];
    };


    module.exports = Node;

});

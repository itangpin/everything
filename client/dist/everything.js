/* EventManager, v1.0.1
 *
 * Copyright (c) 2009, Howard Rauscher
 * Licensed under the MIT License
 */
define(function(require,exports,module){
    function EventManager() {
        this._listeners = {};
    }
    EventManager.prototype = {
        addListener : function(name, fn) {
            (this._listeners[name] = this._listeners[name] || []).push(fn);
            return this;
        },
        removeListener : function(name, fn) {
            if(arguments.length === 1) { // remove all
                this._listeners[name] = [];
            }
            else if(typeof(fn) === 'function') {
                var listeners = this._listeners[name];
                if(listeners !== undefined) {
                    var foundAt = -1;
                    for(var i = 0, len = listeners.length; i < len && foundAt === -1; i++) {
                        if(listeners[i] === fn) {
                            foundAt = i;
                        }
                    }

                    if(foundAt >= 0) {
                        listeners.splice(foundAt, 1);
                    }
                }
            }

            return this;
        },
        fire : function(name, args, context) {
            var listeners = this._listeners[name];
            // if args is not an array, make it an array
            args = args || [];
            if(!args.length){
                args = [args];
            }
            if(listeners !== undefined) {
                var data = {}, evt;
                for(var i = 0, len = listeners.length; i < len; i++) {
                    evt = new EventManager.EventArg(name, data);

                    listeners[i].apply(context || window, args.concat(evt));

                    data = evt.data;
                    if(evt.removed) {
                        listeners.splice(i, 1);
                        len = listeners.length;
                        --i;
                    }
                    if(evt.cancelled) {
                        break;
                    }
                }
            }
            return this;
        },
        hasListeners : function(name) {
            return (this._listeners[name] === undefined ? 0 : this._listeners[name].length) > 0;
        }
    };
    EventManager.eventify = function(object, manager) {
        var methods = EventManager.eventify.methods;
        manager = manager || new EventManager();

        for(var i = 0, len = methods.length; i < len; i++) (function(method) {
            object[method] = function() {
                return manager[method].apply(manager, arguments);
            };
        })(methods[i]);

        return manager;
    };
    EventManager.eventify.methods = ['addListener', 'removeListener', 'fire'];

    EventManager.EventArg = function(name, data) {
        this.name = name;
        this.data = data;
        this.cancelled = false;
        this.removed = false;
    };
    EventManager.EventArg.prototype = {
        cancel : function() {
            this.cancelled = true;
        },
        remove : function() {
            this.removed = true;
        }
    };

    module.exports = EventManager;
    //window.EventManager = EventManager;
});




/**
 * @author 唐品 (Tang Pin)
 * created at 2015-2-13
 */
define(function (require, exports, module) {

    var Node = require('./node.js');
    var History = require('./history.js');
    var Package = require('./package.js');
    var EventMgr = require('./event.js');
    var Saver = require('./saver.js');
    // packages
    var Editor = require('./packages/editor.js');

    var Everything = function (data, option) {
        this.data = data;
        this.index = 0;
        this.packages = [];
        if (!option.container) {
            // create a container
            this.createContainer();
        }
        this.frame = option.container;

        // theme
        this.themes = ['dark', 'light'];
        if (option.theme) {
            this.theme = option.theme;
        } else {
            this.theme = 'light';
        }
        $(this.frame).addClass(this.theme);
        $(document.body).addClass(this.theme);
        this.history = new History();
        this.packageMgr = new Package();
        this.init();
        // move to this.init
        this.initPackages();
        this.creating = true;
        this._create(data);
        this.creating = false;
        this.mode = 'insert';
    };

    Everything.prototype.init = function () {
        this.eventMgr = new EventMgr();
        this.crumb = new Crumb(this);
        this.saver = new Saver(this);
        // register event listener
        this.eventMgr.addListener('rootNodeChange', this.onRootNodeChange);
        this.eventMgr.addListener('valueChange', this.onValueChange);

        // app events
        this.appEvents = ['contentChange'];
        this.appEventsHandler = {};
        var app = this;
        this.appEvents.forEach(function(v){
            app.appEventsHandler[v] = [];
        });
    };

    /**
     * Get Node value
     * @param type
     * @returns {*}
     * @private
     */
    Everything.prototype._getValue = function (type) {
        if (type == 'current') {
            return this.rootNode.getValue();
        }

        if (type == 'root') {
            return this.veryRootNode.getValue();
        }
    };

    Everything.prototype.getRootValue = function () {
        return this._getValue('root');
    };

    Everything.prototype.getCurentValue = function () {
        return this._getValue('current');
    };

    Everything.prototype.onValueChange = function () {
        this.saver.save();
    };

    Everything.prototype.createContainer = function () {

    };

    Everything.prototype._create = function (data) {
        var app = this;
        // create the tool bar
        this._createToolBar();
        var rootNode = new Node(data, app);
        rootNode.adjustDom({
            type: 'append',
            el: this.frame
        });
        rootNode.setRoot();
        this.rootNode = rootNode;
        this.veryRootNode = rootNode;

        // create one global event listener to handle all events from all nodes
        var onEvent = function (event) {
            app.onEvent(event);
        };
        var events = ['click', 'keydown', 'propertychange', 'keyup', 'paste', 'cut'];
        $.each(events, function (index, value) {
            if (value == 'focus') {
                app.frame.addEventListener(value, onEvent, true);
            } else {
                app.frame.addEventListener(value, onEvent);
                app.toobarElement.addEventListener(value, onEvent);
            }
        });
    };

    /**
     * Create the tool bar for global operations
     * @private
     */
    Everything.prototype._createToolBar = function () {
        var app = this;
        var toolbar = document.createElement('div');
        toolbar.className = 'toolbar';
        this.toobarElement = toolbar;
        document.body.appendChild(toolbar);
        var buttons = ['theme'];
        this.buttons = {};
        buttons.forEach(function (value, index) {
            var btn = document.createElement('button');
            btn.className = value;
            btn.innerHTML = value;
            app.buttons[value] = btn;
            app.toobarElement.appendChild(btn);
        });
    };
    Everything.prototype._createTitle = function (node) {
        var titleText = node.getContent();
        if (node == this.veryRootNode) {
            this.frame.removeChild(this.titleElement);
            this.titleElement = undefined;
            return;
        }
        if (this.titleElement) {
            this.titleText = titleText;
            this.titleElement.innerText = titleText;
        } else {
            // create title dom
            var title = document.createElement('div');
            title.innerHTML = titleText;
            title.setAttribute('contentEditable', true);
            title.className += "rootnode-title";
            this.titleElement = title;
            // insert to dom
            if ($(this.frame).children()) {
                $(this.frame).children().first().before(title);
            } else {
                this.frame.appendChild(title);
            }
        }
    };

    Everything.prototype._createAddButton = function () {
        var app = this;
        var addChildBtn = document.createElement('a');
        addChildBtn.innerHTML = "Add a child";
        addChildBtn.setAttribute('href', '#');
        var launchEditorBtn = document.createElement('a');
        launchEditorBtn.setAttribute('href', '#');
        launchEditorBtn.innerHTML = 'Edit';

        var addBtnWrapper = document.createElement('div');
        addBtnWrapper.classList.add('add-wrapper');
        addBtnWrapper.appendChild(addChildBtn);
        addBtnWrapper.appendChild(launchEditorBtn);
        this.addBtnWrapper = addBtnWrapper;
        this.frame.appendChild(addBtnWrapper);

        // add child
        $(addChildBtn).on('click', function () {
            app.rootNode._createChild({});
            if (app.addBtnWrapper) {
                app.frame.removeChild(addBtnWrapper);
            }

        });
        // launch editor
        $(launchEditorBtn).on('click', function () {
            app.switchRootNodeWithPackage(['editor']);
            if (app.addBtnWrapper) {
                app.frame.removeChild(addBtnWrapper);
            }
        });
    };

    /**
     * Register packages to the package manager
     */
    Everything.prototype.initPackages = function () {
        this.packageMgr.add('editor', Editor);
        this.packages.push('editor');
    };
    /**
     * Get all the packages that registered in the app
     * for Node instance to extend it self
     * TODO: handle the situation when the package does not registered
     * @returns {Array}
     */
    Everything.prototype.getPackages = function () {
        var packages = [];
        var app = this;
        this.packages.forEach(function (v) {
            packages.push(app.packageMgr.get(v));
        });
        return packages;
    };
    Everything.prototype.switchRootNodeWithPackage = function (packages) {
        // concat the two array
        var nodeValue = this.rootNode.getValue();
        nodeValue.package = packages;
        var node = new Node(nodeValue, this);
        node.setParent(this.rootNode.parent);
        this.zoomIn(node, true);
        if (packages.indexOf('editor') != -1) {
            node.launchEditor();
        }
    };
    /**
     * Handle events on the application element
     */
    Everything.prototype.onEvent = function (event) {
        if (this.mode == 'move') {
            if (event.type == 'keydown' || event.type == 'focus') {
                this.move(event);
                console.log('keydown');
            }
        } else if (this.mode == 'insert') {

        }
        if (event.keyCode == 27) {
            this.setMode('move');
        }
        //if(event.type == 'focus'){
        //    this.setCurentNode(Node.getNodeFromTarget(event.target));
        //}

        if (event.type == 'click') {
            // toggle theme
            if (event.target == this.buttons['theme']) {
                console.log('theme');
                this.toggleTheme();
            }
            // bread
            if (event.target == this.bread) {

            }
        }
        if (event.type == 'propertychange') {
            var a;
        }
        var node = Node.getNodeFromTarget(event.target);
        if (node) {
            node.onEvent(event);
        }
    };

    /**
     * Store history when a node is moved, removed, duplicated, etc.
     * @param {String} action action name
     * @param {Object} option
     */
    Everything.prototype.onAction = function (action, option) {
        if (action == 'zoomin') {
            var node = option.node;
            if (!node) {
                return;
            }
            this.zoomIn(node);
        }
        if (action == 'valueChange' && option.node == this.veryRootNode) {
            this.eventMgr.fire('valueChange', null, this);
        }
        // add action to history
        if (this.history) {
            this.history.add(action, option);
        }
        // trigger Extension callbacks
    };

    Everything.prototype.onRootNodeChange = function (newRootnode) {
        // handle crumb
        if (newRootnode == this.veryRootNode) {
            this.crumb.hide();
        } else {
            this.crumb.render();
        }

        // handle add buttons
        // todo 让这些元素的创建顺序不要影响他们最终出现在DOM中得位置
        if (this.addBtnWrapper) {
            this.frame.removeChild(this.addBtnWrapper);
            this.addBtnWrapper = undefined;
        }

        // save changes

    };
    Everything.prototype.zoomIn = function (node, hasContent) {
        var newRootNode = node;
        if (!newRootNode) {
            return;
        }
        this.frame.removeChild(this.rootNode.row);
        // TODO 这个refreshDom，问题大大的
        newRootNode.refreshDom();
        newRootNode.setRoot();
        newRootNode.adjustDom({
            type: 'append',
            el: this.frame
        });
        this.rootNode = newRootNode;
        this._createTitle(this.rootNode);
        //this._createBread();
        this.eventMgr.fire('rootNodeChange', this.rootNode, this);
        if (hasContent === false ||
            (hasContent == undefined && !this.rootNode.hasChild())) {
            this._createAddButton();
        }
    };

    /**
     * Switch color theme of the app
     */
    Everything.prototype.toggleTheme = function () {
        var index = this.themes.indexOf(this.theme);
        console.log(index);
        var index = (index + 2) > this.themes.length ? 0 : index + 1;
        var oldTheme = this.theme;
        this.theme = this.themes[index];
        $(this.frame).removeClass(oldTheme).addClass(this.theme);
        $(document.body).removeClass(oldTheme).addClass(this.theme);
        // trigger theme change event
        this.eventMgr.fire('themeChange', [this.theme]);
    };


    /**
     * Set mode. 'move' mode, move the focus from one node to another
     * @param mode
     */
    Everything.prototype.setMode = function (mode) {
        var prevMode = this.mode;
        this.mode = mode;
        if (prevMode == 'insert' || this.mode == 'move') {
            this.curentNode.highlight();
            // blur
            //$(this.curentNode).blur();
            this.curentNode.row.setAttribute('contentEditable', 'false');
        }
    };
    Everything.prototype.setCurentNode = function (node) {
        var oldCurentNode = this.curentNode;
        this.curentNode = node;
        if (this.mode == 'move') {
            oldCurentNode.noHighlight();
            node.highlight();
        }

        //this.curentNode.highlight();
    };
    /**
     * Move focus from one node to another
     * Move to next node: j || ctrl+n ||  space
     * Move to previous node: k || ctrl+p  || shift+space
     * @param event
     */
    Everything.prototype.move = function (event) {
        event.preventDefault();
        if (event.keyCode == 74) {
            this.moveNext();
        }
        if (event.keyCode == 75) {
            this.movePrev();
        }
        return false;
    };
    Everything.prototype.moveNext = function () {
        this.index++;
        if (this.index == 2) {
            console.log(this.curentNode);
        }
        var curentNode = this.curentNode;
        if (curentNode) {
            var newCurentNode;
            if (curentNode.hasChild()) {
                newCurentNode = curentNode.childs[0];
            } else {
                newCurentNode = curentNode.getRelativeNode('after');
            }
            curentNode.noHighlight();
            newCurentNode.highlight();
            //this.setCurentNode(newCurentNode);
            this.curentNode = newCurentNode;
            console.log('c' + curentNode.getContent() + ';;;n' + newCurentNode.getContent());
        } else {
            this.moveToFirst();
        }
    };
    Everything.prototype.movePrev = function () {
    };
    Everything.prototype.moveToFirst = function () {
        if (this.rootNode && this.rootNode.hasChild()) {
            var firstChild = this.rootNode.childs[0];
            this.setCurentNode(firstChild);
            firstChild.highlight();
        }
    };
    Everything.prototype.moveToLast = function () {
    };

    /**
     * Add event handlers from outside. events:
     * 'contentChange',
     * @param {String} eventName
     * @param {Function} handler
     */
    Everything.prototype.on = function(eventName, handler){
        var eventsList = ['contentChange'];
        if(eventsList.indexOf(eventName) == -1){
            return;
        }
        this.appEvents[eventName].push(handler);
    };

    /*========================================================
                          Bread crumb manager
      ========================================================*/
    var Crumb = function (app) {
        if (!app) {
            return;
        }
        this.app = app;
        //this.app.eventMgr.addListener('rootNodeChange', this.onRootNodeChange);
    };
    /**
     * Get dom for the crumb wrapper
     * @param path
     * @returns {Array} array contains all the dom of the crumb
     */
    Crumb.prototype.getDom = function (path) {
        var app = this.app;
        var self = this;
        var domArray = [];
        path.forEach(function (v, i) {
            var content = v.getContent();
            if (v == app.veryRootNode) {
                content = 'Home';
            } else if (v.getContent() == "") {
                content = 'noname';
            }
            var link = crel('div', {class: 'crumb-link'},
                crel('a', {href: '#' + v.id}, content),
                '>'
            );

            domArray.push(link);
        });
        return domArray;
    };

    /**
     * Append links to the crumb
     * or create crumb if not exist
     * and the append the links
     */
    Crumb.prototype.render = function () {
        var app = this.app;
        var self = this;
        if (app.crumbElement) {
            app.crumbElement.innerHTML = "";
            var path = this.app.rootNode.getPath();
            var domArr = this.getDom(path);
            domArr.forEach(function (v, i) {
                app.crumbElement.appendChild(v);
                // add event listener
                $(app.crumbElement).find('a').on('click', function () {
                    self.onEvent($(this));
                });
            });
        } else {
            // create a crumb wrapper and render again
            app.crumbElement = crel('div', {class: 'crumb'});
            if ($(app.frame).children()) {
                $(app.frame).children().first().before(app.crumbElement);
            } else {
                app.frame.appendChild(app.crumbElement);
            }
            this.render();
        }
    };
    Crumb.prototype.hide = function () {
        var app = this.app;
        if (app.crumbElement) {
            app.frame.removeChild(app.crumbElement);
            app.crumbElement = undefined;
        }
    };
    Crumb.prototype.onEvent = function ($this) {
        var app = this.app;
        var id = $this.attr('href').slice(1);
        var targetNode;
        var node = app.rootNode.parent;
        while (node) {
            if (node.id == id) {
                targetNode = node;
                break;
            } else {
                node = node.parent;
            }
        }
        app.zoomIn(targetNode);
    };
    Crumb.prototype.onRootNodeChange = function (newNode, oldNode) {
        if (newNode == ths.app.veryRootNode) {
            this.hide();
        }
        this.render();
    };


    module.exports = Everything;
});

define(function(require, exports, module){
    /**
     * @constructor History
     * Store action history, enables undo and redo
     * @param {Everything} app
     */
    function History (app) {
      this.app = app;
      this.clear();

      // map with all supported actions
      this.actions = {
        'editField': {
          'undo': function (params) {
            params.node.updateField(params.oldValue);
          },
          'redo': function (params) {
            params.node.updateField(params.newValue);
          }
        },
        'editValue': {
          'undo': function (params) {
            params.node.updateValue(params.oldValue);
          },
          'redo': function (params) {
            params.node.updateValue(params.newValue);
          }
        },
        'appendNode': {
          'undo': function (params) {
            params.parent.removeChild(params.node);
          },
          'redo': function (params) {
            params.parent.appendChild(params.node);
          }
        },
        'insertBeforeNode': {
          'undo': function (params) {
            params.parent.removeChild(params.node);
          },
          'redo': function (params) {
            params.parent.insertBefore(params.node, params.beforeNode);
          }
        },
        'insertAfterNode': {
          'undo': function (params) {
            params.parent.removeChild(params.node);
          },
          'redo': function (params) {
            params.parent.insertAfter(params.node, params.afterNode);
          }
        },
        'removeNode': {
          'undo': function (params) {
            var parent = params.parent;
            var beforeNode = parent.childs[params.index] || parent.append;
            parent.insertBefore(params.node, beforeNode);
          },
          'redo': function (params) {
            params.parent.removeChild(params.node);
          }
        },
        'duplicateNode': {
          'undo': function (params) {
            params.parent.removeChild(params.clone);
          },
          'redo': function (params) {
            params.parent.insertAfter(params.clone, params.node);
          }
        },
        'changeType': {
          'undo': function (params) {
            params.node.changeType(params.oldType);
          },
          'redo': function (params) {
            params.node.changeType(params.newType);
          }
        },
        'moveNode': {
          'undo': function (params) {
            params.startParent.moveTo(params.node, params.startIndex);
          },
          'redo': function (params) {
            params.endParent.moveTo(params.node, params.endIndex);
          }
        },
        'sort': {
          'undo': function (params) {
            var node = params.node;
            node.hideChilds();
            node.sort = params.oldSort;
            node.childs = params.oldChilds;
            node.showChilds();
          },
          'redo': function (params) {
            var node = params.node;
            node.hideChilds();
            node.sort = params.newSort;
            node.childs = params.newChilds;
            node.showChilds();
          }
        }

        // TODO: restore the original caret position and selection with each undo
        // TODO: implement history for actions "expand", "collapse", "scroll", "setDocument"
      };
    }

    /**
     * The method onChange is executed when the History is changed, and can
     * be overloaded.
     */
    History.prototype.onChange = function () {};

    /**
     * Add a new action to the history
     * @param {String} action  The executed action. Available actions: "editField",
     *                         "editValue", "changeType", "appendNode",
     *                         "removeNode", "duplicateNode", "moveNode"
     * @param {Object} params  Object containing parameters describing the change.
     *                         The parameters in params depend on the action (for
     *                         example for "editValue" the Node, old value, and new
     *                         value are provided). params contains all information
     *                         needed to undo or redo the action.
     */
    History.prototype.add = function (action, params) {
      this.index++;
      this.history[this.index] = {
        'action': action,
        'params': params,
        'timestamp': new Date()
      };

      // remove redo actions which are invalid now
      if (this.index < this.history.length - 1) {
        this.history.splice(this.index + 1, this.history.length - this.index - 1);
      }

      // fire onchange event
      this.onChange();
    };

    /**
     * Clear history
     */
    History.prototype.clear = function () {
      this.history = [];
      this.index = -1;

      // fire onchange event
      this.onChange();
    };

    /**
     * Check if there is an action available for undo
     * @return {Boolean} canUndo
     */
    History.prototype.canUndo = function () {
      return (this.index >= 0);
    };

    /**
     * Check if there is an action available for redo
     * @return {Boolean} canRedo
     */
    History.prototype.canRedo = function () {
      return (this.index < this.history.length - 1);
    };

    /**
     * Undo the last action
     */
    History.prototype.undo = function () {
      if (this.canUndo()) {
        var obj = this.history[this.index];
        if (obj) {
          var action = this.actions[obj.action];
          if (action && action.undo) {
            action.undo(obj.params);
            if (obj.params.oldSelection) {
              this.editor.setSelection(obj.params.oldSelection);
            }
          }
          else {
            console.log('Error: unknown action "' + obj.action + '"');
          }
        }
        this.index--;

        // fire onchange event
        this.onChange();
      }
    };

    /**
     * Redo the last action
     */
    History.prototype.redo = function () {
      if (this.canRedo()) {
        this.index++;

        var obj = this.history[this.index];
        if (obj) {
          var action = this.actions[obj.action];
          if (action && action.redo) {
            action.redo(obj.params);
            if (obj.params.newSelection) {
              this.editor.setSelection(obj.params.newSelection);
            }
          }
          else {
            util.log('Error: unknown action "' + obj.action + '"');
          }
        }

        // fire onchange event
        this.onChange();
      }
    };

    return History;
});

/**
 * @author 唐品 (Tang Pin)
 * created at 2015-2-8
 */
define(function(require, exports, module){
    var util = require('./util.js');

    var Node = function(value,app){
        this.value = value;
        this.formatValue();
        this.app = app;
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
    Node.prototype.initPackages = function(){
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
                content:value,
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
            this.setContent(this.value.content);
            this.setChildren(this.value.children);
        }else{
            // create the node with null data
            this.setValue('');
        }
    };

    /**
     * Set the content
     * @param value
     */
    Node.prototype.setContent= function(value){
        if((typeof this.value.content == 'string') || this.value.content.constructor == String){
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
        if(Array.isArray(children) && children.length>0) {
            children.forEach(function(value,index){
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


define(function(require, exports, module){
    var Saver = function(app){
        this.app = app;
    };
    Saver.prototype.save = function(){
        this.saveLocalStorage();
    };
    Saver.prototype.saveLocalStorage = function(){
        var value = this.app.getRootValue();
        window.localStorage.setItem('value',JSON.stringify(value));
    };
    module.exports = Saver;
});
define(function(require, exports, module){
    var util = {};
    util.uuid = function guid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    };
    return util;
});
/**
 * @author 唐品(Tang Pin)
 * Created on 3/10/15.
 */
define(function(require,exports,module){
    var editor = {
        name:'editor',
        extraValue: ['editorContent'],
        node:{},
        onEvent:{}
    };
    // Add buttons and Editor to DOM
    editor.node._onDomReady = function(){
        console.log('editor package init');
        var node = this;
        // application events
        this.app.eventMgr.addListener('themeChange', function(theme){
            switch (theme){
                case 'dark':
                    theme = 'monokai';
                    break;
                case 'light':
                    theme = 'xq-light';
                    break;
            }
            if(node.hasLauchEditor){
                node.unLaunchEditor();
                node.launchEditor(theme);
            }
        });
        if(!this.value.packageValue.editor){
            this.value.packageValue.editor = {
                editorContent:""
            };
        }
        //this.packageValue['editor'] = {};
    };
    editor.onEvent = function(event){
        var type = event.type,
            target = event.target;
        var toggleEditor = function(node){
            if(!node.editorHasLaunched){
                node.launchEditor();
                node.editorHasLaunched = true;
            }else{
                node.unLaunchEditor();
                node.editorHasLaunched = false;
            }
        };
        if(type == 'keydown'){
            // keydown events
            if(79 == event.keyCode && event.altKey){
                // Alt + O
                event.preventDefault();
                // toggle editor
                toggleEditor(this);
                return false;
            }
        }
        // click event
        if(type == 'click' && event.altKey){
            if(target == this.buttonElement
                || target == this.buttonElement.childNodes[0]
                || target == this.buttonElement.childNodes[0].childNodes[0]){
                toggleEditor();
            }
        }


    };
    editor.node.editorHasLaunched = false;
    var getTheme = function(appTheme){
        var theme;
        switch (appTheme){
            case 'dark':
                theme = 'monokai';
                break;
            case 'light':
                theme = 'xq-light';
                break;
        }
        return theme;
    };
    editor.node.launchEditor = function(theme){
        var thisnode = this;
        this.row.classList.add('package', 'editor');
        this.titleElement = crel('div',{class:'title',contentEditable:'true'},this.value.content);
        this.editorElement = crel('div',{class:'editor'},this.titleElement);
        this.row.insertBefore(this.editorElement,this.childrenElement);
        // add codemirror
        var createCodeMirror = function(el,contentValue,theme){
            var theme = theme || 'xq-light';
            var codeMirrorOptions = {
                theme: theme,
                tabSize: 4,
                lineNumbers: false,
                lineWrapping: true,
                autoCloseBrackets: true,
                extraKeys: this.keyMaps,
                mode: {
                    name: 'markdown',
                    underscoresBreakWords: false,
                    taskLists: true,
                    fencedCodeBlocks: true
                },
                value:contentValue
            };
            return new CodeMirror(el, codeMirrorOptions);
        };

        this.cm = createCodeMirror(this.editorElement,
            this.value.packageValue.editor.editorContent || "",
            getTheme(this.app.theme));
        this.cm.on('change', function(cm,obj){
            thisnode.onEditorContentChange(cm,obj);
        });
        this.hasLauchEditor = true;
        this.focus(this.titleElement);


    };
    editor.node.unLaunchEditor = function(){
        $(this.row).removeClass("editor");
        this.row.classList.remove('editor');
        this.row.removeChild(this.editorElement);
        this.codemirror = undefined;
        this.hasLauchEditor = false;
    };
    editor.node.onEditorContentChange = function(editor,changeObj){
        console.log('change event');
        this.editorSave(editor.getDoc().getValue());
        this.onValueChange();
    };
    editor.node.editorSave = function(content){
        this.value.packageValue.editor.editorContent = content;
    };

    module.exports = editor;
});

/**
 * @author 唐品(Tang Pin)
 * Created on 3/31/15.
 */

define(function(require, exports, module){
    var highlight = {
        name: 'hightlight'
    };
    highlight.init = function(app){

    };
});

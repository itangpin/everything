/**
 * @author 唐品 (Tang Pin)
 * created at 2015-2-13
 */
define([
    'node',
    'history',
    'package',
    'event',
    'saver',
    'packages/editor',
    'packages/highlight',
    'angular'
],function (Node,History,Package,EventMgr,Saver,Editor,Highlighter,angular) {

    var Everything = function (data, controller, option) {
        this.data = data;
        // angular controller
        this.controller= controller;
        this.index = 0;
        this.packages = [];
        if (!option.container) {
            // create a container
            this.createContainer();
        }
        this.frame = option.container;
        $(this.frame).on('click', function(){
            console.log('frame');
        });

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
        this.packageMgr = new Package(this);
        this.init();
        // move to this.init
        this.initPackages();
        this.creating = true;
        this._create(data);
        this.creating = false;
        this.mode = 'insert';
    };

    Everything.prototype.init = function () {
        var app = this;
        // events manager for intern use
        this.eventMgr = new EventMgr();
        // events magager for packages
        this.packageEventsMgr = new EventMgr();
        this.crumb = new Crumb(this);
        this.saver = new Saver(this);
        // register event listener
        this.eventMgr.addListener('rootNodeChange', this.onRootNodeChange);
        this.eventMgr.addListener('valueChange', this.onValueChange);

        // app events
        this.appEvents = ['contentChange'];
        this.appEventsHandler = {};
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
        //this.saver.save();
        this.controller.onEvent('valueChange')
    };

    Everything.prototype.createContainer = function () {

    };

    Everything.prototype._create = function (data) {
        var app = this;
        // create the tool bar
        //this._createToolBar();
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
                //app.toobarElement.addEventListener(value, onEvent);
            }
        });
        app.frame.addEventListener('input',app.event('input'));
        //app.frame.addEventListener('input', onEvent);
    };

    Everything.prototype.event = function(type){
        var self = this;
        // 使用闭包来保留this引用，不知道是否合适
        if(type == 'input'){
            return function(e){
                var node = Node.getNodeFromTarget(e.target);
                if(node){
                    // let node it self handle the event first
                    node.onEvent(e);
                    // fire the change event for packages
                    self.appEventsHandler['contentChange'].forEach(function(v){
                        v(node);
                    });
                }
            };
        }
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
        var newButton = crel('button', {class:'new-article'},'New Article');
        var buttonWrapper = crel('div',{class:'button-wrapper'},newButton);
        toolbar.appendChild(buttonWrapper);
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

    /**
     * Show 2 buttons when you zoom into the bottom node
     * @private
     */
    Everything.prototype._createAddButton = function () {
        var app = this;
        var self = this;
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
        // switch to editor panel
        $(launchEditorBtn).on('click', function () {
            //app.switchRootNodeWithPackage(['editor']);
            //if (app.addBtnWrapper) {
            //    app.frame.removeChild(addBtnWrapper);
            //}
            self.controller.launchEditorFromNode(self.rootNode);
        });
    };

    /**
     * Register packages to the package manager
     */
    Everything.prototype.initPackages = function () {
        this.packageMgr.add('editor', Editor);
        this.packages.push('editor');
        this.packageMgr.add('highlight', Highlighter);
        this.packages.push('highlight');
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
            //if (event.target == this.buttons['theme']) {
            //    console.log('theme');
            //    this.toggleTheme();
            //}
            // bread
            if (event.target == this.bread) {

            }
        }
        if (event.type == 'keyup') {
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
        this.creating = true;
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
        this.creating = false;
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
     * @example: app.on('contenteChange', function(){
     *      self.handler();
     * })
     * @param {String} eventName
     * @param {Function} handler
     */
    Everything.prototype.on = function(eventName, handler){
        var eventsList = ['contentChange'];
        if(eventsList.indexOf(eventName) == -1){
            return;
        }
        this.appEventsHandler[eventName].push(handler);
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
                $(v).find('a').on('click', function () {
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

    //angular.module('app').factory('app.everything',function(){
    //    return Everything
    //})
    return Everything;
});

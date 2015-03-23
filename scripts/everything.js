/**
 * @author 唐品 (Tang Pin)
 * created at 2015-2-13
 */
define(function (require, exports, module) {

    var Node = require('./node.js');
    var History = require('./history.js');
    var Package = require('./package.js');
    var EventMgr = require('./event.js');
    // packages
    var Editor = require('./packages/editor.js');

    var Everything = function (data, option) {
        this.index = 0;
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
        this._create(data);
        this.mode = 'insert';
    };

    Everything.prototype.init = function(){
        this.eventMgr = new EventMgr();
    };

    /**
     * Get Node value
     * @param type
     * @returns {*}
     * @private
     */
    Everything.prototype._getValue = function(type){
        if(type == 'current'){
            return this.rootNode.getValue();
        }

        if(type == 'root'){
            return this.veryRootNode.getValue();
        }
    };

    Everything.prototype.getRootValue = function(){
        return this._getValue('root');
    };

    Everything.prototype.getCurentValue = function(){
        return this._getValue('current');
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
        var events = ['click', 'keydown'];
        $.each(events, function (index, value) {
            if(value == 'focus'){
                app.frame.addEventListener(value,onEvent,true);
            }else{
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
    Everything.prototype._createBread = function () {
        var app = this;
        if (this.rootNode == this.veryRootNode) {
            this.frame.removeChild(this.bread);
            this.bread = undefined;
            return;
        }
        function createEmptyBread() {
            var bread = document.createElement('div');
            bread.className = "bread";
            return bread;
        }

        if (this.bread) {
            var path = this.rootNode.getPath();
            this.bread.innerHTML = "";
            path.forEach(function (v, i) {
                var content;
                if (v.getContent() != "") {
                    content = v.getContent();
                } else if (v == app.veryRootNode) {
                    content = 'Home';
                } else {
                    content = 'noname';
                }
                var link = document.createElement('div');
                link.innerHTML = "<a href='#" + v.id + "'>" + content + "</a>>";
                link.classList.add('bread-link');
                app.bread.appendChild(link);
            });
            // add event listener
            $(this.bread).find('a').on('click', function (e) {
                var id = $(this).attr('href');
                id = id.slice(1);
                console.log(id);
                var node = app.rootNode.parent;
                var targetNode;
                while (node) {
                    if (node.id == id) {
                        targetNode = node;
                        break;
                    } else {
                        node = node.parent;
                    }
                }
                app.zoomIn(targetNode);
            });
        } else {
            this.bread = createEmptyBread();
            if ($(this.frame).children()) {
                $(this.frame).children().first().before(this.bread);
            } else {
                this.frame.appendChild(this.bread);
            }
            this._createBread();
        }
    };

    Everything.prototype._createAddButton = function(){
        var app = this;
        var addChildBtn = document.createElement('a');
        addChildBtn.innerHTML = "Add a child";
        addChildBtn.setAttribute('href','#');
        var launchEditorBtn = document.createElement('a');
        launchEditorBtn.setAttribute('href','#');
        launchEditorBtn.innerHTML = 'Edit';

        var addBtnWrapper = document.createElement('div');
        addBtnWrapper.classList.add('add-wrapper');
        addBtnWrapper.appendChild(addChildBtn);
        addBtnWrapper.appendChild(launchEditorBtn);

        this.frame.appendChild(addBtnWrapper);

        // add child
        $(addChildBtn).on('click', function(){
            app.rootNode._createChild({});
            app.frame.removeChild(addBtnWrapper);
        });
        // launch editor
        $(launchEditorBtn).on('click', function(){
            app.switchRootNodeWithPackage(['editor']);
            app.frame.removeChild(addBtnWrapper);
        });
    };

    /**
     * Register packages to the package manager
     */
    Everything.prototype.initPackages = function () {
        this.packageMgr.add('editor', Editor);
    };
    Everything.prototype.getPackages = function (packageList) {
        var packages = [];
        var app = this;
        $.each(packageList, function (index, value) {
            packages.push(app.packageMgr.get(value));
        });
        return packages;
    };
    Everything.prototype.switchRootNodeWithPackage = function(packages){
        // concat the two array
        var nodeValue = this.rootNode.getValue();
        nodeValue.package = packages;
        var node = new Node(nodeValue,this);
        node.setParent(this.rootNode.parent);
        this.zoomIn(node,true);
        if(packages.indexOf('editor') != -1){
            node.launchEditor();
        }
    };
    /**
     * Handle events on the application element
     */
    Everything.prototype.onEvent = function (event) {
        if(this.mode == 'move'){
            if (event.type == 'keydown' || event.type=='focus') {
                this.move(event);
                console.log('keydown');
            }
        }else if(this.mode == 'insert'){

        }
        if(event.keyCode == 27){
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
        // add action to history
        if (this.history) {
            this.history.add(action, option);
        }
        // trigger Extension callbacks
    };
    Everything.prototype.zoomIn = function (node, hasContent) {
        var newRootNode = node;
        if (!newRootNode) {
            return;
        }
        //this.rootNode.row.innerHTML = "";
        this.frame.removeChild(this.rootNode.row);
        //this.frame.removeChild(this.);
        //delete this.rootNode;
        newRootNode.refreshDom();
        newRootNode.setRoot();
        newRootNode.adjustDom({
            type: 'append',
            el: this.frame
        });
        this.rootNode = newRootNode;
        this._createTitle(this.rootNode);
        this._createBread();
        if(hasContent === false ||
            (hasContent == undefined && !this.rootNode.hasChild())){
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
        if(prevMode=='insert' || this.mode=='move'){
            this.curentNode.highlight();
            // blur
            $(this.curentNode).blur();
            this.curentNode.row.setAttribute('contentEditable', 'false');
        }
    };
    Everything.prototype.setCurentNode = function (node) {
        var oldCurentNode = this.curentNode;
        this.curentNode = node;
        if(this.mode == 'move'){
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
        if(event.keyCode==74){
            this.moveNext();
        }
        if(event.keyCode==75){
            this.movePrev();
        }
        return false;
    };
    Everything.prototype.moveNext = function(){
        this.index++;
        if(this.index == 2){
            console.log(this.curentNode);
        }
        var curentNode = this.curentNode;
        if(curentNode){
            var newCurentNode;
            if(curentNode.hasChild()){
                newCurentNode = curentNode.childs[0];
            }else{
                newCurentNode = curentNode.getRelativeNode('after');
            }
            curentNode.noHighlight();
            newCurentNode.highlight();
            //this.setCurentNode(newCurentNode);
            this.curentNode = newCurentNode;
            console.log('c'+curentNode.getContent()+';;;n'+newCurentNode.getContent());
        }else{
            this.moveToFirst();
        }
    };
    Everything.prototype.movePrev = function(){};
    Everything.prototype.moveToFirst = function(){
        if(this.rootNode && this.rootNode.hasChild()){
            var firstChild = this.rootNode.childs[0];
            this.setCurentNode(firstChild);
            firstChild.highlight();
        }
    };
    Everything.prototype.moveToLast = function(){};

    //

    module.exports = Everything;
});

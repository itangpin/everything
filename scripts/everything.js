/**
 * @author 唐品 (Tang Pin)
 * created at 2015-2-13
 */
define(function(require,exports,module){

    var Node = require('./node.js');
    var History = require('./history.js');
    var Package = require('./package.js');
    // packages
    var Editor = require('./packages/editor.js');

    var Everything = function(data,option){
        if(!option.container){
            // create a container
            this.createContainer();
        }
        this.frame = option.container;

        // theme
        this.themes = ['dark','light'];
        if(option.theme){
            this.theme = option.theme;
        }else{
            this.theme = 'dark';
        }
        $(this.frame).addClass(this.theme);
        $(document.body).addClass(this.theme);
        this.history = new History();
        this.packageMgr = new Package();
        this.initPackages();
        this._create(data);
    };

    Everything.prototype.createContainer = function(){

    };

    Everything.prototype._create= function(data){
        var app = this;
        // create the tool bar
        this._createToolBar();
        var rootNode = new Node(data,app);
        rootNode.adjustDom({
            type:'append',
            el: this.frame
        });
        rootNode.setRoot();
        this.rootNode = rootNode;

        // create one global event listener to handle all events from all nodes
        var onEvent = function(event){
            app.onEvent(event);
        };
        var events = ['click', 'keydown'];
        $.each(events, function(index, value){
            app.frame.addEventListener(value, onEvent);
            app.toobarElement.addEventListener(value, onEvent);
        });
    };

    /**
     * Create the tool bar for global operations
     * @private
     */
    Everything.prototype._createToolBar = function(){
        var app = this;
        var toolbar = document.createElement('div');
        toolbar.className = 'toolbar';
        this.toobarElement = toolbar;
        document.body.appendChild(toolbar);
        var buttons = ['theme'];
        this.buttons = {};
        buttons.forEach(function(value,index){
            var btn = document.createElement('button');
            btn.className = value;
            btn.innerText = value;
            app.buttons[value] = btn;
            app.toobarElement.appendChild(btn);
        });
    };
    Everything.prototype._createTitle = function(titleText){
        if(titleText){
            this.titleText = titleText;
            var title = document.createElement('div');
            title.innerHTML = titleText;
            title.className += "rootnode-title";
            if($(this.frame).children()){
                $(this.frame).children().first().before(title);
            }else{
                this.frame.appendChild(title);
            }
        }
    };

    /**
     * Register packages to the package manager
     */
    Everything.prototype.initPackages = function(){
        this.packageMgr.add('editor',Editor);
    };
    Everything.prototype.getPackages = function(packageList){
        var packages = [];
        var app = this;
        $.each(packageList, function(index, value){
            packages.push(app.packageMgr.get(value));
        });
        return packages;
    };
    /**
     * Handle events on the application element
     */
    Everything.prototype.onEvent = function(event){
        //event.preventDefault();
        if(event.type == 'keydown'){
            onKeydown();
        }
        function onKeydown(){
            // TODO
            // moving the focus to the next element
            // search for content
            // undo redo
        }
        if(event.type == 'click'){
            if(event.target == this.buttons['theme']){
                console.log('theme');
                this.toggleTheme();
            }
        }

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
        if(action == 'zoomin'){
            var node = option.node;
            if(!node){return;}
            this.zoomIn(node);
        }
        // add action to history
        if(this.history){
            this.history.add(action,option);
        }
        // trigger Extension callbacks
    };
    Everything.prototype.zoomIn = function(node){
        var newRootNode = node;
        if(!newRootNode){
            return;
        }
        //this.rootNode.row.innerHTML = "";
        this.frame.removeChild(this.rootNode.row);
        delete this.rootNode;
        newRootNode.setRoot();
        newRootNode.adjustDom({
            type:'append',
            el: this.frame
        });
        this.rootNode = newRootNode;
        this._createTitle(this.rootNode.getContent());
    };

    Everything.prototype.toggleTheme = function(){
        var index = this.themes.indexOf(this.theme);
        console.log(index);
        var index = (index+2)>this.themes.length?0:index+1;
        var oldTheme = this.theme;
        this.theme = this.themes[index];
        $(this.frame).removeClass(oldTheme).addClass(this.theme);
        $(document.body).removeClass(oldTheme).addClass(this.theme);
    };

    module.exports = Everything;
});

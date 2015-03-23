/**
 * @author 唐品(Tang Pin)
 * Created on 3/10/15.
 */
define(function(require,exports,module){
    var editor = {
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
    editor.node.launchEditor = function(theme){
        this.row.className += ' package editor';
        // take content offline
        this.contentElement.innerHTML = "";
        // add a title input
        var title = document.createElement('div');
        title.setAttribute('contentEditable', true);
        title.className = "title";
        title.innerText = this.value.content;
        this.titleElement = title;
        this.contentElement.appendChild(title);
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
        this.cm = createCodeMirror(this.contentElement,this.value.detail || "",theme);
        this.hasLauchEditor = true;
        this.focus(this.titleElement);


    };
    editor.node.unLaunchEditor = function(){
        $(this.row).removeClass("editor");
        this.contentElement.removeChild(this.contentElement.childNodes[1]);
        this.codemirror = undefined;
        this.hasLauchEditor = false;
    };

    module.exports = editor;
});

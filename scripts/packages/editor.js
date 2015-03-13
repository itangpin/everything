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
    editor.node.launchEditor = function(){
        this.row.className += ' package editor';
        // take content offline
        this.contentElement.innerHTML = "";
        // add a title input
        var title = document.createElement('div');
        title.setAttribute('contentEditable', true);
        title.className = "title";
        title.innerText = this.data.content;
        this.titleElement = title;
        this.contentElement.appendChild(title);
        // add codemirror
        var createCodeMirror = function(el,contentValue){
            var codeMirrorOptions = {
                theme: 'zenburn',
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
        this.cm = createCodeMirror(this.contentElement,this.data.detail);
        this.focus(this.titleElement);
    };
    editor.node.unLaunchEditor = function(){
        $(this.row).removeClass("editor");
        this.contentElement.removeChild(this.contentElement.childNodes[1]);
        this.codemirror = undefined;
    };

    module.exports = editor;
});

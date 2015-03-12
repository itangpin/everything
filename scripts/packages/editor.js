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
        if(type == 'keydown'){
            // keydown events
            if(79 == event.keyCode && event.altKey){
                event.preventDefault();
                // toggle editor
                if(!this.editorHasLaunched){
                    this.launchEditor();
                }else{
                    this.unLaunchEditor();
                }
                return false;
            }
        }
    };
    editor.node.editorHasLaunched = false;
    editor.node.launchEditor = function(){
        this.row.className += ' package editor';
        var textarea = document.createElement('textarea');
        this.contentElement.appendChild(textarea);
        this.codemirrorEl = textarea;
        var createCodeMirror = function(el){
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
                }
            };
            this.codemirror = new CodeMirror.fromTextArea(el, codeMirrorOptions);
        };
        createCodeMirror(this.codemirrorEl);
    };
    editor.node.unLaunchEditor = function(){

    };

    module.exports = editor;
});

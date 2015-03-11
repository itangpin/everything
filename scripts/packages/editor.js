/**
 * @author 唐品(Tang Pin)
 * Created on 3/10/15.
 */
define(function(require,exports,module){
    var editor = {};
    //
    editor._onDomReady = function(){
        console.log('hello');
        this.row.className += ' package editor';
        var textarea = document.createElement('textarea');
        this.contentElement.appendChild(textarea);
        this.codemirrorEl = textarea;
        createCodeMirror(this.codemirrorEl);
    };
    var createCodeMirror = function(el){
        var codeMirrorOptions = {
            theme: 'dark',
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
    module.exports = editor;
});

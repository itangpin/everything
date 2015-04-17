/**
 * Created by pin on 4/13/15.
 */

define([], function () {
    var Editor = function (option) {
        this.el = {
            titleEl: option.titleEl,
            contentEl: option.contentEl
        };
        this.status = {
            editorInstantiated: false
        };
        this.init();
    };
    Editor.prototype.init = function () {

    };

    Editor.prototype.createEditor = function(){
        var createCodeMirror = function (el, content, theme) {
            var codeMirrorOptions = {
                theme: theme || 'xq-light-big',
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
                value: content || '',
                placeholder: 'content'
            };
            return new CodeMirror(el, codeMirrorOptions);
        };

        this.editor = createCodeMirror(this.el.contentEl,null,null);
        this.status.editorInstantiated = true;
    };

    Editor.prototype.onPanelActive = function(data){
        // if editor has not be initiated
        // create one
        if(!this.status.editorInstantiated){
            this.createEditor();
        }
    };

    return Editor;
});

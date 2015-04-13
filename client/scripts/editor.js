/**
 * Created by pin on 4/13/15.
 */

define(['codeMirror'],function(CM){
    var Editor = function(option){
        this.el = {
            titleEl: option.titleEl,
            contentEl: option.contentEl
        };
        this.init();
    };
    Editor.prototype.init = function(){

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
    };
});

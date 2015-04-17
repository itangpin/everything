/**
 * Created by pin on 4/13/15.
 */

define([], function () {
    var Editor = function (option) {
        this.el = {
            titleEl: option.titleEl,
            contentEl: option.contentEl
        };
        this.init();
    };
    Editor.prototype.init = function () {

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
                placeholder: 'Content...'
            };
            return new CodeMirror(el, codeMirrorOptions);
        };

        this.cm = createCodeMirror(this.el.contentEl,null,null);
    };

    Editor.prototype.onPanelActive = function(data){

    };

    return Editor;
});

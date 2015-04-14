/**
 * Created by pin on 4/13/15.
 */

define(['../bower_components/codemirror/lib/codemirror'], function (CodeMirror) {
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
                value: content || ''
            };
            return new CodeMirror(el, codeMirrorOptions);
        };

        this.cm = createCodeMirror(this.el.contentEl);
    };

    return Editor;
});

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

    Editor.prototype.launchEditor = function(value){
        var self = this;
        var createCodeMirror = function (el, content, theme) {
            var codeMirrorOptions = {
                theme: theme || 'xq-light-big',
                tabSize: 4,
                lineNumbers: false,
                scrollbarStyle: 'null',
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

        this.editor = createCodeMirror(this.el.contentEl,value,null);
        this.editor.on('change', function(cm,obj){
            self.node.onEditorContentChange(cm,obj);
        });
        this.status.editorInstantiated = true;
    };

    Editor.prototype.onPanelActive = function(data){
        // if editor has not be initiated
        // create one
        if(data.from == 'toolbar' && !this.status.editorInstantiated){
            this.launchEditor();
        }
    };

    Editor.prototype.launchEditorFromNode = function(node){
        this.node = node;
        var value = node.getValue();
        var title = value.content;
        var content;
        if(!value.packageValue || !value.packageValue.editor){
            content = "";
        }else{
            content = value.packageValue.editor.editorContent;
        }
        if(this.status.editorInstantiated){
            // change the value
            this.editor.setValue(content);
            // TODO: replace it with this.setTitle()
            this.el.titleEl.innerHTML = title;
        }else{
            // launch new editor
            this.launchEditor(content);
            this.el.titleEl.innerHTML = title;
        }
    };

    return Editor;
});

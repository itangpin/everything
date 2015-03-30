/**
 * @author 唐品(Tang Pin)
 * Created on 3/10/15.
 */
define(function(require,exports,module){
    var editor = {
        name:'editor',
        extraValue: ['editorContent'],
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
        if(!this.value.packageValue.editor){
            this.value.packageValue.editor = {
                editorContent:""
            };
        }
        //this.packageValue['editor'] = {};
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
    var getTheme = function(appTheme){
        var theme;
        switch (appTheme){
            case 'dark':
                theme = 'monokai';
                break;
            case 'light':
                theme = 'xq-light';
                break;
        }
        return theme;
    };
    editor.node.launchEditor = function(theme){
        var thisnode = this;
        this.row.classList.add('package', 'editor');
        this.titleElement = crel('div',{class:'title',contentEditable:'true'},this.value.content);
        this.editorElement = crel('div',{class:'editor'},this.titleElement);
        this.row.insertBefore(this.editorElement,this.childrenElement);
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

        this.cm = createCodeMirror(this.editorElement,
            this.value.packageValue.editor.editorContent || "",
            getTheme(this.app.theme));
        this.cm.on('change', function(cm,obj){
            thisnode.onEditorContentChange(cm,obj);
        });
        this.hasLauchEditor = true;
        this.focus(this.titleElement);


    };
    editor.node.unLaunchEditor = function(){
        $(this.row).removeClass("editor");
        this.row.classList.remove('editor');
        this.row.removeChild(this.editorElement);
        this.codemirror = undefined;
        this.hasLauchEditor = false;
    };
    editor.node.onEditorContentChange = function(editor,changeObj){
        console.log('change event');
        this.editorSave(editor.getDoc().getValue());
        this.onValueChange();
    };
    editor.node.editorSave = function(content){
        this.value.packageValue.editor.editorContent = content;
    };

    module.exports = editor;
});

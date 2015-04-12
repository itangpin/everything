/**
 * Created by pin on 4/12/15.
 */

requirejs.config({
        path:{
            'codeMirror': '../spm_modules/codemirror/codemirror.js',
            'Everything': 'everything.js'
        }
    }
);

require(['Everything'], function(Everything){
    var value = [
        '@author Tang Pin',
        'Version 0.5.1',
        {
            content: "功能用法",
            children: [
                '创建新的一行(Enter键)',
                '向右缩进(Tab键)',
                {
                    content: '删除一行',
                    children: [
                        'delete键',
                        '在空行上按退格键'
                    ]
                },
                {
                    content:"文本编辑器",
                    package:['editor']
                }
            ],
            expand: false
        },
        {
            content:"新增功能",
            children:
                [
                    "主题切换",
                    "切换根节点"
                ]
        },
        {
            content: "新特性：编辑器，包管理。在这行上按Alt+O",
            detail: "#标题\n\n*italic*\n\n**加粗**普通",
            package: ['editor']
        }
    ];
    if(localStorage.getItem('value')){
        value = JSON.parse(localStorage.getItem('value'))
    }

    var container = document.querySelector(".everything");

    var everything = new Everything(value, {
        container: container,
        theme: 'light'
    });
});
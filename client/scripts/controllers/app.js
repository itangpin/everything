/**
 * Created by pin on 4/28/15.
 */
define([
    './module',
    '../app',
    '../everything',
    '../services/data',
    '../services/status'
], function (controllerModule, APP, Everything, data, status) {
    controllerModule.controller('appController', function () {
        var defaultValue = [
            {
                content: '写作',
                children: []
            },
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
                        content: "文本编辑器",
                        package: ['editor']
                    }
                ],
                expand: false
            },
            {
                content: "新增功能",
                children: [
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
        APP.init();

        if (!chrome.storage) {
            value = JSON.parse(localStorage.getItem('value')) || defaultValue;
            var everything = new Everything(value, APP, {
                container: container,
                theme: 'light'
            });
        } else {
            chrome.storage.local.get('value', function (data) {
                value = data.value;
                var everything = new Everything(value, APP, {
                    container: container,
                    theme: 'light'
                });
            });
        }

    })
})

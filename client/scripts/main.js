/**
 * Created by pin on 4/12/15.
 */

requirejs.config({
        paths:{
            'angular': '../bower_components/angular/angular'
        },
        shim:{
            'angular': {
                exports: 'angular'
            }
        }
    }
);

require(['Everything','./editor','app','angular'], function(Everything, Editor, APP, angular){
    $(function(){
        var defaultValue = [
            {
                content:'写作',
                children: [

                ]
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

        var container = document.querySelector(".everything");

        $(function(){
            var angularAppModule = angular.module('app',[])
            angularAppModule.controller('settingController',function($scope){
                $scope.aa = 'aa'
            })


            angular.bootstrap(window.document,['app'])
            APP.init();
            APP.toolbar.switchPanel('setting');
            if(!chrome.storage){
                value = JSON.parse(localStorage.getItem('value')) || defaultValue;
                var everything = new Everything(value,APP, {
                    container: container,
                    theme: 'light'
                });
            }else{
                chrome.storage.local.get('value', function(data){
                    value = data.value;
                    var everything = new Everything(value,APP, {
                        container: container,
                        theme: 'light'
                    });
                });
            }
        });
    });

});
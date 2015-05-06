/**
 * Created by pin on 5/5/15.
 */

define([
    './module',
    '../services/status',
    '../services/data',
    '../everything',
    '../app'], function (controllerModule,
                         status,
                         Data,
                         Everything,
                         APP) {
    controllerModule.controller('listController',
        ['service.status','service.data',function (status,Data) {

        var defaultValue = [
            {
                content: '写作',
                children: []
            },
            'Version 0.5.1',
            {
                content: "功能用法",
                children: [
                    '创建新的一行(Ctrl+Enter)',
                    '向右缩进(Tab)',
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
            }
        ]

        var initList = function (data) {
            var container = document.querySelector(".everything")
            var everything = new Everything(data, APP, {
                container: container,
                theme: 'light'
            });
        }

        status.updateSignInStatus(function (status, err) {
            if (err) return
            if (status == 'true') {
                Data.getListData().success(function (data) {
                    Data.updateLocal(data)
                    initList(data)
                })
            } else if (status == 'false') {
                Data.getListDataFromLocal(function (data) {
                    if (data == null) {
                        initList(defaultValue)
                    } else{
                        initList(data)
                    }
                })
            }
        })

    }])
})

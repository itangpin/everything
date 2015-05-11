/**
 * Created by pin on 5/5/15.
 */

define([
    './module',
    '../everything',
    '../app'], function (controllerModule,
                         Everything,
                         APP) {
    controllerModule.controller('listController',
        ['service.status', 'service.data', function (status, Data) {

            var ctrl = this
            ctrl.onEvent = function (type) {
                if(type=='valueChange'){
                    Data.saveChanges(ctrl.list)
                }
            }
            ctrl.launchEditorFromNode = function(node){
                APP.launchEditorFromNode(node)
            }
            var initList = function (data) {
                var defaultValue = [
                    {
                        content: '写作',
                        children: []
                    },
                    {
                        content: '代办',
                        children: []
                    }
                ]
                var container = document.querySelector(".everything")
                ctrl.list = new Everything(data || defaultValue, ctrl, {
                    container: container,
                    theme: 'light'
                })
            }

            status.updateSignInStatus(function (status, err) {
                if (err) return
                if (status == 'true') {
                    Data.getListDataFromServer().success(function (data) {
                        Data.updateListDataToLocal(data.data)
                        initList(data.data)
                    }).error(function(data){
                        initList(null)
                    })
                } else if (status == 'false') {
                    Data.getListDataFromLocal(function (data) {
                        if (data == null) {
                            initList(null)
                        } else {
                            initList(data)
                        }
                    })
                }
            })

        }])
})

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
    controllerModule.controller('listController', function () {

        var getDataRequest = data.getListData()

        var initList = function (data) {
            var container = document.querySelector(".everything")
            var everything = new Everything(value, APP, {
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

            }
        })

    })
})

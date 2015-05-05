/**
 * Created by pin on 5/5/15.
 */

define([
    './module',
    '../services/status',
    '../services/data'], function (controllerModule,
                                   status,
                                   data) {
    controllerModule.controller('listController', function () {

        var getDataRequest = data.getListData()
        var container = document.querySelector(".everything")

        status.updateSignInStatus(function(status, err){
            
        })
    })
})

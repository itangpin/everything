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
        APP.init();
    })
})

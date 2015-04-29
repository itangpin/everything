/**
 * Created by pin on 4/28/15.
 */
define(['./module'], function (serviceModule) {
    serviceModule.factory('service.user', ['$resource', function ($resource) {
        return $resource()
    }])
})
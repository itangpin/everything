/**
 * Created by pin on 4/28/15.
 */
define(['./module'], function (serviceModule) {
    serviceModule.factory('service.user',
        ['$resource','service.status', function ($resource, serviceStatus) {
        var urlPrefix = serviceStatus.urlPrefix;
        return $resource(urlPrefix+'/api/user/:id',{id: '@id'})
    }])
})
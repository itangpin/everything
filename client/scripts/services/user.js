/**
 * Created by pin on 4/28/15.
 */
define(['./module'], function (serviceModule) {
    serviceModule.factory('service.user',
        ['$resource', 'service.status','$http', function ($resource, serviceStatus, $http) {
            var urlPrefix = serviceStatus.urlPrefix;
            var User = $resource(urlPrefix + '/api/user/:id', {id: '@id'})
            User.signIn = function(data){
                return $http.post(urlPrefix + '/api/user/in', data)
            }
            return User
        }])
})
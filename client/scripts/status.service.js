/**
 * Created by pin on 4/28/15.
 * An Angular Service that tells the status of the application
 */
define(['angular','config'], function (angular,config) {
    angular.module('app').
        factory('app.status', ['$http', function ($http) {
            var status = {}
            // in chrome app or just a webpage
            status.env = (function(){
                if(chrome.storage){
                    return 'chrome-app'
                }else{
                    return 'web-page'
                }
            }())
            // if the user has sign in
            var urlPrefix = status.env == 'chrome-app' ? config.domain : ''
            status.updateSignInStatus = function(){
                $http.get(urlPrefix + '/api/user/status').done(function(){
                    
                })
            })
            status.signInStatus = 'pending';
            return status
        }])
})
/**
 * Created by pin on 4/28/15.
 * An Angular Service that tells the status of the application
 */
define(['./module', '../config'], function (serviceModule, config) {
        serviceModule.factory('service.status', ['$http', function ($http) {
            var status = {}
            // in chrome app or just a webpage
            status.env = (function () {
                if (chrome.storage) {
                    return 'chrome-app'
                } else {
                    return 'web-page'
                }
            }())

            // if the user has sign in
            var urlPrefix = config.domain
            status.urlPrefix = urlPrefix

            status.updateSignInStatus = function (callback) {
                $http.get(urlPrefix + '/api/user/status')
                    .success(function (data, resStatus) {
                        if (data.status == 200) {
                            status.signInStatus = 'true'
                        } else {
                            status.signInStatus = 'false'
                        }
                        callback(status.signInStatus)
                    })
                    .error(function () {
                        callback(null, error)
                    })
            }

            // default status
            status.signInStatus = 'pending'

            return status
        }])
})
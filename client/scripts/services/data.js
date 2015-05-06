/**
 * Created by pin on 5/4/15.
 */

define(['./module', './status'], function (serviceModule, status) {
    serviceModule.factory('service.data', ['$http','service.status', function ($http,status) {
        var Data = {}

        // replace all existed data by a new JSON data
        Data.saveByReplace = function (data) {

        }

        Data.getListDataFromServer = function () {
            return $http.get(status.urlPrefix + '/api/data')
        }

        Data.updateListDataToLocal = function (value) {
            window.localStorage.setItem('value', JSON.stringify(value));
        }

        Data.getListDataFromLocal = function (callback) {
            if (status.env == 'web-page') {
                var data = JSON.parse(localStorage.getItem('value'))
                if (data) {
                    callback(data)
                } else {
                    callback(null)
                }
            }
            if (status.env == 'chrome-app') {
                chrome.storage.local.get('value', function (data) {
                    if (data) {
                        var value = data.value
                        callback(value)
                    } else {
                        callback(null)
                    }
                })
            }
        }

        return Data
    }])
})

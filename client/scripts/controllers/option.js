/**
 * Created by pin on 4/27/15.
 */

// angular controller for option panel

define(['./module'], function (controllerModule) {

    controllerModule.controller('optionController',
        ['$scope', 'service.user','service.status', function ($scope, User, status) {
            var option = this
            option.userFormType = 'register'
            option.hasSignedIn = status.signInStatus
            // todo: show pending icon
            status.updateSignInStatus(function(statusResult){
                option.hasSignedIn = statusResult
                if(statusResult == 'false'){
                }
            })
        }])

    controllerModule.controller('registerSigninController',
        ['service.user', function (User) {
            var userCtl = this

            // register
            userCtl.re = function () {
                var user = new User({
                    email: userCtl.reEmail,
                    name: userCtl.reName,
                    password: userCtl.rePassword
                })
                user.$save(function (user) {

                })
            }

        }])

})

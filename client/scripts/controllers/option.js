/**
 * Created by pin on 4/27/15.
 */

// angular controller for option panel

define(['./module'], function (controllerModule) {

    controllerModule.controller('optionController',
        ['$scope', 'service.user', function ($scope, User) {
            var option = this

            // register
            option.re = function () {
                var user = new User({
                    email: option.reEmail,
                    name: option.reName,
                    password: option.rePassword
                })
                user.$save(function(user){

                })
            }
        }])

})

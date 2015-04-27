/**
 * Created by pin on 4/27/15.
 */

// angular module for option panel

define(['angular'],function(angular){
    var appOptionModule = angular.module('app.option')
    appOptionModule.controller('optionController',[function($scope){
        $scope.auth = true
    }])
})

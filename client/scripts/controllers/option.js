/**
 * Created by pin on 4/27/15.
 */

// angular controller for option panel

define(['./module'],function(controllerModule){

    controllerModule.controller('optionController',['$scope',function($scope){
        $scope.auth = true
        var option = this
        this.re = function(){
            console.log(option.reEmail)
        }
    }])

})

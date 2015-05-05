/**
 * Created by pin on 5/4/15.
 */

define(['./module','./status'],function(serviceModule,status){
    serviceModule.factory(['$http',function($http){
        var Saver = {}
        // replace all existed data by a new JSON data
        Saver.saveByReplace = function(data){

        }
        Saver.getListData = function(){
            return $http.get(status.urlPrefix+'/api/data')
        }
    }])
})

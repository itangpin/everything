/**
 * Created by pin on 4/12/15.
 */

requirejs.config({
        paths: {
            'angular': '../bower_components/angular/angular',
            'angular-resource': '../bower_components/angular-resource/angular-resource'
        },
        shim: {
            'angular': {
                exports: 'angular'
            },
            'angular-resource': ['angular']
        }
    }
);

require(['angular','appModule'], function (angular) {

    angular.element(document).ready(function () {
        angular.bootstrap(window.document, ['app'])
    })

});
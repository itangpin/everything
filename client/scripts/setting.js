/**
 * Created by pin on 4/22/15.
 */

define(function () {
    var Setting = {};
    Setting.init = function () {
        this.bindEvents();
    };
    Setting.checkLoginStatus = function(){
        $.post('/api/user/status').done(function(data){

        });
    };
    Setting.bindEvents = function () {
        $('#register-form').submit(function (e) {
            e.preventDefault();
            var email = $('#re-email').val(),
                name = $('#re-name').val(),
                password = $('#re-password').val();

            $.post('/api/user/register', {
                email: email,
                name: name,
                password: password
            }).done(function(data){
                console.log(data.message);
            });
        });
        $('#signin-form').submit(function(e){
            e.preventDefault();
            var email = $('#sign-email').val(),
                password = $('#sign-password').val();
            $.post('api/user/signin',{
                username: email,
                password: password
            }).done(function(data){
                console.log(data);
            });
        });
    };
    return Setting;
});

/**
 * Created by pin on 4/22/15.
 */

define(['backend-api'],function (api) {
    var Setting = {};
    Setting.init = function (option) {
        this.type = option.type;
        this.api = new api({type:this.type});
        this.bindEvents();
        this.checkLoginStatus();
    };
    Setting.checkLoginStatus = function(){
        this.api.checkSignin().done(function(data){
            console.log(data);
        });
    };
    Setting.bindEvents = function () {
        $('#register-formm').submit(function (e) {
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

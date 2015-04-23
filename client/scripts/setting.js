/**
 * Created by pin on 4/22/15.
 */

define(function () {
    var Setting = {};
    Setting.init = function () {
        this.bindEvents();
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
    };
    return Setting;
});

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
            var username = $('#re-name').val(),
                password = $('#re-password').val();

            $.post('/api/user/register', {
                username: username,
                password: password
            });
        });
    };
    return Setting;
});

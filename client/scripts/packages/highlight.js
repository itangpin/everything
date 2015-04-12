/**
 * @author 唐品(Tang Pin)
 * Created on 3/31/15.
 */

define(function(require, exports, module){
    var strRegex = '((https|http|ftp|rtsp|mms)?://)'
        + '?(([0-9a-z_!~*\'().&=+$%-]+: )?[0-9a-z_!~*\'().&=+$%-]+@)?' //ftp的user@
        + '(([0-9]{1,3}.){3}[0-9]{1,3}' // IP形式的URL- 199.194.52.184
        + '|' // 允许IP和DOMAIN（域名）
        + '([0-9a-z_!~*\'()-]+.)*' // 域名- www.
        + '([0-9a-z][0-9a-z-]{0,61})?[0-9a-z].' // 二级域名
        + '[a-z]{2,6})' // first level domain- .com or .museum
        + '(:[0-9]{1,4})?' // 端口- :80
        + '((/?)|' // a slash isn't required if there is no file name
        + '(/[0-9a-z_!~*\'().;?:@&=+$,%#-]+)+/?)';
    var re=new RegExp(strRegex);
    var highlight = {
        name: 'hightlight'
    };
    /**
     * Will be trigged after the package is loaded
     * @param app
     */
    highlight.init = function(app){
        // listen for content change in the node
        app.on('contentChange', function(node){
            console.log('highlight'+node.value.content);
            //node.setContent(node.value.content.replace(re, '<a href="$&">$&</a>'));
        });
    };

    module.exports = highlight;
});

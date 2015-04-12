/**
 * @author 唐品(Tang Pin)
 * Created on 3/31/15.
 */

define(function(require, exports, module){
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
            console.log('highlight'+node.content);
        });
    };

    module.exports = highlight;
});

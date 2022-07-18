const Modal = function( module )
{
    let self = this;
    
    this.init = function( params )
    {
        this.element = t2.common.el( "div", params.parent );
        this.element.id = params.id;
        // modal styles
        let style = this.element.style;  
            style.backgroundColor = "rgba( 255, 255, 255, 0.1 )";
            style.display = "flex";
            style.alignItems = "center";
            style.justifyContent = "center";
            style.height = "100vh";
            style.left = 0;
            style.pointerEvents = "none";
            style.position = "absolute";
            style.top = 0;
            style.width = "100vw";
            style.zIndex = 100;
    };
    
    this.close = function()
    {
        this.element.remove();
    }
};

export default Modal;
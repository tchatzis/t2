const Canvas = function()
{
    this.init = function( params )
    {
        this.element = t2.common.el( "canvas", this.parent.element );
        this.element.id = params.id;
        this.element.setAttribute( "width", this.parent.element.clientWidth );
        this.element.setAttribute( "height", this.parent.element.clientHeight );
        
        this.ctx = this.element.getContext( "2d" );  
    };
};

export default Canvas;
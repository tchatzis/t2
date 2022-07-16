const Canvas = function()
{
    let self = this;
    
    this.init = function( params )
    {
        this.element = t2.common.el( "canvas", params.parent );
        this.element.id = params.id;
        this.element.width = params.parent.clientWidth;
        this.element.height = params.parent.clientHeight;
        
        this.ctx = this.element.getContext( "2d" );  
    };
};

export default Canvas;
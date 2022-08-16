const Info = function( module )
{
    this.init = function( params )
    {
        this.element = t2.common.el( "div", params.parent );
        this.element.id = params.id;
        this.element.classList.add( params.css || "info" );
        this.element.setAttribute( "data-ignore", "clear" );
    };

    this.setContent = function( content )
    {
        this.element.innerHTML = content;
    };
};

export default Info;
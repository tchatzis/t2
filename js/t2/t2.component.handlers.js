import Common from "./t2.common.handlers.js";

const Handlers = function()
{
    this.set = function( content )
    {
        format[ this.format ].call( this, content );
    };

    const format =
    {
        fragment: function( content )
        {
            this.element.appendChild( content );
        },        
        
        html: function( content )
        {
            this.element.innerHTML = content;
        },
    
        text: function( content )
        {
            this.element.textContent = content;
        }
    };

    this.element.setAttribute( "data-format", this.format || "" );

    this.hide = () => this.element.classList.add( "hidden" );

    this.remove = () => this.element.remove();

    this.show = () => this.element.classList.remove( "hidden" );

    Common.call( this );
};

export default Handlers;
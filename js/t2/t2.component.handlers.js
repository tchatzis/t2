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

    this.class = this.constructor.name;

    this.element.setAttribute( "data-id", this.id );
    this.element.setAttribute( "data-type", this.type );
    this.element.setAttribute( "data-class", this.class );
    if ( this.format )
        this.element.setAttribute( "data-format", this.format );

    
    this.hide = () => this.element.classList.add( "hidden" );

    this.remove = () => this.element.remove();

    this.show = () => this.element.classList.remove( "hidden" );
};

export default Handlers;
const Common = function()
{
    this.class = this.constructor.name;

    if ( !this.format )
        console.warn( this.id, this.format, this )

    this.element.classList.add( this.format );
    this.element.setAttribute( "data-id", this.id );
    this.element.setAttribute( "data-type", this.type );
    this.element.setAttribute( "data-class", this.class );
    this.element.setAttribute( "data-path", this.path.get( this.id ).join( "." ) );
    
    this.hide = () => this.element.classList.add( "hidden" );

    this.remove = () => this.element.remove();

    this.show = () => this.element.classList.remove( "hidden" );   
};

export default Common;
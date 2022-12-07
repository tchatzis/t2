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

    this.scale = () => 
    {
        const scale = () => 
        {
            for ( let [ name, component ] of this.parent.children )
                if ( component !== this )
                    component.element.classList.add( "scaled" );
        };
        
        this.element.classList.add( "scaled" );

        this.element.addEventListener( "click", ( e ) => 
        {
            e.stopPropagation();

            this.element.classList.toggle( "scaled" ); 

            if ( this.element.classList.contains( "scaled" ) )
                this.element.style.position = "relative";
            else
                this.element.style.position = "absolute";

            scale();  
        } );
    };
};

export default Common;
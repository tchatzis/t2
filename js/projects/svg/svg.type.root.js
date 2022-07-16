export default function( parameters )
{   
    Object.assign( this, parameters );
    
    this.element = document.createElement( "div" );
    this.element.dataset.name = this.name;
    this.element.dataset.type = this.type;
    this.element.classList.add( "root" );
    
    document.body.appendChild( this.element );
}
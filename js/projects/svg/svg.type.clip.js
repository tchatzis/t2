export default async function( parameters )
{   
    Object.assign( this, parameters );
    
    this.element = await this.create( "clipPath" );
    this.element.setAttribute( "id", this.name );
    this.element.dataset.name = this.name;
    this.element.dataset.type = this.type;
};
export default async function( parameters )
{   
    Object.assign( this, parameters );
    
    this.element = await this.create( "g" );
    this.element.dataset.name = this.name;
    this.element.dataset.type = this.type;
};
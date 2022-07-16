export default async function( parameters )
{   
    Object.assign( this, parameters );

    this.element = await this.create( "text" );
    this.element.dataset.name = this.name;
    this.element.dataset.type = this.type;
    
    this.setContent = function( text )
    {
        this.element.textContent = text;
    };
};
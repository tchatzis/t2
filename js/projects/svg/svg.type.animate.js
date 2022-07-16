export default async function( parameters )
{   
    Object.assign( this, parameters );
    
    this.element = await this.create( "animate" );
    this.element.setAttribute( "id", this.name );
    this.element.setAttribute( "attributeType", "XML" );
    this.element.dataset.name = this.name;
    this.element.dataset.type = this.type;

    let repeats = 0;
    let endEvent = new Event( "endEvent" );
    let events = {};
        events.beginEvent = ( e ) => { repeats = this.element.getAttribute( "repeatCount" ) };
        events.repeatEvent = () => 
        {
            repeats--;

            if ( !repeats )
                this.element.dispatchEvent( endEvent );
        };

    [ "beginEvent", "repeatEvent" ].forEach( event =>
    {
        this.element.addEventListener( event, events[ event ] );
    } );
};
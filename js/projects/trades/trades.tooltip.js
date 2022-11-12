const tooltip = ( data, config, element ) => 
{
    if ( data.length )
    {
        let tooltip = [];

        data.forEach( record => 
        {
            tooltip.push( `${ t2.formats.isoTime( record.datetime ) } ${ record.action.padEnd( 4, " " ) } ${ String( record.qty ).padStart( 4, " " ) } @ ${ record.price.toFixed( 2 ) }` );
        } );

        let total = data.map( record => record.value * record.sign ).reduce( ( a, b ) => a + b, 0 );

        tooltip.push( `\nTOTAL VALUE: ${ total.toFixed( 2 ) }` );

        element.classList.add( "handler" );
        element.classList.add( "tooltip" );
        element.setAttribute( "data-details", tooltip.join( "\n" ) );
    }
    
    return data.map( record => record[ config.input.name ] * record.sign ).reduce( ( a, b ) => a + b, 0 );
};

export default tooltip;
const decimal = ".";

const formats = 
{
    absolute:   ( value ) => Math.abs( value ),
    auto:       ( value ) => 
                {
                    let exp = 5;
                    let pow = Math.pow( 10, exp );
                    let int = parseInt( value );
                    let dec = Math.round( ( value - int ) * pow ) / pow;
                    let string = String( dec );
                    let array = string.split( "." );
                    let decimal = array[ 1 ] ? "." + array[ 1 ].substring( 0, exp ) : 0;

                    return Number( int + decimal );
                },
    boolean:    ( value ) => !!value,
    date:       ( value ) => new Date( value ).toLocaleDateString(),
    datetime:   ( value ) => 
                {
                    try
                    {
                        let date = new Date( value );
                        let offset = date.getTimezoneOffset();
                        let d = new Date( date );
                            d.setHours( d.getHours() - offset / 60 );
                            d = d.toISOString();
                            d = d.split( decimal )[ 0 ];

                        return d.replace( "Z", "" );
                    }
                    catch( e )
                    {
                        return null;
                    }
                },
    "date&time":( value ) => `${ formats.isoDate( value ) } ${ formats.isoTime( value ) }`,
    dollar:     ( value ) => 
                {
                    
                    let rounded = String( Math.round( value * 100 ) / 100 );
                    let array = rounded.split( decimal );
                    let cents = array.length > 1 ? array.pop() : "0";
                    let formatted = cents.padEnd( 2, 0 );

                    array.push( formatted );

                    return array.join( decimal );
                },
    hsl:        ( value ) =>
                {
                    let hash = 0;
                    let saturation = "70%";
                    let lightness = "50%";

                    for ( let i = 0; i < value.length; i++)  
                    {
                        hash = value.charCodeAt( i ) + ( ( hash << 5 ) - hash );
                        hash = hash & hash;
                    }

                    return `hsl( ${ ( hash % 360 ) }, ${ saturation }, ${ lightness } )`;
                },
    isoDate:    ( value ) => formats.datetime( value ).split( "T" )[ 0 ],
    isoTime:    ( value ) => formats.datetime( value ).split( "T" )[ 1 ],
    lowercase:  ( value ) => String( value ).toLowerCase(),
    number:     ( value ) => Number( value ) || 0,
    precision:  ( value ) => value.toFixed( 4 ),
    negate:     ( value ) => -Number( value ),
    null:       ( value ) => null,
    object:     ( value ) => value,
    text:       ( value ) => String( value ),
    time:       ( value ) => 
                {
                    let time = new Date().toLocaleTimeString();

                    if ( !value )
                        return time;

                    const regex = new RegExp( /(?:[01]\d|2[0123]):(?:[012345]\d):(?:[012345]\d)/, 'gm' );

                    if ( regex.test( value ) )
                        return value.split( " " )[ 0 ];

                    else
                    {
                        let time = value.split( " " )[ 0 ];
                        let period = value.split( " " )[ 1 ];
                        let components = time.split( ":" );
                            components = components.map( c => Number( c ) );
                        let formatted = [];

                        let hour = components[ 0 ];
                            hour += ( period == "PM" && Number( hour ) < 12 ) ? 12 : 0;
                            hour = String( hour ).padStart( 2, "0" );
                        formatted.push( hour );

                        let minute = components[ 1 ];
                            minute = String( minute ).padStart( 2, "0" );
                        formatted.push( minute );

                        let second = components[ 2 ];
                            second = String( second ).padStart( 2, "0" );    
                        formatted.push( second );

                        return formatted.join( ":" );
                    }
                },
    uppercase:  ( value ) => String( value ).toUpperCase(),
    zero:       ( value ) => 0
};

export default formats;
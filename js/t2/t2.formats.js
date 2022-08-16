const formats = 
{
    date:       ( value ) => new Date( value ).toLocaleDateString(),
    datetime:   ( value ) => 
    {
        let date = new Date( value );
        let offset = date.getTimezoneOffset();
        let d = new Date( date );
            d.setHours( d.getHours() - offset / 60 );
            d = d.toISOString();
            d = d.split( "." )[ 0 ];

        return d.replace( "Z", "" );
    },
    "date&time":( value ) => `${ formats.isoDate( value ) } ${ formats.isoTime( value ) }`,
    dollar:     ( value ) => value.toFixed( 2 ),
    isoDate:    ( value ) => formats.datetime( value ).split( "T" )[ 0 ],
    isoTime:    ( value ) => formats.datetime( value ).split( "T" )[ 1 ],
    number:     ( value ) => Number( value ),
    precision:  ( value ) => value.toFixed( 4 ),
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
    uppercase:  ( value ) => value.toUpperCase()
};

export default formats;
const formats = 
{
    date:       ( value ) => new Date( value ).toLocaleDateString(),
    dollar:     ( value ) => value.toFixed( 2 ),
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
const Style = function()
{
    var styles = 
    {
        create: ( config ) => config,   
        dimensions: ( config ) =>
        {
            return {
                "stroke-width": 0.5,
                stroke: config.color || "rgba( 255, 255, 255, 0.3 )"
            };
        },
        dotted: ( config ) =>
        {
            return {
                "stroke-width": config.stroke || 1,
                "stroke-dasharray": config.dash ? config.dash.toString() : "2, 2",
                stroke: config.color || "rgb( 255, 255, 255 )"
            };
        },
        fine: ( config ) =>
        {
            return {
                "stroke-width": 0.5,
                stroke: config.color || "rgba( 255, 255, 255, 1 )"
            };
        },
        solid: ( config ) =>
        {
            return {
                fill: config.color || "rgb( 255, 255, 255 )",
                "stroke-width": config.stroke || 1,
                stroke: config.outline || "rgb( 255, 255, 255 )"
            };
        },
        stroke: ( config ) =>
        {
            return {
                "stroke-width": config.stroke || 1,
                stroke: config.color || "rgb( 255, 255, 255 )"
            };
        },
        text: ( config ) =>
        {
            return {
                font: config.font || "normal 1em sans-serif",
                fill: config.color || "rgba( 255, 255, 255, 1 )",
                stroke: config.outline || "transparent"
            }
        }
    };

    const encode = function( object )
    {
        var encoded = [];

        for ( let prop in object )
        {
            encoded.push( `${ prop }: ${ object[ prop ] }` );
        }

        return encoded.join( "; " );
    };

    this.setStyle = function( config )
    {     
        let style = styles[ config.name ]( config );
        let key = "style";
        let value = encode( style );

        this.setConfig( key, value );
        this.element.setAttribute( key, value );    
    };
};

export default Style;
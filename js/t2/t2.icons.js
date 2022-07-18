const Icons = function()
{
    let icons = {};
        icons.circle = function( params )
        {
            let shape = t2.common.svg( params.type );
                shape.setAttribute( "cx", params.r );
                shape.setAttribute( "cy", params.r );
                shape.setAttribute( "r", params.r );
                shape.setAttribute( "style", params.style );
            let svg = t2.common.svg( "svg" );
                svg.setAttribute( "height", params.height );
                svg.setAttribute( "width", params.width );
                svg.appendChild( shape );

            return svg;
        };
        icons.dot = function( params )
        {
            let shape = t2.common.svg( "circle" );
                shape.setAttribute( "cx", params.height / 2 );
                shape.setAttribute( "cy", params.height / 2 );
                shape.setAttribute( "r", params.r );
                shape.setAttribute( "style", params.style );
            let svg = t2.common.svg( "svg" );
                svg.setAttribute( "height", params.height );
                svg.setAttribute( "width", params.width );
                svg.appendChild( shape );

            return svg;
        };
        icons.line = function( params )
        {
            let shape = t2.common.svg( params.type );
                shape.setAttribute( "x1", params.x1 );
                shape.setAttribute( "y1", params.y1 );
                shape.setAttribute( "x2", params.x2 );
                shape.setAttribute( "y2", params.y2 );
                shape.setAttribute( "style", params.style );
            let svg = t2.common.svg( "svg" );
                svg.setAttribute( "height", params.height );
                svg.setAttribute( "width", params.width );
                svg.appendChild( shape );

            return svg;
        };
        icons.polygon = function( params )
        {
            let shape = t2.common.svg( params.type );
                shape.setAttribute( "points", params.points );
                shape.setAttribute( "style", params.style );
            let svg = t2.common.svg( "svg" );
                svg.setAttribute( "height", params.height );
                svg.setAttribute( "width", params.width );
                svg.appendChild( shape );

            return svg;
        };
        icons.polyline = function( params )
        {
            let shape = t2.common.svg( params.type );
                shape.setAttribute( "points", params.points );
                shape.setAttribute( "style", params.style );
            let svg = t2.common.svg( "svg" );
                svg.setAttribute( "height", params.height );
                svg.setAttribute( "width", params.width );
                svg.appendChild( shape );

            return svg;
        };
        icons.rect = function( params )
        {
            let shape = t2.common.svg( params.type );
                shape.setAttribute( "height", params.height );
                shape.setAttribute( "width", params.width );
                shape.setAttribute( "style", params.style );
            let svg = t2.common.svg( "svg" );
                svg.setAttribute( "height", params.height );
                svg.setAttribute( "width", params.width );
                svg.appendChild( shape );

            return svg;
        };
        icons.text = function( params )
        {
            let shape = t2.common.svg( params.type );
                shape.setAttribute( "x", "50%" );
                shape.setAttribute( "y", "50%" );
                shape.setAttribute( "text-anchor", "middle" );
                shape.setAttribute( "dominant-baseline", "central" );
                shape.textContent = params.text;
                shape.setAttribute( "style", params.style );
            let svg = t2.common.svg( "svg" );
                svg.setAttribute( "height", params.height + 4 );
                svg.setAttribute( "width", params.width );
                svg.appendChild( shape );

            return svg;
        };


    this.init = function( params )
    {
        let svg = icons[ params.type ]( params );
        let div = t2.common.el( "div", params.parent );
            div.classList.add( "icon" );
            div.dataset.type = params.type;
            div.dataset.style = params.style;
            div.appendChild( svg );
        
        return div;
    };

};

export default Icons;
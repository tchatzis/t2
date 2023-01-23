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
        icons.select = function( params )
        {
            let h = params.height;
            let w = params.width;
            let t = w * 0.5;
            let v = { x: w * 0.75, y: h * 0.25 };
            
            let line = t2.common.svg( "line" );
                line.setAttribute( "x1", 0 );
                line.setAttribute( "y1", h );
                line.setAttribute( "x2", v.x );
                line.setAttribute( "y2", v.y );
                line.setAttribute( "style", params.style );

            let polyline = t2.common.svg( "polyline" );
                polyline.setAttribute( "points", `${ v.x - t },${ v.y + t / 2 } ${ v.x },${ v.y } ${ v.x - t / 2 },${ v.y + t } ${ v.x - t },${ v.y + t / 2 }` );
                polyline.setAttribute( "style", params.style );

            let svg = t2.common.svg( "svg" );
                svg.setAttribute( "height", params.height );
                svg.setAttribute( "width", params.width );
                svg.appendChild( line );
                svg.appendChild( polyline );

            return svg;
        };
        icons.snap = function( params )
        {
            let h = params.height;
            let w = params.width;
            let t = w * 0.5;
            let v = { x: w * 0.75, y: h * 0.25 };

            let x = t2.common.svg( "line" );
                x.setAttribute( "x1", 0 );
                x.setAttribute( "y1", h * 0.2 );
                x.setAttribute( "x2", w );
                x.setAttribute( "y2", h * 0.2 );
                x.setAttribute( "style", params.style );

            let y = t2.common.svg( "line" );
                y.setAttribute( "x1", w * 0.8 );
                y.setAttribute( "y1", 0 );
                y.setAttribute( "x2", w * 0.8 );
                y.setAttribute( "y2", h );
                y.setAttribute( "style", params.style );          
            
            let line = t2.common.svg( "line" );
                line.setAttribute( "x1", 0 );
                line.setAttribute( "y1", h );
                line.setAttribute( "x2", v.x );
                line.setAttribute( "y2", v.y );
                line.setAttribute( "style", params.style );

            let red = t2.common.svg( "circle" );
                red.setAttribute( "cx", w * 0.2 );
                red.setAttribute( "cy", h * 0.8 );
                red.setAttribute( "r", 4 );
                red.setAttribute( "style", "fill: red;" );

            let polyline = t2.common.svg( "polyline" );
                polyline.setAttribute( "points", `${ v.x - t },${ v.y + t / 2 } ${ v.x },${ v.y } ${ v.x - t / 2 },${ v.y + t } ${ v.x - t },${ v.y + t / 2 }` );
                polyline.setAttribute( "style", params.style );

            let green = t2.common.svg( "circle" );
                green.setAttribute( "cx", w * 0.8 );
                green.setAttribute( "cy", h * 0.2);
                green.setAttribute( "r", 4 );
                green.setAttribute( "style", "fill: green;" );

            let svg = t2.common.svg( "svg" );
                svg.setAttribute( "height", params.height );
                svg.setAttribute( "width", params.width );
                svg.appendChild( x );
                svg.appendChild( y );
                svg.appendChild( line );
                svg.appendChild( red );
                svg.appendChild( polyline );
                svg.appendChild( green );

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
            svg.style.pointerEvents = "none";
        let div = document.createElement( "div" );
            div.classList.add( "icon" );
            div.dataset.type = params.type;
            div.dataset.style = params.style;
            div.appendChild( svg );
        
        return div;
    };
};

export default Icons;
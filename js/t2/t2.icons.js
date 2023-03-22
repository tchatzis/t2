const Icons = function()
{
    let dot = 0.2;
    
    let icons = {};
        icons.bezier = function( params )
        {  
            let h = params.height;
            let w = params.width;
            let r = ( Math.min( w / 2, h / 2 ) - 1 ) * dot;

            params.points = calculate.call( params, "0,0 50,25 75,50 100,100" );
            
            let polyline = t2.common.svg( "polyline" );
                polyline.setAttribute( "points", params.points );
                polyline.setAttribute( "style", params.style );

            let dot1 = t2.common.svg( "circle" );
                dot1.setAttribute( "cx", w * 0.5 );
                dot1.setAttribute( "cy", h * 0.25 );
                dot1.setAttribute( "r", r );
                dot1.setAttribute( "style", "fill: red;" );

            let dot2 = t2.common.svg( "circle" );
                dot2.setAttribute( "cx", w * 0.75 );
                dot2.setAttribute( "cy", h * 0.5 );
                dot2.setAttribute( "r", r );
                dot2.setAttribute( "style", "fill: red;" );
            
            let svg = t2.common.svg( "svg" );
                svg.setAttribute( "height", h );
                svg.setAttribute( "width", w );
                svg.appendChild( polyline );
                svg.appendChild( dot1 );
                svg.appendChild( dot2 );

            return svg;
        };
        icons.circle = function( params )
        {
            let cx = params.height / 2;
            let cy = params.width / 2;
            let r = ( Math.min( cx, cy ) - 1 );
            
            let shape = t2.common.svg( params.type );
                shape.setAttribute( "cx", cx );
                shape.setAttribute( "cy", cy );
                shape.setAttribute( "r", r );
                shape.setAttribute( "style", params.style );

            let svg = t2.common.svg( "svg" );
                svg.setAttribute( "height", params.height );
                svg.setAttribute( "width", params.width );
                svg.appendChild( shape );

            return svg;
        };
        icons.dot = function( params )
        {
            let cx = params.height / 2;
            let cy = params.width / 2;
            let r = ( Math.min( cx, cy ) - 1 ) * 0.25;
            
            let shape = t2.common.svg( "circle" );
                shape.setAttribute( "cx", cx );
                shape.setAttribute( "cy", cy );
                shape.setAttribute( "r", r );
                shape.setAttribute( "style", params.style.replace( "stroke", "fill" ) );

            let svg = t2.common.svg( "svg" );
                svg.setAttribute( "height", params.height );
                svg.setAttribute( "width", params.width );
                svg.appendChild( shape );

            return svg;
        };
        icons.line = function( params )
        {
            let attr = [ "x1", "y1", "x2", "y2" ];
            let shape = t2.common.svg( params.type );
                shape.setAttribute( "style", params.style );
            
            params.points = calculate.call( params, "0,100 100,0" ).replace( " ", "," ).split( "," );
            params.points.forEach( ( component, i ) => shape.setAttribute( attr[ i ], Number( component ) ) );

            let svg = t2.common.svg( "svg" );
                svg.setAttribute( "height", params.height );
                svg.setAttribute( "width", params.width );
                svg.appendChild( shape );

            return svg;
        };
        icons.pencil = function( params )
        {
            params.points = calculate.call( params, "0,100 10,80 90,0 100,10 20,90 0,100" );
            
            let shape = t2.common.svg( "polyline" );
                shape.setAttribute( "points", params.points );
                shape.setAttribute( "style", params.style );

            let svg = t2.common.svg( "svg" );
                svg.setAttribute( "height", params.height );
                svg.setAttribute( "width", params.width );
                svg.appendChild( shape );

            return svg;
        };
        icons.polygon = function( params )
        {
            params.points = calculate.call( params, "0,0 100,0 100,50 50,50 50,100 0,100" );

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
            params.points = calculate.call( params, "0,0 100,25 25,50 50,75 33,100" );
            
            let shape = t2.common.svg( params.type );
                shape.setAttribute( "points", params.points );
                shape.setAttribute( "style", params.style );

            let svg = t2.common.svg( "svg" );
                svg.setAttribute( "height", params.height );
                svg.setAttribute( "width", params.width );
                svg.appendChild( shape );

            return svg;
        };
        icons.quadratic = function( params )
        {  
            let h = params.height;
            let w = params.width;
            let r = ( Math.min( w / 2, h / 2 ) - 1 ) * dot;
            
            params.points = calculate.call( params, "0,0 50,25 75,50 100,100" );
            
            let polyline = t2.common.svg( "polyline" );
                polyline.setAttribute( "points", params.points );
                polyline.setAttribute( "style", params.style );

            let dot1 = t2.common.svg( "circle" );
                dot1.setAttribute( "cx", w * 0.9 );
                dot1.setAttribute( "cy", h * 0.2 );
                dot1.setAttribute( "r", r );
                dot1.setAttribute( "style", "fill: red;" );
            
            let svg = t2.common.svg( "svg" );
                svg.setAttribute( "height", h );
                svg.setAttribute( "width", w );
                svg.appendChild( polyline );
                svg.appendChild( dot1 );

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
            let r = ( Math.min( w / 2, h / 2 ) - 1 ) * dot;
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
                red.setAttribute( "r", r );
                red.setAttribute( "style", "fill: red;" );

            let polyline = t2.common.svg( "polyline" );
                polyline.setAttribute( "points", `${ v.x - t },${ v.y + t / 2 } ${ v.x },${ v.y } ${ v.x - t / 2 },${ v.y + t } ${ v.x - t },${ v.y + t / 2 }` );
                polyline.setAttribute( "style", params.style );

            let green = t2.common.svg( "circle" );
                green.setAttribute( "cx", w * 0.8 );
                green.setAttribute( "cy", h * 0.2);
                green.setAttribute( "r", r );
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

    this.library = icons;

    this.init = function( params )
    {
        let svg = icons[ params.type ]( params );

        if ( !svg )
        {
            console.error( params );
            return;
        }

        svg.style.pointerEvents = "none";

        let div = document.createElement( "div" );
            div.classList.add( "icon" );
            div.dataset.type = params.type;
            div.dataset.style = params.style;
            div.appendChild( svg );
            div.title = params.type;
        
        return div;
    };

    function calculate( points )
    {
        let d = { 0: this.width, 1: this.height };
        let delim = " ";
        let array = points.split( delim );
        let scaled = array.map( point => 
            {
                let components = point.split( "," );

                return components.map( ( percent, i ) => Number( percent ) / 100 * d[ i ] );     
            } );

        return scaled.map( point => point.toString() ).join( delim );
    }
};

export default Icons;
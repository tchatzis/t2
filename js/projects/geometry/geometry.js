import common from "./common.js";
import Point from "./geometry.point.js";
import Vector from "./geometry.vector.js";

const Geometry = function()
{
    // initialize
    let draw;
    
    const scope = this;
    
    // helpers
    const grid =    ( axis, value ) => value / this.pixels[ axis ] * this.grid[ axis ];
    const floor =   ( axis, value ) => Math.floor( grid( axis, value ) );
    const name =    ( x, y ) => `${ x }:${ y }`;
    const random =  ( range, min ) => Math.round( Math.random() * range ) + ( min || 0 );
    const quantize = ( axis, value ) => Math.round( grid( axis, value ) );
    const pixels =  ( axis, value ) => value * this.pixels[ axis ] / this.grid[ axis ];

    const spread =  ( nested ) => 
    {
        let flattened = [];
        
        nested.forEach( nest => flattened = flattened.concat( nest ) );

        return flattened;
    };

    const theta = function( vector )
    {
        let a = vector.x - this.origin.x;
        let o = vector.y - this.origin.y;
        let h = this.origin.distance( vector );

        return { soh: o / h, cah: a / h, toa: o / a } ;
    };
    
    const unmap = function( key, map )
    {
        return Array.from( map.entries() ).map( item => item[ 1 ][ key ] );
    };
    
    const vertices = function( previous, vector )
    {
        let vertices = [];  
            vertices.push( new Vector( vector.x, vector.y ) );
            vertices.push( new Vector( previous.x, vector.y ) );
            vertices.push( new Vector( previous.x, previous.y ) );

        return vertices;
    }

    // classes
    const Node = function( x, y, w, h )
    {
        this.origin = new Vector( x * w, y * h );
        this.name = name( x, y );
        this.x = x;
        this.y = y;
    };
    
    


    // public methods
    this.axes = function()
    {
        let colors = [ "rgba( 255, 0, 0, 0.3 )", "rgba( 0, 255, 0, 0.3 )", "rgba( 0, 0, 255, 0.3 )" ];
        let orientation = [ "vertical", "horizontal" ];
        let values = Array.from( arguments );
        let origin = new Vector( ...values );
        let axes = origin.axes.map( ( axis, i ) => 
            { 
                let vector = new Vector( 0, 0, 0 );
                    vector[ axis ] = scope.pixels[ axis ] * origin[ axis ];

                this.draw[ orientation[ i ] ]( colors[ i ], vector );
            } );
    };
    
    this.effect = function()
    {
        this.points.forEach( point => 
        {
            // sum all the distances to touch points
            point.sum = point.included.map( vector => point.origin.distance( vector ) ).reduce( ( sub, item ) => sub + item, 0 );
            point.included.forEach( vector => point.effect( vector ) ); 
        } );
    };
    
    this.init = function()
    {
        this.divisions = common.get( "settings.divisions" );
        this.draw =      common.get( "modules.draw" );
        this.factor =    common.get( "settings.factor" );
        this.grid =      common.get( "settings.grid" );
        this.pixels =    common.get( "settings.pixels" );
        this.points =    [];
        this.nodes =     new Map();
        this.vectors =   [];

        for ( let x = 0; x <= grid.x; x++ )
        {
            for ( let y = 0; y <= grid.y; y++ )
            {
                this.nodes.set( `${ x }:${ y }`, new Node( x, y, x * this.factor.x, y * this.factor.y ) );
            }
        }
    };
    
    this.lattice = function( color )
    {
        for ( let x = 0; x <= this.grid.x; x++ )
        {
            this.draw.vertical( color, new Vector( x * this.factor.x, 0, 0 ) );  
        }
        
        for ( let y = 0; y <= this.grid.y; y++ )
        {
            this.draw.horizontal( color, new Vector( 0, y * this.factor.y, 0 ) );
        }
    };
    
    this.mesh = function( color )
    {
        let nodes = Array.from( this.nodes.entries() );

        for ( let x = 1; x <= this.sites; x++ )
        {
            for ( let y = 1; y <= this.sites; y++ )
            {
                let vertices = [];
                    vertices.push( this.nodes.get( name( x, y ) ).origin );
                    vertices.push( this.nodes.get( name( x - 1, y ) ).origin );   
                    vertices.push( this.nodes.get( name( x - 1, y - 1 ) ).origin ); 
                this.draw.path( color, vertices );
            }
        }

        return nodes;
    };
    
    this.random = function( n )
    {
        for ( let i = 0; i < n; i++ )
        {
            let xy = [ random( this.pixels.x ), random( this.pixels.y ) ];
            this.vectors.push( new Vector( ...xy ) );
        } 
    };
    
    this.parabola = function( mx, my )
    {
        let mouse = new Vector( mx, my );
        let focus = new Vector( this.pixels.x, this.pixels.y ).multiply( 0.5 );
        let vertex = mouse.lerp( focus, 0.5 )      
        let radius = mouse.distance( focus );
        let p = radius / 2;
        let h = 0;
        let k = p;
        //let x = 4 * p * ( my - k ) / h + h + 2;
        let vector = new Vector( mx, my );
        
        perpendicular.call( this, focus, mouse );
        
        //console.log( focus, vector );
        
        this.draw.dot( "red", vertex, 4 );
        this.draw.path( "white", [ focus, vector ] );
        this.draw.circle( "white", focus, radius );
        
        // ( x - h )^2 = 4p( y - k ) : x^2 -2xh + h^2
        // ( y - k )^2 = 4p( x - h )
        
        function perpendicular( v1, v2 )
        {
            let length = v1.distance( v2 );
            let nx = v2.x - v1.x;
                nx /= length;
            let ny = v2.y - v1.y;
                ny /= length;
            let normal = new Vector( ny, -nx );
            let segment = normal.multiply( length );
            let p1 = v2.subtract( segment );
            let p2 = v2.add( segment );
            
            //this.draw.dot( "blue", p1, 4 );
            //this.draw.dot( "violet", p2, 4 );
            this.draw.path( "white", [ p1, p2 ] );
            
            return normal;
        }
        
    }

    this.plot =
    {
        circles: ( color ) => this.draw.circles( color, this.points.map( point => point.origin ), this.points.map( point => point.distance ) ),
        dots:    ( color ) => this.draw.dots( color, this.points.map( point => point.origin ), 5 ),
        //effect:  ( color ) => draw.dots( color, spread( this.points.map( point => point.nodes.map( vector => vector ) ) ), 2 ),
        lines:   ( color ) => this.draw.lines( color, this.points.map( point => [ point.vertices[ 0 ], point.vertices[ 2 ] ] ) ),
        mesh:    ( color ) => this.mesh( color ),
        nodes:   ( color ) => this.draw.dots( color, unmap( "origin", this.nodes ) ),
        random:  ( color ) => this.draw.dots( color, this.vectors, 5 ),
    };
    
    this.sort = function( key, array )
    {
        let sorted = array.sort( ( a, b ) => ( a[ key ] > b[ key ] ) ? 1 : -1 );

        return [ ...sorted ];
    };
    
    this.tessellate = function()
    {
        let sorted = this.sort( "x", this.vectors );

        function set( sorted )
        {
            let previous = new Vector( 0, 0 );

            sorted.forEach( vector =>
            {
                let dx = vector.x - previous.x;
                let dy = vector.y - previous.y;

                let point = new Point( this, vector );
                    point.dx = dx;
                    point.dy = dy;
                    point.vertices = vertices( previous, vector );
                    point.previous = previous;
                    point.distance = vector.distance( previous );
                    point.scan();

                this.points.push( point );
                
                previous = vector;
            } );   
            
            return sorted;
        }

        set.call( this, sorted );
    };
    
    common.set( "functions.grid", grid );
    common.set( "functions.name", name );
    common.set( "functions.quantize", quantize );
    common.set( "functions.sort", this.sort );
    common.set( "functions.spread", spread );
    common.set( "functions.unmap", unmap );
}

export default Geometry;
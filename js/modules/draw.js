import common from "./common.js";

const Draw = function()
{
    let ctx;
    
    this.circle = function( color, vector, radius )
    {
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.arc( vector.x, vector.y, radius, 0, Math.PI * 2 );
        ctx.stroke();
    };
    
    this.circles = function( color, vectors, radii )
    {
        vectors.forEach( ( vector, index ) => this.circle( color, vector, radii[ index ] ) );
    };
    
    this.clear = function()
    {
        ctx.clearRect( 0, 0, this.pixels.x, this.pixels.y );  
    };
    
    this.crosshairs = function( color, mx, my )
    {
        this.clear();
        
        ctx.setLineDash( [ 1, 5 ] );
        ctx.strokeStyle = color;
        // x
        ctx.beginPath();
        ctx.moveTo( mx, 0 );
        ctx.lineTo( mx, this.pixels.y );
        ctx.stroke();        
        // y
        ctx.beginPath();
        ctx.moveTo( 0, my );
        ctx.lineTo( this.pixels.x, my );
        ctx.stroke();   
        ctx.setLineDash( [ 0, 0 ] );
    };

    this.dash = function()
    {
        ctx.setLineDash( Array.from( arguments ) );
    };
    
    this.dot = function( color, vector, size )
    {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc( vector.x, vector.y, size || 2, 0, Math.PI * 2 );
        ctx.fill();
    };
    
    this.dots = function( color, vectors, size )
    {
        vectors.forEach( vector => this.dot( color, vector, size ) );
    };
    
    this.horizontal = function( color, vector )
    {
        ctx.strokeStyle = color;     
        ctx.beginPath();
        ctx.moveTo( 0, vector.y );
        ctx.lineTo( this.pixels.x, vector.y );
        ctx.stroke();
    };
    
    this.init = function()
    {
        ctx = common.get( "settings.ctx" );
        this.pixels = common.get( "settings.pixels" );
    };

    this.lines = function( color, vectors )
    {
        vectors.forEach( ( vertices ) => this.path( color, vertices ) );
    };

    this.path = function( color, vectors, close )
    {
        let length = vectors.length; 
        let predicate = ( i ) => close ? i <= length : i < length;
        
        ctx.strokeStyle = color;
        ctx.beginPath();

        for ( let i = 0; predicate( i ); i++ )
        {
            let vector = vectors[ i ];

            if ( !i )
                ctx.moveTo( vector.x, vector.y );
            else
                ctx.lineTo( vector.x, vector.y );
        }

        ctx.stroke();
    };
    
    this.paths = function( color, vectors )
    {
        vectors.forEach( ( vertices ) => this.path( color, vertices ) );
    };
    
    this.quadratic = function( color, vectors )
    {
        ctx.fillStyle = color;
        ctx.beginPath();

        let length = vectors.length;
        let values = [];
        
        for ( let i = 0; i < length; i++ )
        {
            let v = i % length;
            let vector = vectors[ v ];

            if ( i == 0 )
                ctx.moveTo( vector.x, vector.y );
            else
                values.push( vector.x, vector.y );
        }

        ctx.quadraticCurveTo( ...values );
        ctx.stroke();
    };
    
    this.text = function( color, vector, text )
    {
        ctx.fillStyle = color;
        ctx.font = "12px Arial";
        ctx.fillText( text, vector.x, vector.y );
    };

    this.vertical = function( color, vector )
    {
        ctx.strokeStyle = color;     
        ctx.beginPath();
        ctx.moveTo( vector.x, 0 );
        ctx.lineTo( vector.x, this.pixels.y );
        ctx.stroke();
    };
}

export default Draw;
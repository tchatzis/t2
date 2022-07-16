import common from "./common.js";

const Point = function( scope, vector )
{
    const grid =     common.get( "functions.grid" );
    const quantize = common.get( "functions.quantize" );
    const name =     common.get( "functions.name" );
    const unmap =    common.get( "functions.unmap" );;
    
    this.included = [];
    this.origin = vector;
    this.x = quantize( "x", vector.x );
    this.y = quantize( "y", vector.y );
    this.name = name( this.x, this.y );

    this.effect = function( vector )
    {
        let length = this.origin.distance( vector );
        let ratio = 1 - length / this.sum;
        let d = this.origin.lerp( vector, ratio );

        let vertices = [];
            vertices.push( this.origin );
            vertices.push( vector );

        vector.x = d.x;
        vector.y = d.y;

        /*this.draw.text( "white", this.origin.lerp( vector, 0.5 ), length.toFixed( 2 ) );
            this.draw.dash( 1, 5 );
            this.draw.path( "gray", vertices );
            this.draw.dash();*/
    };

    this.scan = function()
    {
        let vectors = unmap( "origin", scope.nodes );

        this.included = vectors.filter( vector => this.origin.distance( vector ) <= ( this.distance * scope.power ) );
    };
};

export default Point;
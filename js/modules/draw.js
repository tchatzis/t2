const Draw = function()
{
    let self = this;

    self.circle = function( color, vector, radius )
    {
        this.strokeStyle = color;
        this.beginPath();
        this.arc( vector.x, vector.y, radius, 0, Math.PI * 2 );
        this.stroke();
    };
    
    self.circles = function( color, vectors, radii )
    {
        vectors.forEach( ( vector, index ) => self.circle( color, vector, radii[ index ] ) );
    };
    
    self.clear = function()
    {
        this.clearRect( 0, 0, self.pixels.x, self.pixels.y );  
    };
    
    self.crosshairs = function( color, vector )
    {
        self.clear.call( this );

        this.setLineDash( [ 1, 5 ] );
        this.strokeStyle = color;
        // x
        this.beginPath();
        this.moveTo( vector.x, 0 );
        this.lineTo( vector.x, self.pixels.y );
        this.stroke();        
        // y
        this.beginPath();
        this.moveTo( 0, vector.y );
        this.lineTo( self.pixels.x, vector.y );
        this.stroke();   
        this.setLineDash( [ 0, 0 ] );
    };

    self.dash = function()
    {
        this.setLineDash( Array.from( arguments ) );
    };
    
    self.dot = function( color, vector, size )
    {
        this.fillStyle = color;
        this.beginPath();
        this.arc( vector.x, vector.y, size || 2, 0, Math.PI * 2 );
        this.fill();
    };
    
    self.dots = function( color, vectors, size )
    {
        vectors.forEach( vector => self.dot.call( this, color, vector, size ) );
    };
    
    self.horizontal = function( color, vector )
    {
        this.strokeStyle = color;     
        this.beginPath();
        this.moveTo( 0, vector.y );
        this.lineTo( self.pixels.x, vector.y );
        this.stroke();
    };
    
    self.init = function()
    {

    };

    self.lines = function( color, vectors )
    {
        vectors.forEach( ( vertices ) => self.path.call( this, color, vertices ) );
    };

    self.path = function( color, vectors, close )
    {
        let length = vectors.length; 
        let predicate = ( i ) => close ? i <= length : i < length;
        
        this.strokeStyle = color;
        this.beginPath();

        for ( let i = 0; predicate( i ); i++ )
        {
            let vector = vectors[ i ];

            if ( !i )
                this.moveTo( vector.x, vector.y );
            else
                this.lineTo( vector.x, vector.y );
        }

        this.stroke();
    };
    
    self.paths = function( color, vectors )
    {
        vectors.forEach( ( vertices ) => self.path.call( this, color, vertices ) );
    };
    
    self.quadratic = function( color, vectors )
    {
        this.fillStyle = color;
        this.beginPath();

        let length = vectors.length;
        let values = [];
        
        for ( let i = 0; i < length; i++ )
        {
            let v = i % length;
            let vector = vectors[ v ];

            if ( i == 0 )
                this.moveTo( vector.x, vector.y );
            else
                values.push( vector.x, vector.y );
        }

        this.quadraticCurveTo( ...values );
        this.stroke();
    };

    self.rect = function( color, array )
    {
        this.strokeStyle = color;
        this.beginPath();

        this.rect( ...array );  

        this.stroke();
    };

    self.set = function( args )
    {
        Object.assign( self, args );
    };
    
    self.text = function( color, vector, text )
    {
        this.fillStyle = color;
        this.font = "12px Arial";
        this.fillText( text, vector.x, vector.y );
    };

    self.vertical = function( color, vector )
    {
        this.strokeStyle = color;     
        this.beginPath();
        this.moveTo( vector.x, 0 );
        this.lineTo( vector.x, self.pixels.y );
        this.stroke();
    };
}

export default Draw;
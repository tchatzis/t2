const Vector = function()
{
    //let exclude = [];
    const axes = [ "x", "y", "z" ];

    this.axes = [];

    Array.from( arguments ).forEach( ( value, index ) => 
                                    { 
        let axis = axes[ index ];
        this.axes.push( axis );
        this[ axis ] = value;
    } );

    this.add = function( vector )
    {
        let values = this.axes.map( axis => this[ axis ] + vector[ axis ] );

        return new Vector( ...values );
    };
    
    this.clone = function()
    {
        return new Vector( ...this.values() );
    };

    this.cross = function( vector )
    {
        let values = [];
        values.push( this.y * vector.z - this.z * vector.y );
        values.push( this.z * vector.x - this.x * vector.z );
        values.push( this.x * vector.y - this.y * vector.x );

        return new scope.Vector( ...values );
    };

    this.dimensions = this.axes.length;

    this.distance = function( vector )
    {
        let value = 0;

        this.axes.forEach( axis => value += Math.pow( ( this[ axis ] - vector[ axis ] ), 2 ) );

        return Math.sqrt( value );
    };

    this.dot = function( vector )
    {
        let value = 0;

        this.axes.forEach( axis => value += this[ axis ] * vector[ axis ] );

        return value;
    };
    
    this.equals = function( vector )
    {
        let E = 0.00099;
        
        return this.axes.forEach( axis => Math.abs( this[ axis ] - vector[ axis ] ) > E );
    };
    
    this.lerp = function( vector, scalar )
    {
        let offset = vector.subtract( this ).multiply( scalar );

        return this.add( offset );
    };

    this.magnitude = function()
    {
        let value = 0;

        this.axes.forEach( axis => value += Math.pow( ( this[ axis ] ), 2 ) );

        return Math.sqrt( value );
    };
    
    this.multiply = function( scalar )
    {
        return new Vector( ...this.values().map( axis => axis * scalar ) );
    };

    this.nearest = function( count, vectors )
    {
        let available = [];

        for ( let i = 0; i < vectors.length; i++ )
        {
            let vector = vectors[ i ];

            if ( vector !== this )
                available.push( vector );
        }

        let distances = available.map( vector => { return { distance: this.distance( vector ), vector: vector } } );
        let sorted = distances.sort( ( a, b ) => a.distance - b.distance );
        let neighbours = sorted.map( v => v.vector );

        return neighbours.slice( 0, count );           
    };

    this.subtract = function( vector )
    {
        let values = this.axes.map( axis => this[ axis ] - vector[ axis ] );

        return new Vector( ...values );
    };

    this.theta = function( vector )
    {
        let dot = this.dot( vector );
        let cos = dot / ( this.magnitude() * vector.magnitude() ) || 0;
        return Math.acos( cos );
    };
    
    this.values = function()
    {
        return this.axes.map( axis => this[ axis ] );
    };

    return this;
};

export default Vector;
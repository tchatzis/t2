import Message from "./t2.ui.message.js";

const round = ( value ) => Math.round( value * 1000 ) / 1000;

const concat = function()
{
    [ ...arguments ].forEach( vertex => this.array = this.array.concat( vertex ) );
};

const circle = function( params, v )
{
    let r = params.radius;
    let n = params.segments;
    let y = params.y;
    let a = Math.PI / n;
    
    for ( let c = 0; c < n; c++ )
    {
        let d = ( a * 2 * c );
        let x = r * Math.cos( d );
        let z = r * Math.sin( d );

        v.push( [ x, y, z ] );
    }
};

const concave = function( params, v )
{
    let n = params.segments;
    let k = 1 - !( !n || n < 5 ); // trim top and bottom if segments < 5

    for ( let c = 1; c <= n; c++ )
    {
        let m = n + 1;
        let e = ( c + 0 ) % m || 1;
        let f = ( c + 1 ) % m || 1;

        for ( let s = k; s < n - k; s++ )
        {
            let i = n * ( s + 0 );
            let j = n * ( s + 1 );
            let p = [ 0, i + e, i + f, j + e, i + e, j + e, j + f, i + f, j + e ];
            let upper = [];
            let lower = [];

            params.upper?.forEach( i => upper.push( v[ p[ i ] ] ) );
            params.lower?.forEach( i => lower.push( v[ p[ i ] ] ) );

            if ( upper.length == 4 )
                concat.apply( this, upper );
            if ( lower.length == 4 )
                concat.apply( this, lower );
        }
    }
};

const convex = function( params, v )
{
    let n = params.segments;
    let k = 1 - !( !n || n < 5 ); // trim top and bottom if segments < 5

    for ( let c = 1; c <= n; c++ )
    {
        let m = n + 1;
        let e = ( c + 0 ) % m || 1;
        let f = ( c + 1 ) % m || 1;

        for ( let s = k; s < n - k; s++ )
        {
            let i = n * ( s + 0 );
            let j = n * ( s + 1 );

            concat.call( this, v[ i + e ], v[ i + f ], v[ j + e ], v[ i + e ] );
            concat.call( this, v[ j + e ], v[ j + f ], v[ i + f ], v[ j + e ] );
        }
    }
};

function DXDY( params )
{
    this.height = params.height || 1;
    this.width = params.width || 1;
    this.area = this.height * this.width;
    this.array = [];

    let heights = ( this.height + 1 );
    let widths = ( this.width + 1 );
    let hw = params.width / 2;
    let hh = params.height / 2;
    let indices = [];
    let vertices = [];
    let z = 0;

    this.count = heights * widths;
    this.center = [ hw, hh, z ];
    
    this.init = () =>
    {
        for ( let h = 0; h <= this.height; h++ )
        {
            let y = h - hh;
            
            for ( let w = 0; w <= this.width; w++ )
            {
                let x = w - hw;
    
                indices.push( [ h, w ] );
                vertices.push( [ x, y, z ] );
            }
        }

        /*for ( let i = 0; i < this.count; i++ )
        {
            this.array = this.array.concat( this.dxdy( i ) );
        }

        for ( let h = 0; h < this.height; h++ )
        {
            for ( let w = 0; w < this.width; w++ )
            {
                let x = w - hw;
    
                indices.push( [ h, w ] );
                vertices.push( [ x, y, z ] );
            }
        }*/
    };

    this.curve = ( pair, vertex ) =>
    {
        if ( !params.radius )
            return vertex;
        
        let angle = pair[ 0 ] * ( Math.PI * 2 ) / this.width;

        vertex[ 0 ] = params.radius * Math.sin( angle );
        vertex[ 2 ] = params.radius * Math.cos( angle );

        return vertex;
    };

    this.dxdy = ( i ) =>
    {
        let vertices = [];

        console.log( i );

        return vertices;
    };

    this._dxdy = ( i ) =>
    {   
        let h = Math.floor( i / heights );
        let dh = ( h + 1 ) % heights;

        let w = i % widths;
        let dw = ( w + 1 ) % widths;

        let vertices = [];
        let indices = [ [ w, h ], [ dw, h ], [ w, dh ], [ w, h ], [ dw, h ], [ dw, dh ], [ w, dh ], [ dw, h ] ];
            indices.forEach( pair => 
            {
                let index = this.get.index.apply( this, pair );
                let node = this.get.face( index );
                let vertex = this.curve( pair, node.vertex );
                
                vertices.push( ...vertex )
            } );

        return vertices;
    };

    this.get = 
    {
        face: ( i ) => 
        { 
            let index = indices[ i ];
            
            return {
                index: i,
                vertex: vertices[ i ],
                h: index[ 0 ],
                w: index[ 1 ]
            };
        },

        index: ( w, h ) => h * heights + w % widths,

        vertices: () => vertices
    };
}

const faces = function( params, v )
{
    let n = params.segments;
    let y = params.y;
    let m = 3;
    let i = ( y + 1 ) % m;
        i *= n;
    let j = ( y + 2 ) % m;
        j *= n;

    for ( let e = 0; e < n; e++ )
    {
        let f = ( e + 1 ) % n;
        
        concat.call( this, v[ i + e ], v[ j + e ], v[ i + f ], v[ i + e ] );
        concat.call( this, v[ j + f ], v[ i + f ], v[ j + e ], v[ j + f ] );
    }
}

const polar = function( params, v )
{
    let r = params.radius;
    let n = params.segments;
    let a = Math.PI / n;
    let y = r;
    
    for ( let Y = 0; Y <= n + 1; Y++ )
    {
        let theta = a * Y;
        let p = r * Math.sin( theta );
        let q = r * Math.cos( theta );
        
        y = q;

        for ( let XZ = 0; XZ < n; XZ++ )
        {
            let d = ( a * 2 * XZ + theta );
            let x = Math.cos( d ) * p;
            let z = Math.sin( d ) * p;

            v.push( [ x, y, z ] );
        }
    }
}

const unit = function()
{
    const v = [];

    for ( let i = 0; i < 8; i++ )
    {
        let X = Math.floor( i / 2 ) % 2;
        let Y = Math.floor( ( i + 1 ) / 2 ) % 2;
        let Z = Math.floor( i / 4 );

        let x = 1 - 2 * X;
        let y = 1 - 2 * Y;
        let z = 1 - 2 * Z;

        v.push( [ x, y, z ] );
    }  

    return v;
}

const geometry = {};

geometry.cone = function( params )
{
    this.array = [];

    let v = [];
    let r = params.radius;

    for ( let y = -1; y <= 1; y += 2 )
    {
        let _params = { ...params };
            _params.radius = r * ( y + 1 );
            _params.y = y;
            console.log( y, _params )
        circle.call( this, _params, v );
    }

    for ( let y = -1; y < 1; y += 2 )
    {
        params.y = y;
        faces.call( this, params, v );
    }

    return this.array;
};

geometry.cube = function( params )
{
    this.array = [];
    
    let v = unit();

    concat.call( this, v[ 3 ], v[ 2 ], v[ 1 ], v[ 0 ] ); // F
    concat.call( this, v[ 4 ], v[ 5 ], v[ 6 ], v[ 7 ] ); // O

    concat.call( this, v[ 2 ], v[ 3 ], v[ 7 ], v[ 6 ] ); // L
    concat.call( this, v[ 5 ], v[ 4 ], v[ 0 ], v[ 1 ] ); // R

    concat.call( this, v[ 7 ], v[ 3 ], v[ 0 ], v[ 4 ] ); // T
    concat.call( this, v[ 1 ], v[ 5 ], v[ 6 ], v[ 2 ] ); // B

    return this.array;
};

geometry.grid = function( params )
{
    let dxdy = new DXDY( params );
        dxdy.init();

    return dxdy.array;
};

geometry.plane = function( params )
{
    this.array = 
    [
        -1, -1,  0, 
         1, -1,  0,
         1,  1,  0,
        -1,  1,  0
    ];

    return this.array;
};

geometry.polygon = function( params )
{
    this.array = [];

    let v = [];
        v.push( [ 0, 0, 0 ] );

    polar.call( this, params, v );
    concave.call( this, params, v );

    return this.array;
};

geometry.pyramid = function( params )
{
    this.array = [];
    
    let v = unit();
        v.push( [ 0, 1, 0 ] );

    concat.call( this, v[ 1 ], v[ 5 ], v[ 6 ], v[ 2 ] );
    concat.call( this, v[ 8 ], v[ 2 ], v[ 1 ], v[ 8 ] );
    concat.call( this, v[ 8 ], v[ 1 ], v[ 5 ], v[ 8 ] );
    concat.call( this, v[ 8 ], v[ 5 ], v[ 6 ], v[ 8 ] );
    concat.call( this, v[ 8 ], v[ 6 ], v[ 2 ], v[ 8 ] );

    return this.array;
};

geometry.sphere = function( params )
{
    this.array = [];

    let v = [];
        v.push( [ 0, 0, 0 ] );

    polar.call( this, params, v );
    convex.call( this, params, v );

    return this.array;
};

geometry.tetrahedron = function( params )
{
    this.array = [];
    
    let v = unit();

    concat.call( this, v[ 0 ], v[ 5 ], v[ 7 ], v[ 0 ] );
    concat.call( this, v[ 0 ], v[ 7 ], v[ 2 ], v[ 0 ] );
    concat.call( this, v[ 0 ], v[ 2 ], v[ 5 ], v[ 0 ] );
    concat.call( this, v[ 5 ], v[ 7 ], v[ 2 ], v[ 5 ] );

    return this.array;
};

geometry.tube = function( params )
{
    this.array = [];

    let v = [];

    for ( let y = -1; y <= 1; y += 2 )
    {
        params.y = y;
        circle.call( this, params, v );
    }

    for ( let y = -1; y < 1; y += 2 )
    {
        params.y = y;
        faces.call( this, params, v );
    }

    return this.array;
};

const geometries = function( params )
{
    const Config = function()
    { 
        this.components = 3; 
        this.draw = "drawElements"; 
        this.vertices = () => new geometry[ params.type ]( params );
        this.params = params;
    };

    return {
    
        cone: new Config(),
        
        cube: new Config(),

        //cylinder: new Config(), // tube with caps

        grid: new Config(),

        plane: new Config(),

        //point: { components: 3, draw: "drawPoints", vertices: () => [ 0, 0, 0 ] },

        polygon: new Config(),

        tube: new Config(), // no cap cylinder

        pyramid: new Config(),

        sphere: new Config(),

        tetrahedron: new Config(),

        //torus: new Config(),

        types: Object.keys( geometry )
    }
};

export default geometries;
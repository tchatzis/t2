import geometries from "./t2.component.gl.geometries.js";
import helpers from "./t2.component.gl.helpers.js";

const Child = function( ctx )
{
    let self = this;
    let gl = ctx.gl;
    var arrays, attributes, buffers, shaders, uniforms, varyings;

    this.add = 
    {
        array: ( params ) =>
        {
            createBuffer( params );

            arrays.set( params.name, params );
        },
        
        attribute: ( params ) =>
        {
            this.set.vertex.declare( `attribute ${ params.class } ${ params.name };` );

            params.target = params.target || "ARRAY_BUFFER";
            params.type = params.type || "Float32Array";

            createBuffer( params );

            attributes.set( params.name, params );
        },
        
        uniform: ( params ) => 
        {
            this.set.vertex.declare( `uniform ${ params.class } ${ params.name };` );
            this.set.fragment.declare( `uniform ${ params.class } ${ params.name };` );

            uniforms.set( params.name, params ); 
        },

        varying: ( params ) => 
        {
            this.set.vertex.declare( `varying ${ params.class } ${ params.name };` );
            this.set.fragment.declare( `varying ${ params.class } ${ params.name };` );

            varyings.set( params.name, params );  
        }
    };

    this.bind = () =>
    {
        for ( let [ name, params ] of attributes )
        { 
            gl.bindBuffer( gl[ params.target ], buffers[ name ].buffer );
            gl.vertexAttribPointer( params.location, params.components, gl.FLOAT, false, 0, 0 );
            gl.enableVertexAttribArray( params.location );
        };
    };

    this.delete = 
    {
        animation: ( name ) => delete this.animations[ name ]
    };

    this.reset = () =>
    {
        arrays = new Map();
        attributes = new Map();
        buffers = {};
        shaders = {};
        uniforms = new Map();
        varyings = new Map();
        
        this.animations = {};

        this.geometry = {};
    
        this.transformations = 
        {
            translate: [],
            scale: [],
            rotate: []
        };
    
        this.uuid = t2.common.uuid();
    };

    this.reset();

    this.set = 
    {
        animation: ( params ) => this.animations[ params.name ] = params,
        
        fragment: new helpers.Type( "fragment" ),

        geometry: ( params ) => 
        {
            this.geometry = geometries( params )[ params.type ];
            this.geometry.array = this.geometry.vertices();
            this.geometry.count = this.geometry.array.length / this.geometry.components;

            this.add.attribute( { name: "vertices", class: `vec${ this.geometry.components }`, target: "ARRAY_BUFFER", type: "Float32Array", value: this.geometry.array } );
            this.add.attribute( { name: "color", class: `vec4`, target: "ARRAY_BUFFER", type: "Float32Array", value: params.colors || colors( this.geometry.count ) } );
            this.add.array( { name: "indices", class: "int", target: "ELEMENT_ARRAY_BUFFER", type: "Uint16Array", value: indices( this.geometry.count ) } );
        },

        rotate: function()
        {
            let rotation = Math.PI * arguments[ 0 ] / 180;
            let axes = [ arguments[ 1 ], arguments[ 2 ], arguments[ 3 ] ];

            self.transformations.rotate.push( [ rotation, axes ] );
        },

        scale: function()
        {
            self.transformations.scale.push( [ [ ...arguments ] ] );
        },
        
        translate: function()
        {
            self.transformations.translate.push( [ [ ...arguments ] ] );
        },

        vertex: new helpers.Type( "vertex" )
    };

    this.get =
    {
        animations: () => this.animations,
        
        attribute: ( name ) => attributes.get( name ),
        
        attributes: () => Object.fromEntries( attributes ),

        buffer: ( attribute ) => buffers[ attribute ],

        children: () => 
        {
            let children = {};
            
            for ( let [ uuid, params ] of ctx.children )
            {
                children[ params.params.id ] = { uuid: uuid, params: params.geometry.params };
            }

            return children;
        },

        context: () => ctx,
        
        fragment: this.set.fragment.code,

        geometry: () => this.geometry,

        geometries: () => geometries().types,

        indices: () => arrays.get( "indices" ).value,

        program: () => this.program,

        transformations: () => this.transformations,

        uniforms: () => Object.fromEntries( uniforms ),

        varyings: () => Object.fromEntries( varyings ),

        vertex: this.set.vertex.code,  
    };

    this.init = () =>
    {
        declarePresetUniforms();
        
        createAndCompileShaders();

        createAndLinkProgram();
        
        setAttribute();

        logAttributes();

        locateUniforms();

        this.geometry.buffers = buffers;
    };

    // create buffer for each attribute
    function createBuffer( params )
    {
        const buffer = gl.createBuffer();

        let array = new window[ params.type ]( params.value );

        gl.bindBuffer( gl[ params.target ], buffer );

        gl.bufferData( gl[ params.target ], array, gl.STATIC_DRAW );

        buffers[ params.name ] = { array: array, attribute: params.name, buffer: buffer, components: params.components, target: params.target };
    }

    function createAndCompileShaders()
    {
        [ "vertex", "fragment" ].forEach( type =>
        {
            shaders[ type ] = gl.createShader( gl[ `${ type.toUpperCase() }_SHADER` ] ); 

            let code = self.get[ type ]();

            gl.shaderSource( shaders[ type ], code );
            gl.compileShader( shaders[ type ] );
            
            if ( !gl.getShaderParameter( shaders[ type ], gl.COMPILE_STATUS ) ) 
            {
                console.error( code );
                throw( gl.getShaderInfoLog( shaders[ type ] ) );
            }
        } );
    }

    function createAndLinkProgram()
    {
        self.program = gl.createProgram();

        [ "vertex", "fragment" ].forEach( type =>
        {
            gl.attachShader( self.program, shaders[ type ] );
        } );

        gl.linkProgram( self.program );

        if ( !gl.getProgramParameter( self.program, gl.LINK_STATUS ) ) 
        {
            throw( gl.getProgramInfoLog( self.program ) );
        }

        gl.useProgram( self.program );
    }

    function setAttribute()
    {
        attributes.forEach( params => 
        {
            params.location = gl.getAttribLocation( self.program, params.name );

            let lkp = helpers.lookup( params );

            params.components = lkp.size;

            //arguments: ( index, size, type, normalized, stride, offset )
            gl.vertexAttribPointer( params.location, params.components, gl.FLOAT, false, 0, 0 );
            gl.enableVertexAttribArray( params.location );  
        } );  
    }

    function locateUniforms()
    {
        uniforms.forEach( ( params, name ) => 
        {   
            params.location = gl.getUniformLocation( self.program, name );

            // if there is a value then set the uniform
            if ( ctx.uniforms.hasOwnProperty( name ) )
            {
                let lkp = helpers.lookup( params );

                params.func = lkp.func;

                gl[ lkp.func ]( params.location, ...lkp.args );
            }
        } );
    }

    function logAttributes()
    {
        const n = gl.getProgramParameter( self.program, gl.ACTIVE_ATTRIBUTES );

        for ( let i = 0; i < n; i++ ) 
        {
          const info = gl.getActiveAttrib( self.program, i );
        }
    }

    function declarePresetUniforms()
    {
        for ( let name in ctx.uniforms )
        {
            let params = Object.assign( ctx.uniforms[ name ](), { name: name } );

            self.add.uniform( params );
        };
    }

    // attributes
    function indices( count )
    {
        let indices = [];
        
        for ( let i = 0; i < count; i += 2 )
        {
            let n = Math.floor( i / 4 );
            let o = ( i / 2 ) % 2;
            let p = n * 4;

            indices.push( p );
            indices.push( p + 1 + o );
            indices.push( p + 2 + o );
        }

        return indices;
    }

    function colors( count )
    {
        const HSLToRGB = ( c ) => 
        {
            let h = 360 * c / count;
            let s = 1;
            let l = 0.5;
            
            const k = n => ( n + h / 30 ) % 12;
            const a = s * Math.min( l, 1 - l );
            const f = n => l - a * Math.max( -1, Math.min( k ( n ) - 3, Math.min( 9 - k( n ), 1 ) ) );

            return [ f( 0 ), f( 8 ), f( 4 ) ];
        };
        
        let colors = [];

        for ( let c = 0; c < count / 4; c++ ) 
        {
            let color = HSLToRGB( c * 4 ).concat( 1 );

            colors = colors.concat( color, color, color, color );
        }

        return colors;
    }
};

export default Child;
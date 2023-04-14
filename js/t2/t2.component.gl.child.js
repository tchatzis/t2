import geometries from "./t2.component.gl.geometries.js";
import helpers from "./t2.component.gl.helpers.js";

const Child = function( ctx )
{
    let self = this;
    let buffers = {};
    let gl = ctx.gl;
    let arrays = new Map();
    let attributes = new Map();
    let uniforms = new Map();
    let varyings = new Map();
    let shaders = {};

    this.geometry = {};

    this.transformations = {};

    this.uuid = t2.common.uuid();

    this.add = 
    {
        array: ( params ) =>
        {
            createBuffer( params );

            arrays.set(  params.name, params );
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
            gl.vertexAttribPointer( params.location, 2, gl.FLOAT, false, 0, 0 );
            gl.enableVertexAttribArray( params.location );
        };
    };

    this.set = 
    {
        fragment: new helpers.Type( "fragment" ),

        geometry: ( type ) => 
        {
            this.geometry = geometries[ type ];

            let count = this.geometry.array.length / this.geometry.components;

            this.add.attribute( { name: "vertices", class: `vec${ this.geometry.components }`, target: "ARRAY_BUFFER", type: "Float32Array", value: this.geometry.array } );
            this.add.array( { name: "indices", class: "int", target: "ELEMENT_ARRAY_BUFFER", type: "Uint16Array", value: indices( count ) } );
        },

        rotate: function()
        {
            self.transformations.rotate = [ ...arguments ];
        },

        scale: function()
        {
            self.transformations.scale = [ ...arguments ];
        },
        
        translate: function()
        {
            self.transformations.translate = [ [ ...arguments ] ];
        },

        vertex: new helpers.Type( "vertex" )
    };

    this.get =
    {
        attributes: () => attributes.entries(),

        buffer: ( attribute ) => buffers[ attribute ],
        
        fragment: this.set.fragment.code,

        program: () => this.program,

        uniforms: () => uniforms.entries(),

        varyings: () => varyings.entries(),

        vertex: this.set.vertex.code
    };

    this.init = () =>
    {
        declarePresetUniforms();
        
        createAndCompileShaders();

        createAndLinkProgram();
        
        attributeBuffers();

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

        buffers[ params.name ] = { array: array, attribute: params.name, buffer: buffer, target: params.target };
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

    function attributeBuffers()
    {
        attributes.forEach( params => 
        {
            params.location = gl.getAttribLocation( self.program, params.name );

            let lkp = helpers.lookup( params );

            //arguments: ( index, size, type, normalized, stride, offset )
            gl.vertexAttribPointer( params.location, lkp.size, gl.FLOAT, false, 0, 0 );
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

    function indices( count )
    {
        let vertices = [];
        
        for ( let i = 0; i < count; i += 2 )
        {
            let n = Math.floor( i / 4 );
            let o = ( i / 2 ) % 2;
            let p = n * 4;

            vertices.push( p );
            vertices.push( p + 1 + o );
            vertices.push( p + 2 + o );
        }

        return vertices;
    }
};

export default Child;
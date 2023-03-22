import Handlers from "./t2.component.handlers.js";
import matrix from "../modules/gl-matrix.js";

const Component = function()
{
    let self = this;
    let gl;
    const presetUniforms = [ "modelViewMatrix", "projectionMatrix" ];

    const vertices = 
    {
        cube: { buffer: "ELEMENT_ARRAY_BUFFER", components: 3, draw: "drawElements", data:
        [
            // Front face
            -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0,
            
            // Back face
            -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0,
            
            // Top face
            -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0,
            
            // Bottom face
            -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,
            
            // Right face
            1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0,
            
            // Left face
            -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0,
        ] },
        plane: { buffer: "ELEMENT_ARRAY_BUFFER", components: 3, draw: "drawElements", data: 
        [
            -1.0, -1.0, 0.0,
            1.0, -1.0, 0.0,
            1.0, 1.0, 0.0,
            -1.0, 1.0, 0.0
        ] }//[ 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0 ]
    };

    this.children = new Map();

    this.init = function( params )
    {
        let parent = this.parent.element;

        this.width = parent.clientWidth;
        this.height = parent.clientHeight;
        
        this.element = t2.common.el( "canvas", parent );
        this.element.id = params.id;
        this.element.setAttribute( "width", this.width );
        this.element.setAttribute( "height", this.height );
        
        this.gl = gl = this.element.getContext( "webgl" );  

        Object.assign( this, params );

        Handlers.call( this );
    };

    this.addObject = function( params )
    {
        let object = {};
            object.id = params.id;
            object.output = params.output;
            object.type = params.type;
            object.uuid = t2.common.uuid();

        Object.defineProperty( object, "transformations", { value: {}, enumerable: false, writeable: false } );

        const Shaders = function()
        {
            let shader = this;
            let shaders = { vertex: [], fragment: [] };
            const allow = { vertex: [ "attribute", "uniform", "varying" ], fragment: [ "uniform", "varying" ] };

            const Params = function()
            {
                this.map = new Map();
    
                [ "array", "attribute", "uniform", "varying" ].forEach( type => this.map.set( type, new Map() ) );
    
                this.add = ( params ) =>
                {
                    let map = this.map.get( params.type );
                        map.set( params.name, params );

                    create.call( shader );
                };
            };

            const Main = function( array )
            {
                this.add = function( line )
                {
                    this.main.push( `\t${ line }` );
                    stringify();
                };

                this.main = array;
            };

            this.params = new Params();
    
            function create()
            {
                shaders = { vertex: [], fragment: [] };
                
                Object.keys( shaders ).forEach( t =>
                {
                    let params = shaders[ t ];
                        params.push( "precision mediump float;" );
                        params.push( "" );
                    let main = [];
                    let entries = this.params.map.entries();
        
                    for ( let [ type, map ] of entries )
                    {
                        Array.from( map.values() ).forEach( param => 
                        {
                            if ( ~allow[ t ].indexOf( type ) )
                            {
                                params.push( `${ type } ${ param.class } ${ param.name };` );
                            }
                        } );
                    }
                    
                    params.push( "" );
                    params.push( "void main() {" );
                    params.push( main );
                    params.push( "}" );
        
                    this[ t ] = { params: params };
                    Main.call( this[ t ], main );
                } );

                stringify();
            }

            function stringify()
            {
                Object.keys( shaders ).forEach( type =>
                {
                    let main = shader[ type ]?.main.join( "\n" );
                    let code = [];

                    if ( !shader[ type ]?.params )
                        throw( `${ type } shader is not defined` );
        
                    shader[ type ]?.params.forEach( line =>
                    {
                        if ( line instanceof Array )
                            code.push( main );
                        else
                            code.push( line );
                    } );
        
                    shader[ type ].code = code.join( "\n" );
                } );
            }

            this.init = function() 
            {
                const vertex = compile( gl.VERTEX_SHADER, object.shaders.vertex.code );
                const fragment = compile( gl.FRAGMENT_SHADER, object.shaders.fragment.code );
                const program = gl.createProgram();
                
                gl.attachShader( program, vertex );
                gl.attachShader( program, fragment );
                gl.linkProgram( program ) ;
    
                if ( !gl.getProgramParameter( program, gl.LINK_STATUS ) ) 
                {
                    alert(` Unable to initialize the shader program: ${ gl.getProgramInfoLog( program ) }` );
                    return null;
                }

                locations( program );
                arrays();
                attributes();
            }

            function compile( type, code ) 
            {
                const shader = gl.createShader( type );

                gl.shaderSource( shader, code );
                gl.compileShader( shader );

                if ( !gl.getShaderParameter( shader, gl.COMPILE_STATUS ) ) 
                {
                    alert( `An error occurred compiling the shaders: ${ gl.getShaderInfoLog( shader ) }` );
                    gl.deleteShader( shader );
                    return null;
                }
            
                return shader;
            }

            function locations( program )
            {
                const mapping = { attribute: "getAttribLocation", uniform: "getUniformLocation" };
                const info = { buffers: {}, program: program };

                for ( let [ type, f ] of Object.entries( mapping ) )
                {
                    const map = shader.params.map.get( type );

                    info[ type ] = {};

                    Array.from( map.values() ).forEach( param => 
                    {
                        info[ type ][ param.name ] = gl[ f ]( program, param.name );
                    } );
                }

                object.shaders.info = info;
            }

            function arrays()
            {
                const map = shader.params.map.get( "array" );

                buffers( map );

                for ( let [ attribute, value ] of map.entries() )
                {
                    delete value.components;
                    gl.bindBuffer( gl[ value.target ], value.buffer );
                }
            }

            function attributes() 
            {
                const map = shader.params.map.get( "attribute" );
  
                buffers( map );  
                //this.bind( map );
            }

            function buffers( map )
            {
                for ( let [ attribute, value ] of map.entries() )
                {
                    const config = vertices[ params.type ];

                    value.buffer = gl.createBuffer();
                    value.components = value.components || config.components;
                    value.data = value.data || config.data;
                    value.target = value.target || "ARRAY_BUFFER";
                    value.draw = value.draw || config.draw;

                    switch( value.target )
                    {
                        case "ARRAY_BUFFER":
                            gl.bindBuffer( gl[ value.target ], value.buffer );
                            gl.bufferData( gl[ value.target ], new Float32Array( value.data ), gl.STATIC_DRAW );
                        break;

                        case "ELEMENT_ARRAY_BUFFER":
                            gl.bindBuffer( gl[ value.target ], value.buffer );
                            gl.bufferData( gl[ value.target ], new Uint16Array( value.data ), gl.STATIC_DRAW );
                        break;
                    }

                    object.shaders.info.buffers[ attribute ] = value;
                };
            }

            this.bind = function()
            {
                const type = gl.FLOAT;
                const normalize = false;
                const stride = 0;
                const offset = 0;
                const map = shader.params.map.get( "attribute" );

                for ( let [ attribute, value ] of Object.entries( shader.info.attribute ) )
                {
                    let params = map.get( attribute );
                    let buffer = object.shaders.info.buffers[ attribute ];

                    gl.bindBuffer( gl[ buffer.target ], buffer.buffer );

                    if ( !params.components )
                        return;

                    gl.vertexAttribPointer
                    (
                        value,
                        params.components,
                        type,
                        normalize,
                        stride,
                        offset
                    );

                    gl.enableVertexAttribArray( value );
                }
            }
        };

        object.set = 
        {
            rotate: function()
            {
                object.transformations.rotate = [ ...arguments ];
            },
            
            translate: function()
            {
                object.transformations.translate = [ [ ...arguments ] ];
            }
        };

        object.shaders = new Shaders( params );

        presetUniforms.forEach( uniform => object.shaders.params.add( { type: "uniform", class: "mat4", name: uniform } ) );

        self.children.set( object.uuid, object );

        return object;
    };

    this.clear = function()
    {
        gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
        gl.clear( gl.COLOR_BUFFER_BIT );
        gl.clearDepth( 1.0 );
        gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
    };

    this.render = function( params )
    {
        gl.enable( gl.DEPTH_TEST );
        gl.depthFunc( gl.LEQUAL );

        const fov = ( params.fov * Math.PI ) / 180;
        const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        const mat4 = matrix.mat4;
        
        function render()
        {
            self.clear();

            self.children.forEach( object => 
            {
                const uniforms = {};

                presetUniforms.forEach( uniform => uniforms[ uniform ] = mat4.create() );

                mat4.perspective( uniforms.projectionMatrix, fov, aspect, params.near, params.far );

                let info = object.shaders.info;
                    info.matrix = { model: uniforms.modelViewMatrix, projection: uniforms.projectionMatrix };
    
                // transformations
                for ( let transformation in object.transformations )
                {
                    let args = [ uniforms.modelViewMatrix, uniforms.modelViewMatrix ].concat( object.transformations[ transformation ] );
                    
                    info.matrix.object = mat4[ transformation ].apply( null, args );
                }

                switch( vertices[ object.type ].draw )
                {
                    case "drawArrays":
                        use( object, uniforms );
                        gl.drawArrays( gl[ object.output ], 0, 4 );
                    break;

                    case "drawElements":
                        gl.bindBuffer( gl[ info.buffers.indices.target ], info.buffers.indices.buffer );
                        use( object, uniforms );
                        gl.drawElements( gl[ object.output ], info.buffers.indices.data.length, gl.UNSIGNED_SHORT, 0 );
                    break;
                }
            } );
        }

        function use( object, uniforms )
        {
            let info = object.shaders.info;

            // bind attributes to arrays again
            object.shaders.bind();
            
            gl.useProgram( info.program );

            const u = object.shaders.params.map.get( "uniform" );

            // uniforms
            for ( let [ uniform, value ] of u )
                gl.uniformMatrix4fv( info.uniform[ uniform ], false, uniforms[ uniform ] );
        }

        requestAnimationFrame( render );
    };
};

export default Component;
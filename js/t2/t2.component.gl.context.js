import Child from "./t2.component.gl.child.js";
import helpers from "./t2.component.gl.helpers.js";
import matrix from "../modules/gl-matrix.js";

const Context = function()
{
    let ctx = this;
    let w = this.element.width;
    let h = this.element.height;
    let time = Date.now();
    let mouse = new Float32Array( [ 0, 0 ] );
    let resolution = new Float32Array( [ w, h ] );
    let wheel = 0;

    this.parent.element.addEventListener( "mousemove", ( e ) => { mouse = new Float32Array( [ e.pageX / w, e.pageY / h ] ) }, false );
    this.parent.element.addEventListener( "wheel", ( e ) => { wheel += Math.sign( e.deltaY ) }, false );

    this.aspect = w / h;
    
    this.children = new Map();

    this.addChild = function( params )
    {
        let child = new Child( this );
            child.params = params || {};

        this.children.set( child.uuid, child );
        
        return child;
    };

    this.clear = function()
    {
        this.gl.clearColor( ...arguments );
        this.gl.clear( this.gl.COLOR_BUFFER_BIT );
        this.gl.clearDepth( 1.0 );
        this.gl.clear( this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT );
    };

    this.gl = this.element.getContext( "webgl" ); 
    this.gl.viewport( 0, 0, w, h );

    this.render = function( params )
    {
        this.clear( ...params.clearColor );

        this.gl.enable( this.gl.DEPTH_TEST );
        this.gl.depthFunc( this.gl.LEQUAL );

        const fov = ( params.fov * Math.PI ) / 180;

        function render()
        {
            for ( let [ uuid, child ] of ctx.children )
            {
                let uniforms = {};
    
                for ( let [ name, params ] of child.get.uniforms() )
                {
                    uniforms[ name ] = ctx.uniforms[ name ] ? ctx.uniforms[ name ]().value : params.value;

                    if ( params.location )
                    {
                        params.value = uniforms[ name ];
                        
                        let lkp = helpers.lookup( params );

                        ctx.gl[ lkp.func ]( params.location, ...lkp.args );
                    }
                }

                matrix.mat4.perspective( uniforms[ "projectionMatrix" ], fov, ctx.aspect, params.near, params.far );

                // transformations
                for ( let transformation in child.transformations )
                {
                    let vec3 = matrix.vec3.create();
                    let params = [ vec3 ].concat( ...child.transformations[ transformation ] );

                    matrix.vec3.set.apply( null, params );

                    let args = [ uniforms[ "modelViewMatrix" ], uniforms[ "modelViewMatrix" ] ].concat( vec3 );

                    console.log( args );

                    matrix.mat4[ transformation ].apply( null, args );
                }

                //child.bind();

                switch( child.geometry.draw )
                {
                    case "drawArrays":
                        ctx.gl[ child.geometry.draw ]( ctx.gl[ "TRIANGLES" ], 0, 4 );
                    break;

                    case "drawElements":
                        let indices = child.geometry.buffers.indices;
                        console.log( indices );

                        ctx.gl.bindBuffer( ctx.gl[ indices.target ], indices.buffer );
                        ctx.gl[ child.geometry.draw ]( ctx.gl[ "TRIANGLES" ], indices.array.length, ctx.gl.UNSIGNED_SHORT, 0 );
                    break;

                    case "drawPoints":

                    break;
                }
            }

            //requestAnimationFrame( render );
        }

        render();  
    };

    // preset common uniforms
    this.uniforms =
    {
        modelViewMatrix: () =>  { return { class: "mat4", value: matrix.mat4.create() } },
        mouse: ( e ) =>         { return { class: "vec2", value: mouse } },
        projectionMatrix: () => { return { class: "mat4", value: matrix.mat4.create() } },
        resolution: () =>       { return { class: "vec2", value: resolution } },      
        time: () =>             { return { class: "float", value: ( Date.now() - time ) / 1000 } },
        wheel: () =>            { return { class: "float", value: wheel } }
    };
};

export default Context;
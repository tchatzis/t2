import Child from "./t2.component.gl.child.js";
import helpers from "./t2.component.gl.helpers.js";
import matrix from "../modules/gl-matrix.js";

const Context = function()
{
    let ctx = this;
    let w = this.canvas.width;
    let h = this.canvas.height;
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

    this.gl = this.canvas.getContext( "webgl" ); 
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
                let u = child.get.uniforms();
                let local = 
                {
                    projectionMatrix: matrix.mat4.create(),
                    modelViewMatrix: matrix.mat4.create()
                };

                // perspective
                matrix.mat4.perspective( local.projectionMatrix, fov, ctx.aspect, params.near, params.far );

                // transformations
                for ( let transformation in child.transformations )
                {
                    child.transformations[ transformation ].forEach( data => 
                    {
                        let args = [ local.modelViewMatrix, local.modelViewMatrix ].concat( data );

                        matrix.mat4[ transformation ].apply( null, args );
                    } );
                }

                // animations
                for ( let name in child.animations )
                {
                    let animation = child.animations[ name ];
                    let axis;
                    switch( animation.axis )
                    {
                        case "x": axis = [ 1, 0, 0 ]; break;
                        case "y": axis = [ 0, 1, 0 ]; break;
                        case "z": axis = [ 0, 0, 1 ]; break;
                    }
                    let time = ctx.uniforms.time().value;
                    let data = 
                    {
                        rotate: [ animation.amount * time, axis ]
                    };

                    let args = [ local.modelViewMatrix, local.modelViewMatrix ].concat( data[ animation.transformation ] );

                    matrix.mat4[ animation.transformation ].apply( null, args );
                }

                // update uniforms
                for ( let name in u )
                {
                    let params = u[ name ];
                    
                    uniforms[ name ] = ctx.uniforms[ name ] ? ctx.uniforms[ name ]( local[ name ] ).value : params.value;

                    if ( params.location )
                    {
                        params.value = uniforms[ name ];
                        
                        let lkp = helpers.lookup( params );

                        ctx.gl[ lkp.func ]( params.location, ...lkp.args );
                    }
                }   

                // re-bind attributes
                child.bind();

                draw( child );
            }

            if ( ctx.run )
                requestAnimationFrame( render );
        }

        // draw object
        function draw( child )
        {
            switch( child.geometry.draw )
            {
                case "drawArrays":
                    ctx.gl[ child.geometry.draw ]( ctx.gl[ "TRIANGLES" ], 0, 4 );
                break;

                case "drawElements":
                    ctx.gl[ child.geometry.draw ]( ctx.gl[ "TRIANGLES" ], child.geometry.buffers.indices.array.length, ctx.gl.UNSIGNED_SHORT, 0 );
                break;

                case "drawPoints":

                break;
            }
        }

        render();  
    };

    this.reset = async function()
    {
        this.run = false;
        this.children = new Map();

        t2.common.sleep( 500 );

        ctx.restore();
    };

    this.run = true;

    this.toggle = function()
    {
        this.run != this.run;
    };

    // preset common uniforms
    this.uniforms =
    {
        modelViewMatrix:  ( value ) => { return { class: "mat4", value: value || matrix.mat4.create() } },
        projectionMatrix: ( value ) => { return { class: "mat4", value: value || matrix.mat4.create() } },
        mouse: () =>            { return { class: "vec2", value: mouse } },
        resolution: () =>       { return { class: "vec2", value: resolution } },      
        time: () =>             { return { class: "float", value: ( Date.now() - time ) / 1000 } },
        wheel: () =>            { return { class: "float", value: wheel } }
    };
};

export default Context;
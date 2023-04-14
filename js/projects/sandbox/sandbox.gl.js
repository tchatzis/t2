const Template = function( module )
{
    let self = this;
    
    this.init = async function()
    {
        await this.refresh();

        await navigation();
    };

    this.refresh = async function()
    {

    };

    async function navigation()
    {
        await t2.navigation.update( 
        [ 
            { id: "content", functions: [ { clear: null }, { invoke: [ { f: output, args: null } ] } ] },
        ] );
    } 

    function colors( array )
    {
        var colors = [];

        for ( let j = 0; j < array.length; ++j ) 
        {
            const c = array[ j ];

            colors = colors.concat( c, c, c, c );
        }

        /* 
            [ 
                1.0, 1.0, 1.0, 1.0,
                1.0, 0.0, 0.0, 1.0,
                0.0, 1.0, 0.0, 1.0,
                0.0, 0.0, 1.0, 1.0 
            ] } );*/

        return colors;
    }

    async function output()
    {   
        const palette = 
        [
            [ 1.0, 1.0, 1.0, 1.0 ], // Front face: white
            [ 1.0, 0.0, 0.0, 1.0 ], // Back face: red
            [ 0.0, 1.0, 0.0, 1.0 ], // Top face: green
            [ 0.0, 0.0, 1.0, 1.0 ], // Bottom face: blue
            [ 1.0, 1.0, 0.0, 1.0 ], // Right face: yellow
            [ 1.0, 0.0, 1.0, 1.0 ]  // Left face: purple
        ];

        //let colors = [];'
        let colors =
        [

        ];

        /*for ( let  j = 0; j < palette.length; ++j ) 
        {
            const c = palette[ j ];

            colors = colors.concat( c, c, c, c );
        }*/

        //console.log( colors );
        
        let canvas = await this.addComponent( { id: "webgl", type: "gl", format: "webgl" } );
        let child = canvas.addChild( { id: "id" } );
            child.set.geometry( "plane" );
            // attributes
            //child.add.attribute( { name: "vertices", class: "vec3", value: vertices } );
            child.add.attribute( { name: "color", class: "vec4", value: colors } );

            //uniforms
            //child.add.uniform( { name: "radius", class: "float", value: 0.025 } );
            //child.add.uniform( { name: "red", class: "float", value: 0.4 } );
            //child.add.uniform( { name: "green", class: "float", value: 0.8 } );
            //child.add.uniform( { name: "blue", class: "float", value: 4.0 } );
            child.set.translate( 0, 0, -5 );

            //varyings
            child.add.varying( { name: "vColor", class: "vec4" } );

            // vertex
            child.set.vertex.write( "vColor = vec4( 0.0, 1.0, 0.0, 1.0 );" );
            child.set.vertex.write( "gl_Position = projectionMatrix * modelViewMatrix * vec4( vertices, 1.0 );" );

            // fragment
            /*child.set.fragment.func( `float ball( vec2 p, float fx, float fy, float ax, float ay ) 
            {
                vec2 r = vec2( p.x + sin( time * fx ) * ax, p.y + cos( time * fy ) * ay );	
                return radius / length( r );
            }` );*/
            child.set.fragment.write( "" );
            //child.set.fragment.write( "vec2 q = gl_FragCoord.xy / resolution.xy;" );
            //child.set.fragment.write( "vec2 p = -1.0 + 2.0 * q;" );
            //child.set.fragment.write( "p.x *= resolution.x / resolution.y;" ); // scales the x aspect
            //child.set.fragment.write( "float col = 0.1;" );
            //child.set.fragment.write( "" );
            //child.set.fragment.write( "col += ball( p, 0.0, 0.0, 0.0, 0.0 );" );
            //child.set.fragment.write( "col += ball(p, 1.5, 2.5, 0.2, 0.3);" );
            //child.set.fragment.write( "col += ball(p, 2.0, 3.0, 0.3, 0.4);" );
            //child.set.fragment.write( "col += ball(p, 2.5, 3.5, 0.4, 0.5);" );
            //child.set.fragment.write( "col += ball(p, 3.0, 4.0, 0.5, 0.6);" );
            //child.set.fragment.write( "col += ball(p, 1.5, 0.5, 0.6, 0.7);" );
            //child.set.fragment.write( "gl_FragColor = vec4(col * red, col * green, col * blue, 1.0);" );
            //child.set.fragment.write( "gl_FragColor = vec4( col * 1.0 * red, col * green, col * blue, 1.0 );" );
            child.set.fragment.write( "gl_FragColor = vColor;" );

            child.init();

        canvas.render( {
            clearColor: [ 0.0, 0.0, 0.0, 0.001 ],
            fov: 60,
            near: 0.1,
            far: 100
        } );

        //console.log( child.get.vertex() );
        //console.log( child.get.fragment() );
        
  
        /*let box = canvas.addObject( { id: "box", type: "plane", output: "TRIANGLES" } );
            box.shaders.params.add( { type: "attribute", class: "vec4", name: "aVertices" } );
            box.shaders.params.add( { type: "attribute", class: "vec4", components: 4, name: "aColor", data:
            [
                1, 1, 1, 1,
                1, 0, 0, 1,
                0, 1, 0, 1,
                0, 0, 1, 1
            ] } );
            box.shaders.params.add( { type: "array", name: "indices", target: "ELEMENT_ARRAY_BUFFER", data: vertices( 4 ) } );
            box.shaders.params.add( { type: "varying", class: "vec4", name: "vColor" } );
            box.shaders.vertex.add( "gl_Position = uProjectionMatrix * uModelViewMatrix * aVertices;" );
            box.shaders.vertex.add( "vColor = aColor;" );
            box.shaders.fragment.add( "gl_FragColor = vColor;" );
            box.shaders.init();
            box.set.translate( 2, 0, -4 );
            box.set.rotate( Math.PI * Math.random(), [ 0, 1, 0 ] );

        let cube = canvas.addObject( { id: "cube", type: "cube", output: "TRIANGLES" } );
            cube.shaders.params.add( { type: "attribute", class: "vec4", name: "aVertices" } ); 
            cube.shaders.params.add( { type: "attribute", class: "vec4", components: 4, name: "aColor", data: colors(
            [
                [ 1.0, 1.0, 1.0, 0.5 ], // Front face: white
                [ 1.0, 0.0, 0.0, 0.5 ], // Back face: red
                [ 0.0, 1.0, 0.0, 0.5 ], // Top face: green
                [ 0.0, 0.0, 1.0, 0.5 ], // Bottom face: blue
                [ 1.0, 1.0, 0.0, 0.5 ], // Right face: yellow
                [ 1.0, 0.0, 1.0, 0.5 ]  // Left face: purple
            ] ) } );
            cube.shaders.params.add( { type: "array", name: "indices", target: "ELEMENT_ARRAY_BUFFER", data: vertices( 24 ) } );
            cube.shaders.params.add( { type: "varying", class: "vec4", name: "vColor" } );
            cube.shaders.vertex.add( "gl_Position = uProjectionMatrix * uModelViewMatrix * aVertices;" );
            cube.shaders.vertex.add( "vColor = aColor;" );
            cube.shaders.fragment.add( "gl_FragColor = vColor;" );
            cube.shaders.init();
            cube.set.translate( 0, 0, -5 );
            cube.set.rotate( Math.PI * Math.random(), [ 1, 1, 0 ] );*/

        /*let points = canvas.addObject( { id: "points", type: "points", output: "TRIANGLES" } );
            points.shaders.params.add( { type: "uniform", class: "float", name: "uTime" } );
            //points.shaders.params.add( { type: "uniform", class: "vec2", name: "uMouse" } );
            points.shaders.params.add( { type: "uniform", class: "vec2", name: "uResolution" } );
            points.shaders.params.add( { type: "attribute", class: "vec4", name: "vPosition" } );
            points.shaders.vertex.add( "gl_Position = vPosition;" );
            points.shaders.fragment.add( "gl_FragColor = vec4( 1.0, 1.0, 1.0, 1.0 );" );
            points.shaders.init();*/
    }   
};

export default Template;
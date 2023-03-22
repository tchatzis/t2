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
        let canvas = await this.addComponent( { id: "webgl", type: "gl", format: "webgl" } );

        let box = canvas.addObject( { id: "box", type: "plane", output: "TRIANGLES" } );
            box.shaders.params.add( { type: "attribute", class: "vec4", name: "aVertices" } );
            box.shaders.params.add( { type: "attribute", class: "vec4", components: 4, name: "aColor", data:
            [
                1, 1, 1, 1,
                1, 0, 0, 1,
                0, 1, 0, 1,
                0, 0, 1, 1
            ] } );
            box.shaders.params.add( { type: "array", name: "indices", target: "ELEMENT_ARRAY_BUFFER", data: tessellate() } );
            box.shaders.params.add( { type: "varying", class: "vec4", name: "vColor" } );
            box.shaders.vertex.add( "gl_Position = projectionMatrix * modelViewMatrix * aVertices;" );
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
            cube.shaders.params.add( { type: "array", name: "indices", target: "ELEMENT_ARRAY_BUFFER", data: vertices() } );
            cube.shaders.params.add( { type: "varying", class: "vec4", name: "vColor" } );
            cube.shaders.vertex.add( "gl_Position = projectionMatrix * modelViewMatrix * aVertices;" );
            cube.shaders.vertex.add( "vColor = aColor;" );
            cube.shaders.fragment.add( "gl_FragColor = vColor;" );
            cube.shaders.init();
            cube.set.translate( 0, 0, -5 );
            cube.set.rotate( Math.PI * Math.random(), [ 1, 1, 0 ] );

        
        function tessellate()
        {
            const points = [ 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0 ];
            const iterations = points.length / 2;
            let vertices = [];

            for ( let i = 0; i < iterations; i += 2 )
            {
                let n = Math.floor( i / 4 );
                let o = ( i / 2 ) % 2;
                let p = n * 4;
                let t = [];

                vertices.push( p );
                vertices.push( p + 1 + o );
                vertices.push( p + 2 + o );
            }

            return vertices;
        }
    
        function vertices()
        {
            let vertices = [];
            
            for ( let i = 0; i < 24; i += 2 )
            {
                let n = Math.floor( i / 4 );
                let o = ( i / 2 ) % 2;
                let p = n * 4;
                let t = [];

                vertices.push( p );
                vertices.push( p + 1 + o );
                vertices.push( p + 2 + o );
            }

            return vertices;
        }

        canvas.render( { fov: 75, near: 0.1, far: 100 } );
    }   
};

export default Template;
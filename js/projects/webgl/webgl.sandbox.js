const Template = function( module )
{
    let self = this;
    let content = 
    [
        { id: "canvas", type: "gl", format: "block", output: "webgl" },
        { id: "context", type: "content", format: "block", output: "object", debug: true },
        { id: "children", type: "content", format: "block", output: "object", debug: true },
        { id: "vertex", type: "content", format: "block", output: "code", debug: true },
        { id: "fragment", type: "content", format: "block", output: "code", debug: true },
        { id: "geometry", type: "content", format: "block", output: "object", debug: true },
        { id: "attributes", type: "content", format: "block", output: "object", debug: true },
        { id: "uniforms", type: "content", format: "block", output: "object", debug: true },
        { id: "varyings", type: "content", format: "block", output: "object", debug: true },
        { id: "animations", type: "content", format: "block", output: "object", debug: true },
        { id: "transformations", type: "content", format: "block", output: "object", debug: true },
    ];
    let menu;
    let panels = {};

    this.init = async function()
    {
        await this.refresh();

        await navigation();

        this.geometry = "grid";
    };

    this.refresh = async function()
    {
        // content clear
        content.forEach( params => 
        {
            if ( params.debug )
            {
                let element = panels[ params.id ]?.element;

                if ( element )
                    element.innerHTML = null;
            }
        } );
    };

    async function navigation()
    {
        await t2.navigation.update( 
        [ 
            { id: "menu", functions: [ { ignore: "clear" }, { show: null }, { invoke: [ { f: geometry, args: null } ] } ] },
            { id: "content", functions: [ { clear: null }, { invoke: [ { f: output, args: null } ] } ] },
        ] );
    } 

    // menu
    async function geometry()
    { 
        menu = await this.addComponent( { id: "geometries", type: "menu", format: "block" } );
        menu.addBreadcrumbs( 3, t2.navigation.components.breadcrumbs );   
        menu.addListener( { type: "click", handler: async function() 
        { 
            self.geometry = menu.activated.toLowerCase();

            let canvas = panels[ "canvas" ];
                canvas.reset();

            self.refresh();

            draw();
        } } );  
    }

    // content
    async function output()
    {
        let panel = await this.addComponent( { id: "panels", type: "panels", format: "block", output: "vertical" } );

        let fulfill = new t2.common.Fulfill();

        for ( let c = 0; c < content.length; c++ )
        {
            let params = content[ c ];

            fulfill.add( panels[ params.id ] = await panel.add( "Component", Object.assign( params, { label: params.id } ) ) );
        }

        await fulfill.resolve();

        panel.setControls( 
        { 
            breadcrumbs: { index: 2, component: t2.navigation.components.breadcrumbs },
            controller: { id: "tabs", type: "tabs", format: "flex-left", output: "horizontal" }
        } );

        draw();
    }

    function draw()
    {
        let child = panels[ "canvas" ].addChild( { id: self.geometry } );
            child.set.geometry( 
            { 
                type: self.geometry, 
                radius: 0, 
                segments: 11, 
                upper: [ 1, 0, 3, 4 ], 
                lower: [ 5, 6, 0, 8 ],
                height: 10,
                width: 10
            } );

            //console.log( panels[ "canvas" ] );

            // attributes
            //child.add.attribute( { name: "vertices", class: "vec3", value: vertices } );
            //child.add.attribute( { name: "color", class: "vec4", value: colors( child.get.geometry().count ) } );

            //uniforms
            //child.add.uniform( { name: "rotation", class: "float", value: 0 } );
            //child.add.uniform( { name: "radius", class: "float", value: 0.025 } );
            //child.add.uniform( { name: "red", class: "float", value: 0.4 } );
            //child.add.uniform( { name: "green", class: "float", value: 0.8 } );
            //child.add.uniform( { name: "blue", class: "float", value: 4.0 } );

            //varyings
            child.add.varying( { name: "vColor", class: "vec4" } );
            child.add.varying( { name: "vVertices", class: "vec4" } );

            // transformations
            child.set.translate( 0, 0, -5 );
            //child.set.scale( 1, 2, 1 );
            //child.set.rotate( 90, 0, 1, 0 );

            // animations
            child.set.animation( { transformation: "rotate", name: "rotate-x", amount: 0.5, axis: "x" } );
            //child.set.animation( { transformation: "rotate", name: "rotate-y", amount: 0.6, axis: "y" } );
            //child.set.animation( { transformation: "rotate", name: "rotate-z", amount: 0.7, axis: "z" } );

            // vertex
            child.set.vertex.write( "vVertices = vec4( vertices, 1.0 );" );
            child.set.vertex.write( "vColor = color;" );
            child.set.vertex.write( "gl_Position = projectionMatrix * modelViewMatrix * vVertices;" );
            
            // fragment
            /*child.set.fragment.func( `float ball( vec3 vertex, float i ) 
            {
                vec3 periodic = vec3( sin( time * i * 0.9 ) * cos( time * 0.8 ), cos( time * 0.7 ) * cos( time * 0.6 ), sin( time * 0.5 ) * sin( time * 0.4 ) );	

                return radius / length( periodic * vertex );
            }` );*/
            //child.set.fragment.write( "" );
            //child.set.fragment.write( "float aspect = resolution.x / resolution.y;" );
            //child.set.fragment.write( "vec2 q = gl_FragCoord.xy / resolution.xy;" );
            //child.set.fragment.write( "vec2 p = -1.0 + 2.0 * q;" );
            //child.set.fragment.write( "p.x *= aspect;" ); // scales the x aspect
            //child.set.fragment.write( "float col = wheel * 0.1;" );
            //child.set.fragment.write( "" );

            /*const float = ( value ) => value.toFixed( 1 );

            for ( let i = 0; i < 8; i++ )
            {
                child.set.fragment.write( `col += ball( vVertex.xyz, ${ float( i ) } );` );
            }*/
            child.set.fragment.write( "gl_FragColor = vColor;" );

            child.init();

        panels[ "canvas" ].render( {
            clearColor: [ 0.0, 0.0, 0.0, 0.001 ],
            fov: 60,
            near: 0.1,
            far: 100
        } );

        // menu
        menu.update( child.get.geometries() );
        menu.highlight( self.geometry );

        // tabs debug content
        content.forEach( params => 
        {
            if ( params.debug )
                panels[ params.id ].set( child.get[ params.id ]() );
        } );
    }
};

export default Template;
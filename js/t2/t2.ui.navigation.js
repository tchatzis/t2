const Navigation = function( module )
{
    let self = this;

    // parent elements
    let breadcrumbs;
    let header;
    let footer;
    let menu;
    let view;

    this.components = {};

    this.init = async function( params )
    {
        await t2.ui.layout.init( params );
        
        console.log( "...breadcrumbs" );
    }

    this.addComponent = async function( params )
    {
        let parent = t2.ui.children.get( params.parent );
        
        this.components[ params.id ] = await parent.addComponent( { id: params.id, type: params.type || "menu", array: params.array, format: params.format || "flex" } );
    
        return this.components[ params.id ];
    };

    this._init = async function( params )
    {
        await t2.ui.layout.init( params.init );

        header = t2.ui.children.get( "header" );
        footer = t2.ui.children.get( "footer" );
        menu = header.children.get( "scenes" );


        // main menu
        if ( !menu )
        {
            menu = await header.addComponent( { id: "scenes", type: "menu", array: params.menu.array, format: "flex" } );
            menu.addListener( { type: "click", handler: async function()
            {
                await t2.ui.layout.init( { layout: params.init.layout, ignore: params.menu.ignore } );
                
                let e = arguments[ 0 ];
                let listener = arguments[ 1 ];
                let active = arguments[ 2 ];
                let name = active.curr.getAttribute( "data-link" );

                t2.movie.changeScene( name );

                breadcrumbs.unset( 3 );
                breadcrumbs.unset( 2 );
                breadcrumbs.unset( 1 );
                breadcrumbs.set( 0, name ); 
            } } );

            this.menu = menu;
        }

        // sub menu
        if ( params.view.array )
        {
            view = await footer.addComponent( { id: "view", type: "menu", array: params.view.array, format: "flex", output: null } );
            view.addListener( { type: "click", handler: async function()
            {
                await t2.ui.layout.init( { layout: params.init.layout, ignore: params.view.ignore } );

                let e = arguments[ 0 ];
                let listener = arguments[ 1 ];
                let active = arguments[ 2 ];
                let name = active.curr.getAttribute( "data-link" );
                // load module
                let imported = await import( `../projects/${ module.info.namespace }/${ module.info.namespace }.${ name }.js` );
                let script = await new imported.default( module );

                await script.run();

                breadcrumbs.unset( 3 );
                breadcrumbs.unset( 2 );
                breadcrumbs.set( 1, name ); 
            } } );

            this.view = view;
        }

        // breadcrumbs
        breadcrumbs = await footer.addComponent( { id: "breadcrumbs", type: "path", format: "block", output: "path" } );

        // activate
        if ( params.menu.activate )
        {
            menu.active( params.menu.activate );
            breadcrumbs.set( 0, params.menu.activate );
        }

        if ( params.view.activate )
        {
            view.activate( params.view.activate );
        }
    };

    this.location = function( path )
    {
        let _path = path.split( "/" );

        [ "menu", "view" ].forEach( ( name, index ) => 
        {
            if ( _path[ index ] )
                self[ name ].activate( _path[ index ] );
        } );
    };
}

export default Navigation;
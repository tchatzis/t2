async function navigation( params )
{
    let self = this;

    await t2.ui.layout.init( params.init );

    // parent elements
    let header = await t2.ui.children.get( "header" );
    let footer = t2.ui.children.get( "footer" );
    let menu = header.children.get( "scenes" );
    let view;

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
            let module = await import( `../projects/${ self.info.namespace }/${ self.info.namespace }.${ name }.js` );
            let script = await new module.default( self );

            await script.run();

            breadcrumbs.unset( 3 );
            breadcrumbs.unset( 2 );
            breadcrumbs.set( 1, name ); 
        } } );
    }

    // breadcrumbs
    let breadcrumbs = await footer.addComponent( { id: "breadcrumbs", type: "path", format: "block", output: "path" } );

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
}

export default navigation;
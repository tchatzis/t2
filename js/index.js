import T2 from "./t2/t2.js";

async function init( namespace )
{
    let t2 = new T2();
    await t2.init( namespace );
    await t2.ui.init( 
        [ 
            { id: "header",  ignore: "clear", parent: document.body }, 
            { id: "wrapper", ignore: "clear", parent: document.body },
            { id: "footer",  ignore: "clear", parent: document.body },
            { id: "context", ignore: "clear", parent: document.body }
        ] );

    // import the movie scripts
    let module      = await import( "./index.scripts.js" );
    let script      = new module.default();
    let scripts     = await script.init();
    let scenes      = {};
    let scene       = "trades";

    // story board
    //scenes.login       = t2.movie.addScene( { duration: 2000, name: "login", next: "database", script: scripts.login } );
    scenes.database      = t2.movie.addScene( { duration: Infinity, name: "database", next: "imports", script: scripts.databases } );
    //scenes.imports     = t2.movie.addScene( { duration: Infinity, name: "imports", next: "trades", script: scripts.imports } );
    scenes.trades        = t2.movie.addScene( { duration: Infinity, name: "trades", next: "2D", script: scripts.trades } );
    //scenes.svg           = t2.movie.addScene( { duration: Infinity, name: "svg", next: "2D", script: scripts.svg } );
    scenes[ "2D" ]       = t2.movie.addScene( { duration: Infinity, name: "2D", next: "end", script: scripts[ "2D" ] } );
    scenes.end           = t2.movie.addScene( { duration: Infinity, name: "end", next: null, script: null } );

    // footer navigation
    let header = await t2.ui.root( t2.ui.elements.get( "header" ).element );
    let menu = await header.addComponent( { id: "scenes", type: "menu", array: Array.from( t2.movie.scenes.keys() ), format: "flex" } );
        menu.element.dataset.ignore = "clear";
        menu.addListener( { type: "click", handler: ( e, listener, active ) => 
        { 
            breadcrumbs.set.path( 0, active.curr.textContent ); 
            scenes.end.change( e, listener, active );
        } } );
        menu.activate( scene );

    // add breadcrumbs ( path ) component
    let footer = await t2.ui.root( t2.ui.elements.get( "footer" ).element );
    let breadcrumbs = await footer.addComponent( { id: "breadcrumbs", type: "path" } );
        breadcrumbs.set.path( 0, scene );

    await scenes[ scene ].start();
};

window.onload = () => init( "t2" );
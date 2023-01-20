import T2 from "./t2/t2.js";

async function init( namespace )
{
    let t2 = new T2();
    await t2.init( namespace );

    let scenes      = {};
    let scene       = "design";

    // story board
    //scenes.login       = t2.movie.addScene( { duration: 2000, name: "login", next: "database" } );
    scenes.sandbox       = t2.movie.addScene( { duration: Infinity, name: "sandbox", next: null } );
    scenes.databases     = t2.movie.addScene( { duration: Infinity, name: "databases", next: null } );
    //scenes.imports     = t2.movie.addScene( { duration: Infinity, name: "imports", next: "trades" } );
    scenes.trades        = t2.movie.addScene( { duration: Infinity, name: "trades", next: null } );
    //scenes.svg           = t2.movie.addScene( { duration: Infinity, name: "svg", next: "2D" } );
    scenes.design        = t2.movie.addScene( { duration: Infinity, name: "design", next: null } );
    scenes.end           = t2.movie.addScene( { duration: Infinity, name: "end", next: null } );

    await scenes[ scene ].start();
};

window.onload = () => init( "t2" );
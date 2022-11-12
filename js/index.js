import T2 from "./t2/t2.js";
import navigation from "./t2/t2.ui.navigation.js";

async function init( namespace )
{
    let t2 = new T2();
    await t2.init( namespace );

    let scenes      = {};
    let scene       = "design";

    // story board
    //scenes.login       = t2.movie.addScene( { duration: 2000, name: "login", next: "database" } );
    scenes.databases     = t2.movie.addScene( { duration: Infinity, name: "databases", next: "imports" } );
    //scenes.imports     = t2.movie.addScene( { duration: Infinity, name: "imports", next: "trades" } );
    scenes.trades        = t2.movie.addScene( { duration: Infinity, name: "trades", next: "design" } );
    //scenes.svg           = t2.movie.addScene( { duration: Infinity, name: "svg", next: "2D" } );
    scenes.design        = t2.movie.addScene( { duration: Infinity, name: "design", next: "end" } );
    scenes.end           = t2.movie.addScene( { duration: Infinity, name: "end", next: null } );

    await scenes[ scene ].start();
};

window.onload = () => init( "t2" );
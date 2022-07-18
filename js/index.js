import scripts from "./index.scripts.js";
import T2 from "./t2/t2.js";

async function init( namespace )
{
    let t2 = new T2();
        t2.init( namespace );
        t2.ui.init( 
        [ 
            { id: "header",  ignore: "clear", parent: document.body }, 
            { id: "wrapper", ignore: "clear", parent: document.body },
            { id: "footer",  ignore: "clear", parent: document.body } 
        ] );

    // story board
    let login   = t2.movie.addScene( { duration: 2000, name: "login", next: "trades", script: scripts.login } );
    let trades  = t2.movie.addScene( { duration: Infinity, name: "trades", next: "svg", script: scripts.trades } );
    let svg     = t2.movie.addScene( { duration: Infinity, name: "svg", next: "twoD", script: scripts.svg } );
    let twoD    = t2.movie.addScene( { duration: Infinity, name: "2D", next: "end", script: scripts.twoD } );
    let end     = t2.movie.addScene( { duration: Infinity, name: "end", next: null, script: null } );
    

    await svg.start();

    // footer navigation
    let names = Array.from( t2.movie.scenes.keys() );

    let menu = await t2.ui.addComponent( { id: "scenes", component: "menu", parent: t2.ui.elements.get( "footer" ), array: names, horizontal: true } );
        menu.addListener( { type: "click", handler: end.change } );
        menu.element.dataset.ignore = "clear";
};

window.onload = () => init( "t2" );
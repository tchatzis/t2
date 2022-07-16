import T2 from "./t2/t2.js";

async function init( namespace )
{
    let t2 = new T2();
        t2.init( namespace );
        t2.ui.init( 
        [ 
            { id: "header", parent: document.body }, 
            { id: "wrapper", parent: document.body },
            { id: "footer", parent: document.body } 
        ] );
    
    let movie = t2.movie;
    
    let scene1 = movie.addScene( 
        {
            duration: 2000,
            name: "scene 1",
            next: "scene 2"
        } );
        scene1.pre = async () =>
        {
            await scene1.addComponent( { id: "modal", component: "modal", parent: document.body } );
            await scene1.addContent( { default: "default", invoke: "init", path: "forms.login", namespace: "login", parent: "modal" } );
            await scene1.addUnload( { namespace: "login", execute: "success" } );
            await scene1.addUnload( { namespace: "this", execute: "removeComponent", arguments: [ "modal" ] } );  
        };
        
    // trades
    let scene2 = movie.addScene(
        { 
            duration: Infinity,    
            name: "trades",
            next: null
        } );
        scene2.pre = async () => 
        {
            let scenes = Array.from( movie.scenes.keys() );
            
            // set up the UI
            await scene2.addElement( { id: "menu", parent: "wrapper" } );
            await scene2.addElement( { id: "submenu", parent: "menu", ignore: "clear" } );
            await scene2.addElement( { id: "middle", parent: "wrapper" } );
            await scene2.addElement( { id: "content", parent: "middle" } );
            await scene2.addElement( { id: "subcontent", parent: "middle", ignore: "clear" } );
            await scene2.addElement( { id: "margin", parent: "wrapper" } );
            await scene2.addElement( { id: "submargin", parent: "margin", ignore: "clear" } );
            
            // footer links
            let nav = await scene2.addComponent( { id: "movies", component: "menu", parent: "footer", array: scenes, horizontal: true } );
                nav.addListener( { type: "click", handler: () => console.log( nav ) } );
            
            // menu links
            let module = await scene2.addModule( { default: "default", invoke: "init", path: "../projects/trades/trades", namespace: "trades" } );
            let symbols = Array.from( module.symbols.keys() );
            let menu = await scene2.addComponent( { id: "symbols", component: "menu", parent: "menu", array: symbols, horizontal: false } );
                menu.addListener( { type: "click", handler: function() { module.handlers.clicked( ...arguments, scene2 ) } } );  
                
        };
        scene2.start( movie );
        

    /*let scene3 = movie.addScene(
        {
            duration: 3000, 
            movie: this,
            name: "scene 3",
            next: "end"
        } );*/;
};

window.onload = () => init( "t2" );
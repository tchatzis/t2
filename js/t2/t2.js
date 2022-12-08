import Common from "./t2.common.js";
import Controls from "../modules/controls.js";
import formats from "./t2.formats.js";
import Icons from "./t2.icons.js";
import IndexedDB from "../modules/indexeddb.js";
import Layout from "./t2.ui.layout.js";
import Navigation from "./t2.ui.navigation.js";
import Movie from "../modules/movie.js";
//import Schema from "./t2.ui.schema.js";
//import UI from "./t2.ui.js";

const T2 = function()
{
    let self = this;
    
    this.init = async ( namespace ) => 
    {
        window[ namespace ] = this;
        
        this.common = new Common();
        this.controls = new Controls();
        this.db = new IndexedDB();  
        this.formats = formats;
        await this.db.init( { name: "T2", version: 1 } );
        this.icons = new Icons();
        this.movie = new Movie();
        this.navigation = new Navigation();
        
        this.ui = {};  
        this.ui.children = new Map();
        this.ui.layout = new Layout(); 
        
        await navigation();
    };

    async function navigation()
    {
        await t2.navigation.setLayout( { name: "navigation", ignore: [ "menu" ] } );

        let menu = await self.navigation.addComponent( { id: "menu", type: "menu", format: "flex", parent: "header" } );
            menu.addListener( { type: "click", handler: async function()
            {
                let active = arguments[ 2 ];

                menu.activated = active.curr.getAttribute( "data-link" );

                self.movie.changeScene( menu.activated );

                breadcrumbs.reset();
                breadcrumbs.set( 0, menu.activated ); 
            } } );

        let view = await self.navigation.addComponent( { id: "view", type: "menu", format: "flex", output: null, parent: "footer" } );
            view.addListener( { type: "click", handler: async function()
            {
                let active = arguments[ 2 ];

                view.activated = active.curr.getAttribute( "data-link" );

                let script = await t2.navigation.import( view.module, view.activated );
                await script.run();

                breadcrumbs.reset();
                breadcrumbs.set( 0, menu.activated ); 
                breadcrumbs.set( 1, view.activated );
            } } );

        let breadcrumbs = await self.navigation.addComponent( { id: "breadcrumbs", type: "path", format: "block", output: "path", parent: "footer" } );
            breadcrumbs.reset();   
            breadcrumbs.set( 0, menu.activated );
            breadcrumbs.set( 1, view.activated );
    }
};

export default T2;
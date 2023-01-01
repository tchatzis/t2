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
        await self.ui.layout.init( { name: "navigation" } );

        let breadcrumbs = await self.navigation.addComponent( { id: "breadcrumbs", type: "path", format: "block", output: "path", parent: "footer" } );
            breadcrumbs.reset(); 

        let menu = await self.navigation.addComponent( { id: "main", type: "menu", format: "flex", parent: "header" } );
            menu.addBreadcrumbs( 0, breadcrumbs );
            menu.addListener( { type: "click", handler: async function()
            {
                self.movie.changeScene( menu.activated );
            } } );

        let view = await self.navigation.addComponent( { id: "view", type: "menu", format: "flex", output: null, parent: "footer" } );
            view.addBreadcrumbs( 1, breadcrumbs );
            view.addListener( { type: "click", handler: async function()
            {
                let script = await t2.navigation.import( view.module, view.activated );
                await script.init();
            } } );
    }
};

export default T2;
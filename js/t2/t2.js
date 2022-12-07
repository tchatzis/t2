import Common from "./t2.common.js";
import Controls from "../modules/controls.js";
import formats from "./t2.formats.js";
import Icons from "./t2.icons.js";
import IndexedDB from "../modules/indexeddb.js";
import Layout from "./t2.ui.layout.js";
import Navigation from "./t2.ui.navigation.js";
import Movie from "../modules/movie.js";
import Schema from "./t2.ui.schema.js";
import UI from "./t2.ui.js";

const T2 = function()
{
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
        this.ui = new UI();  
        this.ui.layout = new Layout(); 
        this.Schema = Schema;
        this.schemas = {};
    };
};

export default T2;
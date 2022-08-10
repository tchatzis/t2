import Common from "./t2.common.js";
import Controls from "../modules/controls.js";
import formats from "./t2.formats.js";
import Icons from "./t2.icons.js";
import IndexedDB from "../modules/indexeddb.js";
import List from "./t2.ui.list.js";
import Movie from "../modules/movie.js";
import Popup from "./t2.ui.popup.js";
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
        this.ui = new UI();
        
        this.List = List;
        this.Popup = Popup; 
        this.Schema = Schema;
        this.schemas = {};
    };
};

export default T2;
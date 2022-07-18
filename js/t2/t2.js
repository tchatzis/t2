import Common from "./t2.common.js";
import Controls from "../modules/controls.js";
import Icons from "./t2.icons.js";
import IndexedDB from "../modules/indexeddb.js";
import List from "./t2.ui.list.js";
import Movie from "../modules/movie.js";
import Popup from "./t2.ui.popup.js";
import UI from "./t2.ui.js";

const T2 = function()
{
    this.init = async ( namespace ) => 
    {
        window[ namespace ] = this;
        
        this.common = new Common();
        this.controls = new Controls();
        this.db = new IndexedDB();  
        this.icons = new Icons();
        this.movie = new Movie();
        this.ui = new UI();
        
        this.List = List;
        this.Popup = Popup;
    };
};

export default T2;
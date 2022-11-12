import navigation from "../../t2/t2.ui.navigation.js";

const Index = function()
{
    const self = this;

    this.init = function()
    {
        navigation.call( this, 
        { 
            init: { layout: "minimal", ignore: [ "header" ] }, 
            menu: { activate: self.info.namespace, array: Array.from( t2.movie.scenes.keys() ), ignore: [ "header", "footer" ] }, 
            view: { activate: "IndexedDB", array: [ "IndexedDB", "Firebase" ], ignore: [ "header", "footer" ] } 
        } );
    };
};

export default Index;
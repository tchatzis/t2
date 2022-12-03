import navigation from "../../t2/t2.ui.navigation.js";

const Index = function()
{
    const self = this;
    let breadcrumbs;

    this.init = async function()
    {
        await navigation.call( this, 
        { 
            init: { layout: "minimal", ignore: [ "header" ] }, 
            menu: { activate: self.info.namespace, array: Array.from( t2.movie.scenes.keys() ), ignore: [ "header", "footer" ] }, 
            view: { activate: null, array: [ "list", "table" ], ignore: [ "header", "footer" ] } 
        } );

        breadcrumbs = t2.ui.children.get( "footer.breadcrumbs" );
    };
};

export default Index;
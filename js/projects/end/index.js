import navigation from "../../t2/t2.ui.navigation.js";

const End = function()
{
    const self = this;

    this.init = async function()
    {
        await this.refresh();

        await navigation();
    };

    this.refresh = async function()
    {

    };

    async function navigation()
    { 
        let menu = t2.navigation.components.main;
            menu.update( Array.from( t2.movie.scenes.keys() ) );
            menu.highlight( self.info.namespace );

        let view = t2.navigation.components.view;
            view.setModule( self );
            view.update( [] );

        await t2.ui.layout.init( { name: "minimal", preserve: [ "header", "footer" ] } );
    }
};

export default End;
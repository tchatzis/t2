import Common from "../../modules/navigation.js";

const Databases = function()
{
    const self = this;

    this.init = async function()
    {
        navigation.call( this );

        layout();
    };

    function navigation()
    {
        Common.call( this );

        this.navigation.scenes.clear = [ "menu", "submenu", "content", "subcontent", "margin", "submargin" ];
        this.navigation.scenes.component.addListener( { type: "click", handler: function()
        {
            self.navigation.set.call( self.navigation.scenes, ...arguments );
        } } );
        this.navigation.scenes.component.update( this.navigation.scenes.component.array );
        this.navigation.activate.call( this.navigation.scenes, this.info.namespace );

        this.navigation.view.array = [ "IndexedDB", "Firebase" ];
        this.navigation.view.default = this.navigation.view.array[ 0 ].toLowerCase();
        this.navigation.view.clear = [ "content" ];
        this.navigation.view.component.addListener( { type: "click", handler: function()
        {
            self.navigation.set.call( self.navigation.view, ...arguments );
        } } );
        this.navigation.view.component.update( this.navigation.view.array );
        this.navigation.click.call( this.navigation.view, this.navigation.view.default );
    }   

    function layout()
    {

    }

};

export default Databases;
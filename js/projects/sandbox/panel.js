import Common from "../../t2/t2.container.handlers.js";

const Panel = function( module )
{
    let self = this;
    let panel;
    
    this.init = async function( parent, params )
    {
        panel = await parent.addContainer( { id: "panel", type: "box", format: "block", css: [ "container" ] } );
 
        this.element = panel.element;
        this.type = panel.type;

        Object.assign( this, params );
        Common.call( this );
    };

    this.refresh = async function()
    {
        //await navigation();
    }; 

    async function navigation()
    {
        await t2.navigation.update( 
        [ 
            //{ id: "submenu", functions: [ { ignore: "clear" }, { clear: null } ] }, 
            //{ id: "subcontent", functions: [ { ignore: "clear" } ] },
            //{ id: "submargin", functions: [ { ignore: "clear" }, { clear: null } ] },
            //{ id: "menu", functions: [ { ignore: "clear" } ] },
            //{ id: "content", functions: [ { ignore: "clear" } ] },
            { id: `content.panels.${ self.id }`, functions: [ { clear: null }, { invoke: [ { f: output, args: null } ] } ] },
            //{ id: "margin", functions: [ { ignore: "clear" } ] }
        ] );
    } 

    async function output()     
    {

    };
};

export default Panel;
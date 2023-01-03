const Template = function( module )
{
    let self = this;

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
        await t2.navigation.update( 
        [ 
            { id: "content", functions: [ { clear: null }, { invoke: [ { f: output, args: null } ] } ] },
        ] );
    } 

    async function output()
    {
        let panels = await this.addComponent( { id: "panels", type: "panels", format: "block", output: "vertical" } );
            await panels.add( "Module", { id: "normalize", label: "normalize", format: "block", config: { arguments: [ module ], src: "../projects/trades/trades.fix.normalize.js" } } );
            await panels.add( "Module", { id: "rename", label: "rename", format: "block", config: { arguments: [ module ], src: "../projects/trades/trades.fix.rename.js" } } );
            await panels.add( "Module", { id: "repair", label: "repair", format: "block", config: { arguments: [ module ], src: "../projects/trades/trades.fix.repair.js" } } );
            panels.setTitle( module.info.namespace );
            panels.setControls( 
            { 
                breadcrumbs: { index: 2, component: t2.navigation.components.breadcrumbs },
                controller: { id: "tabs", type: "tabs", format: "flex-left", output: "horizontal" }
            } );
    }
};

export default Template;
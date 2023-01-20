const Template = function( module )
{
    let self = this;
    let tab = 0;
    
    this.init = async function()
    {
        await this.refresh(); 

        await navigation();  
    };

    this.refresh = async function()
    {
        await module.queries();
    };

    async function navigation()
    {
        await t2.navigation.update( 
        [ 
            { id: "submenu",    functions: [ { ignore: "clear" }, { clear: null } ] },
            { id: "subcontent", functions: [ { ignore: "clear" }, { clear: null }, { show: null } ] },
            { id: "submargin",  functions: [ { ignore: "clear" }, { clear: null }, { show: null } ] },
            { id: "menu",       functions: [ { ignore: "clear" }, { show: null } ] },
            { id: "content",    functions: [ { clear: null }, { invoke: [ { f: output, args: null } ] } ] },
            { id: "margin",     functions: [ { clear: null }, { show: null } ] }
        ] );
    }

    async function output()
    {
        let panels = await this.addComponent( { id: "panels", type: "panels", format: "block", output: "vertical" } );
            await panels.add( "Module", { id: "settings", label: "settings", format: "block", config: { arguments: [ module ], src: "../projects/design/design.edit.settings.js" } } );
            await panels.add( "Module", { id: "draw", label: "draw", format: "block", config: { arguments: [ module ], src: "../projects/design/design.edit.draw.js" } } );
            //await panels.add( "Module", { id: "repair", label: "repair", format: "block", config: { arguments: [ module ], src: "../projects/trades/trades.fix.repair.js" } } );
            panels.setControls( 
            { 
                breadcrumbs: { index: 2, component: t2.navigation.components.breadcrumbs },
                controller: { id: "tabs", type: "tabs", format: "flex-left", output: "horizontal" }
            } );
    }
};

export default Template;
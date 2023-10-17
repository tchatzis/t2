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
        let panels = await this.addComponent( { id: "carousel", type: "carousel", format: "block", output: "vertical" } );
            await panels.add( "Module", { id: "one", label: "one", format: "block", config: { arguments: [ module ], src: "../projects/sandbox/panel.js" } } );
            await panels.add( "Module", { id: "two", label: "two", format: "block", config: { arguments: [ module ], src: "../projects/sandbox/panel.js" } } );
            await panels.add( "Module", { id: "three", label: "three", format: "block", config: { arguments: [ module ], src: "../projects/sandbox/panel.js" } } );
            panels.setTitle( module.info.namespace );
            panels.setControls( 
            { 
                breadcrumbs: { index: 2, component: t2.navigation.components.breadcrumbs },
                controller: { id: "tabs", type: "tabs", format: "flex-left", output: "horizontal" }
            } );
    }
};

export default Template;
const Tabs = function( module )
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
            await panels.add( "Module", { id: "export", label: "export", format: "block", config: { arguments: [ module ], src: "../projects/databases/databases.indexeddb.export.js" } } );
            await panels.add( "Module", { id: "import", label: "import", format: "block", config: { arguments: [ module ], src: "../projects/databases/databases.indexeddb.import.js" } } );
            await panels.add( "Module", { id: "open", label: "open", format: "block", config: { arguments: [ module ], src: "../projects/databases/databases.indexeddb.open.js" } } );
            await panels.add( "Module", { id: "schema", label: "schema", format: "block", config: { arguments: [ module ], src: "../projects/databases/databases.indexeddb.schema.js" } } );
            await panels.add( "Module", { id: "table", label: "add table", format: "block", config: { arguments: [ module ], src: "../projects/databases/databases.indexeddb.table.js" } } );
            panels.setControls( 
            { 
                breadcrumbs: { index: 2, component: t2.navigation.components.breadcrumbs },
                controller: { id: "tabs", type: "tabs", format: "flex-left", output: "horizontal" }
            } );
    }
};

export default Tabs;
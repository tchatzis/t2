const Tabs = function( module )
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

    };

    async function navigation()
    {
        await t2.navigation.update( 
        [ 
            { id: "content",    functions: [ { clear: null }, { invoke: [ { f: container, args: null } ] } ] },
        ] );
    }

    async function container()
    {
        let details = await this.addContainer( { id: "panels", type: "panels", format: "block", output: "vertical" } );

        let title = await details.addComponent( { id: "title", type: "title", format: "block", output: "text" } );
            title.set( `${ t2.db.name } v${ t2.db.version }` );

        await details.setModule( { id: "export", label: "export", format: "block", config: { arguments: [ module ], src: "../projects/databases/databases.indexeddb.export.js" } } );
        await details.setModule( { id: "import", label: "import", format: "block", config: { arguments: [ module ], src: "../projects/databases/databases.indexeddb.import.js" } } );
        await details.setModule( { id: "open", label: "open", format: "block", config: { arguments: [ module ], src: "../projects/databases/databases.indexeddb.open.js" } } );
        await details.setModule( { id: "schema", label: "schema", format: "block", config: { arguments: [ module ], src: "../projects/databases/databases.indexeddb.schema.js" } } );
        await details.setModule( { id: "table", label: "add table", format: "block", config: { arguments: [ module ], src: "../projects/databases/databases.indexeddb.table.js" } } );

        let array = Array.from( details.panels.keys() );  
        
        let tabs = await details.setComponent( { id: "tabs", type: "tabs", format: "flex-left", output: "horizontal" } );
            tabs.addBreadcrumbs( 2, t2.navigation.components.breadcrumbs );
            tabs.addListener( { type: "click", handler: ( active ) => 
            {
                tab = array.findIndex( id => id == active.id );

                title.set( `${ active.id }` );
            } } );  
            tabs.update( details.panels );
            tabs.activate( array[ tab || 0 ] );
    }
};

export default Tabs;
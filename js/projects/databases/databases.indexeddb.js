const IndexedDB = function( module )
{
    this.run = async function()
    {
        Object.assign( module, this );
        
        await this.refresh();
    };

    this.refresh = async function()
    {
        await layout();
    };

    async function layout()
    {
        await container();

        let submenu = t2.ui.children.get( "submenu" );

        submenu.element.textContent = `${ t2.db.name } v${ t2.db.version }`;
    }

    async function container()
    {
        let breadcrumbs = t2.ui.children.get( "footer.breadcrumbs" );
        
        let content = t2.ui.children.get( "content" );
            content.clear();

        let details = await content.addContainer( { id: "details", type: "panels", format: "block", output: "vertical" } );
            // set breadcrumbs
            details.addListener( { type: "click", handler: ( active ) => 
            {
                breadcrumbs.set.path( 2, active.panel?.label || "" );
            } } );
        let title = await details.addComponent( { id: "title", type: "title", format: "block", output: "text" } );
            title.set( "IndexedDB Tools" );
            await details.setModule( { id: "export", label: "export", format: "block", config: { arguments: [ module ], src: "../projects/databases/databases.indexeddb.export.js" } } );
            await details.setModule( { id: "import", label: "import", format: "block", config: { arguments: [ module ], src: "../projects/databases/databases.indexeddb.import.js" } } );
            await details.setModule( { id: "open", label: "open", format: "block", config: { arguments: [ module ], src: "../projects/databases/databases.indexeddb.open.js" } } );
            await details.setModule( { id: "schema", label: "schema", format: "block", config: { arguments: [ module ], src: "../projects/databases/databases.indexeddb.schema.js" } } );
            await details.setModule( { id: "table", label: "add table", format: "block", config: { arguments: [ module ], src: "../projects/databases/databases.indexeddb.table.js" } } );

        let tabs = await details.setComponent( { id: "tabs", type: "tabs", format: "flex-left", output: "horizontal" } );
            tabs.addListener( { type: "click", handler: ( active ) => title.set( active.panel.label ) } );
            tabs.update( details.panels );

        let array = Array.from( details.panels.keys() );

        tabs.activate( array[ 0 ] );
    }
};

export default IndexedDB;
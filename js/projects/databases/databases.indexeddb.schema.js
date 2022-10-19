import Common from "../../t2/t2.common.handlers.js";

const Export = function()
{
    let panel;
    
    this.init = async function( parent, params )
    {
        panel = await parent.addContainer( { id: "panel", type: "panel", format: "flex" } );

        this.element = panel.element;
        this.type = panel.type;

        Object.assign( this, params );
        Common.call( this ); 
    };
    
    this.run = async function()
    {
        panel.clear();

        let array = Array.from( t2.db.db.objectStoreNames ).map( name => { return { name: name } } );

        let table = await panel.addComponent( { id: "tables", type: "table" } );
            table.addColumn( { 
                input: { name: "name", type: "text" }, 
                cell: { css: { class: "value" }, display: 12, modes: [ "read" ] },
                format: [] } );
            table.setColumns();
            table.populate( { array: array, orderBy: "name" } );
    };
};

export default Export;
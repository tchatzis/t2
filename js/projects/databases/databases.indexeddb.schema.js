import Common from "../../t2/t2.container.handlers.js";

const Panel = function()
{
    let self = this;
    let panel;
    
    this.init = async function( parent, params )
    {
        panel = await parent.addContainer( { id: "panel", type: "box", format: "flex-left", css: [ "panel" ] } );

        this.element = panel.element;
        this.type = panel.type;

        Object.assign( this, params );
        Common.call( this ); 
    };

    this.refresh = async function()
    {
        await navigation();
    };

    async function navigation()
    {
        await t2.navigation.update( 
        [ 
            { id: "content", functions: [ { ignore: "clear" } ] },
            { id: `content.panels.${ self.id }`, functions: [ { clear: null }, { invoke: [ { f: output, args: null } ] } ] }
        ] );
    } 
    
    async function output()
    {
        let array = Array.from( t2.db.db.objectStoreNames ).map( name => { return { name: name } } );

        let table = await this.addComponent( { id: "tables", type: "table" } );
            table.addColumn( { 
                input: { name: "name", type: "text" }, 
                cell: { css: { class: "value" }, display: 12, modes: [ "read" ] },
                format: [] } );
            table.populate( { array: array, orderBy: "name" } );
    };
};

export default Panel;
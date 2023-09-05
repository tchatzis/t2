import Common from "../../t2/t2.container.handlers.js";

const Panel = function( module )
{
    let self = this;
    let panel;
    const day = 1000 * 60 * 60 * 24;

    const Data = function( data )
    {
        Object.assign( this, data );

        this.id = Number( this.id );
    };

    this.init = async function( parent, params )
    {
        this.table = "deposits";

        panel = await parent.addContainer( { id: "panel", type: "panel", format: "flex" } );
 
        this.element = panel.element;
        this.type = panel.type;

        Object.assign( this, params );
        Common.call( this );
    };

    this.refresh = async function()
    {
        module.unsetSymbol();
        module.unsetDate();
        
        let records = await t2.db.tx.retrieve( self.table );

        this.data = records.data.filter( record => record.action == "INT" );
        this.data.forEach( record => record.date = Math.round( new Date( record.datetime ).getTime() * day ) / day );

        await navigation();
    };
    
    async function navigation()
    {
        await t2.navigation.update( 
        [ 
            { id: "submenu", functions: [ { ignore: "clear" }, { clear: null } ] }, 
            { id: "subcontent", functions: [ { ignore: "clear" } ] },
            { id: "submargin", functions: [ { ignore: "clear" }, { clear: null } ] },
            { id: "menu", functions: [ { ignore: "clear" } ] },
            { id: "content", functions: [ { ignore: "clear" } ] },
            { id: `content.panels.${ self.id }`, functions: [ { clear: null }, { invoke: [ { f: output, args: null } ] } ] },
            { id: "margin", functions: [ { ignore: "clear" } ] }
        ] );
    }  

    async function output()
    {
        let table = await this.addComponent( { id: "interest", type: "table" } );
            table.addRowListener( { type: "contextmenu", handler: table.edit } );
            table.addSubmitListener( { type: "submit", handler: async function ( data )
            { 
                let form = this;
    
                let d = new Data( data );
    
                let record = await t2.db.tx.update( self.table, d.id, d );
    
                let message = await panel.addComponent( { id: "message", type: "message", format: "block", output: "text" } );
                    message.set( `Updated ${ data.action }` );   
    
                self.refresh();
            } } ); 
            table.addColumn( { 
                input: { name: "id", type: "hidden" }, 
                cell: { css: {}, display: 0, modes: [ "edit" ] },
                format: [] } );
            table.addColumn( { 
                input: { name: "datetime", type: "text" }, 
                cell: { css: { class: "date" }, display: 12, modes: [ "read", "edit" ] },
                format: [ "date&time" ] } );
            table.addColumn( { 
                input: { name: "action", type: "text", readonly: true }, 
                cell: { css: { value: "action" }, display: 4, modes: [ "read", "edit" ] } } );
            table.addColumn( { 
                input: { name: "amount", type: "number", step: 0.01 }, 
                cell: { css: { class: "buy" }, display: 4, modes: [ "read", "edit" ] },
                format: [ "negate", "precision" ] } );
            table.addColumn( { 
                input: { name: "brokerage", type: "select" }, 
                cell: { css: {}, display: 8, modes: [ "read", "edit" ] },
                format: [],
                options: module.data.brokerage } );
            table.addColumn( { 
                input: { type: "submit", value: "UPDATE" }, 
                cell: { css: {}, display: 4, modes: [ "edit" ] },
                format: [] } );
            table.populate( { array: self.data, orderBy: "symbol" } );
            table.setTotals();
    };
};

export default Panel;
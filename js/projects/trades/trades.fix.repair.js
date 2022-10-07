import Common from "../../t2/t2.common.handlers.js";
import Data from "./trades.data.js";
import details from "./trades.fix.details.js";
import handlers from "./trades.fix.handlers.js";

const Panel = function( module )
{
    this.init = async function( parent, params )
    {
        let panel = await parent.addContainer( { id: "panel", type: "panel", format: "flex" } );

        this.element = panel.element;
        this.type = panel.type;

        Object.assign( this, params );
        Common.call( this );

        let outline = await panel.addContainer( { id: "outline", type: "box", format: "block" } );

        let form = await outline.addComponent( { id: "select", type: "form", format: "block" } );
            form.addListener( { type: "submit", handler: repair } );
            form.addField( { 
                input: { name: "id", label: "id", type: "number", min: 0, step: 1, required: "" }, 
                cell: { css: {}, display: 4 },
                format: [] } );
            form.addField( { 
                input: { type: "submit", value: "SELECT" }, 
                cell: { css: {}, display: 4 },
                format: [] } ); 

        async function repair( data )
        {
            let records = await t2.db.tx.filter( module.table, [ { key: "id", operator: "==", value: data.id } ] );
            let record = records.data[ 0 ];

            outline.hide();

            await details( panel, record, "Existing" );

            let inline = await panel.addContainer( { id: "outline", type: "box", format: "block" } );

            let form = await inline.addComponent( { id: "transaction", type: "form", format: "block" } );
                form.addListener( { type: "submit", handler: execute } );
                form.addField( { 
                    input: { name: "id", type: "hidden", value: record.id || data.id },
                    cell: { css: {}, display: 0 },
                    format: [] } );
                form.addField( { 
                    input: { name: "datetime", label: "datetime", type: "datetime", value: record.datetime || t2.formats.datetime( new Date() ) },
                    cell: { css: {}, display: 10 },
                    format: [] } );
                form.addField( { 
                    input: { name: "symbol", label: "symbol", type: "datalist", value: record.symbol || "" }, 
                    cell: { css: {}, display: 4 },
                    format: [ "uppercase" ],
                    options: module.data.symbol } );
                form.addField( { 
                    input: { name: "qty", label: "quantity", type: "number", value: record.qty || 0, min: 0, step: 0.0001, required: "" }, 
                    cell: { css: {}, display: 4 },
                    format: [] } );
                form.addField( { 
                    input: { name: "price", label: "price", type: "number", value: record.price || 0, min: 0, step: 0.0001, required: "" }, 
                    cell: { css: {}, display: 5 },
                    format: [] } );
                form.addField( { 
                    input: { name: "notes", label: "notes", value: record.notes || "", type: "text" }, 
                    cell: { css: {}, display: 4 },
                    format: [ "uppercase" ] } );
                form.addField( { 
                    input: { name: "brokerage", label: "brokerage", type: "select", value: record.brokerage || "", }, 
                    cell: { css: {}, display: 9 },
                    format: [],
                    options: module.data.brokerage } );  
                form.addField( { 
                    input: { type: "submit", value: "REPAIR" }, 
                    cell: { css: {}, display: 4 },
                    format: [] } );            
        }

        async function execute( data )
        {
            let record = new Data( data );
                record.id = Number( data.id );

                console.log( data, record );
            
            await details( panel, record, "Updated" );

            await handlers.repair( module.table, new Data( data ), data );

            let message = await parent.addComponent( { id: "message", type: "message", format: "block", output: "text" } );
                message.set( `Repaired ID: ${ record.id }` );         
        }
    };
};

export default Panel;
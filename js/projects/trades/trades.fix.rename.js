import Common from "../../t2/t2.common.handlers.js";
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

        let form = await outline.addComponent( { id: "test", type: "form", format: "block" } );
            form.addListener( { type: "submit", handler: test } );
        form.addField( { 
            input: { name: "symbol", label: "from", type: "select", required: "" }, 
            cell: { css: {}, display: 4 },
            format: [],
            options: module.data.symbol } );   
        form.addField( { 
            input: { name: "to", label: "to", type: "text", required: "" }, 
            cell: { css: {}, display: 4 },
            format: [ "uppercase" ] } );
        form.addField( { 
            input: { type: "submit", value: "TEST" }, 
            cell: { css: {}, display: 4 },
            format: [] } );

        async function test( data )
        {
            let records = await t2.db.tx.filter( module.table, [ { key: "symbol", operator: "==", value: data.symbol } ] );
                records.fields = data;

            await details( panel, records );

            let confirmed = await t2.common.delay( () => confirm( "OK to rename?" ), 1000 );

            if ( !confirmed )
                return;

            await handlers.rename( module.table, records.data, data );

            let message = await parent.addComponent( { id: "message", type: "message", format: "block", output: "text" } );
                message.set( `Renamed ${ data.symbol } to ${ data.to.toUpperCase() }` );         
        };
    };
};

export default Panel;
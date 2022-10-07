
import Common from "../../t2/t2.common.handlers.js";
import Data from "./trades.data.js";
import details from "./trades.fix.details.js";
import handlers from "./trades.fix.handlers.js";

const Panel = function( module )
{
    this.init = async function( parent, params )
    {
        let records = await t2.db.tx.retrieve( module.table );
        let sample = records.data[ 0 ];

        let panel = await parent.addContainer( { id: "panel", type: "panel", format: "flex" } );

        this.element = panel.element;
        this.type = panel.type;

        Object.assign( this, params );
        Common.call( this );

        await details( panel, records );

        // before
        {
            let before = await panel.addContainer( { id: "before", type: "box", format: "block" } );
            let title = await before.addComponent( { id: "data", type: "title", format: "block", output: "text" } );
                title.set( "Before" );

            let tuple = await before.addComponent( { id: "before", type: "tuple", format: "block", output: "object" } );
                tuple.set( sample );
        }

        // after
        {
            let after = await panel.addContainer( { id: "after", type: "box", format: "block" } );
            let title = await after.addComponent( { id: "data", type: "title", format: "block", output: "text" } );
                title.set( "After" );

            let tuple = await after.addComponent( { id: "after", type: "tuple", format: "block", output: "object" } );
                tuple.set( new Data( sample ) );
        }

        let form = await panel.addComponent( { id: "form", type: "form", format: "flex" } );
            form.addListener( { type: "submit", handler: async function ()
            {
                await handlers.normalize( module.table, records.data );

                let message = await parent.addComponent( { id: "message", type: "message", format: "block", output: "text" } );
                    message.set( "Success" );
            } } );
        form.addField( { 
            input: { type: "submit", value: "EXECUTE" }, 
            cell: { css: {}, display: 4 },
            format: [] } );
    };
};

export default Panel;
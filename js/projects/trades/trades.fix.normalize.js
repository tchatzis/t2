
import Common from "../../t2/t2.container.handlers.js";
import Data from "./trades.data.js";
import details from "./trades.fix.details.js";
import handlers from "./trades.fix.handlers.js";
import Message from "../../t2/t2.ui.message.js";

const Panel = function( module )
{
    let self = this;
    let panel;
    
    this.init = async function( parent, params )
    {
        panel = await parent.addContainer( { id: "panel", type: "box", format: "flex", css: [ "panel" ] } );
 
        this.element = panel.element;
        this.type = panel.type;

        Object.assign( this, params );
        Common.call( this );
    };

    this.refresh = async function()
    {
        await module.queries(); 

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
        let records = module.data.filtered;
        let sample = records[ 0 ];

        await details( panel, records );

        // before
        {
            let before = await this.addContainer( { id: "before", type: "box", format: "block" } );
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
                let message = new Message();
                    message.init();                
                
                await handlers.normalize( module.table, records );

                message.set( "Success" );
            } } );
        form.addField( { 
            input: { type: "submit", value: "EXECUTE" }, 
            cell: { css: {}, display: 4 },
            format: [] } );
    };
};

export default Panel;
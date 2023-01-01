import Common from "../../t2/t2.container.handlers.js";
import details from "./trades.fix.details.js";
import handlers from "./trades.fix.handlers.js";
import Message from "./trades.message.js";

const Panel = function( module )
{
    let self = this;
    let panel;
    
    this.init = async function( parent, params )
    {
        panel = await parent.addContainer( { id: "panel", type: "panel", format: "flex" } );
 
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
        let outline = await this.addContainer( { id: "outline", type: "box", format: "block" } );

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

            let message = new Message();
                message.init();    

            await handlers.rename( module.table, records.data, data );

            message.set( "Success" );        
        };
    };
};

export default Panel;
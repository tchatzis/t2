import Common from "../../t2/t2.container.handlers.js";
import tooltip from "./trades.tooltip.js";

const Panel = function( module )
{
    let self = this;
    let panel;
    let table;
    
    this.init = async function( parent, params )
    {
        panel = await parent.addContainer( { id: params.id, type: "box", format: "flex", css: [ "panel" ] } );
 
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
            { id: `content.panels.${ self.id }`, functions: [ { clear: null }, { invoke: [ { f: history, args: null }, { f: week, args: null } ] } ] },
            { id: "margin", functions: [ { ignore: "clear" } ] }
        ] );
    }

    async function history()
    {  
        let records = module.data.filtered.sort( ( a, b ) => new Date( a.datetime ) - new Date( b.datetime ) );
        let links = records.slice( -6 ).map( record => record.datetime ).reverse();

        let tiles = await this.addComponent( { id: "tiles", type: "tiles", format: "flex", output: template } );  
            tiles.update( links );
    }

    function template( link )
    {
        let record = module.data.filtered.find( record => record.datetime == link );
        let status = record.action == "BUY" ? "open" : "closed";

        let output = 
        [
            { label: "symbol", text: record.symbol, css: "string" },
            { label: "brokerage", text: record.brokerage, css: record.brokerage.toLowerCase() },
            { label: "datetime", text: t2.formats[ "date&time" ]( record.datetime ), css: "date" },
            { label: "quantity", text: t2.formats.auto( record.qty ), css: "number" },
            { label: "action", text: record.action, css: record.action.toLowerCase() },
            { label: "price", text: t2.formats.auto( record.price ), css: "number" },
            { label: "value", text: t2.formats.dollar( record.value ), css: "number" },
        ];

        this.classList.add( status );

        for ( let obj of output )
        {        
            if ( obj )
            {
                let row = t2.common.el( "div", this );
                    row.classList.add( "flex-left" );
                    row.classList.add( "underline" );

                let label = t2.common.el( "label", row );
                    label.textContent = obj.label;

                let text = t2.common.el( "div", row );
                    text.classList.add( "field" ); 
                    text.classList.add( obj.css );
                    text.textContent = obj.text;
            }
        }
    }


    async function week()
    {
        let qty = { predicate: { conditions: [ { name: "qty", operator: ">=", value: 0 } ], options: [ "buy", "sell" ] } };
        let week = await this.addComponent( { id: "week", type: "weekdays", format: "table-body" } );
            week.populate(
            { 
                data: module.data.filtered, 
                date: module.date ? new Date( module.date) : new Date(),
                primaryKey: "id",
                column: { name: "datetime" },
                row: { name: "symbol", array: module.data.symbol },
                cell: { 
                    input: { name: "qty", type: "number" }, 
                    cell: { css: qty, display: 4, modes: [ "read" ], value: tooltip },
                    format: [ "negate", "number" ] 
                }
            } );
    }
};

export default Panel;
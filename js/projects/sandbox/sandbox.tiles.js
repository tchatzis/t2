import Queries from "../../t2/t2.queries.js";

const Template = function( module )
{
    let self = this;
    
    this.init = async function()
    {
        this.symbol = null;
        
        this.q = new Queries();
        await this.q.init( { table: "trades" } );
        
        await this.refresh();

        await navigation();
    };

    this.refresh = async function()
    {
        await this.q.refresh();

        this.q.define( 
        [ 
            { key: "symbol", format: "uppercase", sort: "asc", use: "all" } 
        ] );
    };

    this.setActive = function( name )
    {
        self.symbol = tiles.activated.toUpperCase();
    };

    async function navigation()
    {
        await t2.navigation.update( 
        [ 
            { id: "content", functions: [ { clear: null }, { invoke: [ { f: output, args: null } ] } ] }
        ] );  
    }

    async function output()
    {
        let tiles = await this.addComponent( { id: "tiles", type: "tiles", format: "flex", output: template } );
            tiles.addBreadcrumbs( 2, t2.navigation.components.breadcrumbs );   
            tiles.update( self.q.data.symbol );
            tiles.highlight( self.symbol );
    }

    const template = function( link )
    {
        let records = self.q.data.all.filter( data => ( data[ "symbol" ] == link ) );
        let data = records.filter( data => data[ "action" ] !== "DIV" );
        let [ last ] = data.slice( -1 );
        let divs = records.filter( data => data[ "action" ] == "DIV" );
        let dividends = divs.reduce( ( acc, record ) => acc + ( record.qty * record.price * record.sign ), 0 );
        let div = divs.reduce( ( acc, record ) => acc + ( record.qty * record.sign ), 0 );
        let qty = data.reduce( ( acc, record ) => acc - ( record.qty * record.sign ), 0 ) + div;
        let status = !!t2.common.round( qty, 4 ) ? "open" : "closed";
        let value = data.reduce( ( acc, record ) => acc + ( record.qty * record.price * record.sign ), 0 );
        let gain = last.price * qty + value;
        let gainCSS = gain > 0 ? "buy" : "sell";
        let output = 
        [
            { label: "symbol", text: link, css: "string" },
            { label: "quantity", text: t2.formats.auto( qty ), css: "number" },
            { label: "last action", text: last.action, css: last.action.toLowerCase() },
            { label: "last quantity", text: t2.formats.auto( last.qty ), css: "number" },
            { label: "last price", text: t2.formats.auto( last.price ), css: "number" },
            { label: "last value", text: t2.formats.dollar( last.price * last.qty ), css: "number" },
            { label: "net", text: t2.formats.dollar( value ), css: "number" },
            { label: "gain", text: t2.formats.dollar( gain ), css: gainCSS },
            { label: "dividend shares", text: t2.formats.auto( div ), css: "number" },
            { label: "dividend payout", text: t2.formats.dollar( dividends ), css: "number" },
            { label: "trades", text: data.length, css: "number" },
            { label: "status", text: t2.formats.uppercase( status ), css: status }
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
    };
};

export default Template;
import Common from "../../t2/t2.container.handlers.js";

const Panel = function( module, array, symbols )
{   
    let self = this;
        self.summary = [];
    let panel;
    //let _array = array.filter( record => record.symbol.charCodeAt( 0 ) < 256 );
    let sum = ( a, b ) => a + b;
    let previous = { cell: null, popup: null };

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
            { id: "menu", functions: [ { ignore: "clear" } ] },
            { id: "content", functions: [ { ignore: "clear" } ] },
            { id: `content.panels.${ self.id }`, functions: [ { clear: null }, { invoke: [ { f: output, args: null } ] } ] },
            { id: "margin", functions: [ { ignore: "clear" } ] }
        ] );
    } 

    // content
    async function output()
    {
        summarize();
        tiles();
    }

    function summarize()
    {
        let get = ( symbol ) => 
        {
            let records = module.data.all.filter( record => record.symbol == symbol );
            let _array = array.find( record => record.symbol == symbol );
            let data = {};
                data.transactions = _array.transactions;
                data.change = _array.qty;
                data.qty = records.map( record => record.qty * -record.sign ).reduce( sum, 0 );
                data.value = _array.value;
                data.gain = records.map( record => record.value * record.sign ).reduce( sum, 0 );

            return data;
        }
        
        symbols.forEach( symbol => self.summary.push( { symbol: symbol, data: get( symbol ) } ) );
    }

    async function tiles()
    {
        let tiles = await self.addComponent( { id: "tiles", type: "tiles", format: "flex", output: template } );  
            tiles.update( module.q.data.symbol );
            tiles.addListener( { type: "click", handler: async function() 
            { 
                let e = arguments[ 0 ];
                let event = arguments[ 1 ];
                let link = arguments[ 2 ].curr;
                let symbol = link.dataset.link.toUpperCase();
                
                module.setSymbol( symbol );

                await t2.navigation.path( `/symbol/${ symbol }` );
            } } );  
    }

    const template = function( link )
    {
        let records = module.q.data.all.filter( data => ( data[ "symbol" ] == link ) );
        let data = records.filter( data => data[ "action" ] !== "DIV" );
        let [ last ] = data.slice( -1 );
        let divs = records.filter( data => data[ "action" ] == "DIV" );
        let dividends = divs.reduce( ( acc, record ) => acc + ( record.qty * record.price * record.sign ), 0 );
        let div = divs.reduce( ( acc, record ) => acc + ( record.qty * record.sign ), 0 );
        let qty = data.reduce( ( acc, record ) => acc - ( record.qty * record.sign ), 0 ) + div;
        let status = !!t2.common.round( qty, 4 ) ? "open" : "closed";
        let display = !!t2.common.round( qty, 4 ) ? "show" : "hidden";
        let value = data.reduce( ( acc, record ) => acc + ( record.qty * record.price * record.sign ), 0 );
        let gain = last.price * qty + value;
        let gainCSS = gain > 0 ? "buy" : "sell";
        let output = 
        [
            { label: "symbol", text: link, css: "string" },
            { label: "quantity", text: t2.formats.auto( qty ), css: "number" },
            { label: "last date", text: t2.formats[ "date&time" ]( last.datetime ), css: "date" },
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
        this.classList.add( display )

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

export default Panel;
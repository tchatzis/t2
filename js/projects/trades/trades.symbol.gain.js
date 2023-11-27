import Common from "../../t2/t2.container.handlers.js";

const Panel = function( module )
{
    let self = this;
    let panel;
    let day = 1000 * 60 * 60 * 24;
 
    this.init = async function( parent, params )
    {
        panel = await parent.addContainer( { id: "panel", type: "box", format: "block", css: [ "panel" ] } );

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
            { id: "submargin", functions: [ { ignore: "clear" } ] },
            { id: "menu", functions: [ { ignore: "clear" } ] },
            { id: "content", functions: [ { ignore: "clear" } ] },
            { id: `content.panels.${ self.id }`, functions: [ { clear: null }, { invoke: [ { f: plot, args: null } ] } ] },
            { id: "margin", functions: [ { ignore: "clear" } ] }
        ] );
    } 

    async function preamble()
    {
        // filter by symbol and no dividends
        let array = module.data.all.filter( record => ( record.symbol == module.symbol ) );
        // sort by date asc
        array.sort( ( a, b ) => a.date < b.date ? 1 : -1 );

        // sort by date desc
        let total = {};
            total.DIV =  { qty: 0, value: 0, price: 0 };
            total.BUY =  { qty: 0, value: 0, price: 0 };
            total.SELL = { qty: 0, value: 0, price: 0 };
        let trade = 0;

        array.sort( ( a, b ) => a.datetime > b.datetime ? 1 : -1 );
        array.forEach( record => 
        { 
            record.date = Math.round( new Date( record.datetime ).getTime() * day ) / day;
            
            total[ record.action ].qty += record.qty;
            total[ record.action ].value += record.value;
            total[ record.action ].price = total[ record.action ].value / total[ record.action ].qty;

            let qty = total.BUY.qty - total.SELL.qty;
            let value = total.SELL.value - total.BUY.value;

            trade = qty ? -value / qty : trade;

            let spread = ( record.price - trade );

            let gain = spread * ( qty || record.qty );

            record.gain = gain;
            record.trade = trade;
            record.total = value;
            
            return;
            console.warn( record.id );
            console.log( "action", record.action, record.qty );
            console.log( "sign", record.sign );
            console.log( "value", value );
            console.log( "qty", qty );
            console.log( "trade", trade );
            console.log( "price", record.price );
            console.log( "spread", spread );
            console.log( "gain", gain );
            console.dir( record );
            console.dir( total );
        } );

        return array;
    }

    async function plot()
    {
        let array = await preamble();

        let timeline = await this.addComponent( { id: "timeline", type: "chart", format: "flex" } );
            timeline.addLayer( { color: "lime", font: "12px sans-serif", type: "step",
                data: array,
                axes:
                { 
                    "0": { axis: "date", settings: { format: "date", step: day, mod: mondays, axis: true } },
                    "1": { axis: "gain", settings: { mod: ( p ) => !( p % 10 ), axis: true } } 
                } } );

        function mondays( p, chart )
        {
            let date = new Date( chart.min );
                date.setDate( date.getDate() + p );

            return !date.getDay() || !p || p == chart.divisions; 
        }
    };
};

export default Panel; 
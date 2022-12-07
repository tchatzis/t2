import Common from "../../t2/t2.common.handlers.js";

const Panel = function( module )
{
    let self = this;
    let panel;
    let subcontent;
 
    this.init = async function( parent, params )
    {
        panel = await parent.addContainer( { id: "panel", type: "panel", format: "block" } );
        subcontent = t2.ui.children.get( "subcontent" );

        this.element = panel.element;
        this.type = panel.type;

        Object.assign( this, params );
        Common.call( this ); 
    };

    this.run = async function()
    {
        panel.clear();
        subcontent.clear();
        
        await this.plot();
    };

    this.plot = async function()
    {
        // filter by symbol and no dividends
        this.array = module.data.all.filter( record => ( record.symbol == module.symbol ) );
        // sort by date asc
        this.array.sort( ( a, b ) => a.date < b.date ? 1 : -1 );

        // format and calculate data
        let day = 1000 * 60 * 60 * 24;

        // sort by date desc
        let total = {};
            total.DIV =  { qty: 0, value: 0, price: 0 };
            total.BUY =  { qty: 0, value: 0, price: 0 };
            total.SELL = { qty: 0, value: 0, price: 0 };
        let trade = 0;

        this.array.sort( ( a, b ) => a.datetime > b.datetime ? 1 : -1 );
        this.array.forEach( record => 
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

        let timeline = await panel.addComponent( { id: "timeline", type: "chart", format: "flex" } );
            timeline.addLayer( { color: "rgba( 0, 127, 127, 1 )", font: "12px sans-serif", type: "step",
                data: this.array,
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
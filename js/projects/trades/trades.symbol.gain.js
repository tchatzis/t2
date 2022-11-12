import Common from "../../t2/t2.common.handlers.js";

const Panel = function( module )
{
    let self = this;
    let panel;

    this.init = async function( parent, params )
    {
        panel = await parent.addContainer( { id: "panel", type: "panel", format: "block" } );

        this.element = panel.element;
        this.type = panel.type;

        Object.assign( this, params );
        Common.call( this ); 

        await this.plot();
    };

    this.plot = async function()
    {
        // filter by symbol and no dividends
        this.array = module.data.all.filter( record => ( record.symbol == module.symbol ) );
        // sort by date asc
        this.array.sort( ( a, b ) => a.date < b.date ? 1 : -1 );

        // format and calculate data
        let position = 0;
        let qty = 0;
        let day = 1000 * 60 * 60 * 24;

        // sort by date desc
        let total = {};
            total.BUY =  { initial: 0, qty: 0, value: 0, average: 0 };
            total.SELL = { initial: 0, qty: 0, value: 0, average: 0 };
            total.gain = 0;

        this.array.sort( ( a, b ) => a.datetime > b.datetime ? 1 : -1 );
        this.array.forEach( record => 
        { 
            if ( record.action == "DIV" )
                return;
            
            record.date = Math.round( new Date( record.datetime ).getTime() * day ) / day;

            if ( !total[ record.action ].initial )
                total[ record.action ].initial = record.price;

            total[ record.action ].qty -= record.qty * record.sign;
            total[ record.action ].value += record.value;

            let qty = total.SELL.qty + total.BUY.qty;
            let delta = record.price - total.BUY.initial;  
            let value = delta * qty;

            //total.gain -= delta;

            //let value = -( total.SELL.value - total.BUY.value );
            //let average = value / qty;

            //let gain = total.BUY.initial - average;*/
            console.log( record.id, record.action, record.qty, "@", record.price )
            console.warn( "qty:", qty, "delta:", delta, "value:", value, "gain:", total.gain );
            console.log( "" );

            record.gain = record.price;
        } );

        let timeline = await panel.addComponent( { id: "timeline", type: "chart", format: "flex" } );
            timeline.setData( this.array );
            timeline.addLayer( { color: "rgba( 0, 255, 255, 0.3 )", font: "12px sans-serif", type: "line",
                axes:
                { 
                    "0": { axis: "date", settings: { format: "date", step: day, mod: mondays } },
                    "1": { axis: "gain", settings: { mod: ( p ) => !( p % 10 ) } } } } );

        function mondays( p, chart )
        {
            let date = new Date( chart.min );
                date.setDate( date.getDate() + p );

            return !date.getDay() || !p || p == chart.divisions; 
        }
    };
};

export default Panel; 
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
            total.DIV =  { qty: 0, value: 0, average: 0 };
            total.BUY =  { qty: 0, value: 0, average: 0 };
            total.SELL = { qty: 0, value: 0, average: 0 };
            total.SUB = {};

        this.array.sort( ( a, b ) => a.datetime > b.datetime ? 1 : -1 );
        this.array.forEach( record => 
        { 
            record.date = Math.round( new Date( record.datetime ).getTime() * day ) / day;
            
            total[ record.action ].qty += record.qty;
            total[ record.action ].price = record.price;
            total[ record.action ].value += record.value;
            total[ record.action ].average = total[ record.action ].value / total[ record.action ].qty;

            total.SUB.qty = total.SELL.qty - total.BUY.qty;
            total.SUB.delta = total.SELL.average - total.BUY.average;
            total.SUB.gain = total.SUB.delta * total.SELL.qty;

            record.gain = total.SUB.gain;
        } );

        let timeline = await panel.addComponent( { id: "timeline", type: "chart", format: "flex" } );
            timeline.addLayer( { color: "rgba( 0, 127, 0, 1 )", font: "12px sans-serif", type: "line",
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
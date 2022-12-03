import Common from "../../t2/t2.common.handlers.js";

const Panel = function( module )
{
    let self = this;
    let panel;
    let day = 1000 * 60 * 60 * 24;
    let sum = ( a, b ) => a + b;

    this.init = async function( parent, params )
    {
        panel = await parent.addContainer( { id: "panel", type: "panel", format: "flex" } );
 
        this.element = panel.element;
        this.type = panel.type;

        Object.assign( this, params );
        Common.call( this );
    };

    this.run = async function()
    {
        panel.clear();
        
        await module.queries(); 
        await output();   
    };    

    async function preamble()
    {
        let records = await t2.db.tx.retrieve( "deposits" );
        let deposits = records.data;
        let previous = { date: null, amount: null };
        let total = {};
            total.DIV =  { qty: 0, value: 0, average: 0 };
            total.BUY =  { qty: 0, value: 0, average: 0 };
            total.SELL = { qty: 0, value: 0, average: 0 };
            total.SUB = { deposits: 0 };       

        let array = [ ...module.data.all ];
            array.sort( ( a, b ) => a.datetime > b.datetime ? 1 : -1 );
            array.forEach( record => 
            { 
                record.date = Math.round( new Date( record.datetime ).getTime() * day ) / day;

                let date = t2.formats.isoDate( record.date );

                if ( date !== previous.date )
                {
                    let amount = deposits.filter( deposit => t2.formats.isoDate( new Date( deposit.datetime ) ) == date ).map( d => Number( d.amount ) ).reduce( sum, 0 );
                    
                    total.SUB.deposits += amount;

                    if ( previous.amount !== amount )
                        record.deposits = total.SUB.deposits;

                    previous.amount = amount;
                }
                
                total[ record.action ].qty += record.qty;
                total[ record.action ].price = record.price;
                total[ record.action ].value += record.value;
                total[ record.action ].average = total[ record.action ].value / total[ record.action ].qty;

                total.SUB.qty = total.SELL.qty - total.BUY.qty;
                total.SUB.delta = total.SELL.average - total.BUY.average;
                total.SUB.gain = total.SUB.delta * total.SELL.qty;

                record.gain = total.SUB.gain - previous.amount;
    
                previous.date = date;
            } );

        return array;
    }

    async function output()
    {
        let array = await preamble();

        let chart = await panel.addComponent( { id: "portfolio", type: "chart", format: "flex" } );
            chart.addLayer( { color: "green", font: "12px sans-serif", type: "line",
                data: array,
                axes:
                { 
                    "0": { axis: "date", settings: { format: "date", step: day, mod: mondays, axis: true } },
                    "1": { axis: "gain", settings: { mod: ( p ) => !( p % 10 ), axis: true } } 
                } } );
            chart.addLayer( { color: "blue", font: "12px sans-serif", type: "step",
                data: array,
                axes:
                { 
                    "0": { axis: "date", settings: { format: "date", step: day, axis: false } },
                    "1": { axis: "deposits", settings: { axis: false } } 
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
import Common from "../../t2/t2.container.handlers.js";

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

    async function preamble()
    {
        let records = await t2.db.tx.retrieve( "deposits" );
        let deposits = records.data;
        let previous = { date: null, deposit: null };
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

                    if ( previous.deposit )
                        record.deposits = total.SUB.deposits;

                    previous.deposit = amount;
                }

                total[ record.action ].qty += record.qty;
                total[ record.action ].price = record.price;
                total[ record.action ].value += record.value;
                total[ record.action ].average = total[ record.action ].value / total[ record.action ].qty;

                total.SUB.qty = total.BUY.qty - total.SELL.qty;
                total.SUB.value = total.SELL.value - total.BUY.value;
                total.SUB.gain = total.SUB.value - previous.deposit;

                record.gain = -total.SUB.gain;
    
                previous.date = date;
            } );

        return array;
    }

    async function output()
    {
        let array = await preamble();

        let chart = await this.addComponent( { id: "portfolio", type: "chart", format: "flex" } );
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
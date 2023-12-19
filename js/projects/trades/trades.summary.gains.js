import Common from "../../t2/t2.container.handlers.js";

const Panel = function( module )
{
    let self = this;
    let panel;
    let day = 1000 * 60 * 60 * 24;
    let sum = ( a, b ) => a + b;

    this.init = async function( parent, params )
    {
        panel = await parent.addContainer( { id: "panel", type: "box", format: "flex", css: [ "panel" ] } );
 
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
        let qty = 0;
        let value = 0;
        let deposit = 0;

        let array = [ ...module.data.all ];
            array.sort( ( a, b ) => new Date( a.datetime ) > new Date( b.datetime ) ? 1 : -1 );
            array.forEach( record => 
            { 
                record.date = Math.round( new Date( record.datetime ).getTime() * day ) / day;

                qty += record.qty;
                value += record.value;

                let date = t2.formats.isoDate( record.date );

                if ( date !== previous.date )
                {
                    let amount = deposits.filter( deposit => t2.formats.isoDate( new Date( deposit.datetime ) ) == date ).map( d => check( d ) ).reduce( sum, 0 );
                    
                    deposit += amount;
                    record.deposits = deposit;
                }

                record.gain = -value;

                previous.date = date;
            } );

        return array;
    }

    function check( d )
    {
        let sign = ( d.action == "DEP" ) ? 1 : -1;

        return Number( d.amount ) * sign;
    }

    async function output()
    {
        let array = await preamble();

        let chart = await this.addComponent( { id: "portfolio", type: "chart", format: "flex" } );
            chart.addLayer( { color: "green", font: "12px sans-serif", type: "step",
                data: array,
                axes:
                { 
                    "0": { axis: "date", settings: { format: "date", step: day, mod: monthly, axis: true } },
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

        function monthly( p, chart )
        {
            let date = new Date( chart.min );
                date.setDate( date.getDate() + p );

            return !( date.getDate() - 1 );
        }
    };
};

export default Panel;
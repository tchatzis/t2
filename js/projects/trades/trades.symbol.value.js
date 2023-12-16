import Common from "../../t2/t2.container.handlers.js";

const Panel = function( module )
{
    let self = this;
    let panel;
    let day = 1000 * 60 * 60 * 24;
    let colors = [ "green", "red" ];
    let profit = false;
    const sum = ( a, b ) => a + b;
    const round = ( value ) => Math.round( value * 10000 ) / 10000;
 
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
            { id: "submenu", functions: [ { ignore: "clear" } ] }, 
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
        // sort by date desc
        array.sort( ( a, b ) => new Date( a.datetime ) > new Date( b.datetime ) ? 1 : -1 );

        let qty = 0;
        let value = 0;

        array.forEach( record => 
        { 
            record.date = Math.round( new Date( record.datetime ).getTime() * day ) / day;

            qty += record.qty;
            value += record.value;

            if ( qty )
            {
                let price = value / qty;
                record.gain = qty * ( record.price + price );
            }
            else
            {
                record.gain = value;
            }

            profit = record.gain > 0;
        } );

        return array;
    }

    async function plot()
    {
        let array = await preamble();

        let timeline = await this.addComponent( { id: "timeline", type: "chart", format: "flex" } );
            timeline.addLayer( { color: colors[ 1 - profit ] , font: "12px sans-serif", type: "step",
                data: array,
                axes:
                { 
                    "0": { axis: "date", settings: { format: "date", step: day * 7, mod: mondays, axis: true } },
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
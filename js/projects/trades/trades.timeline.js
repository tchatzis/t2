import { aggregate, reset, total } from "./trades.aggregate.js";
import totals from "./trades.totals.js";

const Timeline = function( module )
{
    let self = this;

    this.init = async function()
    {
        if ( !module.symbol )
            return;

        t2.ui.breadcrumbs[ 2 ] = module.symbol;

        // filter by symbol and no dividends
        this.array = module.data.all.filter( record => ( record.symbol == module.symbol && record.action !== "DIV" ) );
        // sort by date asc
        this.array.sort( ( a, b ) => a.date < b.date ? 1 : -1 );

        // format and calculate data
        let position = 0;
        let qty = 0;
        let day = 1000 * 60 * 60 * 24;

        // sort by date desc
        this.array.sort( ( a, b ) => a.datetime > b.datetime ? 1 : -1 );
        this.array.forEach( record => 
        { 
            record.date = Math.round( new Date( record.datetime ).getTime() * day ) / day;

            position += record.value;
            record.position = position;

            qty += record.qty;

            record.quantity = qty;
            record.average = qty ? record.position / qty : 0;
        } );

        let timeline = await t2.ui.addComponent( { id: "timeline", component: "chart", parent: t2.ui.elements.get( "content" ), module: module } );
            timeline.setData( this.array );
            timeline.addLayer( { color: "rgba( 0, 255, 255, 0.3 )", font: "12px sans-serif", type: "step",
                axes:
                { 
                    "0": { axis: "date", settings: { format: "date", step: day, mod: mondays } },
                    "1": { axis: "quantity", settings: { mod: ( p ) => !( p % 10 ) } } } } );
            /*timeline.addLayer( { color: "rgba( 0, 255, 0, 0.3 )", font: "12px sans-serif", type: "step",
                axes:
                { 
                    "0": { axis: "date", settings: { format: "date", step: day, mod: mondays } },
                    "1": { axis: "position", settings: { mod: ( p ) => !( p % 10 ) } } } } );*/

        reset();
        aggregate( module.symbol, this.array );
        totals( total );

        function mondays( p, chart )
        {
            let date = new Date( chart.min );
                date.setDate( date.getDate() + p );

            return !date.getDay() || !p || p == chart.divisions; 
        }
    };
};

export default Timeline; 
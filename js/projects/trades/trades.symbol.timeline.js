import Common from "../../t2/t2.container.handlers.js";

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
            { id: `content.panels.${ self.id }`, functions: [ { clear: null }, { invoke: [ { f: plot, args: null } ] } ] },
            { id: "margin", functions: [ { ignore: "clear" } ] }
        ] );
    } 

    async function plot()
    {
        // filter by symbol and no dividends
        let array = module.data.all.filter( record => ( record.symbol == module.symbol ) );
        // sort by date asc
        array.sort( ( a, b ) => a.date < b.date ? 1 : -1 );

        // format and calculate data
        let position = 0;
        let qty = 0;
        let day = 1000 * 60 * 60 * 24;

        // sort by date desc
        array.sort( ( a, b ) => a.datetime > b.datetime ? 1 : -1 );
        array.forEach( record => 
        { 
            record.date = Math.round( new Date( record.datetime ).getTime() * day ) / day;

            position += record.value;
            record.position = position;

            qty -= record.qty * record.sign;

            record.quantity = qty;
            record.average = qty ? record.position / qty : 0;
        } );

        let timeline = await this.addComponent( { id: "timeline", type: "chart", format: "flex" } );
            timeline.addLayer( { color: "rgba( 0, 255, 255, 1 )", font: "12px sans-serif", type: "step",
                data: array,
                axes:
                { 
                    "0": { axis: "date", settings: { format: "date", step: day, mod: mondays, axis: true } },
                    "1": { axis: "quantity", settings: { mod: ( p ) => !( p % 10 ), axis: true } } 
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
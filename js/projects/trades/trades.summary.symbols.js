import Common from "../../t2/t2.common.handlers.js";

const Panel = function( module )
{
    let self = this;
    let panel;
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

    async function output()
    {
        let array = [];

        [ "", ...module.data.symbol, "" ].forEach( symbol => 
        {
            let set =  module.data.all.filter( record => record.symbol == symbol );

            let data = {};
                data.symbol = symbol;
                data.qty = set.map( record => record.qty * -record.sign ).reduce( sum, 0 );
                data.value = set.map( record => record.value * record.sign ).reduce( sum, 0 );

            array.push( data );
        } );

        let chart = await panel.addComponent( { id: "symbols", type: "chart", format: "flex" } );
            chart.addLayer( { color: "gray", font: "12px sans-serif", type: "bar",
                data: array,
                axes:
                { 
                    "0": { axis: "symbol", settings: { mod: ( p ) => !( p % 1 ), axis: true, format: "uppercase" } },
                    "1": { axis: "value", settings: { mod: ( p ) => !( p % 1 ), axis: true } } 
                } } );
    }
};

export default Panel;
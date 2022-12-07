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
        await preamble();
        await output();   
    };   

    async function preamble()
    {
        let transactions = module.data.all.filter( record => record.action !== "DIV" );

        self.closed = [];
        self.closed.push( { name: "\u25f9", value: 0 } );

        module.data.symbol.forEach( symbol => 
        {
            let set = transactions.filter( record => record.symbol == symbol );
            let qty = set.map( record => record.qty * record.sign ).reduce( sum, 0 );

            if ( !qty )
            {
                self.closed.push( { name: symbol, value: set.map( record => record.value * record.sign ).reduce( sum, 0 ) } );
            }
        } );

        self.closed.push( { name: "\u25fa", value: 0 } );
    }

    async function output()
    {
        let array = self.closed;

        let chart = await panel.addComponent( { id: "stocks", type: "chart", format: "flex" } );
            chart.addLayer( { color: "hsl( 60, 90%, 40% )", font: "12px sans-serif", type: "bar",
                data: array,
                axes:
                { 
                    "0": { axis: "name", settings: { mod: ( p ) => !( p % 1 ), axis: true, format: "text", step: 1, colored: { axis: true, data: true } } },
                    "1": { axis: "value", settings: { mod: ( p ) => !( p % 10 ), axis: true } } 
                } } );
    }
};

export default Panel;
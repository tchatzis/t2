import Common from "../../t2/t2.container.handlers.js";

const Panel = function( module )
{
    let self = this;
    let panel;
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
        let transactions = module.data.all.filter( record => record.action !== "DIV" );

        self.closed = [];
        self.closed.push( { name: "\u25f9", value: 0 } );

        module.data.symbol.forEach( symbol => 
        {
            let set = transactions.filter( record => record.symbol == symbol );
            let qty = set.map( record => record.qty ).reduce( sum, 0 );// * record.sign

            if ( !qty )
            {
                self.closed.push( { name: symbol, value: set.map( record => record.value ).reduce( sum, 0 ) } );// * record.sign
            }
        } );

        self.closed.push( { name: "\u25fa", value: 0 } );
    }

    async function output()
    {
        await preamble();
        
        let array = self.closed;

        let chart = await this.addComponent( { id: "stocks", type: "chart", format: "flex" } );
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
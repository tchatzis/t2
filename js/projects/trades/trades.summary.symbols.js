import Common from "../../t2/t2.container.handlers.js";

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

    async function output()
    {
        let array = [];
            array.push( { symbol: "\u25f9", qty: 0, value: 0 } );

        module.data.symbol.forEach( symbol => 
        {
            let set = module.data.all.filter( record => record.symbol == symbol );

            let data = {};
                data.symbol = symbol;
                data.qty = set.map( record => record.qty * -record.sign ).reduce( sum, 0 );
                data.value = set.map( record => record.value * record.sign ).reduce( sum, 0 );

            array.push( data );
        } );

        array.push( { symbol: "\u25fa", qty: 0, value: 0 } );

        let chart = await this.addComponent( { id: "symbols", type: "chart", format: "flex" } );
            chart.addLayer( { color: "gray", font: "12px sans-serif", type: "bar",
                data: array,
                axes:
                { 
                    "0": { axis: "symbol", settings: { mod: ( p ) => !( p % 1 ), axis: true, format: "uppercase", step: 1, colored: { axis: true, data: true } } },
                    "1": { axis: "value", settings: { mod: ( p ) => !( p % 1 ), axis: true } } 
                } } );
    }
};

export default Panel;
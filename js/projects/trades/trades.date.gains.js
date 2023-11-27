import Common from "../../t2/t2.container.handlers.js";

const Panel = function( module, array )
{   
    let self = this;
    let panel;

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
            { id: "menu", functions: [ { ignore: "clear" } ] },
            { id: "content", functions: [ { ignore: "clear" } ] },
            { id: `content.panels.${ self.id }`, functions: [ { clear: null }, { invoke: [ { f: output, args: null } ] } ] },
            { id: "margin", functions: [ { ignore: "clear" } ] }
        ] );
    } 

    // content
    async function output()
    {
        chart.call( this );
        table.call( this );
    }

    // chart
    async function chart()
    {
        let container = await this.addContainer( { id: "gains", type: "box", format: "inline-block" } );
        let title = await container.addComponent( { id: "title", type: "title", format: "block", output: "text" } );
            title.set( `Closed Gains \u00BB ${ module.date }` );

        let chart = await container.addComponent( { id: "underperformers", type: "chart", format: "flex" } );
            chart.addLayer( { color: "hsl( 0, 70%, 30% )", font: "12px sans-serif", type: "bar",
                data: array,
                axes:
                { 
                    "0": { axis: "name", settings: { mod: ( p ) => !( p % 1 ), axis: true, format: "text", step: 1, colored: { axis: true, data: true } } },
                    "1": { axis: "value", settings: { mod: ( p ) => !( p % 10 ), axis: true } } 
                } } );
    }

    // table
    async function table()
    {
        let _array = array.filter( record => record.name.charCodeAt( 0 ) < 256 );

        let container = await this.addContainer( { id: "problems", type: "box", format: "inline-block" } );
        let title = await container.addComponent( { id: "title", type: "title", format: "block", output: "text" } );
            title.set( `Closed Gains \u00BB ${ module.date }` );

        let table = await container.addComponent( { id: "problematic", type: "table" } );
            table.addColumn( { 
                input: { name: "name", type: "text" }, 
                cell: { css: {}, display: 4, modes: [ "read" ] },
                format: [ "uppercase" ] } )
            table.addColumn( { 
                input: { name: "value", type: "number", readonly: "" }, 
                cell: { css: { class: "value" }, display: 6, modes: [ "read" ] },
                format: [ "dollar" ],
                formula: ( args ) =>
                {
                    let value = args.record[ args.column ];
                    
                    args.totals[ args.column ] += value;

                    return value;
                } } );
            table.populate( { array: _array, orderBy: "name" } );
            table.setTotals();
    }
};

export default Panel;
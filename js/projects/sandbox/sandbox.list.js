const Template = function( module )
{
    let self = this;
    let array = [];
    let table;
    
    this.init = async function()
    {
        await this.refresh();

        await navigation();
    };

    this.refresh = async function()
    {

    };

    async function navigation()
    {
        await t2.navigation.update( 
        [ 
            { id: "content", functions: [ { clear: null }, { invoke: [ { f: list, args: null }, { f: output, args: null } ] } ] },
        ] );
    } 

    async function list()
    {
        let list = await this.addComponent( { id: "list", type: "list", format: "block" } );
            list.addRowListener( { type: "contextmenu", handler: highlight } );
            list.subscription.add( { event: "addRow", handler: () => update( array ) } );
            list.subscription.add( { event: "removeRow", handler: () => update( array ) } );
            list.subscription.add( { event: "saveRow", handler: () => update( array ) } );
            list.subscription.add( { event: "renumber", handler: () => update( array ) } );
            list.addColumn( { 
                input: { name: "x", type: "number", step: 0.01, min: 0, required: "" }, 
                cell: { css: {}, display: 3, modes: [ "read", "edit" ] },
                format: [] } );
            list.addColumn( { 
                input: { name: "y", type: "number", step: 0.01, min: 0, required: "" }, 
                cell: { css: {}, display: 3, modes: [ "read", "edit" ] },
                format: [] } );
            list.addColumn( { 
                input: { name: "z", type: "number", step: 0.01, min: 0, required: "" }, 
                cell: { css: {}, display: 3, modes: [ "read", "edit" ] },
                format: [] } );
            list.populate( { array: array } );
            list.setTotals();  
    };

    async function output()
    {
        let box = await this.addContainer( { id: "box", type: "box", format: "block" } );
        
        table = await box.addComponent( { id: "table", type: "table", format: "block" } );
        table.addColumn( { 
            input: { name: "x", type: "number", step: 0.01, min: 0, required: "" }, 
            cell: { css: {}, display: 3, modes: [ "read", "edit" ] },
            format: [] } );
        table.addColumn( { 
            input: { name: "y", type: "number", step: 0.01, min: 0, required: "" }, 
            cell: { css: {}, display: 3, modes: [ "read", "edit" ] },
            format: [] } );
        table.addColumn( { 
            input: { name: "z", type: "number", step: 0.01, min: 0, required: "" }, 
            cell: { css: {}, display: 3, modes: [ "read", "edit" ] },
            format: [] } );
        table.update( { array: array } );
    }

    function highlight( args )
    {
        //data, columns, row
        console.log( args );
    }

    function update( array )
    {
        table?.update( { array: array } );
    }
};

export default Template;
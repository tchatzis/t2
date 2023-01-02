const Template = function( module )
{
    let self = this;
    let array = [ { x: 1, y: 2, z: 3 }, { x: 4, y: 5, z: 6 } ];
    
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
            { id: "content", functions: [ { clear: null }, { invoke: [ { f: output, args: null } ] } ] },
        ] );
    } 

    async function output()
    {
        let table = await this.addComponent( { id: "table", type: "table", format: "block" } );
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
            table.populate( { array: array } );
            table.setTotals();
    }
};

export default Template;
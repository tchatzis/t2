import Common from "../../t2/t2.common.handlers.js";

const Panel = function( module )
{
    /*this.init = async function( params )
    {
        let records = await t2.db.tx.filter( module.table, [ { key: "symbol", operator: "==", value: module.symbol } ] );
        let min = Math.min.apply( null, records.data.map( record => record.price ) );
        let max = Math.max.apply( null, records.data.map( record => record.price ) );

        source.call( this, records.data );

        console.log( min, max )
        console.log( module.mode )
        //let actions = [ "BUY", "SELL" ];
        //let array = module.data.all.filter( record => record.symbol == module.symbol );
    };*/

    this.init = async function( parent, params )
    {
        let records = await t2.db.tx.filter( module.table, [ { key: "symbol", operator: "==", value: module.symbol } ] );
        let array = records.data;

        let panel = await parent.addContainer( { id: "panel", type: "panel", format: "flex" } );

        this.element = panel.element;
        this.type = panel.type;

        Object.assign( this, params );
        Common.call( this );

        let table = await panel.addComponent( { id: "transactions", type: "table" } );
            table.addColumn( { 
                input: { name: "id", type: "hidden" }, 
                cell: { css: {}, display: 0, modes: [ "edit" ] },
                format: [] } );
            table.addColumn( { 
                input: { name: "datetime", type: "datetime" }, 
                cell: { css: { class: "date" }, display: 5, modes: [ "read" ] },
                format: [ "date" ] } );
            table.addColumn( { 
                input: { name: "action", type: "text" }, 
                cell: { css: { value: null }, display: 3, modes: [ "read" ] },
                format: [ "uppercase" ] } );
            table.addColumn( { 
                input: { name: "qty", type: "number", step: 1 }, 
                cell: { css: { class: "info" }, display: 3, modes: [ "read" ] },
                format: [ "precision" ] } );
            table.addColumn( { 
                input: { name: "price", type: "number", step: 0.001 }, 
                cell: { css: { class: "value" }, display: 4, modes: [ "read" ] },
                format: [ "precision" ] } );
            table.setColumns( module.mode );
            table.populate( { array: array, orderBy: "price" } );

        stage1( table, array );
    };

    function stage1( table, array )
    {
        let tbody = table.element;
        let l = array.length;

        async function iterator( i )
        {
            let data =  array[ i ];
            let row = tbody.querySelector( `[ data-id = "${ i }" ]` );

            console.log( i, data, row );
            
            
            if ( i < l - 1 )
            {
                i++;
                await t2.common.delay( iterator, 100, i );
            };
        }

        iterator( 0 );

    }


};

export default Panel;
const Deposits = function( module )
{
    const self = this;
    const Data = function( data )
    {
        Object.assign( this, data );

        this.id = Number( this.id );
    };

    this.run = async function()
    {
        Object.assign( module, this );

        this.table = "deposits";

        await this.refresh();  
    };

    this.refresh = async function()
    {
        await module.queries(); 
        await layout();
    };

    async function layout()
    {
        let date = t2.ui.children.get( "submenu.date" );
            date.hide();

        await history();
        await transaction();
    }

    async function history()
    {
        let records = await t2.db.tx.retrieve( self.table );
        let array = records.data;
        
        let content = t2.ui.children.get( "content" );
            content.clear();
        let container = await content.addContainer( { id: "day", type: "box", format: "inline-block" } );
        let title = await container.addComponent( { id: "title", type: "title", format:"block", output: "text" } );
            title.set( "Deposit History" );

        let table = await container.addComponent( { id: "history", type: "table" } ); 
            table.addRowListener( { type: "contextmenu", handler: table.edit } );
            table.addSubmitListener( { type: "submit", handler: async function ( data )
            { 
                let form = this;

                let d = new Data( data );

                let record = await t2.db.tx.update( self.table, d.id, d );

                let message = await content.addComponent( { id: "message", type: "message", format: "block", output: "text" } );
                    message.set( `Updated ${ data.action }` );   

                self.refresh();
            } } ); 
            table.addColumn( { 
                input: { name: "id", type: "hidden" }, 
                cell: { css: {}, display: 0, modes: [ "read", "edit" ] },
                format: [] } );
            table.addColumn( { 
                input: { name: "datetime", type: "datetime", step: 0.01, min: 0 }, 
                cell: { css: {}, display: 10, modes: [ "read", "edit" ] },
                format: [ "date&time" ] } );
            table.addColumn( { 
                input: { name: "action", type: "select" }, 
                cell: { css: { value: "action" }, display: 3, modes: [ "read", "edit" ] },
                format: [],
                options: [ "DEP", "WD" ] } );
            table.addColumn( { 
                input: { name: "amount", type: "number", step: 0.01, min: 0 }, 
                cell: { css: {}, display: 3, modes: [ "read", "edit" ] },
                format: [ "precision" ] } );
            table.addColumn( { 
                input: { name: "notes", type: "text" }, 
                cell: { css: { value: "action" }, display: 10, modes: [ "read", "edit" ] },
                format: [] } );
            table.addColumn( { 
                input: { name: "source", type: "select" }, 
                cell: { css: {}, display: 9, modes: [ "read", "edit" ] },
                format: [],
                options: module.data.source } ); 
            table.addColumn( { 
                input: { type: "submit", value: "SUBMIT" }, 
                cell: { css: {}, display: 4, modes: [ "edit" ] },
                format: [] } );
            table.setColumns( module.mode );
            table.populate( { array: array, orderBy: "datetime" } );
            table.setTotals();
    }

    // transaction entry form
    async function transaction()
    {
        let content = t2.ui.children.get( "content" );
        let subcontent = t2.ui.children.get( "subcontent" );
            subcontent.clear();
        
        let form = await subcontent.addComponent( { id: "deposits", type: "form", format: "flex" } );
            form.addListener( { type: "submit", handler: async function ( data )
            {
                data.action = this.submitter.value;

                let record = await t2.db.tx.create( self.table, data );

                self.refresh();

                let message = await content.addComponent( { id: "message", type: "message", format: "block", output: "text" } );
                    message.set( "Success" );
            } } );
            form.addField( { 
                input: { name: "datetime", type: "datetime", value: t2.formats.datetime( new Date() ) },
                cell: { css: {}, display: 10 },
                format: [ "datetime" ]/*,
                update: ( input ) => 
                {
                    function set()
                    {
                        let datetime = new Date();
    
                        input.value = t2.formats.datetime( datetime );
                    }

                    setInterval( set, 1000 );
                }*/ } );
            form.addField( { 
                input: { name: "amount", type: "number", min: 0, step: 0.01, required: "" }, 
                cell: { css: {}, display: 4 },
                format: [] } );
            form.addField( { 
                input: { name: "notes", type: "text" }, 
                cell: { css: {}, display: 8 },
                format: [ "uppercase" ] } );
            form.addField( { 
                input: { name: "source", type: "select" }, 
                cell: { css: {}, display: 9 },
                format: [],
                options: module.data.source } );  
            form.addField( { 
                input: { type: "submit", value: "DEP" }, 
                cell: { css: {}, display: 3 },
                format: [] } );
            form.addField( { 
                input: { type: "submit", value: "WD" }, 
                cell: { css: {}, display: 3 },
                format: [] } ); 
    };
};

export default Deposits;
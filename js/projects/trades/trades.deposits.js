const Template = function( module )
{
    const self = this;
    const day = 1000 * 60 * 60 * 24;
    
    const Data = function( data )
    {
        Object.assign( this, data );

        this.id = Number( this.id );
    };

    this.init = async function()
    {
        this.table = "deposits";
        
        await this.refresh(); 

        await navigation();  
    };

    this.refresh = async function()
    {
        module.unsetSymbol();
        module.unsetDate();
        
        let records = await t2.db.tx.retrieve( self.table );

        this.data = records.data;
        this.data.forEach( record => record.date = Math.round( new Date( record.datetime ).getTime() * day ) / day );
    };

    async function navigation()
    {
        await t2.navigation.update( 
        [ 
            { id: "subcontent", functions: [ { clear: null }, { show: null }, { invoke: [ { f: transaction, args: null } ] } ] },
            { id: "submargin",  functions: [ { clear: null }, { show: null } ] },
            { id: "menu",       functions: [ { ignore: "clear" }, { hide: null } ] },
            { id: "content",    functions: [ { clear: null }, { invoke: [ { f: chart, args: null } ] } ] },
            { id: "margin",     functions: [ { clear: null }, { invoke: [ { f: history, args: null } ] } ] }
        ] );
    }

    async function chart()
    { 
        let chart = await this.addComponent( { id: "deposits", type: "chart", format: "flex" } );
            chart.addLayer( { color: "green", font: "12px sans-serif", type: "bar",
                data: self.data,
                axes:
                { 
                    "0": { axis: "date", settings: { format: "date", step: day, mod: mondays, axis: true } },
                    "1": { axis: "amount", settings: { format: "number", mod: ( p ) => !( p % 10 ), axis: true } }
                } } );
    }

    async function history()
    {
        let container = await this.addContainer( { id: "history", type: "box", format: "inline-block" } );
        let title = await container.addComponent( { id: "title", type: "title", format:"block", output: "text" } );
            title.set( "Deposit History" );

        let table = await container.addComponent( { id: "history", type: "table" } ); 
            table.addRowListener( { type: "contextmenu", handler: table.edit } );
            table.addSubmitListener( { type: "submit", handler: async function ( data )
            { 
                let form = this;

                let d = new Data( data );

                let record = await t2.db.tx.update( self.table, d.id, d );

                let message = await container.addComponent( { id: "message", type: "message", format: "block", output: "text" } );
                    message.set( `Updated ${ data.action }` );   

                self.refresh();
            } } ); 
            table.addColumn( { 
                input: { name: "id", type: "hidden" }, 
                cell: { css: {}, display: 0, modes: [ "read", "edit" ] },
                format: [] } );
            table.addColumn( { 
                input: { name: "datetime", type: "datetime", step: 0.01, min: 0 }, 
                cell: { css: { value: "brokerage" }, display: 10, modes: [ "read", "edit" ] },
                format: [ "date&time" ] } );
            table.addColumn( { 
                input: { name: "action", type: "select" }, 
                cell: { css: {}, display: 3, modes: [ "read", "edit" ] },
                format: [],
                options: [ "DEP", "WD" ] } );
            table.addColumn( { 
                input: { name: "amount", type: "number", step: 0.01, min: 0 }, 
                cell: { css: {}, display: 3, modes: [ "read", "edit" ] },
                format: [ "precision" ] } );
            table.addColumn( { 
                input: { name: "notes", type: "text" }, 
                cell: { css: {}, display: 10, modes: [ "edit" ] },
                format: [] } );
            table.addColumn( { 
                input: { name: "source", type: "select" }, 
                cell: { css: {}, display: 9, modes: [ "read", "edit" ] },
                format: [],
                options: module.data.source } ); 
            table.addColumn( { 
                input: { name: "brokerage", type: "select" }, 
                cell: { css: {}, display: 9, modes: [ "read", "edit" ] },
                format: [],
                options: module.data.brokerage } ); 
            table.addColumn( { 
                input: { type: "submit", value: "SUBMIT" }, 
                cell: { css: {}, display: 4, modes: [ "edit" ] },
                format: [] } );
            table.populate( { array: self.data, orderBy: "datetime" } );
            table.setTotals();
    }

    // transaction entry form
    async function transaction()
    {
        let form = await this.addComponent( { id: "deposits", type: "form", format: "flex" } );
            form.addListener( { type: "submit", handler: async function ( data )
            {
                data.action = this.submitter.value;

                let record = await t2.db.tx.create( self.table, data );

                self.refresh();

                let message = await this.addComponent( { id: "message", type: "message", format: "block", output: "text" } );
                    message.set( "Success" );
            } } );
            form.addField( { 
                input: { name: "datetime", type: "datetime", value: t2.formats.datetime( new Date() ) },
                cell: { css: {}, display: 10 },
                format: [] } );
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
                input: { name: "brokerage", type: "select" }, 
                cell: { css: {}, display: 9 },
                format: [],
                options: module.data.brokerage } ); 
            form.addField( { 
                input: { type: "submit", value: "DEP" }, 
                cell: { css: {}, display: 3 },
                format: [] } );
            form.addField( { 
                input: { type: "submit", value: "WD" }, 
                cell: { css: {}, display: 3 },
                format: [] } ); 
    };

    function mondays( p, chart )
    {
        let date = new Date( chart.min );
            date.setDate( date.getDate() + p );

        return !date.getDay() || !p || p == chart.divisions; 
    }
};

export default Template;
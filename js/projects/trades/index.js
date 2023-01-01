import Data from "./trades.data.js";
import Message from "../../t2/t2.ui.message.js";

const Trades = function()
{
    const self = this;

    this.init = async function()
    {
        await this.refresh();

        await navigation();
    };

    this.refresh = async function()
    {
        this.unsetSymbol();
        
        await this.queries();
    };

    async function navigation()
    { 
        let menu = t2.navigation.components.main;
            menu.update( Array.from( t2.movie.scenes.keys() ) );
            menu.highlight( self.info.namespace );

        let view = t2.navigation.components.view;
            view.setModule( self );
            view.update( [ "Day", "Symbol", "Summary", "Search", "Fix", "Deposits" ] );
            view.activate( view.array[ 0 ].toLowerCase() );

        await t2.ui.layout.init( { name: "all", preserve: [ "header", "footer" ] } );
    }

    this.filter = function()
    {
        this.data.filtered = [ ...this.data.all ];
        
        if ( this.symbol )
        {
            //console.log( "symbol", this.symbol );
            this.data.filtered = this.data.filtered.filter( record => record.symbol == this.symbol );
        }
        
        if ( this.from && this.to )
        {
            //console.log( "from", this.from, "to", this.to );
            let from = new Date( this.from );
            let to = new Date( this.to );
                to.setDate( to.getDate() + 2 );

            this.data.filtered = this.data.filtered.filter( record => ( new Date( record.datetime ) > from && new Date( record.datetime ) < to ) );
        }

        if ( this.date )
        {
            this.data.filtered = this.data.filtered.filter( record => t2.formats.isoDate( record.datetime ) == this.date ); 
        }

        t2.common.log( "blue", "filtered:", this.data.filtered.length );
    };

    this.queries = async () =>
    {
        this.table = "trades";

        let records = await t2.db.tx.retrieve( this.table );

        this.data = 
        {
            actions:    [ "BUY", "SELL", "DIV" ],
            all:        records.data,
            brokerage:  [ "TDAmeritrade", "JPMorganChase", "Robinhood" ],
            filtered:   [],
            source:     [ "JPMorganChase", "RBC", "HSBC", "Robinhood", "Cheque" ]    
        };

        this.filter();

        [ 
            { key: "datetime", format: "datetime", sort: "asc", use: "filtered" }, 
            { key: "symbol", format: "uppercase", sort: "asc", use: "all" } 
        ].forEach( property => 
        {
            let map = new Map();

            this.data[ property.use ].map( record => map.set( record[ property.key ], record ) );

            let array = Array.from( map.keys() );
                array = array.map( item => t2.formats[ property.format ]( item ) );
            this.data[ property.key ] = array.sort( this.sort[ property.sort ] );
        } ); 
    };

    this.setDate = ( date ) => this.date = date;

    this.unsetDate = () => delete this.date;
    
    this.setSymbol = ( symbol ) => this.symbol = symbol;

    this.unsetSymbol = () => delete this.symbol;

    this.sort =
    {
        asc:  ( a, b ) => ( a > b ) ? 1 : -1,
        desc: ( a, b ) => ( a < b ) ? 1 : -1
    };

    // common transaction entry form
    this.transaction = async function( source )
    {
        let form = await this.addComponent( { id: "transaction", type: "form", format: "flex" } );
            form.addListener( { type: "submit", handler: async ( args ) =>
            {
                args.source = source;
   
                let record = await self.addTransaction( args );
            } } );
            form.addField( { 
                input: { name: "datetime", type: "datetime", value: t2.formats.datetime( new Date() ) },
                cell: { css: {}, display: 10 },
                format: [] } );
            form.addField( { 
                input: { name: "symbol", type: "datalist", value: self.symbol || "" }, 
                cell: { css: {}, display: 4 },
                format: [ "uppercase" ],
                options: self.data.symbol } );
            form.addField( { 
                input: { name: "qty", type: "number", value: "", min: 0, step: 0.0001, required: "" }, 
                cell: { css: {}, display: 4 },
                format: [] } );
            form.addField( { 
                input: { name: "price", type: "number", value: "", min: 0, step: 0.0001, required: "" }, 
                cell: { css: {}, display: 5 },
                format: [] } );
            form.addField( { 
                input: { name: "notes", type: "text", value: "" }, 
                cell: { css: {}, display: 4 },
                format: [ "uppercase" ] } );
            form.addField( { 
                input: { name: "brokerage", type: "select", value: "TDAmeritrade" }, 
                cell: { css: {}, display: 9 },
                format: [],
                options: self.data.brokerage } );  
            form.addField( { 
                input: { type: "submit", value: "BUY" }, 
                cell: { css: {}, display: 3 },
                format: [] } );
            form.addField( { 
                input: { type: "submit", value: "SELL" }, 
                cell: { css: {}, display: 3 },
                format: [] } );
            form.addField( { 
                input: { type: "submit", value: "DIV" }, 
                cell: { css: {}, display: 3 },
                format: [] } );  
    };

    // add transaction handlers
    this.addTransaction = async function( args )
    {
        let event = args.event;
        let form = event.target;
        let submit = event.submitter;
            submit.setAttribute( "disabled", "" );
        let data = args.data;
            data.action = submit.value;
        let message = new Message();
            message.init();
        let record = await t2.db.tx.create( self.table, new Data( data ) );
        let table = self.appendRow( args.source, record );

        message.set( `Added ${ record.id }` );

        form.datetime.value = t2.formats.datetime( new Date() );
        form.symbol.value = "";
        form.qty.value = "";
        form.price.value = "";
        form.notes.value = "";
        submit.removeAttribute( "disabled" );

        await this.queries();

        if ( table ) 
            table.unhighlight( record.id );

        return record;
    };

    this.appendRow = function( source, record )
    {
        let data = record.data;

        let table = source[ data.brokerage ];

        if ( !table )
            return;

        table.addRow( data, table.array.length );
        table.parent.unscale();
        table.highlight( data.id );
        table.setTotals();

        table.array.push( data );

        return table;
    };

    // update transaction handlers
    this.updateTransaction = async function( args )
    { 
        let data = args.data;
        let table = args.table; 
        let row = args.row;
        let message = new Message();
            message.init();
        let record = await t2.db.tx.update( self.table, Number( data.id ), new Data( data ) );

        await this.queries();

        if ( table )
        {
            table.highlight( record.id );
            table.updateRow( row, record.data, Number( row.dataset.index ) );
        }

        message.set( `Updated ${ record.id }` ); 

        let popup = t2.ui.children.get( "subcontent.popup" );
            popup?.element?.remove();  

        if ( table ) 
            table.unhighlight( record.id );
    }
};

export default Trades;
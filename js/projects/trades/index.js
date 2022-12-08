import Data from "./trades.data.js";

const Trades = function()
{
    const self = this;

    this.init = async function()
    {
        await this.queries();

        navigation();

        let max = Math.max.apply( null, this.data.all.map( record => new Date( record.datetime ) ) );

        this.date = t2.formats.isoDate( new Date( max ) );
    };

    async function navigation()
    {
        let menu = t2.navigation.components.menu;
            menu.update( Array.from( t2.movie.scenes.keys() ) );
            menu.active( self.info.namespace );

        let view = t2.navigation.components.view;
            view.setModule( self );
            view.update( [ "Day", "Symbol", "Summary", "Search", "Fix", "Deposits" ] );
            view.activate( view.array[ 0 ].toLowerCase() );
            view.addListener( { event: "click", handler: () =>
            {
                [ "submenu", "subcontent", "submargin" ].forEach( id => t2.navigation.addIgnore( { id: id, ignore: [ "clear" ] } ) );
                
                t2.navigation.update( 
                {
                    clear: [ "menu", "submenu", "content", "subcontent", "margin", "submargin" ]
                } );
            } } );

        await t2.navigation.setLayout( { name: "all", ignore: [] } );
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
            //console.log( "date", this.date );
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

    this.setDate = async function( date )
    {
        this.date = date;

        nav.call( this );
    };
    
    this.setSymbol = async function( symbol )
    {
        this.symbol = symbol;

        await this.refresh();
    };

    this.unsetSymbol = async function( symbol )
    {
        delete this.symbol;

        await this.refresh();
    };

    this.sort =
    {
        asc:  ( a, b ) => ( a > b ) ? 1 : -1,
        desc: ( a, b ) => ( a < b ) ? 1 : -1
    };

    // common transaction entry form
    this.transaction = async function( source )
    {
        let subcontent = t2.ui.children.get( "subcontent" );

        let form = await subcontent.addComponent( { id: "transaction", type: "form", format: "flex" } );
            form.addListener( { type: "submit", handler: async ( e, data ) =>
            {
                let record = await this.addTransaction( e, data, source );
                this.updateTable( record, source );
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

    // add transaction handler
    this.addTransaction = async function( args )
    {
        let event = args.event;
        let data = args.data;
        let form = event.target;
        let submit = event.submitter;
            submit.setAttribute( "disabled", "" );
        let message = t2.ui.children.get( "message" );
            message.output = "text";
            message.element.classList.add( "expanded" );    
        let messages = await message.addComponent( { id: "message", type: "message", format: "block", output: "text" } );    

        data.action = submit.value;

        let record = await t2.db.tx.create( self.table, new Data( data ) );

        messages.set( `Added ${ record.id }` );
        await t2.common.delay( () => message.element.classList.remove( "expanded" ), 5000 ); 
        messages.set();

        form.datetime.value = t2.formats.datetime( new Date() );
        form.symbol.value = "";
        form.qty.value = "";
        form.price.value = "";
        form.notes.value = "";
        submit.removeAttribute( "disabled" );

        source.refresh();

        return record;
    };

    this.updateTransaction = async function( args )
    { 
        let event = args.event;
        let data = args.data;
        let table = args.table; 
        let row = args.row;
        let message = t2.ui.children.get( "message" );
            message.output = "text";
            message.element.classList.add( "expanded" );    
        let messages = await message.addComponent( { id: "message", type: "message", format: "block", output: "text" } ); 

        let record = await t2.db.tx.update( self.table, Number( data.id ), new Data( data ) );

        table.highlight( record.id );
        table.resetTotals();
        table.updateRow( row, record.data, Number( row.dataset.index ) );
        table.setTotals();

        messages.set( `Updated ${ record.id }` ); 
        await t2.common.delay( () => message.element.classList.remove( "expanded" ), 5000 ); 
        messages.set();

        let popup = t2.ui.children.get( "subcontent.popup" );
            popup?.element?.remove();
    }

    this.updateTable = function( record, source )
    {
        let data = record.data;
        
        let table = source[ data.brokerage ];
            table.addRow( record, table.array.length );
            table.parent.unscale();
            table.highlight( data.id );
            table.setTotals();

        return table;
    };
};

export default Trades;
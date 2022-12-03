import navigation from "../../t2/t2.ui.navigation.js";

const Trades = function()
{
    const self = this;

    this.init = async function()
    {
        nav.call( this );

        await this.queries();

        let max = Math.max.apply( null, this.data.all.map( record => new Date( record.datetime ) ) );

        this.date = t2.formats.isoDate( new Date( max ) );

        this.tab = 5;

        await layout();
    };

    function nav()
    {
        navigation.call( this, 
        { 
            init: { layout: "all", ignore: [ "header" ] }, 
            menu: { activate: self.info.namespace, array: Array.from( t2.movie.scenes.keys() ), ignore: [ "header", "footer" ] }, 
            view: { activate: "Day", array: [ "Day", "Symbol", "Summary", "Search", "Fix", "Deposits" ], ignore: [ "header", "footer" ] } 
        } );
    }

    async function layout()
    {
        
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
    this.transaction = async function( handler )
    {
        let subcontent = t2.ui.children.get( "subcontent" );
            subcontent.clear();
        
        let form = await subcontent.addComponent( { id: "transaction", type: "form", format: "flex" } );
            form.addListener( { type: "submit", handler: handler } );
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
};

export default Trades;
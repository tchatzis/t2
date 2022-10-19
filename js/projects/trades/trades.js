import Common from "../../modules/navigation.js";
import Data from "./trades.data.js";

const Trades = function()
{
    const self = this;

    this.init = async function()
    {
        navigation.call( this );

        await this.queries();

        let max = Math.max.apply( null, this.data.all.map( record => new Date( record.datetime ) ) );

        this.date = t2.formats.isoDate( new Date( max ) );

        layout();
    };

    function navigation()
    {
        Common.call( this );

        this.navigation.scenes.clear = [ "menu", "submenu", "content", "subcontent", "margin", "submargin" ];
        this.navigation.scenes.component.addListener( { type: "click", handler: function()
        {
            self.navigation.set.call( self.navigation.scenes, ...arguments );
        } } );
        this.navigation.scenes.component.update( this.navigation.scenes.component.array );
        this.navigation.activate.call( this.navigation.scenes, this.info.namespace );

        this.navigation.view.array = [ "Day", "Summary", "Dividends", "Symbol", "Search", "Fix", "Deposits" ];
        this.navigation.view.default = this.navigation.view.array[ 0 ].toLowerCase();
        this.navigation.view.clear = [ "content" ];
        this.navigation.view.component.addListener( { type: "click", handler: function()
        {
            self.navigation.set.call( self.navigation.view, ...arguments );
        } } );
        this.navigation.view.component.update( this.navigation.view.array );
        this.navigation.click.call( this.navigation.view, this.navigation.view.default );
    }   

    function layout()
    {
        symbols();
        self.transaction();
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

        await this.refresh();
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

    // transaction entry form
    this.transaction = async function()
    {
        let content = t2.ui.children.get( "content" );
        
        let subcontent = t2.ui.children.get( "subcontent" );
            subcontent.clear();
        
        let form = await subcontent.addComponent( { id: "transaction", type: "form", format: "flex" } );
            form.addListener( { type: "submit", handler: async function ( data )
            {
                data.action = this.submitter.value;

                let record = await t2.db.tx.create( self.table, new Data( data ) );

                let records = await t2.db.tx.filter( self.table, [ { key: "datetime", operator: "==", value: self.date } ] );

                let table = self[ data.brokerage ];
                    table.populate( { array: records.data } );
                    table.highlight( record.data.id );
                    table.setTotals();

                form.form.datetime.value = t2.formats.datetime( new Date() );
                form.form.symbol.value = "";
                form.form.qty.value = "";
                form.form.price.value = "";
                form.form.notes.value = "";

                let message = await content.addComponent( { id: "message", type: "message", format: "block", output: "text" } );
                    message.set( `Added ${ record.data.id }` );
            } } );
            form.addField( { 
                input: { name: "datetime", type: "datetime", value: t2.formats.datetime( new Date() ) },
                cell: { css: {}, display: 10 },
                format: [] } );
            form.addField( { 
                input: { name: "symbol", type: "datalist", value: self._symbol || "" }, 
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

    // symbols menu
    async function symbols()
    {
        let menu = t2.ui.children.get( "menu" );

        let symbols = await menu.addComponent( { id: "symbols", type: "menu", array: self.data.symbol, format: "block" } );
            symbols.addListener( { type: "click", handler: function() 
            { 
                let link = arguments[ 2 ].curr;
                let symbol = link.textContent;

                self._symbol = symbol;

                if ( self.symbol )
                {
                    link.classList.remove( "inactive" );
                    
                    self.unsetSymbol( symbol );
                }
                else
                {
                    link.classList.add( "inactive" );
                    
                    self.setSymbol( symbol );
                }
            } } );       
    }
};

export default Trades;
import Data from "./trades.data.js";

const Trades = function()
{
    const self = this;
    let breadcrumbs;
    let views;

    this.init = async function()
    {
        this.mode = "read";
        this.view = "day";
        this.views = [ "Day", "Summary", "Symbol", "Fix", "Deposits" ];

        breadcrumbs = t2.ui.children.get( "footer.breadcrumbs" );

        await this.refresh();

        layout();
    };

    async function layout()
    {
        let footer = await t2.ui.children.get( "footer" );

        views = await footer.addComponent( { id: "views", type: "menu", array: self.views, format: "flex" } );
        views.addListener( { type: "click", handler: function() 
        { 
            self.handlers.change( ...arguments );
        } } );  
        views.activate( self.view );

        let menu = t2.ui.children.get( "menu" );

        let symbols = await menu.addComponent( { id: "symbols", type: "menu", array: [], format: "block" } );
            symbols.update( self.data.symbol );
            symbols.hide();
            symbols.addListener( { type: "click", handler: function() 
            { 
                self.handlers.clicked( ...arguments );
                breadcrumbs.set.path( 2, arguments[ 2 ].curr.textContent );
            } } );
    }

    function activate( args )
    {
        let e = args[ 0 ];
            e.preventDefault();
            e.stopPropagation();

        // activate / deactivate links
        let element = e.target;
            element.classList.add( "active" );

        let active = args[ 2 ];
            active.link?.classList.remove( "active" );
            active.link = element;
    }

    this.clear = () => t2.common.clear( [ "content", "margin", "subcontent", "submargin" ] );

    this.handlers = 
    {
        change: async function()
        {
            activate( arguments );

            let element = arguments[ 0 ].target;
            let view = element.getAttribute( "data-link" ).toLowerCase();

            await self.setView( view );
            //await transaction();
        },
        
        clicked: async function()
        {
            activate( arguments );
            
            let element = arguments[ 0 ].target;
            let symbol = element.getAttribute( "data-link" ).toUpperCase();

            await self.setSymbol( symbol ); 
            await self.setView( self.view );
        },


        
         /*create: async ( e ) => 
        { 
            e.preventDefault(); 

            let form = e.target; 
            //let date = new Date();
            let data = {};
                data.action = e.submitter.value;
                //data.date = date.toLocaleDateString();
                //data.time = date.toLocaleTimeString();
            let formdata = new FormData( form );    
            let array = Array.from( formdata.entries() );
                array.forEach( input => data[ input[ 0 ] ] = input[ 1 ] );

            let record = await t2.db.tx.create( this.table, new Data( data ) );

            this.setSymbol( data.symbol );
            this.refresh( record );
        
            form.elements.qty.value = null
            form.elements.price.value = null;
        },

        edit: async ( e, record ) =>
        {
            if ( e.target.parentNode.tagName == "TR" )
            {
                self.setSymbol( record.symbol );
                await self.setView( "edit" );
                self.highlight( record );
            }
        },

        row: ( e, record ) =>
        {
            if ( e.target.parentNode.tagName == "TR" )
                e.target.parentNode.classList.toggle( "pairing" );
        },

        update: async ( e ) => 
        { 
            e.preventDefault(); 

            let form = e.target; 
            let formdata = new FormData( form );
            let data = {};   
            let array = Array.from( formdata.entries() );
                array.forEach( input => data[ input[ 0 ] ] = input[ 1 ] );

            let record = await t2.db.tx.update( this.table, data.id, new Data( data ) );

            this.refresh( record );
        }*/
    };

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

        console.log( "filtered", this.data.filtered );
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

    this.refresh = async function()
    {
        await this.queries();
        await this.setView( this.view );

        transaction();
    };

    /*this.setDate = async function()
    {
        this.date = t2.formats.isoDate( record.datetime );

        breadcrumbs.set.path( 2, this.date );

        await this.refresh();
    };*/

    /*this.setDates = async function( e )
    {
        e.preventDefault();

        let form = e.target; 
        let formdata = new FormData( form );

        Array.from( formdata.entries() ).forEach( field => self[ field[ 0 ] ] = field[ 1 ] );

        await self.setView( "date" );
        await self.setForm();
    };*/

    // add trade form


    /*async function range()
    {
        let max = t2.formats.isoDate( Date.now() );
        let min = t2.formats.isoDate( this.data.datetime[ 0 ] );

        let dates = await t2.ui.addComponent( { id: "range", component: "form", parent: t2.ui.elements.get( "subcontent" ), module: this, horizontal: true } );
            dates.form.addEventListener( "submit", this.setDates );
            dates.addField( { 
                input: { name: "from", type: "date", value: this.from || min, min: min, max: max, required: "" }, 
                cell: { css: {}, display: 8 },
                format: [ "date" ] } );
            dates.addField( { 
                input: { name: "to", type: "date", value: this.to || max, min: min, max: max, required: "" }, 
                cell: { css: {}, display: 8 },
                format: [ "date" ] } );
            dates.addField( { 
                input: { type: "submit", value: "FILTER" }, 
                cell: { css: {}, display: 4 },
                format: [] } );
    };*/

    this.setDate = function( data )
    {
        self.date = data.date;
        
        breadcrumbs.set.path( 2, data.date );

        this.refresh();
    };
    
    this.setSymbol = function( symbol )
    {
        this.symbol = symbol;
    };

    this.setView = async function( view )
    {
        this.clear();
        
        this.view = view;

        let module = await import( `./trades.${ this.view }.js` );

        this.module = await new module.default( this );

        await this.module.init();

        breadcrumbs.set.path( 1, this.view );
    };

    this.sort =
    {
        asc:  ( a, b ) => ( a > b ) ? 1 : -1,
        desc: ( a, b ) => ( a < b ) ? 1 : -1
    };

    // transaction entry form
    async function transaction()
    {
        let subcontent = t2.ui.children.get( "subcontent" );
        
        let form = await subcontent.addComponent( { id: "transaction", type: "form", format: "flex" } );
            form.addListener( { type: "submit", handler: async function ( data )
            {
                data.action = this.submitter.value;

                let record = await t2.db.tx.create( self.table, new Data( data ) );

                self.setDate( record.data );
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
};

export default Trades;
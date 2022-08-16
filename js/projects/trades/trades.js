import Data from "./trades.data.js";

const Trades = function()
{
    const self = this;
    let breadcrumbs;
    let symbols;
    let views;
    
    this.actions = [ "BUY", "SELL", "DIV" ];

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

    // top menu ( view )
    this.change = async function()
    {
        activate( arguments );

        let element = arguments[ 0 ].target;
        let view = element.getAttribute( "data-link" ).toLowerCase();

        await this.setView( view );
        await this.setForm();
    };

    this.clear = () => t2.common.clear( [ "content", "margin", "subcontent", "submargin" ] );

    // side menu ( symbol )
    this.clicked = async function()
    {
        activate( arguments );
        
        let element = arguments[ 0 ].target;
        let symbol = element.getAttribute( "data-link" ).toUpperCase();

        await this.setSymbol( symbol ); 
        await this.setView( this.view );
        await this.setForm();
    };

    this.handlers = 
    {
        create: async ( e ) => 
        { 
            e.preventDefault(); 

            let form = e.target; 
            let date = new Date();
            let data = {};
                data.action = e.submitter.value;
                data.date = date.toLocaleDateString();
                data.time = date.toLocaleTimeString();
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
        }
    };

    this.highlight = function( record )
    {
        if ( !record )
            return;

        let row = document.querySelector( `[ data-id = "${ record.id }" ]` );

        if ( row )
            row.classList.add( "highlight" );
    };

    this.init = async function()
    {
        this.mode = "read";
        this.view = "day";
        this.views = [ "Day", "Summary" ];

        await this.queries();

        fix();
    };

    this.queries = async () =>
    {
        this.table = "trades";

        let records = await t2.db.tx.retrieve( this.table );

        this.data = 
        {
            all: records.data    
        };

        [ { key: "datetime", format: "datetime", sort: "asc" }, { key: "symbol", format: "uppercase", sort: "asc" } ].forEach( property => 
        {
            let map = new Map();

            if ( this.symbol )
                this.data.all.filter( record => record.symbol == this.symbol ).map( record => map.set( record[ property.key ], record ) );
            else
                this.data.all.map( record => map.set( record[ property.key ], record ) );

            let array = Array.from( map.keys() );
                array = array.map( item => t2.formats[ property.format ]( item ) );
            this.data[ property.key ] = array.sort( this.sort[ property.sort ] );
        } ); 
    };

    this.refresh = async function( record )
    {
        await this.queries();
        await this.setView( this.view );
        await this.setForm();

        if ( !record )
            return;

        this.highlight( record );
        this.symbol = record.symbol;
    };

    this.setDate = async function( record )
    {
        this.date = t2.formats.isoDate( record.datetime );

        delete this.from;
        delete this.to;

        t2.ui.breadcrumbs[ 3 ] = t2.formats.isoDate( this.date );
        breadcrumbs.setContent( t2.ui.breadcrumbs.join( "/" ) );

        await this.refresh( record );
    };

    this.setDates = async function( e )
    {
        e.preventDefault();

        let form = e.target; 
        let formdata = new FormData( form );

        Array.from( formdata.entries() ).forEach( field => self[ field[ 0 ] ] = field[ 1 ] );

        await self.setView( "date" );
        await self.setForm();
    };

    // add trade form
    this.setForm = async function()
    {
        let form = await t2.ui.addComponent( { id: "form", component: "form", parent: t2.ui.elements.get( "subcontent" ), module: this, horizontal: true } );
            form.form.addEventListener( "submit", this.handlers.create );
            /*form.addField( { 
                input: { name: "datetime", type: "datetime", value: ( input ) => 
                {
                    function set()
                    {
                        let datetime = new Date();

                        input.value = datetime.toISOString();
                    }

                    setInterval( set, 1000 );
                } }, 
                cell: { css: {}, display: 10.5 },
                format: [ "uppercase" ] } );*/
            form.addField( { 
                input: { name: "symbol", tag: "select", value: this.symbol }, 
                cell: { css: {}, display: 4 },
                format: [ "uppercase" ],
                options: this.data.symbol } );
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
            form.addField( { 
                input: { name: "brokerage", type: "hidden", value: "TDAmeritrade" }, 
                cell: { css: {}, display: 0 },
                format: [] } );    

        if ( !this.symbol )
            return;

        let max = this.to || t2.formats.isoDate( Date.now() );
        let min = this.from || t2.formats.isoDate( this.data.datetime[ 0 ] );

        let dates = await t2.ui.addComponent( { id: "dates", component: "form", parent: t2.ui.elements.get( "subcontent" ), module: this, horizontal: true } );
            dates.form.addEventListener( "submit", this.setDates );
            dates.addField( { 
                input: { name: "from", type: "date", value: min, min: min, max: max, required: "" }, 
                cell: { css: {}, display: 8 },
                format: [ "date" ] } );
            dates.addField( { 
                input: { name: "to", type: "date", value: max, min: min, max: max, required: "" }, 
                cell: { css: {}, display: 8 },
                format: [ "date" ] } );
            dates.addField( { 
                input: { type: "submit", value: "FILTER" }, 
                cell: { css: {}, display: 4 },
                format: [] } );       
    };

    this.setSymbol = function( symbol )
    {
        this.symbol = symbol;
        this.views = [ "Day", "Summary", "Edit", "Date", "Short", "Match", "Timeline" ];
    
        views.update( this.views );
    };

    this.setView = async function( view )
    {
        this.clear();
        
        this.view = view;
        
        let module = await import( `./trades.${ this.view }.js` );

        this.module = await new module.default( this );

        await this.module.init();

        t2.ui.breadcrumbs[ 1 ] = this.view;;
        breadcrumbs.setContent( t2.ui.breadcrumbs.join( "/" ) );  
        
        views.activate( this.view );
    };

    this.sort =
    {
        asc: ( a, b ) => ( a > b ) ? 1 : -1,
        desc: ( a, b ) => ( a < b ) ? 1 : -1
    };

    this.update = function()
    {
        breadcrumbs = t2.ui.components.get( "breadcrumbs" );
        symbols = t2.ui.components.get( "symbols" );
        views = t2.ui.components.get( "views" );
    };

    function fix()
    {
        /* clean up reverse split
        let data = self.data.all.filter( record => record.symbol == "SNDL" );
            data.forEach( async ( record ) => 
            {
                if ( record.brokerage == "TDAmeritrade" )
                {
                    record.qty /= 10;
                    record.price *= 10;
                }

                await t2.db.tx.update( self.table, record.id, new Data( record ) );
            } );
        */

        /* update symbol
        let data = self.data.all.filter( record => record.symbol == "NRZ" );
            data.forEach( async ( record ) => 
            {
                record.symbol = "RITM";

                await t2.db.tx.update( self.table, record.id, new Data( record ) );
            } );
        */

        /*
        let data = self.data.all;//.filter( record => ( record.action == "SELL" ) );
            data.forEach( async ( record ) => 
            {
                //record.action = "DIV";
                record.sign = ( record.action == "SELL" ) ? -1 : 1;
                record.qty = Math.abs( record.qty ) * record.sign;
                //record.brokerage = "TDAmeritrade";
                //record.notes = "";
                //record.sign = -1;
                //record.symbol = "ARCC";
                record.value = record.price * record.qty;
                console.log( record )

                await t2.db.tx.update( self.table, record.id, record );
            } );
        */

        /*let data = self.data.all;//.filter( record => record.symbol !== "TEST" );
            data.forEach( async ( record ) => 
            {   
                //let datetime = t2.common.addTime( record.date, record.time );
                
                //record.datetime = t2.formats.datetime( datetime );
                //record.date = t2.formats.isoDate( record.date );

                //await t2.db.tx.update( self.table, record.id, record );
                //console.log( record.id, record.datetime );
            } );*/

        /*let data = self.data.all;//.filter( record => record.id == 1199 );
            data.forEach( async ( _record ) => 
            {   
                let record =
                {
                    action: _record.action,
                    brokerage: _record.brokerage,
                    datetime: _record.datetime,
                    id: _record.id,
                    notes: _record.notes,
                    price: _record.price,
                    qty: _record.qty,
                    sign: _record.sign,
                    symbol: _record.symbol,
                    value: _record.value
                };

                await t2.db.tx.overwrite( self.table, record.id, record );     
            } );*/
    }
};

export default Trades;
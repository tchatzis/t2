import Data from "./trades.data.js";

const Trades = function()
{
    const self = this;
    
    this.actions = [ "BUY", "SELL" ];
    this.views = [ "Day", "Summary", "Transactions", "Match", "Timeline" ];

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
        let view = element.getAttribute( "data-link" );

        await this.setView( view.toLowerCase() );
        await this.setForm();
    };

    this.clear = () => t2.common.clear( [ "content", "margin", "subcontent", "submargin" ] );

    // side menu ( symbol )
    this.clicked = async function()
    {
        activate( arguments );
        
        let element = arguments[ 0 ].target;
        let symbol = element.getAttribute( "data-link" );

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

            this.refresh( record );
        
            form.elements.qty.value = null
            form.elements.price.value = null;
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

        await this.refresh();
    };

    this.queries = async () =>
    {
        this.table = "trades";

        let records = await t2.db.tx.retrieve( this.table );

        this.data = 
        {
            all: records.data    
        };

        [ { key: "date", format: "date", sort: "asc" }, { key: "symbol", format: "uppercase", sort: "asc" } ].forEach( property => 
        {
            let map = new Map();
            
            this.data.all.map( record => map.set( record[ property.key ], null ) );

            let array = Array.from( map.keys() );
                array = array.map( item => t2.formats[ property.format ]( item ) );

            this.data[ property.key ] = array.sort( this.sort[ property.sort ] );
        } );

        fix();
    };

    this.refresh = async function( record )
    {
        await this.queries();
        await this.setView( this.view );
        await this.setForm();
        
        this.highlight( record );
    };

    // add trade
    this.setForm = async function()
    {
        //let popup = await t2.ui.addComponent( { title: "Add Trade", component: "popup", parent: t2.ui.elements.get( "middle" ) } );

        let form = await t2.ui.addComponent( { id: "form", component: "form", parent: t2.ui.elements.get( "subcontent" ), module: this, horizontal: true } );
            form.form.addEventListener( "submit", this.handlers.create );
            form.addField( { 
                input: { name: "symbol", tag: "select", value: this.symbol }, 
                cell: { css: {}, display: 4 },
                format: [ "uppercase" ],
                options: this.data.symbol } );
            form.addField( { 
                input: { name: "qty", type: "number", value: "", min: 0, step: 0.0001, required: "" }, 
                cell: { css: {}, display: 4 },
                format: [ "time" ] } );
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
                input: { name: "brokerage", type: "hidden", value: "TDAmeritrade" }, 
                cell: { css: {}, display: 0 },
                format: [] } );    
    };

    this.setSymbol = function( symbol )
    {
        this.symbol = symbol;
    };

    this.setView = async function( view )
    {
        // TODO: activate the menu link

        this.clear();
        
        this.view = view;
        
        let module = await import( `./trades.${ this.view }.js` );

        this.module = await new module.default( this );

        await this.module.init();
    };

    this.sort =
    {
        asc: ( a, b ) => ( a > b ) ? 1 : -1,
        desc: ( a, b ) => ( a < b ) ? 1 : -1
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
    }
};

export default Trades;
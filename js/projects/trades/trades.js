import Data from "./trades.data.js";
import Forms from "./trades.forms.js";
import Handlers from "./trades.handlers.js";
import Totals from "./trades.totals.js";

const Trades = function()
{
    this.actions = [ "BUY", "SELL" ];
    
    this.clear = () => t2.common.clear( [ "content", "subcontent", "margin", "submargin" ] );

    this.count = function( data )
    {
        let symbol = this.symbols.get( data.symbol );
        let counts = this.actions.map( action => symbol[ action ].length );
        let count = Math.max( ...counts );

        return count;
    };
    
    this.forms = new Forms( this );
    
    this.handlers = new Handlers( this );

    this.init = async function()
    {
        // database stuff
        this.table = "history";
        this.db = await t2.db;
        await this.db.open( "trades", 2 );
        // await t2.db.tx.delete( this.table, 736 );
        this.records = await this.db.tx.retrieve( this.table );

        // set map of unique symbols
        this.unique();
        // split the buys and sells
        this.split();

        this.totals.init();

        return this;
    }

    // split the buy and sell data into arrays
    this.process = function( data )
    {
        let array = this.symbols.get( data.symbol )[ data.action ];

        array.push( data );
    };
    
    this.reload = async function( symbol )
    {
        this.records = await this.db.tx.filter( this.table, { symbol: symbol } );
 
        // clear the BUY and SELL arrays
        let map = this.symbols.get( symbol );  
        this.actions.forEach( action => map[ action ] = [] );
        // split the buys and sells
        this.split();

        this.totals.init();
        
        this.handlers.selected( symbol );
    };

    // normalize raw data;
    this.split = function()
    {
        this.records.data.forEach( ( record, index ) => 
        {               
            let id = this.records.id[ index ];
            let data = new Data( record );
                data.id = id;

            this.process( data );
            data.count = this.count( data );
        } );
    };

    this.symbols = new Map();
    
    // test the range of the data and disable out of range
    this.test = function( name )
    {
        let symbol = this.symbols.get( name );
        let bounds = new Map();
        let prices = ( action ) => symbol[ action ].map( prop => prop.price );
        let checks = [];
        
        this.actions.forEach( action => bounds.set( action, { min: Math.min( ...prices( action ) ), max: Math.max( ...prices( action ) ) } ) );
        this.actions.forEach( ( action, index ) => 
        {
            if ( index )
                symbol[ action ].forEach( data => data.disabled = data.price < bounds.get( this.actions[ 1 - index ] ).min ); // SELL is too low
            else
                symbol[ action ].forEach( data => data.disabled = data.price > bounds.get( this.actions[ 1 - index ] ).max ); // BUY is too high                        
        } );
    };
    
    this.totals = new Totals( this );

    // set the menu keys
    this.unique = () => this.records.data.forEach( record => 
    { 
        if ( record.symbol ) 
            this.symbols.set( record.symbol, { BUY: [], SELL: [] } ); 
    } );
};

export default Trades;
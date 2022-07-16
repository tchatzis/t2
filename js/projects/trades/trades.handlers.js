import Data from "./trades.data.js";

const Handlers = function( module )
{
    let self = this;
    let el = t2.common.el;

    this.checkbox = function( params )
    {
        // checkbox click handler
        
        Object.assign( params, { mode: module.mode, type: "Checkbox" } );
        
        let checkbox = t2.controls.init( params );   
            checkbox.listener( { type: "click", handler: () => self.checked.call( checkbox, params ) } ); 
            checkbox.init(); 
    };
    
    this.checked = async function( args )
    {
        // checkbox checked handler
        
        let popup = self.popup( args ); 
        let checkbox = this;   
        let params = { map: checkbox.map, mode: module.mode, name: args.name, parent: popup.element };
        
        self.list.call( popup, params );
    };
    
    this.clicked = async function()
    {
        // symbol menu click handler
        
        // activate / deactivate links
        let element = arguments[ 0 ].target;
            element.classList.add( "active" );

        let active = arguments[ 2 ];
            active.link?.classList.remove( "active" );
            active.link = element;
                
        // invoke /populate list
        let symbol = arguments[ 0 ].target.textContent;

        module.totals.subtotals = [];
        
        self.reset();
        self.matches = [];
        self.selected( symbol );
    };

    this.color = ( item ) => `hsla( ${ item.index / ( item.count + 1 ) * 360 }, 100%, 30%, 0.3 )`;
    
    this.create = async function( e, params )
    {
        // list: create form submit handler
        
        e.preventDefault();

        let formData = new FormData( e.target );
        let d = new Date();
        let string = d.toLocaleString().split( ", " );
        let date = string[ 0 ];
        let time = string[ 1 ];
        let data = {};
        data.date = date;
        data.time = time;

        Object.keys( params.item ).forEach( key => data[ key ] = formData.get( key ) );

        await t2.db.tx.create( module.table, new Data( data ) );
        
        e.target.elements.qty.value = null
        e.target.elements.price.value = null;

        module.reload( params.item.symbol );
    };
    
    this.delete = async function( action )
    {
        // popup : delete link handler
        
        let popup = this;
        let list = popup.components.get( "list" );
        let map = list.args.map;

        let proceed = confirm( "Are you sure you want to delete?" );

        if ( proceed )
        {
            let symbol;

            let promises = map.get( action ).map( async ( item ) => 
            {
                await t2.db.tx.delete( module.table, item.id );
  
                symbol = item.symbol;
            } ); 
            
            await Promise.all( promises ); 
            
            popup.close();
            module.reload( symbol );
        }
    };
    
    this.edit = function( action )
    {
        // popup : edit link handler
        
        let popup = this;
            popup.clear();
        
        let list = popup.components.get( "list" );
        let map = list.args.map;
        let params = { map: map, mode: "edit", name: action, parent: popup.element };

        self.list.call( popup, params );
    };
    
    this.empty = function( name )
    {
        let popup = this;
        let list = popup.components.get( "list" );
        let map = list.args?.map;

        if ( map ) 
        {
            map.set( name, [] );  
            list.args.array = [];
            list.args.map = map;
        }

        list.populate( list.args );
    };

    this.list = async function( params )
    {
        // popup : list
        
        let popup = this;
        
        console.log(params)
        
        if ( params.array?.length || params.map?.size )
        {
            let list = await popup.addComponent( { id: "Pairs", component: "list", parent: popup.element } );
                list.init( { id: params.name, parent: params.parent } );
                list.invoke( module.forms[ params.mode ] );
                list.populate( { map: params.map, mode: params.mode, name: params.name, orderBy: "price" } );   
        }
        else
            popup.close();
    };

    
    this.match = function( item )
    {
        // match and highlight equal qty and price range
        
        self.nomatches( item );
        
        let qty = Math.abs( item.qty );
        
        let { index, action, other } = self.other( item );

        self.matches = other.filter( data => 
        {
            let filters = [];

            if ( index )
                filters.push( data.price < item.price ); // SELL
            else
                filters.push( data.price > item.price ); // BUY

            filters.push( Math.abs( data.qty ) == qty );
            filters.push( !data.disabled );
            filters.push( !data.locked );

            return filters.every( bool => bool )
        } );

        self.matches.forEach( data => data.row.classList.add( "match" ) );
    };
    
    this.matches = [];

    this.other = function( item )
    {
        let index = module.actions.indexOf( item.action );
        let action = module.actions[ 1 - index ];
        let other = module.symbols.get( item.symbol )[ action ];
        
        return { index, action, other };
    };
    
    this.nomatches = function( item )
    {
        self.matches = [];
        
        module.actions.forEach( action =>
        {
            let items = module.symbols.get( item.symbol )[ action ];
                items.forEach( item => item.row.classList.remove( "match" ) );
        } );
    };

    this.pair = async function( item )
    {
        // pair buy and sell quantities
        
        function reduce( map )
        {
            return Array.from( map.values() ).reduce( ( prev, curr ) => prev + curr, 0 );
        }
        
        let action = self.pairs.get( item.action );
        let rows = self.pairs.get( "ROWS" );
        let items = self.pairs.get( "ITEMS" );
        let source = self.pairs.get( "SOURCE" );
        let all = self.pairs.get( "ALL" );
            all.set( item.id, item.row );
        
        // set / unset clicked rows
        if ( rows.get( item.id ) )
        {
            item.paired = false;
            rows.delete( item.id );
            items.delete( item.id );
            source.delete( item.id );
        }
        else
        {
            item.paired = true;
            rows.set( item.id, item.row );
            items.set( item.id, { ...item } );
            source.set( item.id, item );
        }
        
        // set / unset items
        if ( action.get( item.id ) )
        {
            action.delete( item.id );  
            item.row.classList.remove( "pairing" );
        }
        else
        {
            action.set( item.id, item.qty );
            item.row.classList.add( "pairing" );        
        }
        
        // compare the total quantities
        let BUY =  self.pairs.get( "BUY" );
        let buy = reduce( BUY );
        let SELL = self.pairs.get( "SELL" );
        let sell = reduce( SELL );
        
        // clear the classes
        Array.from( all.values() ).forEach( row => 
        {
            //row.style.backgroundColor = "transparent";
            row.classList.remove( "pairing" );
            row.classList.remove( "pair" );
        } );
        
        let array = Array.from( rows.values() );
        
        // set the classes
        if ( buy == sell )
        {
            array.forEach( row => 
            {
                row.classList.add( "pair" );
            } );
            
            // display clone in popup
            let popup = new t2.Popup( module );
                popup.addLink( { text: "Set", f: () => self.set.call( popup ) } );
                popup.init( { name: "Pairs", parent: t2.ui.getElement( "middle" ) } );

            let list = await popup.addComponent( { id: "Pairs", component: "list", parent: popup.element } );
                list.invoke( module.forms.read );
                list.populate( { array: Array.from( items.values() ), mode: "read", orderBy: "price" } );
        }
        else
        {
            array.forEach( row => 
            {
                row.classList.add( "pairing" );
            } );
            
            if ( module.popup )
                module.popup.close();
        }
    };
    
    this.popup = function( params )
    {
        let popup = new t2.Popup( module );
            popup.addLink( { text: "Edit",   f: () => self.edit.call( popup, params.name ) } );
            popup.addLink( { text: "Empty",  f: () => self.empty.call( popup, params.name ) } );
            popup.addLink( { text: "Delete", f: () => self.delete.call( popup, params.name ) } );
            popup.init( { name: params.name, parent: t2.ui.getElement( "middle" ) } );        
        
        return popup;
    };
    
    this.reset = function()
    {
        this.pairs = new Map();
        this.pairs.set( "BUY", new Map() );
        this.pairs.set( "SELL", new Map() );
        this.pairs.set( "ROWS", new Map() );
        this.pairs.set( "ITEMS", new Map() );
        this.pairs.set( "SOURCE", new Map() );
        this.pairs.set( "ALL", new Map() );        
    };
 
    this.selected = async function( symbol )
    {
        // populate the BUY and SELL lists
        
        t2.common.clear( [ "content", "subcontent", "margin", "submargin" ] );

        module.mode = "read";
        module.totals.reset();

        let list = async ( action ) =>
        {                        
            let array = module.symbols.get( symbol )[ action ];
            let list = new t2.List( module );
                list.init( { id: action, parent: t2.ui.elements.get( "content" ) } );
                list.listener( { type: "mouseover", handler: self.match } );
                list.listener( { type: "mouseout", handler: self.nomatches } );
                list.listener( { type: "click", handler: self.pair } );
                list.invoke( module.forms[ module.mode ] );
                list.invoke( self.checkbox );
                list.invoke( self.values );
                list.append( module.forms.create, 
                    { item: { symbol: symbol, action: action, qty: null, price: null, brokerage: "TDAmeritrade" }, name: action } );
                list.populate( { array: array, mode: module.mode, orderBy: "price" } );
            
            module.totals.content( action );
            module.totals.subcontent( action );
        };
        
        //module.totals.margin();
        
        let promises = module.actions.map( async( action ) => await list( action ) ); 

        await Promise.all( promises );  
        
        module.totals.submargin();
    };    

    this.set = function()
    {
        // set the color for the pairs

        let source = self.pairs.get( "SOURCE" );
        let array = Array.from( source.values() );
        let color = self.color( array[ array.length - 1 ] );
        let popup = this;
            popup.close();
 
        array.forEach( item => 
        {
            item.row.classList.remove( "match" );
            item.row.classList.remove( "pair" );
            item.row.style.backgroundColor = color;
        } );
        
        self.reset();
    };
    
    this.update = async function( e, params )
    {
        // popup: edit form submit handler
        
        e.preventDefault();

        let formData = new FormData( e.target );
        let d = new Date();
        let string = d.toLocaleString().split( ", " );
        let date = string[ 0 ];
        let time = string[ 1 ];
        let data = {};
        data.date = date;
        data.time = time;

        Object.keys( params.item ).forEach( key => data[ key ] = formData.get( key ) );

        await t2.db.tx.update( module.table, params.item.id, new Data( data ) );

        params.parent.remove();
        module.reload( params.item.symbol );
    };
    
    this.values = ( params ) => module.totals.values( params.name, params.item );
};

export default Handlers;
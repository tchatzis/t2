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

        let checkbox = this;   

        let popup = await t2.ui.addComponent( { title: args.name, component: "popup", parent: t2.ui.elements.get( "middle" ) } );
        let list = await t2.ui.addComponent( { id: args.name, component: "list", parent: popup.element } );
            popup.addLink( { text: "Edit",   f: () => self.edit.call( popup, checkbox ) } );
            popup.addLink( { text: "Delete", f: () => self.delete.call( popup, checkbox ) } );
            popup.update();

        let array = checkbox.map.get( args.name );

        if ( !array.length )
        {
            popup.close()
            return;
        }

        list.invoke( module.forms[ module.mode ] );
        list.populate( { array: array, orderBy: "price" } );
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
        
        //t2.common.remove( [ "popup" ] );
        
        self.reset();
        self.matches = [];
        self.selected( symbol );
    };

    this.color = ( n ) => `hsla( ${ n * 360 }, 100%, 30%, 0.3 )`;
    
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
    
    this.delete = async function( checkbox )
    {
        // popup : delete link handler

        let proceed = confirm( "Are you sure you want to delete?" );

        if ( !proceed )
            return;

        let array = checkbox.map.get( checkbox.name );
        let action;
        let symbol;

        let promises = array.map( async ( item, index ) => 
        {
            await t2.db.tx.delete( module.table, item.id );
            
            // remove item from array
            array.splice( index, 1 );

            // remove deleted row
            item.row.remove();

            action = item.action;
            symbol = item.symbol;
        } ); 

        await Promise.all( promises );
        
        // update the map
        checkbox.map.set( action, [] );

        let popup = this;
            popup.close();  
        
        module.reload( symbol );
    };
    
    this.edit = async function( checkbox )
    {
        // popup : edit link handler

        module.mode = "edit";
        
        let popup = this;
            popup.refresh();

        let array = checkbox.map.get( checkbox.name );

        if ( array.length )
        {
            let list = await t2.ui.addComponent( { id: "popup", component: "list", parent: popup.element } );
                list.map = checkbox.map;
                list.invoke( module.forms[ module.mode ] );
                list.populate( { array: array, orderBy: "price" } );
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
                items.forEach( item => item.row?.classList.remove( "match" ) );
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
            array.forEach( row => row.classList.add( "pair" ) );

            let popup = await t2.ui.addComponent( { title: "Related Transactions", component: "popup", parent: t2.ui.elements.get( "middle" ) } );
                popup.addLink( { text: "Set", f: ( e ) => self.set.call( popup ) } );
                popup.addLink( { text: "Unset", f: ( e ) => self.unset.call( popup ) } );
                popup.update();

            let list = await t2.ui.addComponent( { id: "related", component: "list", parent: popup.element } );
                list.invoke( module.forms.read );
                list.populate( { array: Array.from( items.values() ), orderBy: "price" } );
        }
        else
        {
            array.forEach( row => row.classList.add( "pairing" ) );
        }
    };

    function postTransaction( params )
    {
        let list = this;
        let array = list.array;
        let item = params.item;
        let index = array.findIndex( data => data == item );

        // remove item from array
        array.splice( index, 1 );

        // update the map
        list.map.set( item.action, array );

        // hide the popup if empty
        if ( !array.length )
        {
            let popup = t2.ui.components.get( "popup" );
                popup.close();
        }

        // remove updated row
        params.parent.remove();
        module.reload( item.symbol );
    }
    
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

        let parent = t2.ui.elements.get( "content" );

        let list = async ( action ) =>
        {                        
            let array = module.symbols.get( symbol )[ action ];
            let list = await t2.ui.addComponent( { id: action, component: "list", parent: parent, module: module } );
                list.addListener( { type: "mouseover", handler: self.match } );
                list.addListener( { type: "mouseout", handler: self.nomatches } );
                list.addListener( { type: "click", handler: self.pair } );
                list.invoke( module.forms[ module.mode ] );
                list.invoke( self.checkbox );
                list.invoke( self.values );
                list.append( module.forms.create, { item: { symbol: symbol, action: action, notes: "", qty: null, price: null, brokerage: "TDAmeritrade" }, name: action } );
                list.populate( { array: array, orderBy: "price" } );

            /*let schema = new t2.Schema( { action: "BUY" } );
            let columns = schema.init( { handler: ( e ) => e.preventDefault(), name: "trades", parent: content } );
                columns.setCell( { mode: module.mode, display: 4, name: "symbol",    css: null,               input: { type: "text", value: "TEST" } } );
                columns.setCell( { mode: module.mode, display: 3, name: "action",    css: { data: "action" }, input: { type: "text", value: "BUY" } } );
                columns.setCell( { mode: module.mode, display: 3, name: "notes",     css: { column: "" },     input: { type: "text", value: "" } } );
                columns.setCell( { mode: module.mode, display: 3, name: "qty",       css: { class: "info" },  input: { type: "number", value: "", min: 0, step: 1 } } );
                columns.setCell( { mode: module.mode, display: 4, name: "price",     css: null,               input: { type: "number", value: "", step: 0.001 } } );
                columns.setCell( { mode: module.mode, display: 8, name: "brokerage", css: null,               input: { type: "text", value: "TDAmeritrade" } } );
                columns.setCell( { mode: module.mode, display: 3,                    css: null,               input: { type: "submit", value: "add" } } );
                console.log( columns )*/
            
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
        let item = array[ array.length - 1 ];
        let index = Number( item.row.dataset.index );
        let count = Number( item.row.dataset.count );
        let n = Math.abs( ( index / count ) - ( index % 2 ) );
        let color = self.color( n );
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

    this.unset = function()
    {
        // unset the pairs

        let source = self.pairs.get( "SOURCE" );
        let array = Array.from( source.values() );
        let color = "transparent";
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
        // list: edit form submit handler

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

        postTransaction.call( this, params );
    };
    
    this.values = ( params ) => module.totals.values( params.name, params.item );
};

export default Handlers;
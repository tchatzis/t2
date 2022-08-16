import { aggregate, reset, total } from "./trades.aggregate.js";
import totals from "./trades.totals.js";

const Transactions = function( module )
{
    let self = this;
    let map = new Map();
    let marks = new Map();
    let match = new Map();
    let tbody;
    let subtotals = [];

    //let qty = 0;
   let average = 0;

    const round = ( n ) => Math.round( n * 100 ) / 100;
    
    this.init = async function()
    {
        if ( !module.symbol )
            return;

        t2.ui.breadcrumbs[ 2 ] = module.symbol;

        let records = module.data.all.filter( record => record.symbol ==  module.symbol );
        this.array = records.sort( ( a, b ) => a.price > b.price ? -1 : 1 );
        
        await actions( this.array );
        await lists();
        
        await process(); 

        reset();
        aggregate( module.symbol, this.array );
        totals( total );

        await results();
        await annotate();
    };

    async function lists()
    {
        let container = await t2.ui.addComponent( { id: "match", title: `Match ${ module.symbol } Transactions`, component: "container", parent: t2.ui.elements.get( "content" ), module: module } );

        let table = t2.common.el( "table", container.element );
        tbody = t2.common.el( "tbody", table );
    }

    // matched transactions
    async function results()
    {
        let container = await t2.ui.addComponent( { title: "Matches", component: "container", parent: t2.ui.elements.get( "content" ), module: module } );
        self.container = container.element;
        
        // margin subtotals
        let table = await t2.ui.addComponent( { title: "Subtotals", component: "table", parent: t2.ui.elements.get( "margin" ), module: module } );
            table.addColumn( { 
                input: { name: "qty", type: "number", step: 1, min: 0 }, 
                cell: { css: { class: "info" }, display: 3, modes: [ "read" ] } } );
            table.addColumn( { 
                input: { name: "price", type: "number", step: 0.001 }, 
                cell: { css: { class: "value" }, display: 4, modes: [ "read" ] },
                format: [ "precision" ] } );
            table.addColumn( { 
                input: { name: "value", type: "number", readonly: "" }, 
                cell: { css: { class: "value" }, display: 6, modes: [ "read" ] },
                format: [ "precision" ] } );
            table.setColumns( module.mode, true );

        self.subtotals = table;
    }

    async function actions()
    {
        let promises = [];

        async function setAction( action )
        {
            let array = self.array.filter( record => record.action == action );
            
            let prices = array.map( record => 
            {
                let price = Math.round( record.price * 100 ) / 100;

                if ( !marks.has( price ) )
                    marks.set( price, [] );

                marks.get( price ).push( record );
                
                return price;
            } );
            let min = Math.min.apply( null, prices );
            let max = Math.max.apply( null, prices );

            map.set( action, { data: array, properties: { count: array.length, min: min, max: max } } );

            return map.get( action );
        }

        // wait for both actions to be set
        module.actions.forEach( ( action ) => promises.push( setAction( action ) ) );

        return await Promise.all( promises );
    };

    function annotate()
    {
        let exp = 1 / self.step;
        let mark = Math.abs( Math.round( total.price * exp ) / exp );
        let tr = document.querySelector( `[ data-mark = "${ mark }" ]` );

        if ( tr )
            Array.from( tr.children ).forEach( td => td.classList.add( "highlight" ) );
    }

    // match functions
    async function display( id, array )
    {
        let table = await t2.ui.addComponent( { id: id, component: "table", parent: self.container, module: module } );  
            table.addColumn( { 
                input: { name: "id", type: "hidden" }, 
                cell: { css: {}, display: 0, modes: [ "read" ] },
                format: [] } );
            table.addColumn( { 
                input: { name: "action", type: "text" }, 
                cell: { css: { value: null }, display: 3, modes: [ "read" ] },
                format: [ "uppercase" ] } );
            table.addColumn( { 
                input: { name: "qty", type: "number", step: 1, min: 0 }, 
                cell: { css: { class: "info" }, display: 3, modes: [ "read" ] } } );
            table.addColumn( { 
                input: { name: "price", type: "number", step: 0.001 }, 
                cell: { css: { class: "value" }, display: 4, modes: [ "read" ] },
                format: [ "precision" ] } );
            table.addColumn( { 
                input: { name: "value", type: "number", readonly: "" }, 
                cell: { css: { class: "value" }, display: 6, modes: [ "read" ] },
                format: [ "precision" ],
                formula: ( args ) => 
                {
                    args.totals[ args.column ] += args.value;
                    
                    if ( args.record.action == "SELL" )
                    {
                        args.totals.qty += args.record.qty;
                        
                        args.totals.price = args.totals.value / args.totals.qty;
                    }

                    return args.value;
                } } );
            table.setColumns( module.mode );
            table.populate( { array: array, orderBy: "action" } );  
            table.setTotals();   
            
        return table.totals;
    }

    async function select( record )
    {
        this.preventDefault();
        this.stopPropagation();
        
        let tr = this.target.parentNode;

        if ( !match.has( "active" ) )
            match.set( "active", new Map() );
        
        // tr was already selected
        if ( match.get( "active" ).has( record.id ) )
        {
            //console.log( "exists" );
            
            tr.classList.remove( "pairing" );
            tr.classList.remove( "pair" );

            match.get( "active" ).delete( record.id );  

            let matched = match.get( "active" );
            let m = Array.from( matched.values() );
            let trs = m.map( o => o.tr )
                trs.forEach( tr => 
                {
                    tr.classList.remove( "pair" );
                    tr.classList.remove( "nomatch" );
                    tr.classList.remove( "disabled" );
                } );   
        }
        // fresh selection
        else
        {
            //console.log( "new" );
            
            let matched = match.get( "active" ).set( record.id, { tr: tr, record: record } );
            let m = Array.from( matched.values() );
            let qty = m.map( o => o.record.qty ).reduce( ( a, b ) => a + b, 0 );
            let value = m.map( o => o.record.value ).reduce( ( a, b ) => a + b, 0 );

            // only one is selected - no match possible
            if ( matched.size == 1 )
            {
                //console.log( "one" );
                
                tr.classList.add( "pairing" );

                return;
            }

            // enable selecting the same action
            if ( m.map( o => o.record.action ).every( action => action == record.action ) )
            {
                //console.log( "same action" );

                tr.classList.add( "pairing" );

                return;
            }

            // it's a match
            if ( !qty && value <= 0 )
            {
                //console.warn( "matched" );
                
                let trs = m.map( o => o.tr )
                    trs.forEach( tr => 
                    {
                        tr.classList.add( "pair" );
                        tr.classList.add( "disabled" );
                    } );

                // TODO: flag the records as matched - save ids
                let records = m.map( o => o.record );
                let total = await display( "matches", records );
                subtotals.push( total );

                self.subtotals.populate( { array: subtotals } );
                self.subtotals.setTotals();

                match.delete( "active" );

                return;
            }

            // the quantities are not matched
            if ( qty )
            {
                //console.log( "quantity", qty );

                tr.classList.add( "pairing" );

                return;
            }
            // no match possible
            else
            {
                //console.error( "Not a match", qty, value );

                tr.classList.add( "nomatch" );
                
                matched.delete( record.id );
            }
        } 
    }

    // display functions
    function process()
    {
        // dovetail the actions
        let unsorted = Array.from( marks.keys() );
        let sorted = unsorted.sort( ( a, b ) => a > b ? -1 : 1 );

        // calculate the scaling
        let min = Math.floor( sorted[ sorted.length -1 ] );
        let max = Math.ceil( sorted[ 0 ] );
        let log = Math.floor( Math.log10( max - min ) );
        let step = Math.pow( 10, ( log - 1 ) );
        let precision = Math.max( 2 * ( 2 - log ), 0 );

        self.step = step;
        //console.warn( log, precision, step )

        // create the rows
        for ( let p = max; p >= min; p -= step )
        {
            p = round( p );

            let cells = {};
            let high = round( p + step );
            let tr = t2.common.el( "tr", tbody );
                tr.setAttribute( "valign", "bottom" );
                tr.setAttribute( "data-mark", p );
            let price = t2.common.el( "td", tr );
                price.classList.add( "data" );
                price.classList.add( "value" );
                price.textContent = p.toFixed( precision );

            let columns = module.actions.concat( "values" );
                columns.forEach( action =>
                {
                    let td = t2.common.el( "td", tr );
                        td.setAttribute( "cellpadding", 0 );
                        td.setAttribute( "cellspacing", 0 );
                        td.setAttribute( "data-column", action );
                        td.style.borderLeft = "3px solid #222";
                        td.style.borderBottom = "1px solid #222";

                    cells[ action ] = td;
                } );

            // filter out marks in each range
            let prices = sorted.filter( mark => ( ( ( mark < high ) && ( mark >= p ) ) ) );

            tables( cells, prices, precision );
        }
    };

    function tables( cells, prices, precision )
    {
        prices.forEach( mark =>
        {    
            [ "BUY", "SELL" ].forEach( action =>
            {
                let actions =
                {
                    BUY: [ "BUY", "DIV" ],
                    SELL: [ "SELL" ]
                };

                let records = marks.get( mark );   
                let array = records.filter( record => actions[ action ].find( action => record.action == action ) );

                if ( array.length )
                    transactions( cells[ action ], array, action, precision );     
            } ); 
        } );
    }

    async function transactions( cell, array, action, precision )
    {
        let table = await t2.ui.addComponent( { id: action, component: "table", parent: cell, module: module } );
            table.handlers = { row: ( e, record ) => select.call( e, record ), update: module.handlers.update };    
            table.addColumn( { 
                input: { name: "action", type: "text" }, 
                cell: { css: { value: null }, display: 3, modes: [ "read" ] },
                format: [ "uppercase" ] } );
            table.addColumn( { 
                input: { name: "notes", type: "text" }, 
                cell: { css: { value: "action" }, display: 3, modes: [ "read" ] },
                format: [ "uppercase" ] } );
            table.addColumn( { 
                input: { name: "qty", type: "number", step: 1, min: 0 }, 
                cell: { css: { class: "info" }, display: 3, modes: [ "read" ] } } );
            table.addColumn( { 
                input: { name: "price", type: "number", step: 0.001 }, 
                cell: { css: { class: "value" }, display: 4, modes: [ "read" ] },
                format: [ "precision" ] } );
            table.addColumn( { 
                input: { name: "value", type: "number", readonly: "" }, 
                cell: { css: { class: "value" }, display: 6, modes: [ "read" ] },
                format: [ "precision" ] } );
            table.setColumns( module.mode, true );
            table.populate( { array: array } ); 
    }
};

export default Transactions;
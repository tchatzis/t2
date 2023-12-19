import Common from "../../t2/t2.container.handlers.js";

const Panel = function( module )
{
    let self = this;
    let actions = [ "BUY", "SELL" ];
    let arrays = {};
    let limit = 1.2001;
    let delay = 100;
    let round = ( action, value ) => 
    {
        switch ( action )
        { 
            case "BUY":
                return Math.floor( ( value * limit ) * 1000 ) / 1000;

            case "SELL":
                return Math.ceil( ( value / limit ) * 1000 ) / 1000;  
        }
    };
    let comparator = ( a, b ) => { return { 
        BUY:  Math.abs( a.qty ) == Math.abs( b.qty ) && a.price <= b.price && a.price * limit > b.price,/* && a.brokerage == b.brokerage,*/ 
        SELL: Math.abs( a.qty ) == Math.abs( b.qty ) && a.price >= b.price && a.price < b.price * limit,/* && a.brokerage == b.brokerage */
    } };
    let match;
    let panel;
    let tables = {};

    this.init = async function( parent, params )
    {
        panel = await parent.addContainer( { id: "panel", type: "box", format: "flex-left", css: [ "panel" ] } );

        this.element = panel.element;
        this.type = panel.type;

        Object.assign( this, params );
        Common.call( this );
    };

    this.refresh = async function()
    {
        await module.queries(); 

        let records = module.data.filtered;

        if ( !records )
            return;

        await navigation();

        match = new Map();
    };

    async function navigation()
    {
        await t2.navigation.update(
        [ 
            { id: "submenu", functions: [ { ignore: "clear" } ] }, 
            { id: "subcontent", functions: [ { ignore: "clear" } ] },
            { id: "submargin", functions: [ { ignore: "clear" } ] },
            { id: "menu", functions: [ { ignore: "clear" } ] },
            { id: "content", functions: [ { ignore: "clear" } ] },
            { id: `content.panels.${ self.id }`, functions: [ { clear: null }, { invoke: [ { f: start, args: null } ] } ] },
            { id: "margin", functions: [ { ignore: "clear" } ] }
        ] );
    }

    // invoke this function
    async function start()
    {
        let results = await sort( module.data.filtered );
            results.forEach( result => 
            {
                tables[ result.action ].populate( { array: result.array, orderBy: "price" } );
                tables[ result.action ].setTotals();
            } ); 

        let { accepted, rejected } = await scan( "BUY", "highlight", delay );
        
        await execute( accepted );

        // split buys and sells
        async function sort( records )
        {
            const promises = [];
            
            actions.forEach( action =>
            {
                let actions =
                {
                    BUY: [ "BUY" ], //, "DIV"
                    SELL: [ "SELL" ]
                };

                let array = records.filter( record => actions[ action ].find( action => record.action == action ) );

                arrays[ action ] = array;

                if ( array.length )
                    promises.push( transactions( action, array ) );
            } );

            return await Promise.all( promises );
        }

        // start the matching scripts
        async function execute( accepted )
        {
            let array = group( accepted );

            await grouped();

            tables.grouped.populate( { array: array } );
            tables.grouped.setTotals();
        }
    }

    // table of transactions - display element
    async function transactions( action, array )
    {
        let outline = await panel.addContainer( { id: action, type: "box", format: "block" } );
        let opp = actions[ 1 - actions.indexOf( action ) ];

        let transactions = await outline.addComponent( { id: action, type: "table" } );
            transactions.addRowListener( { type: "click", handler: select } );
            transactions.addColumn( { 
                input: { name: "action", type: "text" }, 
                cell: { css: { value: "action" }, display: 3, modes: [ "read" ] },
                format: [ "uppercase" ] } );
            transactions.addColumn( { 
                input: { name: "qty", type: "number", step: 1 }, 
                cell: { css: { class: "number" }, display: 3, modes: [ "read" ] },
                format: [ "precision" ] } );
            transactions.addColumn( { 
                input: { name: "price", type: "number", step: 0.001 }, 
                cell: { css: { class: "number" }, display: 4, modes: [ "read" ] },
                format: [ "precision" ] } );
            transactions.addColumn( { 
                input: { name: "target", type: "number", step: 0.001 }, 
                cell: { css: { class: opp.toLowerCase() }, display: 4, modes: [ "read" ] },
                format: [ "precision" ],
                formula: ( args ) => round( action, args.record.price ) } );
            transactions.addColumn( { 
                input: { name: "value", type: "number", step: 0.001 }, 
                cell: { css: { class: "number" }, display: 5, modes: [ "read" ] },
                format: [ "dollar" ],
                formula: ( args ) => 
                {
                    let value = args.record.action == "DIV" ? 0 : args.value;
                    
                    args.totals.value += value;
                    args.totals.price = args.totals.value / args.totals.qty;

                    return value;
                } } );

            transactions.addColumn( { 
                input: { name: "brokerage", type: "hidden" }, 
                cell: { css: { class: "value" }, display: 0, modes: [ "read" ] },
                format: [] } );

        tables[ action ] = transactions;

        return { action: action, array: array };
    }

    // iterate through the table data
    async function scan( action, css, delay )
    {
        let array = arrays[ action ];
        let accepted = [];
        let rejected = [];

        async function iterator( i, active )
        {
            let data =  array[ i ];

            if ( !data )
            {
                active.classList.remove( css ); 
                return;
            }

            let tr = row( action, data, css );

            let found = find( action, data, accepted );

            if ( found )
            {
                await t2.common.delay( () =>
                {
                    tables[ action ].removeRow( data );
                    tables[ other( action ) ].removeRow( found );
                }, delay )

                accepted.push( { [ action ]: data, [ other( action ) ]: found } );
            }
            else
                rejected.push( data.id );

            if ( i < array.length )
            {
                i++;

                active = tr;

                [ "highlight", "pairing" ].forEach( css => active?.classList.remove( css ) );
                
                await t2.common.delay( iterator, 0, i, tr );                    
            };    
        }

        await iterator( 0, null );

        return { accepted, rejected };
    }

    // group the matched transactions
    function group( accepted )
    {
        let grouped = [];

        accepted.forEach( group => 
        {
            let totals = { qty: 0, price: 0, value: 0 };
            let previous = { action: null };
            let percent = 0;
            
            actions.forEach( action =>
            {
                let data = group[ action ]; 
                let value = data.qty * data.price * data.sign.value;

                grouped.push( data );

                switch ( data.action )
                {
                    case "BUY":   
                        previous = { action: data.action, value: value };           
                    break;

                    /*case "DIV":   
                        data.qty *= -1;
                        data.price *= -1;
                        previous = { action: data.action, value: -value };   
                        value = 0;        
                    break;*/

                    case "SELL":
                        percent = -Math.round( ( ( previous.value + value ) / previous.value ) * 10000 ) / 100;
                        previous = { action: data.action, value: 0 };
                    break;
                }


                totals.price += data.price;// * data.sign
                totals.qty += -data.qty;// * data.sign
                totals.value += value;
            } );

            let id = t2.common.uuid();
            let total = { id: id, action: "GAIN", notes: percent, qty: totals.qty, price: totals.price, value: totals.value, brokerage: "none" };//, sign: 1
            grouped.push( total );
        } );

        return grouped;
    }

    // automated matched transactions - display element
    async function grouped()
    {
        let outline = await panel.addContainer( { id: "grouped", type: "box", format: "block" } );
        
        let transactions = await outline.addComponent( { id: "grouped", type: "table" } );
            transactions.addColumn( { 
                input: { name: "action", type: "text" }, 
                cell: { css: {}, display: 3, modes: [ "read" ] },
                format: [ "uppercase" ] } );
            transactions.addColumn( { 
                input: { name: "notes", type: "text" }, 
                cell: { css: { value: "brokerage" }, display: 3, modes: [ "read" ] },
                format: [ "uppercase" ] } );
            transactions.addColumn( { 
                input: { name: "qty", type: "number", step: 1 }, 
                cell: { css: { class: "number" }, display: 3, modes: [ "read" ] },
                format: [ "precision" ],
                formula: ( args ) => 
                {
                    if ( args.record.action == "SELL" )
                    {
                        args.totals[ args.column ] += args.value; 
                    }
                     
                    return args.record[ args.column ];// * args.record.sign
                } } );
            transactions.addColumn( { 
                input: { name: "price", type: "number", step: 0.001 }, 
                cell: { css: { class: "number" }, display: 4, modes: [ "read" ] },
                format: [ "precision" ],
                formula: ( args ) => 
                {
                    args.totals[ args.column ] = 0; 

                    return args.value;
                } } );
            transactions.addColumn( { 
                input: { name: "value", type: "number", readonly: "" }, 
                cell: { css: { class: "number" }, display: 4, modes: [ "read" ] },
                format: [ "dollar" ],
                formula: ( args ) => 
                {
                    let value = args.value;
                    
                    if ( args.record.action == "GAIN" )
                    {
                        args.totals[ args.column ] += value; 

                        if ( args.record.notes )
                        {
                            let hue = args.record.notes * 6;

                            transactions.hsl( args.record.id, hue );
                        }
                    }
                    else if ( args.record.action == "DIV" )
                    {
                        value = 0;
                    }

                    return value;
                } } );
            transactions.addColumn( { 
                input: { name: "brokerage", type: "hidden" }, 
                cell: { css: { class: "value" }, display: 0, modes: [ "read" ] },
                format: [] } );

        tables.grouped = transactions;
    }

    // tr selector
    function row( action, data, css )
    {
        if ( action == "DIV" )
            action = "BUY";
        
        let table = tables[ action ].element;
        
        let tr = table.querySelector( `[ data-id = "${ data.id }" ]` );

        if ( css )
            tr?.classList.add( css );

        return tr;
    }

    // find a match
    function find( action, data, excluded )
    {
        //if ( action == "DIV" )
        //    action = "BUY";
        
        let array = arrays[ other( action ) ];

        return array.find( record => !excluded.find( item => record.id == item[ other( action ) ].id ) && comparator( data, record )[ action ] );
    }

    // get other action
    function other( action )
    {
        //if ( action == "DIV" )
        //    action = "BUY";
        
        return actions[ 1 - actions.indexOf( action ) ];
    }
    
    // manually select unmatched
    async function select( args )
    {
        let debug = false;
        
        let record = args.data;
        let action = record.action;

        if ( action == "DIV" )
            action = "BUY";

        let tr = row( action, record, null );

        if ( !match.has( "active" ) )
            match.set( "active", new Map() );

        if ( debug )
            console.warn( record )

        // tr was already selected
        if ( match.get( "active" ).has( record.id ) )
        {
            if ( debug )    
                console.log( "exists" );
            
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
            if ( debug )
                console.log( "new" );
            
            let matched = match.get( "active" ).set( record.id, { tr: tr, record: record } );
            let m = Array.from( matched.values() );
            let qty = Math.round( m.map( o => o.record.qty * o.record.sign * ( ( o.record.action == "DIV" ) ? -1 : 1 ) ).reduce( ( a, b ) => ( a + b ), 0 ) * 10000 ) / 10000;
            let value = Math.round( m.map( o => o.record.value * o.record.sign ).reduce( ( a, b ) => ( a + b ), 0 ) * 10000 ) / 10000;

            if ( debug )
                console.log( record.action, qty, value, record.sign );

            // only one is selected - no match possible
            if ( matched.size == 1 )
            {
                if ( debug )
                    console.log( "one" );
                
                tr.classList.add( "pairing" );

                return;
            }

            // enable selecting the same action
            if ( m.map( o => o.record.action ).every( _action => _action == action ) )
            {
                if ( debug )
                    console.log( "same action" );

                tr.classList.add( "pairing" );

                return;
            }

            // it's a match
            if ( !qty && value >= 0 )
            {
                if ( debug )
                    console.warn( "matched", value );
                
                let trs = m.map( o => o.tr )
                    trs.forEach( tr => 
                    {
                        tr.classList.add( "disabled" );
                        tr.classList.add( "hidden" );
                    } );

                let r = Array.from( match.get( "active" ).values() ).map( data => data.record );
                    r.forEach( record => record.matched = true );
                let qty = Math.round( r.map( o => o.qty ).reduce( ( a, b ) => ( a + b ), 0 ) * 10000 ) / 10000;// * o.sign * ( ( o.action == "DIV" ) ? -1 : 1 )
                let sell = Math.round( r.map( o => o.qty * ( ( o.action == "SELL" ) ? 1 : 0 ) ).reduce( ( a, b ) => ( a + b ), 0 ) * 10000 ) / 10000;// * o.sign
                let v = Math.round( r.map( o => o.value ).reduce( ( a, b ) => ( a + b ), 0 ) * 10000 ) / 10000;// * o.sign
                let total = { id: "", action: "GAIN", notes: "", qty: qty, price: Math.round( v / sell * 10000 ) / 10000, value: v, brokerage: "none" };//, sign: 1

                r.forEach( record => 
                {
                    let action = record.action;

                    if ( record.action == "DIV" )
                        action = "BUY";
                    
                    tables[ action ].removeRow( record );
                } );
                
                r.push( total );

                tables.grouped.populate( { array: tables.grouped.array.concat( r ) } );

                [ "BUY", "SELL", "grouped" ].forEach( table => tables[ table ].setTotals() );

                match.delete( "active" );

                return;
            }

            // the quantities are not matched
            if ( qty )
            {
                if ( debug )
                    console.log( "quantity", qty );

                tr.classList.add( "pairing" );

                return;
            }
            // no match possible
            else
            {
                if ( debug )
                    console.error( "Not a match", qty, value );

                tr.classList.add( "nomatch" );

                matched.delete( record.id );

                await t2.common.delay( () => tr.classList.remove( "nomatch" ), 5000 );
            }
        } 
    }
};

export default Panel;
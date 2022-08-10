const Transactions = function( module )
{
    let self = this;
    let map = new Map();
    let marks = new Map();
    let match = new Map();
    let tbody;
    let qty = 0;
    let total = 0;
    let average = 0;

    const round = ( n ) => Math.round( n * 100 ) / 100;
    
    this.init = async function()
    {
        if ( !module.symbol )
            return;

        let records = module.data.all.filter( record => record.symbol ==  module.symbol );
        let array = records.sort( ( a, b ) => a.price > b.price ? -1 : 1 );
        
        await actions( array );

        let table = t2.common.el( "table", t2.ui.elements.get( "content" ) );
        tbody = t2.common.el( "tbody", table );

        process(); 
        annotate();
    };

    async function actions( _array )
    {
        let promises = [];

        async function setAction( action )
        {
            let array = _array.filter( record => record.action == action );
            
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
        let mark = Math.round( average * exp ) / exp;
        let tr = document.querySelector( `[ data-mark = "${ mark }" ]` );

        if ( tr )
            Array.from( tr.children ).forEach( td => td.style.backgroundColor = "#111" );
    }

    // match functions
    async function display( id, array )
    {
        let table = await t2.ui.addComponent( { id: id, component: "table", parent: t2.ui.elements.get( "margin" ), module: module } );
            table.handler = module.handlers.update;    
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
                cell: { css: { class: "info" }, display: 3, modes: [ "read" ] },
                formula: ( args ) => args.totals[ args.column ] += args.record.action == "SELL" ? args.record.qty : 0 } );
            table.addColumn( { 
                input: { name: "price", type: "number", step: 0.001 }, 
                cell: { css: { class: "value" }, display: 4, modes: [ "read" ] },
                format: [ "precision" ],
                formula: ( args ) => args.totals[ args.column ] = Math.abs( args.totals.value / args.totals.qty ) } );
            table.addColumn( { 
                input: { name: "value", type: "number", readonly: "" }, 
                cell: { css: { class: "value" }, display: 6, modes: [ "read" ] },
                format: [ "precision" ] } );
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
            console.log( "new" );
            
            let matched = match.get( "active" ).set( record.id, { tr: tr, record: record } );
            let m = Array.from( matched.values() );
            let qty = m.map( o => o.record.qty * o.record.sign ).reduce( ( a, b ) => a + b, 0 );
            let value = m.map( o => o.record.value ).reduce( ( a, b ) => a + b, 0 );

            // only one is selected - no match possible
            if ( matched.size == 1 )
            {
                console.log( "one" );
                
                tr.classList.add( "pairing" );

                return;
            }

            // enable selecting the same action
            if ( m.map( o => o.record.action ).every( action => action == record.action ) )
            {
                console.log( "same action" );

                tr.classList.add( "pairing" );

                return;
            }

            // it's a match
            if ( !qty && value >= 0 )
            {
                console.warn( "matched" );
                
                let trs = m.map( o => o.tr )
                    trs.forEach( tr => 
                    {
                        tr.classList.add( "pair" );
                        tr.classList.add( "disabled" );
                    } );

                

                // TODO: flag the records as matched - save ids
                let records = m.map( o => o.record );
                await display( "x", records );

                //let ids = Array.from( matched.keys() );

                match.delete( "active" );
            }
            // not a match
            else
            {
                console.error( "Not a match", qty, value );



                tr.classList.add( "nomatch" );
                
                matched.delete( record.id );
            }
        } 
    }

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
            module.actions.forEach( action =>
            {
                let records = marks.get( mark );   
                let array = records.filter( record => record.action == action );

                if ( array.length )
                    transactions( cells[ action ], array, action, precision );     
            } ); 

            values( cells.values, precision );
        } );
    }

    function transactions( cell, array, action, precision )
    {
        let table = t2.common.el( "table", cell );
        let tbody = t2.common.el( "tbody", table );

        array.forEach( record =>
        {
            let tr = t2.common.el( "tr", tbody );

                //tr.addEventListener( "mouseover", ( e ) => highlight.call( e, record ) );
                //tr.addEventListener( "mouseout", ( e ) => cancel.call( e, record ) );
                tr.addEventListener( "click", ( e ) => select.call( e, record ) );

            let a = t2.common.el( "td", tr );
                a.classList.add( action.toLowerCase() );
                a.classList.add( "data" );
                //a.classList.add( "noclick" );

            let n = t2.common.el( "td", tr );
                n.classList.add( action.toLowerCase() );
                n.classList.add( "data" );
                //n.classList.add( "noclick" );

            let q = t2.common.el( "td", tr );
                q.classList.add( "number" );
                q.classList.add( "data" );
                //q.classList.add( "noclick" );

            let p = t2.common.el( "td", tr );
                p.classList.add( "data" );
                p.classList.add( action );
                //p.classList.add( "noclick" );

            let value = Math.abs( record.value ) * record.sign;
                
            let v = t2.common.el( "td", tr );
                v.classList.add( "value" );
                v.classList.add( "data" );
                //v.classList.add( "noclick" );
                v.textContent = value.toFixed( 2 );

            if ( record.action == action )
            {
                a.textContent = action;
                n.textContent = record.notes;
                q.textContent = record.qty;
                p.textContent = record.price.toFixed( precision );
                p.setAttribute( "data-action", action ); 
            }
            else
            {
                let space = "<br>";
                
                a.innerHTML = space;
                n.innerHTML = space;
                q.innerHTML = space;
                x.innerHTML = space;
            }

            // calculations
            qty += Math.abs( record.qty ) * -record.sign;  
            total += value;
        } );
    }

    function values( cell, precision )
    {
        let table = t2.common.el( "table", cell );
        let tbody = t2.common.el( "tbody", table );
        let tr = t2.common.el( "tr", tbody );

        let q = t2.common.el( "td", tr );
            q.classList.add( "data" );
            q.textContent = round( qty );

        let t = t2.common.el( "td", tr );
            t.classList.add( "value" );
            t.classList.add( "data" );
        if ( total > 0 && !qty )
            t.classList.add( "buy" );
        if ( total < 0 && !round( qty ) )
            t.classList.add( "sell" );
            t.textContent = total.toFixed( 2 );

        average = round( Math.abs( total / round( qty ) ) );

        let p = t2.common.el( "td", tr );
            p.classList.add( "data" );
        if ( qty )
            p.textContent = average.toFixed( precision );
    }
};

export default Transactions;
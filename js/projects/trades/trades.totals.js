const Totals = function( module )
{
    let el = t2.common.el;

    this.clear = () => t2.common.clear( [ "margin" ] );
    
    this.columns = new Map();
    
    // content: BUY and SELL lists
    this.content = function( action )
    {
        this.columns.set( action, this.aggregate[ action ] );
    };
    
    this.init = function()
    {
        this.reset();
        this.element = el( "div", t2.ui.elements.get( "margin" ) );
        this.element.classList.add( "list" ); 
    };
 
    this.margin = function()
    {
        this.reset();

        t2.common.sort( this.subtotals, "index" ).forEach( obj => 
        {             
            let row = el( "div", t2.ui.elements.get( "margin" ) );
                row.classList.add( "row" );
                row.style.borderColor = obj.item.color;

            let cell = el( "div", row );
                cell.classList.add( "data" );
                cell.textContent = obj.subtotal.toFixed( 2 ); 
        } );

        let row = el( "div", t2.ui.elements.get( "margin" ) );
            row.classList.add( "row" );

        let cell = el( "div", row );
            cell.classList.add( "data" );
            cell.classList.add( "info" );
            cell.textContent = this.total().toFixed( 2 );  
    };
       
    this.reset = function()
    {
        this.clear();
        this.aggregate = { BUY: { qty: 0, value: 0 }, SELL: { qty: 0, value: 0 } };
    };
    
    this.subcontent = function( action )
    {
        let parent = t2.ui.elements.get( "subcontent" );
        let map = this.columns.get( action );
            map.avg = ( map.value && map.qty ) ? ( map.value / map.qty ).toFixed( 2 ) : null;
            map.avg = map.avg ? Math.abs( map.avg ) : null;
        
        let row = el( "div", parent );
            row.classList.add( "row" );
        
        let cell = el( "div", row );
            cell.classList.add( "data" );
            cell.textContent = "Totals";
        
        let array = [ action, [ "qty", 0 ], [ "avg", 2 ], [ "value", 2 ] ];
            array.forEach( column =>
            {
                let cell = el( "div", row );
                    cell.classList.add( "data" );
                    cell.classList.add( "totals" );
                    cell.textContent = Array.isArray( column ) ? Number( map[ column[ 0 ] ] ).toFixed( column[ 1 ] ) : column;
            } );
    };
    
    this.submargin = function()
    {
        let qty = this.columns.get( "BUY" ).qty - this.columns.get( "SELL" ).qty;
        let value = this.columns.get( "SELL" ).value + this.columns.get( "BUY" ).value;
        let avg = qty ? value / qty : value / this.columns.get( "SELL" ).qty;
        let condition = 1 - ( value > 0 );
        let css = module.actions[ condition ].toLowerCase();
        let color = [ "green", "red" ][ condition ];

        let row = el( "div", t2.ui.elements.get( "submargin" ) );
            row.classList.add( "row" );
            row.style.borderLeftColor = color;

        let qtyEl = el( "div", row );
            qtyEl.classList.add( "data" );
            qtyEl.classList.add( "totals" );
            qtyEl.textContent = qty.toFixed( 0 );            

        let avgEl = el( "div", row );
            avgEl.classList.add( "data" );
            avgEl.classList.add( "totals" );
            avgEl.textContent = avg.toFixed( 2 );            

        let valEl = el( "div", row );
            valEl.textContent = value.toFixed( 2 );
            valEl.classList.add( "data" );
            valEl.classList.add( "totals" );
            valEl.classList.add( css );        
    };

    this.subtotal = function( item, other )
    {
        let map = new Map();
        let array = Array.from( arguments );
            array.forEach( data => map.set( data.action, data ) );
        let sell = map.get( "SELL" );
        let buy  = map.get( "BUY" );
        let subtotal = sell.value + buy.value;

        this.subtotals.push( { index: item.index, item: item, subtotal: subtotal } );       
    };

    this.subtotals = [];

    this.total = function() 
    {
        let total = 0;

        this.subtotals.forEach( obj => total += obj.subtotal );

        return total;
    };

    this.values = function( action, item )
    {
        this.aggregate[ action ].qty += item.qty;
        this.aggregate[ action ].value += item.value;
    };
};

export default Totals;
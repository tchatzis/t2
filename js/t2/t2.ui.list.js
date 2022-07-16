const List = function( module )
{
    let self = this;
    let forms = [];
    let handlers = [];
    let invokes  = [];
    //let refreshes = [];
    let el = t2.common.el;

    this.append = async function( f, params )
    {
        let row = el( "div", self.element );
            row.classList.add( "row" );
            row.classList.add( "create" );

        params.parent = row;
        
        let form = await f( params );

        self.element.appendChild( form );
    };
    
    this.clear = () => this.element.innerHTML = null;

    this.init = function( params )
    {
        params.parent = t2.common.getParent( params );
        
        this.element = el( "div", params.parent );
        this.element.dataset.id = params.id;
        this.element.classList.add( "list" );

        this.id = params.id;
    };
    
    this.invoke = function( f )
    {
        invokes.push( f );
    };
    
    this.listener = function( event )
    {
        handlers.push( event );
    };

    this.populate = function( args )
    {
        this.args = args;
        this.clear();

        let array = args.map ? Array.from( args.map.get( args.name ) ) : args.array;

        t2.common.sort( array, args.orderBy ).forEach( ( item, index ) => 
        {             
            let row = el( "div", self.element );
                row.classList.add( "row" );
                row.setAttribute( "data-id", item.id );
            if ( item.disabled )
                row.classList.add( "disabled" );
            
            handle.call( row, item );

            item.index = index;
            item.list = self;
            item.row = row;

            let cell = el( "div", row );
                cell.classList.add( "data" );
                cell.textContent = index + 1;
            
            invoke( { item: item, name: this.id, parent: row } );
        } );
    };

    function handle( item )
    {
        handlers.forEach( event =>
        {
            this.addEventListener( event.type, ( e ) => event.handler( item ) );
        } );
    }
    
    function invoke( params )
    {
        invokes.forEach( f => f( params ) );
    }
};

export default List;
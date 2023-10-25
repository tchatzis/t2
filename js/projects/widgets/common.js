const Common = function()
{
    const delim = ",";
    const self = this;

    this.children = new Map();

    this.params.uuid = t2.common.uuid();

    this.action = 
    {
        add: ( widget ) =>
        {
            widget.action.attach.call( widget, this ); 
        },
        attach: ( parent ) => 
        {
            this.parent = parent;

            this.parent.element.appendChild( this.element );

            this.parent.children.set( this.params.id, this );
        },
        detach: () =>
        {
            this.parent.element.removeChild( this.element );

            this.parent.children.delete( this.params.id );
        },
        get: ( args ) => args.hasOwnProperty( "id" ) ? this.children.get( args.id ) : find( args ),
        init: ( args ) =>
        {
            let widget = args.widget;
                widget.parent = args.parent;

            this.children.set( widget.params.id, widget );
        },
        remove: ( widget ) =>
        {
            widget.action.detach.call( widget, this );

            this.children.delete( widget.params.id );
        }
    };

    this.content =
    {
        add: ( content ) => 
        {
            let type = typeof content;

            if ( !this.content[ type ] )
                throw ( `${ type } ( ${ content } ) is not defined` );

            let node = this.content[ type ]( content );

            this.element.appendChild( node );
        },
        object: ( object ) => 
        {
            let pre = document.createElement( "pre" );
                pre.textContent = JSON.stringify( object );

            return pre;
        },
        number: ( number ) => document.createTextNode( number ),
        string: ( string ) => document.createTextNode( string )
    };

    this.css = 
    {
        add: ( cls ) => this.element.classList.add( cls ),
        contains: ( cls ) => this.element.classList.contains( cls ),
        list: () => [ ...self.element.classList ],
        remove: ( cls ) => this.element.classList.remove( cls ),
    };

    this.data =
    {
        array: [],
        count: () => this.data.array.length,
        //define: ( data ) => this.data.value = data,
        delete: async ( record ) => {},
        filter: ( key, operator, value ) => 
        {
            let copy = [ ...this.data.array ];
            
            let filtered = copy.filter( record => eval( "record[ key ]" + operator + "value" ) );

            this.data.array = [ ...filtered ];

            return this.data.array;
        },
        get: async ( table ) => 
        {
            this.params.table = table;

            let object = await t2.db.tx.retrieve( table );
            
            this.data.raw = object.data;
            this.data.array = [ ...this.data.raw ];
        },
        insert: ( data ) => {},
        packet: {},
        populate: async ( f ) => 
        {
            let fulfill = new t2.common.Fulfill();
            
            this.data.array.forEach( ( record, index ) => fulfill.add( f( record, index ) ) );

            let widgets = await fulfill.resolve();

            widgets.forEach( widget => widget.parent.element.appendChild( widget.element ) );
        },
        query: async ( table ) => {},
        records: () => this.data.raw.length,
        refresh: () => {},
        replace: async ( record ) => {},
        set: ( array ) => 
        {
            this.data.raw = array;
            this.data.array = [ ...this.data.raw ];
        },
        share: ( widget ) => 
        {
            this.data.raw = widget.data.raw;
            this.data.array = widget.data.array;
        },
        sort: ( key, direction ) => 
        {
            const sorter =
            {
                asc:  ( a, b ) => ( a[ key ] > b[ key ] ) ? 1 : -1,
                desc: ( a, b ) => ( a[ key ] < b[ key ] ) ? 1 : -1
            };

            if ( sorter[ direction ] )
            {
                let copy = [ ...this.data.array ];  
                let sorted = copy.sort( sorter[ direction ] );

                this.data.array = [ ...sorted ];
            }
            else
               throw( `sort direction "${ direction }" is not defined` );
        },
        update: async ( record ) => {},
        value: new Set()
    };

    this.display =
    {
        config: {},
        disable: () => {},
        flag: () => {},
        hide: () => {},
        redact: () => {},
        set: ( config ) => this.display.config = config,
        show: () => {},

    };

    this.dom = 
    {
        append: ( element ) => this.element.appendChild( element ),
        dimensions: () => this.element.getBoundingClientRect(),
        clear: () => 
        {
            while ( this.element.hasChildNodes() )
                this.element.removeChild( this.element.firstChild );
        },
        id: ( id ) => this.element.setAttribute( "id", id ),
        ignore: ( name ) => 
        {   
            let ignore = datasetToArray( this.element, "ignore" );
                ignore.push( name );
  
            this.element.dataset.ignore = ignore.join( delim );
        },
        insert: ( element ) => this.parent.element.insertBefore( element, this.element ),
        remove: () => this.element.remove(),
        replace: ( element ) => this.parent.element.replaceChild( element, this.element ),
        reset: () => 
        {
            [ ...this.parent.element.children ].forEach( element => 
            {
                let ignore = datasetToArray( element, "ignore" );
                let invoke = datasetToArray( element, "invoke" );

                invoke.forEach( action => 
                {
                    if ( !ignore.find( a => a == action ) )
                        this.action[ action ]();
                } );

                //console.log( "ignore", ignore );
                //console.log( "invoke", invoke );
            } );
        }
    };

    this.event = 
    {
        broadcaster:
        {
            add: ( config ) => 
            {
                let widget = config.packet.widget;
    
                config.packet.type = config.type;

                this.event.broadcaster.types.add( config.type );
    
                const event = new CustomEvent( config.packet.broadcaster.params.uuid, { detail: config.packet } );  
    
                widget.element.addEventListener( config.type, function( e ) 
                { 
                    if ( e.type == "contextmenu" )
                        e.preventDefault();
    
                    e.stopPropagation();
    
                    if  ( e.type == config.type )
                        this.dispatchEvent( event );
                 } );
            }, 
            dispatch: ( config ) =>
            {
                config.packet.type = config.type;
                
                const event = new CustomEvent( config.packet.broadcaster.params.uuid, { detail: config.packet } );  

                document.dispatchEvent( event );
            },
            state: false,
            types: new Set()
        },
        Packet: function( config )
        {
            this.broadcaster = config.broadcaster || config.widget;
            this.label = config.label
            this.index = config.index || 0;
            this.record = config.record;
            this.value = config.value;
            this.widget = config.widget;
        },
        subscribe: ( args ) => 
        { 
            this.event.subscriptions.set( args.type, args.broadcaster );

            const f = ( e ) => 
            {
                let packet = e.detail;

                if ( packet.type == args.type )
                    args.handler ? args.handler( packet ) : t2.common.debug( `${ this.params.class }: [ ${ args.type } ] subscription handler missing`, "red" );
            };

            this.element.addEventListener( args.broadcaster.params.uuid, f );
            document.addEventListener( args.broadcaster.params.uuid, f );
        },
        subscriptions: new Map(),
    };

    this.handlers = {};

    // utility functions
    function datasetToArray( element, name )
    {
        let dataset = element.dataset?.[ name ];

        return dataset ? dataset.split( delim ) : [];
    }

    function paramsToDataset()
    {
        for ( let prop in self.params )
        {
            self.element.dataset[ prop ] = self.params[ prop ];
        }
    }

    const find = ( args ) =>
    {
        for ( let [ id, widget ] of this.children )
        {
            let packet = widget.data.packet;
            let properties = Object.keys( args );

            for ( let prop of properties )
            {
                if ( packet.label.hasOwnProperty( prop ) && packet.label[ prop ] == args[ prop ] )
                    return widget;
            }
        }
    }

    paramsToDataset();
};

export default Common;
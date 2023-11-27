import Internals from "../widgets/widget.internals.js";

const Table = function( params )
{ 
    // required
    this.element = document.createElement( "table" );

    // common
    Internals.call( this, params );

    // extend internals
    this.add.head = () =>
    {
        let th = document.createElement( "th" );
        let tr = document.createElement( "tr" );
            tr.appendChild( th );

        head = document.createElement( "thead" );
        head.appendChild( tr );

        for ( let column in schema )
        {
            let config = schema[ column ];

            if ( config.display )
            {
                let th = document.createElement( "th" );
                    th.textContent = config.label;

                tr.appendChild( th );
            }
        }

        this.element.appendChild( head );
    };

    this.add.body = async () =>
    {
        body = document.createElement( "tbody" );

        await this.populate();
    
        this.element.appendChild( body );
    };

    this.add.foot = () =>
    { 
        const td = document.createElement( "td" );
        const tr = document.createElement( "tr" );
            tr.appendChild( td );

        foot = document.createElement( "tfoot" );
        foot.appendChild( tr );

        for ( let column in schema )
        {
            let config = schema[ column ];

            if ( config.display )
            {
                let td = document.createElement( "td" );

                if ( config.total?.calculation )
                {
                    this.set.total( column );

                    td.textContent = t2.formats[ config.format ]( config.total.value );
                    td.classList.add( "totals" );
                }

                tr.appendChild( td );
            }
        }

        this.element.appendChild( foot );
    };

    this.add.row = async ( record ) =>
    {
        const uuid = t2.common.uuid();
        const th = document.createElement( "th" );
            th.classList.add( "autonumber" );
        const tr = document.createElement( "tr" );
            tr.appendChild( th );
            tr.setAttribute( "data-id", record[ this.config.primaryKey ] );
            tr.setAttribute( "data-uuid", uuid );
            tr.classList.add( "hover" );

        record.uuid = uuid;

        for ( let column in schema )
        {
            let config = schema[ column ];

            if ( config.display )
            {
                let div = document.createElement( "div" );
                    div.classList.add( "data" );
                    
                let td = document.createElement( "td" );
                    td.classList.add( "cell" );
                
                td.appendChild( div );
                tr.appendChild( td );

                let load = async () =>
                {                              
                    let widget = await this.add.widget( { id: column, path: params.path, widget: config.widget, config: config, record: record } );
                        widget.add.column( { key: column, display: true, format: config.format, classes: [], primaryKey: true } );
                        widget.set.source( () => 
                        {
                            if ( config.source )
                            {
                                widget.set.data( config.source );

                                return widget.get.data();
                            }
                            else if ( widget.config.primitive )
                            {
                                return t2.formats[ config.format ]( record[ config.key ] );
                            } 
                        } );
                        widget.set.element( div );
                        widget.set.config( "record", record );

                    config.classes.forEach( cls => widget.add.css( cls ) );

                    return widget;
                };

                fulfill.add( load() );
            }
        }

        body.appendChild( tr );
    };

    this.handlers.click = ( args ) => 
    {
        let record = args.widget.config.record;

        this.event.send( { key: this.config.primaryKey, record: record, value: record[ this.config.primaryKey ], widget: args.widget } );
    };  
    
    let previous = null;

    this.set.highlight = ( params ) =>
    {
        if ( previous )
            previous.classList.remove( "highlight" );
        
        let tr = body?.querySelector( `[ data-${ params.key } = "${ params.value }" ]` );
            tr?.classList.add( "highlight" );

        if ( tr )
            previous = tr;
    };

    // widget specific
    let array;
    var head, body, foot, schema;
    //let array = [];
    let fulfill;
    
    this.render = async function()
    {
        schema = this.get.schema();

        array = await this.refresh();
        this.set.data( array );
        
        // table components
        this.add.head();
        await this.add.body();
        this.add.foot();

        // post drawing
        this.renumber();
        this.resize();

        return this;
    };

    this.populate = async function()
    {
        fulfill = new t2.common.Fulfill();

        body.innerHTML = null;

        //let array = this.get.data();

        if ( this.config.sort )
            array = this.get.copy().sort( this.sort[ this.config.sort.direction ] );
            array.forEach( record => this.add.row( record ) );

        const completed = new t2.common.Fulfill();

        let widgets = await fulfill.resolve();
            widgets.forEach( widget => completed.add( widget.render() ) );

        const rendered = await completed.resolve();
            rendered.forEach( ( widget, index ) => completed.add( widget.add.handler( { event: "click", handler: this.handlers.click, record: null } ) ) );
    };

    this.resize = () =>
    {
        const widths = [];
        
        if ( !body.lastChild )
            return;

        calculate();
        resize(); 

        function calculate()
        {
            const children = Array.from( body.lastChild.children );
                children.forEach( ( td, index ) => 
                {
                    let el = td.firstChild?.firstChild ? td.firstChild.firstChild : td;
                    let bbox = el.getBoundingClientRect();
                    let th = head?.firstChild.children[ index ];
                    let tf = foot?.firstChild.children[ index ];
                    let width = Math.round( bbox.width ) + "px";

                    widths.push( width );

                    if ( th ) th.style.width = width;
                    if ( tf ) tf.style.width = width;
                } );
        }

        function resize()
        { 
            Array.from( body.children ).forEach( tr => Array.from( tr.children ).forEach( ( td, index ) => td.style.width = widths[ index ] ) );
        }  
    };

    this.renumber = () =>
    {
        if ( body )
        {
            const children = Array.from( body.children );
                children.forEach( ( tr, index ) => 
                {
                    tr.firstChild.textContent = index + 1;
                } );

            foot.firstChild.firstChild.textContent = children.length;
        }
    };
};

export default Table;
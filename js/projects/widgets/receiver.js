import Internals from "../widgets/widget.internals.js";

const Receiver = function( params )
{ 
    // required
    this.element = document.createElement( "div" );

    // common
    Internals.call( this, params );

    // extend externals
    this.add.log = ( params ) => 
    {
        const detail = params.detail;
        const timestamp = document.createElement( "ul" );
            timestamp.classList.add( "datetime" );
            timestamp.textContent = t2.formats[ "date&time" ]( Date.now() );
        const source = document.createElement( "ul" );
            source.classList.add( "object" );
            source.textContent = `((( ${ detail.source.attributes.id }.${ detail.channel } ))) ${ Array.from( detail.source.event.subscribers.keys() ).map( widget => widget.attributes.class ) }`;
            source.setAttribute( "data-index", index );
        const details = document.createElement( "ul" );
            details.classList.add( "string" );
            details.innerHTML = `{ id: <span class="number">${ detail.id }</span>, value: <span class="map">${ detail.value }</span> }`;
        const record = document.createElement( "ul" );
            record.classList.add( "code" );
            record.textContent = JSON.stringify( detail.record );

        source.appendChild( details );
        source.appendChild( record );
        timestamp.appendChild( source );
        div.appendChild( timestamp );

        div.scrollTop = div.scrollHeight;

        index++;
    };

    this.remove.log = ( index ) =>
    {
        let div = this.element.querySelector( `[ data-index = '${ index } ]` );
            div?.remove();
    };   

    this.handlers.click = ( args ) => this.event.send( { channel: args.channel || "toggle", widget: args.widget } );
    this.handlers.contextmenu = ( args ) => this.event.send( { channel: args.channel || "clear", widget: args.widget } );

    this.set.active = ( widget ) => this.handlers.click( { channel: "activate", widget: widget } );
    this.set.inactive = ( widget ) => this.handlers.click( { channel: "deactivate", widget: widget } );
    this.set.clear = ( widget ) => this.handlers.click( { channel: "clear", widget: widget } );

    // widget specific
    let index = 0;
    let div = document.createElement( "div" );

    this.render = async () =>
    {
        this.add.css( "receiver" );

        this.element.appendChild( div );

        this.event.receive( { channel: [ "clear" ], source: this, handler: clear } );
        this.event.receive( { channel: [ "toggle" ], source: this, handler: toggle } );
        this.event.receive( { channel: [ "activate" ], source: this, handler: activate } );
        this.event.receive( { channel: [ "deactivate" ], source: this, handler: deactivate } );

        this.add.handler( { event: "click", handler: this.handlers.click, record: null } );
        this.add.handler( { event: "contextmenu", handler: this.handlers.contextmenu, record: null } );

        return this;
    };

    const activate = ( e ) =>
    {
        let widget = e.detail.widget;
            widget.element.classList.remove( "collapsed" );
    };

    const deactivate = ( e ) =>
    {
        let widget = e.detail.widget;
            widget.element.classList.add( "collapsed" );
    };

    const clear = ( e ) =>
    {
        e.preventDefault();
        e.stopPropagation();
        
        div.innerHTML = null;
    };

    const toggle = ( e ) =>
    {
        let widget = e.detail.widget;

        if ( widget.element.classList.contains( "collapsed" ) )
        {
            activate( e );
        }
        else
        {
            deactivate( e );
        }
    };
};

export default Receiver;
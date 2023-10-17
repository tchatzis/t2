const Handlers = function()
{
    let previous = null;
    
    // menu
    this.handlers.activate = ( args ) =>
    {
        let link = this.action.get( args );

        if ( link )
            activate( link.data.packet );
    };

    this.handlers.disable = ( args ) =>
    {
        let link =this.action.get( args );

        if ( link )
            link.css.add( "disabled" );
    };

    this.handlers.enable = ( args ) =>
    {
        let link = this.action.get( args );

        if ( link )
            link.css.remove( "disabled" );
    };

    this.handlers.flag = ( args ) =>
    {
        let link = this.action.get( args );

        if ( link )
            link.css.add( args.css );
    };

    this.handlers.unflag = ( args ) =>
    {
        let link = this.action.get( args );

        if ( link )
            link.css.remove( args.css );
    };

    
    // carousel


    // multi
    this.handlers.toggle = ( packet ) =>
    {
        const widget = packet.widget;

        widget.event.state = !widget.event.state;

        let type = "select";
        let copy = new this.event.Packet( packet );
        
        if ( widget.event.state )
        {
            widget.css.add( "selected" );
            this.data.value.add( copy.value );
        }
        else
        {
            widget.css.remove( "selected" );
            this.data.value.delete( copy.value );
        }

        this.event.broadcaster.add( { type: type, packet: copy } );
        this.event.broadcaster.dispatch( { type: type, packet: copy } );
    };

    // private functions
    const activate = ( packet ) =>
    { 
        const widget = packet.widget;

        if ( previous == widget )
            return;

        if ( previous )
        {
            previous.css.remove( "active" );
            previous.event.state = false;
        }

        previous = widget;

        widget.css.add( "active" );
        widget.event.state = true;

        let type = "activate";
        let copy = new this.event.Packet( packet );

        this.data.value.add( copy.value );

        this.event.broadcaster.add( { type: type, packet: copy } );
        this.event.broadcaster.dispatch( { type: type, packet: copy } );
    };
};

export default Handlers;
import Handlers from "./t2.container.handlers.js";

const Component = function()
{
    let self = this;
    let listeners = [];
    let panels = new Map();
    
    this.init = async function( params )
    {        
        let direction;
        
        switch ( params.format )
        {
            case "horizontal":
                direction = "row";
            break;

            case "vertical":
                direction = "column";
            break;
        }
        
        this.element = t2.common.el( "div", this.parent.element );
        this.element.classList.add( "panels" );
        this.element.style.flexDirection = direction;

        this.panels = new Map();

        Object.assign( this, params );

        Handlers.call( this );
    };

    this.addListener = function( listener )
    {
        listeners.push( listener );
    };

    this.addPanel = function( params )
    {
        panels.set( params.id, params );
    };

    this.render = async function()
    {
        let formats = { tabs: self.format, title: "text" };
        let promises = [];
        let types = [ ...arguments ];
        let array = Array.from( panels.keys() );
        let components = [];

        // first argument
        if ( types[ 0 ] )
            components.push( types[ 0 ] );

        // added containers
            components = components.concat( array );

        // remaining components
        if ( types.length > 1 )
        {
            let args = [ ...types ];
                args.splice( 0, 1 );
            components = components.concat( args );
        }

        // add in order
        components.forEach( ( id ) => promises.push
        (    
            new Promise( ( resolve ) =>
            {
                let condition = panels.get( id );
                let config = condition ? { f: "addContainer", p: panels.get( id ) } : { f: "addComponent", p: { id: id, type: id, format: formats[ id ] } };

                let component = self[ config.f ]( config.p );

                resolve( component );   
            } )  
        ) );

        // hide the panel containers
        let result = await Promise.all( promises );
            result.forEach( c => 
            {
                if ( c.class == "Container" )
                {
                    c.element.classList.add( "hidden" );
                    this.panels.set( c.id, c );
                };
            } );

        
        if ( components.find( id => id == "tabs" ) )
            setTabs.call( this );

        return this.panels;
    };

    // hook to tabs component
    function setTabs()
    {
        let tabs = this.children.get( "tabs" );
            tabs.clear();

        listeners.forEach( listener => tabs.addListener( listener ) );
 
        Array.from( this.panels.entries() ).forEach( panel => tabs.addTab( ...panel ) );
    };
};

export default Component;
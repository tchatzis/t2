import Handlers from "./t2.container.handlers.js";

const Component = function()
{
    let self = this;
    let listeners = [];
    //let panels = new Map();
    
    this.init = async function( params )
    {        
        let direction;
        
        switch ( params.output )
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

    this.refresh = function()
    {

    };

    this.setComponent = async function( params )
    {
        let module = await this.addComponent( params );

        if ( params.label )
        {
            this.panels.set( params.id, module );
            module.hide();
        }

        return module;
    };

    this.setContainer = async function( params )
    {
        let module = await this.addContainer( params );

        if ( params.label )
        {
            this.panels.set( params.id, module );
            module.hide();
        }

        return module;
    };

    this.setModule = async function( params )
    {
        let module = await this.addModule( params );

        if ( params.label )
        {
            this.panels.set( params.id, module );
            module.hide();
        }

        return module;
    };

    /*this.render = async function()
    {
        let formats = { tabs: self.format, title: "text" };
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
        async function load( i )
        {
            let id = components[ i ];
            let condition = panels.get( id );
            let config = condition ? { f: "addContainer", p: panels.get( id ) } : { f: "addComponent", p: { id: id, type: id, format: formats[ id ] } };
            let component = await self[ config.f ]( config.p );

            if ( condition )
            {
                component.element.classList.add( "hidden" );
                self.panels.set( id, component );
            }

            if ( i < components.length - 1 )
            {
                i++;
                await load( i );
            } 
        }

        await load( 0 );

        if ( components.find( id => id == "tabs" ) )
            setTabs.call( this );

        return this.panels;
    };*/

    // hook to tabs component
    /*function setTabs()
    {
        let tabs = self.children.get( "tabs" );
            //tabs.clear();

        listeners.forEach( listener => tabs.addListener( listener ) );
 
        Array.from( this.panels.entries() ).forEach( panel => tabs.addTab( ...panel ) );
    };*/
};

export default Component;
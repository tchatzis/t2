import Common from "./t2.common.handlers.js";

const Handlers = function()
{
    this.addComponent = async function( params )
    {   
        let module    = await import( `../t2/t2.ui.component.${ params.type }.js` );
        let component = await new module.default();
            component.id = params.id;
            component.parent = this;
            component.path = new Map();
            component.path.set( params.id, this.path.get( this.id ).concat( params.id ) );
            component.init( params );  

        this.adopt( component, params );

        return component;
    };

    this.addContainer = async function( params )
    {
        let module    = await import( `../t2/t2.ui.container.${ params.type }.js` );
        let container = await new module.default();
            container.id = params.id;
            container.parent = this;
            container.path = new Map();
            container.path.set( params.id, this.path.get( this.id ).concat( params.id ) );
            container.init( params ); 
    
        this.adopt( container, params );

        return container;
    };

    this.addFunction = async function( params )
    {
        params.type = "content";
        params.format = "block";

        let panel = await this.addComponent( params );
            panel.id = params.id;
            panel.parent = this;
            panel.path = new Map();
            panel.path.set( params.id, this.path.get( this.id ).concat( params.id ) );
            panel.refresh = async () => await params.config.function.apply( this, params.config.arguments );
            
        return panel;
    };

    this.addModule = async function( params )
    {
        let module    = await import( params.config.src );
        let object = await new module.default( ...params.config.arguments );
            object.id = params.id;
            object.parent = this;
            object.path = new Map();
            object.path.set( params.id, this.path.get( this.id ).concat( params.id ) );
            await object.init( this, params ); 
        
        this.adopt( object, params );

        return object;
    };

    this.clear = () => Array.from( this.element.children ).forEach( child => 
    {
        if ( !t2.common.ignored( "clear", child ) )
            child.remove();     
    } );

    this.delete = ( id ) => t2.ui.children.delete( id );

    this.empty = () => Array.from( this.element.children ).forEach( child => 
    { 
        console.log( this.element.id, child.id ); 
    } );  

    this.ignore = function( f )
    {
        let ignore = this.element.dataset.ignore?.split( "," ) || [];

        if ( !ignore.find( prop => f == prop ) )
            ignore.push( f );
        
        this.element.dataset.ignore = ignore.toString();
    };

    this.invoke = async function( functions )
    {
        let container = this;
        
        async function invoke( index )
        {
            let func = functions[ index ];

            await func.f.call( container, func.args );

            if ( index < functions.length - 1 )
                await invoke( index + 1 );
        }
        
        await invoke( 0 );
    };

    this.remove = () => this.element.remove();

    this.children = new Map();

    Common.call( this );
};

export default Handlers;
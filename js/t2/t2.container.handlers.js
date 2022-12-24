import Common from "./t2.common.handlers.js";

const Handlers = function()
{
    this.addComponent = async function( params )
    {   
        if ( t2.ui.children.has( params.id ) )
            return t2.ui.children.get( params.id );
        
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
        if ( t2.ui.children.has( params.id ) )
            return t2.ui.children.get( params.id );

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
            ignore.push( f );
        
        this.element.dataset.ignore = ignore.toString();
    };

    this.remove = () => this.element.remove();

    this.children = new Map();

    Common.call( this );
};

export default Handlers;
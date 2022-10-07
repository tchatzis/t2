import Common from "./t2.common.handlers.js";

const Handlers = function()
{
    this.addComponent = async function( params )
    {
        let module    = await import( `../t2/t2.ui.component.${ params.type }.js` );
        let component = await new module.default();
            component.parent = this;
            component.path = new Map();
            component.path.set( params.id, this.path.get( this.id ).concat( params.id ) );
            component.init( params );  

        let path = component.path.get( params.id ).join( "." );
        t2.ui.children.set( path, component );

        this.children.set( params.id, component );

        return component;
    };

    this.addContainer = async function( params )
    {
        let module    = await import( `../t2/t2.ui.container.${ params.type }.js` );
        let container = await new module.default();
            container.parent = this;
            container.path = new Map();
            container.path.set( params.id, this.path.get( this.id ).concat( params.id ) );
            container.init( params ); 
    
        let path = container.path.get( params.id ).join( "." );
        t2.ui.children.set( path, container );
        
        this.children.set( params.id, container );

        return container;
    };

    this.addModule = async function( params )
    {
        let module    = await import( params.config.src );
        let object = await new module.default( ...params.config.arguments );
            object.parent = this;
            object.path = new Map();
            object.path.set( params.id, this.path.get( this.id ).concat( params.id ) );
            await object.init( this, params ); 
        
            let path = object.path.get( params.id ).join( "." );
            t2.ui.children.set( path, object );
        
        this.children.set( params.id, object );

        Object.assign( object, params );

        return object;
    };

    this.clear = () => Array.from( this.element.children ).forEach( child => child.remove() );

    this.children = new Map();

    Common.call( this );
};

export default Handlers;
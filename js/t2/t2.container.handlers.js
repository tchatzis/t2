const Handlers = function()
{
    this.addComponent = async function( params )
    {
        let module    = await import( `../t2/t2.ui.component.${ params.type }.js` );
        let component = await new module.default();
            component.parent = this;
            component.init( params );   
        
        this.children.set( params.id, component );

        return component;
    };

    this.addContainer = async function( params )
    {
        let module    = await import( `../t2/t2.ui.container.${ params.type }.js` );
        let container = await new module.default();
            container.parent = this;
            container.init( params );   
        
        this.children.set( params.id, container );

        return container;
    };

    this.class = this.constructor.name;

    this.clear = () => Array.from( this.element.children ).forEach( child => child.remove() );

    this.children = new Map();

    this.element.setAttribute( "data-id", this.id );
    this.element.setAttribute( "data-type", this.type );
    this.element.setAttribute( "data-class", this.class );
    
    this.hide = () => this.element.classList.add( "hidden" );

    this.remove = () => this.element.remove();

    this.show = () => this.element.classList.remove( "hidden" );
};

export default Handlers;
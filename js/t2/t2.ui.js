import Handlers from "./t2.container.handlers.js";

const UI = function()
{
    let self = this;

    function Element( element )
    {
        this.element = element;
        this.id = this.element.id;
        this.type = "element";
    };
    
    this.addComponent = async function( componentParams )
    {
        let module    = await import( `../t2/t2.ui.${ componentParams.component }.js` );
        let component = await new module.default( componentParams.module );
            component.init( componentParams );
        
        this.components.set( componentParams.id, component );

        return component;
    };

    this.addContainer = async function( params )
    {
        let module    = await import( `../t2/t2.ui.${ params.type }.js` );
        let container = await new module.default();
            container.init( params );
        
        this.containers.set( params.id, container );

        return container;
    };

    this.root = async function( params )
    {
        let elParams = new Element( params );

        this.elements.set( elParams.id, elParams );

        Handlers.call( elParams );

        return elParams;
    };

    this.addElement = async function( params )
    {
        let element = t2.common.el( "div", params.parent );
            element.id = params.id;
        if ( params.ignore )
            element.setAttribute( "data-ignore", params.ignore );

        let rooted = await self.root( element );

        return rooted;
    };

    this.components = new Map();

    this.containers = new Map();
    
    this.elements = new Map();
    
    this.getElement = ( id ) => this.elements.get( id );

    this.init = function( elArray )
    {
        elArray.forEach( elParams => this.addElement( elParams ) );
    };

};

export default UI;
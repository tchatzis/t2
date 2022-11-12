import Handlers from "./t2.container.handlers.js";

const UI = function()
{
    let self = this;

    function Element( element )
    {
        this.element = element;
        this.id = this.element.id;
        this.type = "element";
        this.path = new Map();
    };

    this.root = async function( element )
    {
        let elParams = new Element( element );

        elParams.path.set( elParams.id, [ elParams.id ] );
        elParams.format = getComputedStyle( element ).getPropertyValue( "display" );

        let path = elParams.path.get( elParams.id ).join( "." );

        this.children.set( path, elParams );

        Handlers.call( elParams );

        return elParams;
    };

    this.addElement = async function( params )
    {
        if ( t2.ui.children.get( params.id ) )
            return;
        
        let element = t2.common.el( "div", params.parent );
            element.id = params.id;
        if ( params.ignore )
            element.setAttribute( "data-ignore", params.ignore );
        if ( params.css )
            element.classList.add( params.css );

        let root = await self.root( element );

        return root;
    };

    this.children = new Map();

    this.clear = ( array ) => array.forEach( id => 
    {
        let child = t2.ui.children.get( id );
            child.clear();
        
        //t2.ui.children.delete( id );
    } );

    this.init = function( elArray )
    {
        elArray.forEach( elParams => this.addElement( elParams ) );
    };

};

export default UI;
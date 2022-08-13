const UI = function()
{
    let self = this;

    this.addComponent = async function( componentParams )
    {
        let module    = await import( `../t2/t2.ui.${ componentParams.component }.js` );
        let component = await new module.default( componentParams.module );
            component.init( componentParams );
        
        this.components.set( componentParams.id, component );

        return component;
    };
    
    this.addElement = function( elParams )
    {
        let parent = t2.common.getParent( elParams );
        let element = t2.common.el( "div", elParams.parent );
            element.id = elParams.id;
        if ( elParams.ignore )
            element.setAttribute( "data-ignore", elParams.ignore );

        self.elements.set( elParams.id, element );

        return element;
    };

    this.components = new Map();
    
    this.elements = new Map();
    
    this.getElement = ( id ) => this.elements.get( id );

    this.init = function( elArray )
    {
        elArray.forEach( elParams => this.addElement( elParams ) );

        this.addElement( { id: "popup", ignore: "clear", parent: self.elements.get( "wrapper" ) } );
    };
};

export default UI;
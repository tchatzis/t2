const UI = function()
{
    let self = this;
    
    this.addElement = function( elParams )
    {
        let parent = t2.common.getParent( elParams );
        let element = t2.common.el( "div", elParams.parent );
            element.id = elParams.id;
        if ( elParams.ignore )
            element.setAttribute( "data-ignore", elParams.ignore );

        self.elements.set( elParams.id, element );
    };
    
    this.elements = new Map();
    
    this.getElement = ( id ) => this.elements.get( id );

    this.init = function( elArray )
    {
        elArray.forEach( elParams => this.addElement( elParams ) );
    };

    
};

export default UI;
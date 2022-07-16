const Popup = function( module )
{
    let self = this;
    let el = t2.common.el;
    let tools = [];
    
    
    this.addComponent = async function( componentParams )
    {
        let module    = await import( `../t2/t2.ui.${ componentParams.component }.js` );
        let component = await new module.default();
            component.init( componentParams );
        
        this.components.set( componentParams.component, component );

        return component;
    };

    this.addLink = function( link )
    {
        tools.push( link );
    };
    
    this.clear = () => t2.common.clear( [ "popup", "toolbar" ] );

    this.close = function()
    {
        self.clear();
        self.element.classList.add( "hidden" );
    };
    
    this.components = new Map();

    this.init = function( params )
    {
        if ( !module.popup )
        {
            // new element
            self.parent = params.parent;
            self.element = el( "div", self.parent );
            self.element.setAttribute( "data-ignore", "clear" );
            self.element.classList.add( "popup" );

            module.popup = self;
            t2.ui.elements.set( "popup", self.element );
        }
        else
        {
            // recycled element
            self.element = module.popup.element;
            self.element.classList.remove( "hidden" );
            self.clear();
        }
        
        self.tools( params );
    };
    
    this.tools = function( params )
    {
        let flex = el( "div", self.element );
            flex.classList.add( "flex" );

        let toolbar = el( "div", flex );
            toolbar.id = "toolbar";
            toolbar.classList.add( "toolbar" );
            self.toolbar = toolbar;

        //let title = el( "div", toolbar );
        //    title.classList.add( "title" );
        //    title.textContent = params.name;

        let close = el( "div", flex );
            close.classList.add( "icon" );
            close.textContent = "X";
            close.addEventListener( "click", () => self.close.call( module ) );   

        links.call( module );
        
        tools = [];
    };

    function links()
    {
        tools.forEach( params => 
        {
            let link = el( "div", self.toolbar );
                link.classList.add( "tool" );
                link.textContent = params.text;
                link.addEventListener( "click", () => params.f.call( self ) ); 
        } );
    }
};

export default Popup;
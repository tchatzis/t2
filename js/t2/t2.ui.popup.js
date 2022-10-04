const Popup = function()
{
    let self = this;
    let el = t2.common.el;
    let links = [];
    let clear = [];
    let args = arguments[ 0 ];
    let title;

    this.addLink = function( link )
    {
        links.push( link );
    };

    this.clear = () => Array.from( self.element.children ).forEach( child => child.remove() );

    this.close = function()
    {
        self.hide();
        self.clear(); 
    };

    this.hide = function()
    {
        self.element.style.display = "none";
    };

    this.init = function( params )
    {
        self.element = t2.ui.elements.get( "popup" );

        if ( params.parent )
            params.parent.appendChild( self.element );
        
        self.close();
        self.show();

        let flex = el( "div", self.element );
            flex.classList.add( "flex" );
            flex.setAttribute( "data-ignore", "clear" ); 

        self.links( flex );
        self.update();

        title = el( "div", self.toolbar );
        self.setTitle( params );

        return self;
    };

    this.links = function( parent )
    {
        self.toolbar = el( "div", parent );
        self.toolbar.id = "toolbar";
        self.toolbar.classList.add( "toolbar" );

        let close = el( "div", parent );
            close.classList.add( "icon" );
            close.textContent = "X";
            close.addEventListener( "click", () => self.close() );   

        links = [];
    };

    this.refresh = () => t2.common.clear( [ "popup" ] );

    this.setTitle = function( params )
    {
        title.classList.add( "popup" );
        title.textContent = params.title;
    };

    this.show = function()
    {
        self.element.style.display = "block";
    };

    this.update = function()
    {
        links.forEach( params => 
        {
            let link = el( "div", self.toolbar );
                link.classList.add( "tool" );
                link.textContent = params.text;
                link.addEventListener( "click", () => params.f.call( self ) ); 
        } );
    };
};

export default Popup;
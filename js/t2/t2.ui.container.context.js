const Container = function()
{
    let self = this;
    let el = t2.common.el;
    let links = [];
    let clear = [];
    let args = arguments[ 0 ];

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
        let px = "px";
        let bbox = params.link ? params.link.getBoundingClientRect() : { right: params.coord.x, top: params.coord.y };

        self.element = t2.ui.elements.get( "context" );
        self.element.style.left = Math.ceil( bbox.right ) + 1 + px;
        self.element.style.top  = Math.ceil( bbox.top ) - 1 + px;

        if ( params.parent )
            params.parent.appendChild( self.element );
        
        self.close();
        self.show();

        return self;
    };

    this.refresh = () => t2.common.clear( [ "context" ] );

    this.show = function()
    {
        self.element.style.display = "block";
    };

    this.update = function()
    {
        links.forEach( params => 
        {
            let link = el( "div", self.element );
                link.classList.add( "link" );
                link.textContent = params.text;
                link.addEventListener( "click", () => params.f.call( self ) ); 
        } );
    };
};

export default Container;
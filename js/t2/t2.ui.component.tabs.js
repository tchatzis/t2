import Handlers from "./t2.component.handlers.js";

const Component = function()
{
    let self = this;
    let active = { curr: null, id: null, panel: null };
    let listeners = [];

    this.activate = function( id )
    {
        active.curr?.classList.remove( "active" );
        active.panel?.hide();
        
        let tab = self.element.querySelector( `[ data-tab = "${ id }" ]` );
            tab?.classList.add( "active" );

        let title = get( "title" );
            title?.set( tab?.textContent || this.parent.id || this.id );

        let panel = get( id );
            panel?.show();

        let module = this.panels.get( id );
        if ( module.refresh )
            module.refresh();

        active.curr = tab;
        active.id = id;
        active.panel = panel;

        this.setBreadcrumbs( id ); 
        
        listeners.forEach( listener => listener.handler( active ) );
    };

    this.addListener = function( listener )
    {
        listeners.push( listener );
    };

    this.addTab = function( id, container )
    {
        this.tabs.set( id, container );

        let tab = t2.common.el( "div", this.element );
            tab.classList.add( "tab" );
            tab.setAttribute( "data-tab", id );
            tab.textContent = container.label;
            tab.addEventListener( "click", () => this.activate( id ) );        
    };

    this.clear = () => this.element.innerHTML = null;

    this.disable = function( array )
    {
        array.forEach( id =>
        {
            let tab = self.element.querySelector( `[ data-tab = "${ id }" ]` );
                tab.classList.add( "disabled" );
        } );
    };

    this.enable = function( array )
    {
        array.forEach( id =>
        {
            let tab = self.element.querySelector( `[ data-tab = "${ id }" ]` );
                tab.classList.remove( "disabled" );
        } );
    };

    let get = ( id ) =>
    {
        let path = [ ...this.path.get( this.id ) ];
            path.pop();
            path.push( id );

        return t2.ui.children.get( path.join( "." ) );
    };

    this.init = function( params )
    {
        let display;
        let position;
        let axis;
        
        switch ( params.output )
        {
            case "vertical":
                display = "block";
                position = "left";
                axis = "height";
            break;

            case "horizontal":
                display = "flex-left";
                position = "bottom";
                axis = "width";
            break;
        }
        
        this.element = t2.common.el( "div", this.parent.element );
        this.element.classList.add( "tabs" );
        this.element.style[ position ] = 0;
        this.element.style[ axis ] = "100%";

        Object.assign( this, params );

        Handlers.call( this );
        
        this.tabs = new Map();
    };

    this.update = function( map )
    {
        this.panels = map;
        
        for ( let [ id, component ] of map )
        {
            this.addTab( id, component );
        }
    };
};

export default Component;
import Container from "./t2.container.handlers.js";

const Composite = function()
{
    let self = this;
    let tabs;
    let title;

    this.array = [];
    
    this.panels = new Map();

    this.init = async function( params )
    {        
        /*let direction;
        
        switch ( params.output )
        {
            case "horizontal":
                direction = "row";
            break;

            case "vertical":
                direction = "column";
            break;
        }*/
        
        this.element = t2.common.el( "div", this.parent.element );
        this.element.classList.add( "carousel" );

        Object.assign( this, params );

        Container.call( this );

        title = await this.addComponent( { id: "title", type: "title", format: "block", output: "text" } );
    };

    this.add = async function( type, params )
    {
        let module = await this[ `add${ type }` ]( params );

        if ( params.label )
        {
            this.panels.set( params.id, module );

            let rotation = 360 / this.panels.size;
            
            console.log( rotation )

            module.element.classList.add( "xyz" );
            module.element.style.transform = `rotateY( ${ rotation }deg )`;
        }

        this.array = Array.from( this.panels.keys() );

        return module;
    };

    this.setControls = async function( params )
    {
        tabs = await this.addComponent( params.controller );
        tabs.addBreadcrumbs( params.breadcrumbs.index, params.breadcrumbs.component );
        tabs.addListener( { type: "click", handler: ( active ) => 
        {
            self.tab = self.array.findIndex( id => id == active.id );

            if ( self.saveTab )
                self.saveTab( self.tab );

            title.set( `${ active.id }` );
        } } ); 
        tabs.update( this.panels );
        tabs.activate( this.array[ this.tab || 0 ] );

        return tabs;
    };

    this.setTitle = ( string ) => title.set( string );
};

export default Composite;

/*
transform-style: preserve-3d;
transform: rotateX(45deg);
*/
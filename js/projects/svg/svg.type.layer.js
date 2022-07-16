export default async function( parameters )
{
    Object.assign( this, parameters );
    
    let w = window.innerWidth;
    let h = window.innerHeight;

    this.element = await this.create( "svg" );
    this.element.dataset.name = this.name;
    this.element.dataset.type = this.type;
    this.element.setAttribute( "width", w );
    this.element.setAttribute( "height", h );
    this.element.setAttribute( "viewBox", `0, 0, ${ w }, ${ h }` );
    
    let div = document.createElement( "div" );
        div.dataset.name = this.name;
        div.dataset.type = this.type; 
        div.appendChild( this.element );
    
    this.setConfig( "parent", { element: div } );
    this.setConfig( "width", w );
    this.setConfig( "height", h );
    
    let root = this.get( "ui.root" );
        root.element.appendChild( div );
        root.addChild( this );
};
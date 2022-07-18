const SVG = function()
{
    let self = this;
    let styles = new Map();
    let values = {};

    let addAttribute = function( name, value )
    {
        this.element.setAttribute( name, value );
        
        values[ name ] = value;

        let map = self.elements.get( self.name );
            map.values = values;
    };

    let addStyle = function( style )
    {
        styles.set( style.name, style.value ); 
    };

    let setStyle = function()
    {
        let array = [];
        
        styles.forEach( ( value, key ) => array.push( `${ key }: ${ value }` ) );

        let style = array.join( "; " );

        this.element.setAttribute( "style", style );
    };
    
    this.addType = async function( parameters )
    {
        Object.assign( this, parameters );
        
        let script = await import( `./svg.type.${ parameters.type }.js` );   
        let svg = await new script.default( parameters );
            svg.element.style.overflow = "visible";
            svg.parent.appendChild( svg.element );
            svg.addAttribute = addAttribute;
            svg.addStyle = ( style ) => addStyle.call( svg.element, style );
            svg.setStyle = setStyle;
        let mapValue = Object.assign( svg, parameters );

        self.elements.set( this.name, mapValue );

        return svg;
    };

    this.init = function()
    {
        this.elements = new Map();
    };
};

export default SVG;
const Attribute = function()
{
    this.lookup = new Map();
    this.lookup.set( "circle", [ "cx", "cy", "r" ] );
    this.lookup.set( "ellipse", [ "cx", "cy", "rx", "ry" ] );
    this.lookup.set( "line", [ "x1", "y1", "x2", "y2" ] );
 
    this.setAttribute = function( key, value )
    {
        if ( key == "circle" )
        {
            this.lookup.get( key ).forEach( ( prop, index ) => 
            {
                this.setConfig( prop, value[ index ] );
                this.element.setAttribute( prop, value[ index ] );
            } );
            
            return;
        }
        
        if ( key == "ellipse" )
        {
            this.lookup.get( key ).forEach( ( prop, index ) => 
            {
                this.setConfig( prop, value[ index ] );
                this.element.setAttribute( prop, value[ index ] );
            } );
            
            return;
        }
        
        if ( key == "line" )
        {
            this.lookup.get( key ).forEach( ( prop, index ) => 
            {
                this.setConfig( prop, value[ index ] );
                this.element.setAttribute( prop, value[ index ] );
            } );
            
            return;
        }
        
        if ( key == "position" )
        {
            [ "x", "y" ].forEach( ( prop, index ) => 
            {
                this.setConfig( prop, value[ index ] );
                this.element.setAttribute( prop, value[ index ] );
            } );
            
            return;
        }
        
        if ( key == "rounded" )
        {
            [ "rx", "ry" ].forEach( ( prop, index ) => 
            {
                this.setConfig( prop, value[ index ] );
                this.element.setAttribute( prop, value[ index ] );
            } );
            
            return;
        }
        
        if ( key == "size" )
        {
            [ "width", "height" ].forEach( ( prop, index ) => 
            {
                this.setConfig( prop, value[ index ] );
                this.element.setAttribute( prop, value[ index ] );
            } );
            
            return;
        }
        
        if ( key == "length" )
            key = "height";
        
        if ( key == "attr" )
            key = "attributeName";

        this.setConfig( key, value );
        this.element.setAttribute( key, value );
    };
}

export default Attribute;
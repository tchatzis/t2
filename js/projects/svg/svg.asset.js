import Style from "./svg.library.style.js";

const SVG = function()
{
    let config = {};
    
    Style.call( this );
    
    Object.defineProperty( this, "create",
    { 
        enumerable: false,
        configurable: false,
        writable: false,
        value: async function( tag )
        {
            let element = await document.createElementNS( "http://www.w3.org/2000/svg", tag );

            return element;
        }
    } );
    
    this.center = function( asset )
    {   
        let a = asset.getBBox();
        let t = this.getBBox();
        
        this.setAttribute( "x", ( a.width - t.width ) / 2 );
        this.setAttribute( "y", ( a.height - t.height ) / 2 );
    };
    
    this.getBBox = function()
    {
        return this.element.getBBox();
    };
    
    /*this.setBBox = function( dimensions )
    {
        
    };
    
    this.addChild = function( asset )
    {
        
    };
    
    this.removeChild = function()
    {
        
    };
    
    this.getChild = function( index )
    {
        return config.children[ index ];
    };
    
    this.getChildren = function()
    {
        return config.children;
    };
    
    this.removeChildren = function()
    {
        config.children = [];
    };
    
    this.copyConfig = function( asset )
    {   
        return { ...asset.getConfig() };
    };*/
    
    this.setAttribute = function( key, value )
    {
        if ( key == "circle" )
        {
            [ "cx", "cy", "r" ].forEach( ( prop, index ) => 
            {
                this.setConfig( prop, value[ index ] );
                this.element.setAttribute( prop, value[ index ] );
            } );
            
            return;
        }
        
        if ( key == "line" )
        {
            [ "x1", "y1", "x2", "y2" ].forEach( ( axis, index ) => 
            {
                this.setConfig( axis, value[ index ] );
                this.element.setAttribute( axis, value[ index ] );
            } );
            
            return;
        }
        
        if ( key == "position" )
        {
            [ "x", "y" ].forEach( ( axis, index ) => 
            {
                this.setConfig( axis, value[ index ] );
                this.element.setAttribute( axis, value[ index ] );
            } );
            
            return;
        }
        
        if ( key == "length" )
            key = "height";

        this.setConfig( key, value );
        this.element.setAttribute( key, value );
    };
    
    this.setClip = async function( asset )
    {
        // new object
        let id = `clip ${ this.name }`.replace( / /g, "_" );
        let svg = new SVG();
        await svg.add( { name: id, type: "clip" } );
        // new object takes original parent
        svg.setParent( config.parent );
        
        // new object adopts original object as child
        this.setParent( svg );
        
        // set id reference on asset
        asset.setAttribute( "clip-path", `url( #${ id } )` );
    };
    
    this.getConfig = function()
    {
        console.warn( config );
        
        return config;
    };
    
    this.setConfig = function( key, value )
    {
        config[ key ] = value;
    };
    
    /*this.setStyle = function( name )
    {
        
        //this.element.setAttribute( "style", this.style( config ) );
    };*/
    
    /*this.getElement = function()
    {
        return config.element;
    };
    
    this.setElement = function()
    {
        config.element = this.element;
    };
    
    this.getParent = function()
    {
        return config.parent;
    };*/
    
    this.setParent = function( asset )
    {   
        this.setConfig( "parent", asset );

        asset.element.appendChild( this.element );
    };
    
    // import the external js file
    this.add = async function( parameters )
    {
        let script = await import( `./svg.type.${ parameters.type }.js` );     
        await script.default.call( this, parameters );
        
        Object.assign( config, parameters );
        
        this.setConfig( "element", this.element );
    };
};

export default SVG;
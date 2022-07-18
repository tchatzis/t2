import common from "./common.js";

import Attribute from "./svg.extend.attribute.js";
import Dimensions from "./svg.extend.dimensions.js";
import Label from "./svg.extend.label.js";
import Style from "./svg.extend.style.js";
import Transformations from "./svg.extend.transformations.js";

/*let common = 
{
    animations: [],
    settings: {},
    updates: []
};

const Common = function()
{
    this.extend = ( module ) => common.modules[ module.name ] = module;
    
    this.get = ( name ) => common[ name ];
    
    

    this.settings = ( name, value ) => common.settings[ name ] = value;
    
    this.sleep = function( ms )
    {
        return new Promise( resolve => setTimeout( resolve, ms ) );
    };
    
    this.sort = function( key, array )
    {
        let sorted = array.sort( ( a, b ) => ( a[ key ] > b[ key ] ) ? 1 : -1 );

        return [ ...sorted ];
    };
    
    this.svg = async function( parameters )
    {
        let svg = new SVG();

        await svg.add( parameters );
 
        if ( this.callback ) this.callback( svg );

        return svg;
    };
    
    common.svg = this.svg;
};*/



let scope;

const SVG = function()
{
    let config = {};
    let map = new Map();
        map.set( "x", "x" );
        map.set( "y", "y" );
        map.set( "cx", "x" );
        map.set( "cy", "y" );
    
    Attribute.call( this );
    Dimensions.call( this );
    Label.call( this );
    Style.call( this );
    Transformations.call( this );

    // methods
    this.create = function( tag )
    {
        return document.createElementNS( "http://www.w3.org/2000/svg", tag );
    };
    
    this.center = function( asset )
    {   
        this.updates.push(
        () =>
        {
            let c = asset.getConfig();
            let a = asset.getBBox();
            let t = this.getBBox();
            let w = c.width || a.width;
            let h = c.height || a.height;
            let x = ( w - t.width ) / 2;
            let y = ( h - t.height ) / 2;
            
            this.setAttribute( "cx", x );
            this.setAttribute( "y", y );
            this.setAttribute( "x", x );
            this.setAttribute( "cy", y );
        } );
        
        this.concat( "updates" );
    };
    
    this.concat = function( key )
    {
        let name = `svg.${ key }`;
        let array = common.get( name );
            array = array || [];
            array = array.concat( this[ key ] );

        this.set( name, array );
    };
    
    this.init = function()
    {
        this.set( "svg.invoke", this.invoke );
    };
 
    this.invoke = async function( parameters )
    {
        let svg = new SVG();

        await svg.add( parameters );
        
        let callback = common.get( "ui.tree" );

        if ( callback ) 
            callback( svg );

        return svg;
    };
    
    this.get = common.get;
    
    this.set = common.set;

    this.updates = [];
    
    this.update = function()
    {
        let updates = common.get( "svg.updates" );
            updates.forEach( f => f() );
    },

    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    

    
    this.setAnimation = function( config )
    {
        if ( config.animate )
            common.animations.push( config );
    };

    // svg
    this.insert = function( asset )
    {
        asset.setParent( config.parent );
    };
    
    this.setMidpoint = function()
    {
        if ( this.getBBox() )
        {
            let bbox = this.getBBox();
            
            this.setConfig( "midpoint", { x: bbox.x + bbox.width / 2, y: bbox.y + bbox.height / 2 } );
        }
    };
    
    this.swap = function( asset )
    {
        // new object takes original parent
        asset.setParent( config.parent );
            
        // current object takes new parent
        this.setParent( asset );

        // remove the child
        config.parent.removeChild( this );     
    };

    // children
    this.children = [];
    
    this.addChild = function( asset )
    {
        this.children.push( asset );
    };
    
    this.getChild = function( name )
    {
        return this.children.find( item => item.name == name );
    };
    
    this.getChildren = function()
    {
        return config.children;
    };
    
    this.removeChild = function( asset )
    {
        let parent = this.getParent();
        let index = parent.children.findIndex( item => item == asset );

        if ( index > -1 )
            parent.children.splice( index, 1 );
    };
    
    this.removeChildren = function()
    {
        this.children = [];
    };
    
    // attributes
    this.getBBox = function()
    {
        return this.element.getBBox ? this.element.getBBox() : null;
    };

    // clipping and masking
    this.setClip = async function( asset )
    {
        this.setAttribute( "clip-path", `url( #${ asset.name } )` );
    };
    
    this.setMask = async function( asset )
    {
        this.setAttribute( "mask", `url( #${ asset.name } )` );
    };
    
    // config
    this.copyConfig = function( asset )
    {   
        return { ...asset.getConfig() };
    };
    
    this.getConfig = function( prop )
    {
        return prop ? config[ prop ]: config;
    };
    
    this.setConfig = function( key, value )
    {
        config[ key ] = value;
    };

    // parenting
    this.getParent = function()
    {
        return config.parent;
    };
    
    this.setParent = function( asset )
    {   
        let config = asset.getConfig();
        
        this.setConfig( "parent", asset );
        
        asset.addChild( this );    
        asset.element.appendChild( this.element );
        
        this.setMidpoint();
    };
    
    // import the external js file
    this.add = async function( parameters )
    {
        let script = await import( `./svg.type.${ parameters.type }.js` );     
        await script.default.call( this, parameters );

        Object.assign( config, parameters );
        
        this.setConfig( "element", this.element );
        this.element.style.overflow = "visible";
        
        return this;
    };
};

export default SVG;
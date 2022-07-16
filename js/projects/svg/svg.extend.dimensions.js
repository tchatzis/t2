const Dimensions = function( ui )
{
    function format( value, precision )
    {
        let power = Math.pow( 10, precision );
        let evaluated = Math.round( value * power ) / power;
        
        return Number( evaluated.toFixed( precision ) );
    };
    
    this.setDimensions = async function()
    {
        let root = this.get( "root" );
        let factor = this.get( "factor" );
        let config = this.getConfig();
        let w = format( config.width / factor, 0 );
        let h = format( config.height / factor, 0 );

        this.setConfig( "dimensions", { width: w, height: h } );
        
        let group = await this.svg( { name: this.name, type: "group" } );

        let width = await this.svg( { name: "width", type: "text" } );
            width.setParent( group );
            width.setStyle( { name: "text", font: "normal 0.8em sans serif", color: "gray" } );
            width.setContent( w ); 

        let height =  await this.svg( { name: "height", type: "text" } );
            height.setParent( group );
            height.setStyle( { name: "text", font: "normal 0.8em sans serif", color: "gray" } );
            height.setContent( h ); 

        this.swap( group );
        
        let parent = group.getParent();
        let tbox = this.getBBox();
        let pbox = parent.getBBox();
        let wbox = width.getBBox();
        let hbox = height.getBBox();
        let pad = 5;
        
        let vertical = await this.svg( { name: "vertical", type: "line" } );
            vertical.setParent( group );
            vertical.setAttribute( "line", [ tbox.width + wbox.width, tbox.y, tbox.width + wbox.width, tbox.height ] );
            vertical.setStyle( { name: "dimensions" } );   
        
        let horizontal = await this.svg( { name: "horizontal", type: "line" } );
            horizontal.setParent( group );
            horizontal.setAttribute( "line", [ tbox.x, tbox.height + hbox.height, tbox.width, tbox.height + hbox.height ] );
            horizontal.setStyle( { name: "dimensions" } );

        width.setAttribute( "x", pbox.width / 2 )
        width.setAttribute( "y", pbox.height + pad );
        
        height.setAttribute( "x", tbox.width + pad );
        height.setAttribute( "y", tbox.height / 2 );
        height.rotate( { amount: 90 } );   
    };
}

export default Dimensions;
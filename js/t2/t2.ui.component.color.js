import Handlers from "./t2.component.handlers.js";

const Component = function( module )
{
    let self = this;
    let active = null;
    let step = 15;
    let border = [ "1px solid transparent", "1px solid white" ];

    this.init = function( params )
    {
        this.element = t2.common.el( "table", this.parent.element );
        this.element.classList.add( "picker" );

        Object.assign( this, params );

        Handlers.call( this );

        output[ params.output ]();
    };

    this.update = function( color )
    {
        this.value = color;

        let td = self.element.querySelector( `td[ data-color = "${ color }" ]` );

        if ( td )
            td.style.border = border[ 1 ];
    };

    const over = ( e ) => e.target.style.border = border[ 1 ];
    const out = ( e ) => e.target.style.border = border[ 0 ];
    const reset = () => Array.from( self.element.querySelectorAll( "[ data-color ]" ) ).forEach( td => 
    { 
        td.style.border = border[ 0 ]; 
        td.addEventListener( "mouseout", out );
    } );

    const output =
    {
        hsl: () => 
        {
            for ( let l = 10; l <= 70; l += step )
            {
                let tr = t2.common.el( "tr", self.element );
                
                for ( let h = 0; h < 360; h += step * 2 )
                {
                    let hsl = `hsl( ${ h }, 100%, ${ l }% )`;
                    let b = 1 - ( self.value !== hsl );   
                    let td = t2.common.el( "td", tr );
                        td.dataset.color = hsl;
                        td.style.backgroundColor = hsl;
                        td.style.border = border[ b ];
                        td.style.borderRadius = "3px";
                        td.style.cursor = "pointer";
                        td.style.height = "0.75em";
                        td.style.padding = 0;
                        td.style.width = "1em";
                        td.addEventListener( "mouseover", over );
                        td.addEventListener( "mouseout", out );
                        td.addEventListener( "click", () => 
                        {
                            reset();

                            self.update( td.dataset.color );
                            
                            td.removeEventListener( "mouseout", out );

                            active = td;
                        } );
                }
            } 
        }
    }
};

export default Component;
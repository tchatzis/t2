export function debug()
{
    Function.prototype.debug = function() 
    {
        let that = this;
        let x = this.toString();
        let signature = x.slice( x.indexOf( "(" ) + 1, x.indexOf( ")" ) );

        var temp = function() 
        { 
            console.log( "name:", this.name );
            console.log( "signature:", `( ${ signature } )` );
            console.log( "arguments:", ...arguments )

            return that.apply( this, arguments ); 
        };

        for ( let key in this )  
        {
            if ( this.hasOwnProperty( key ) ) 
            {
                temp[ key ] = this[ key ];
                console.warn( key, this[ key ] );
            }
        }

        return temp;
    };
};

export function extend()
{
    Function.prototype.extend = function( before, after ) 
    {
        let that = this;

        for ( let key in this )  
        {
            if ( this.hasOwnProperty( key ) ) 
            {
                extended[ key ] = this[ key ];
            }
        }

        let extended = function()
        {
            if ( before instanceof Function )
                before();
            
            that.apply( this, arguments ); 

            if ( after instanceof Function )
                after();
        };

        return extended;
    };
};

 /*let current = x.slice( x.indexOf( "{" ) + 1, x.lastIndexOf( "}" ) );
            let prepend = 
            `let self = this;
            let helpers = import( "../t2/t2.component.table.helpers.js" );`
            let append = `this.dispatch( "${ params.event }" );`;
            let body = prepend + s + current + s + t + t + append;

            
            console.log( body );
            this[ params.event ] = new Function( ...args, body );*/
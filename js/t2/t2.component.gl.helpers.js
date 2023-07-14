const helpers = 
{
    lookup: function( params )
    {
        switch( params.class )
        {
            case "float":
                return { name: params.name, func: "uniform1f", args: [ params.value || 0.0 ], size: 1 };
    
            case "mat4":
                return { name: params.name, func: "uniformMatrix4fv", args: [ false, params.value ], size: 16 };
    
            case "vec2":
                return { name: params.name, func: "uniform2fv", args: [ params.value || [ 0.0, 0.0 ] ], size: 2 };
    
            case "vec3":
                return { name: params.name, func: "uniform3fv", args: [ params.value || [ 0.0, 0.0, 0.0 ] ], size: 3 }; 
    
            case "vec4":
                return { name: params.name, func: "uniform4fv", args: [ params.value || [ 0.0, 0.0, 0.0, 0.0 ] ], size: 4 };
    
            default:
                throw( `${ params.name } ${ params.type } ${ params.class } is not defined` );
        }
    },

    Type: function( type )
    {
        let declarations = [];
            declarations.push( "precision mediump float;" );
            declarations.push( "" );

        let func = [];
            func.push( "" );

        let main = [];
            main.push( "" );
            main.push( "void main()" );
            main.push( "{" );

        let body = [];

        this.code = () => declarations.concat( format( func.join( "\n" ) ) ).concat( main.join( "\n" ) ).concat( body.join( "\n" ) ).concat( "}" ).join( "\n" );

        this.declare = ( code ) => declarations.push( code );

        this.func = ( code ) => func.push( code );

        this.type = type;

        this.write = ( code ) => body.push( `\t${ code }` );

        function format( string )
        {
            let result = string.replace( /\s\s+/g, " " );
                result = result.replace( ")", ")\n" );
                result = result.replace( " {", "{\n" );
                result = result.replace( /\;/g, ";\n" );
                result = result.replace( " }", "}" );

            return result;
        }
    }
};

export default helpers;
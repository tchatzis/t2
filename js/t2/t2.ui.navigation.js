const Navigation = function()
{
    let self = this;
    let names = new Set();

    this.components = {};

    this.addComponent = async function( params )
    {
        let parent = t2.ui.children.get( params.parent );

        names.add( params.id );
        
        this.components[ params.id ] = await parent.addComponent( { id: params.id, type: params.type || "menu", array: params.array, format: params.format || "flex", output: params.output || "block" } );
    
        return this.components[ params.id ];
    };

    this.addIgnore = function( params )
    {
        let container = t2.ui.children.get( params.id );

        params.ignore.forEach( ignore => container.ignore( ignore ) );          
    };

    this.import = async function( module, name )
    {
        let imported = await import( `../projects/${ module.info.namespace }/${ module.info.namespace }.${ name }.js` );
        let script = await new imported.default( module );

        return script;
    };

    this.path = function( path )
    {
        let _path = path.split( "/" );

        names.forEach( ( name, index ) => 
        {
            if ( _path[ index ] )
                self[ name ].activate( _path[ index ] );
        } );
    };

    this.setLayout = async function( params )
    {
        await t2.ui.layout.init( params );
    };

    this.update = function( params )
    {
        Object.keys( params ).forEach( event => 
        {
            params[ event ].forEach( id => 
            {
                let component = t2.ui.children.get( id );

                if ( component[ event ] )
                    component[ event ]();
            } );
        } );
    };
}

export default Navigation;
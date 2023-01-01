const Navigation = function()
{
    let self = this;
    let names = new Map();
    let i = 0;

    this.children = new Map();
    
    this.components = {};

    this.addComponent = async function( params )
    {
        let parent = t2.ui.children.get( params.parent );

        this.components[ params.id ] = await parent.addComponent( { id: params.id, type: params.type || "menu", array: params.array, format: params.format || "flex", output: params.output || "block" } );

        if ( [ "menu", "tabs" ].find( type => type == this.components[ params.id ].type ) )
            names.set( i++, params.id );
    
        return this.components[ params.id ];
    };

    this.import = async function( module, name )
    {
        let imported = await import( `../projects/${ module.info.namespace }/${ module.info.namespace }.${ name }.js` );
        let script = await new imported.default( module );

        return script;
    };

    this.path = async function( _path )
    {
        let path = _path.split( "/" );

        async function activate( index )
        {
            let name = names.get( index );
            let link = path[ index ];

            if ( name && link )
                await self.components[ name ].activate( link )

            if ( index < names.size )
                activate( index + 1 );
        }

        activate( 0 );
    };

    this.update = function( array )
    {   
        // array of { element.id, [ functions ] }
        array.forEach( item =>
        {
            let component = t2.ui.children.get( item.id );

            function execute( set )
            {
                for ( let f in set )
                {
                    component[ f ]( set[ f ] );  
                }
            }

            item.functions.forEach( execute );
        } );
    };
}

export default Navigation;
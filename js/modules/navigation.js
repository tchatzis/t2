const Common = function()
{
    let self = this;

    this.clear = function () { t2.common.clear( Array.from( arguments ) ) };

    this.layout = {};

    this.navigation = {};

    this.navigation.activate = async function( name )
    {
        let link = this.component.element.querySelector( `[ data-link = "${ name }" ]` );

        this.component.setActive( link );
    };

    this.navigation.click = async function( name )
    {
        let link = this.component.element.querySelector( `[ data-link = "${ name }" ]` );
            link?.click();
    };

    this.navigation.breadcrumbs = {};
    this.navigation.breadcrumbs.component = t2.ui.children.get( "footer.breadcrumbs" )

    this.navigation.scenes = {};
    this.navigation.scenes.breadcrumb = 0;
    this.navigation.scenes.component = t2.ui.children.get( "header.scenes" );

    this.navigation.view = {};
    this.navigation.view.breadcrumb = 1;
    this.navigation.view.component = t2.ui.children.get( "footer.view" );

    this.navigation.symbols = {};
    this.navigation.symbols.breadcrumb = 2;

    this.navigation.set = async function()
    {
        let e = arguments[ 0 ];
        let listener = arguments[ 1 ];
        let active = arguments[ 2 ];
        let name = active.curr.getAttribute( "data-link" );

        this.name = this.component.id;
        this.selected = name;

        self.clear( ...this.clear );

        await self.handlers[ this.name ]( name );

        self.navigation.breadcrumbs.component.set( this.breadcrumb, name ); 
        self.navigation.breadcrumbs.component.unset( this.breadcrumb + 1 );
    };

    this.handlers =
    {
        scenes: async ( name ) =>
        {
            t2.movie.changeScene( name );
        },

        view: async ( name ) =>
        {
            let module = await import( `../projects/${ self.info.namespace }/${ self.info.namespace }.${ name }.js` );
            let script = await new module.default( self );
    
            await script.run();
        }
    };
};

export default Common; 
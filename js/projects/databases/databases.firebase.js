const Firebase = function( module )
{
    this.run = async function()
    {
        Object.assign( module, this );

        await this.refresh();
    };

    this.refresh = async function()
    {
        await layout();
    };

    async function layout()
    {
        //await container();

        //let submenu = t2.ui.children.get( "submenu" );

        //submenu.element.textContent = `${ t2.db.name } v${ t2.db.version }`;
    }
};

export default Firebase;
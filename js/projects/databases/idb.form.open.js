const IDBOpen = function()
{
    let args = arguments[ 0 ];
    let listeners = [];

    this.addListener = function( listener )
    {
        listeners.push( listener );
    };
    
    this.init = function()
    {
        let div = t2.common.el( "div", t2.ui.elements.get( "content" ) );
            div.classList.add( "hform" );
        let title = t2.common.el( "div", div );
            title.classList.add( "title" );
            title.textContent = "DB Status"; 
        let form = t2.common.el( "form", div );
            form.id = "open";
            form.addEventListener( "submit", openDB );
        let name = t2.common.el( "input", div );
            name.name = "name";
            name.placeholder = "db name";
            name.value = t2.db.name;
            name.setAttribute( "Form", form.id );
        let version = t2.common.el( "input", div );
            version.name = "version";
            version.type = "number";
            version.value = t2.db.version;
            version.placeholder = "version name";
            version.setAttribute( "Form", form.id );
        let submit = t2.common.el( "input", div );
            submit.value = "Open";
            submit.type = "submit";
            submit.setAttribute( "Form", form.id ); 
        let close = t2.common.el( "input", div );
            close.value = "Close";
            close.type = "submit";
            close.addEventListener( "click", closeDB );
    };

    async function closeDB( e )
    {
        e.preventDefault();

        await t2.db.db.close();

        t2.db.version = 0;

        submenu.textContent = "CLOSED";
    }

    async function openDB( e )
    {
        e.preventDefault();

        let data = {};
        let formData = new FormData( e.target );
        let keys = Array.from( formData.keys() );
            keys.forEach( key => data[ key ] = formData.get( key ) );

        await t2.db.open( data );

        listeners.forEach( listener => listener.handler( data ) );

        submenu.textContent = `${ t2.db.name } v${ t2.db.version }`;
    }
};

export default IDBOpen;
const IDBExport = function( module )
{
    let self = this;

    this.init = function()
    {
        let content = t2.ui.elements.get( "content" );
     
        let div = t2.common.el( "div", content );
            div.classList.add( "hform" );
        let title = t2.common.el( "div", div );
            title.classList.add( "title" );
            title.textContent = "Database"; 
        let form = t2.common.el( "form", div );
            form.id = "export";
            form.addEventListener( "submit", ( e ) => data( e ) );
        let submit = t2.common.el( "input", div );
            submit.value = "Export";
            submit.type = "submit";
            submit.setAttribute( "Form", form.id ); 
    };

    async function data( e )
    {
        e.preventDefault();

        let data = {};
        let options = { type: "application/json;charset=utf-8" };
        let promises = [];

        let tables = await Array.from( t2.db.db.objectStoreNames );
            tables.forEach( ( table ) => promises.push( t2.db.tx.retrieve( table ) ) );
        let results = await Promise.all( promises );
            results.forEach( result =>  
            {
                data[ result.table ] = [];

                result.data.forEach( record => data[ result.table ].push( record ) ); 
            } );
        let file = new File( [ JSON.stringify( data ) ], `${ t2.formats.date( new Date() ) }.idb`, options );

        download( file );
    }

    function download( file ) 
    {
        var element = t2.common.el( 'a', document.body );
            element.setAttribute( 'href', URL.createObjectURL( file ) );
            element.setAttribute( 'download', file.name );
            element.style.display = 'none';
            element.click();

        document.body.removeChild( element );
    }
};

export default IDBExport;
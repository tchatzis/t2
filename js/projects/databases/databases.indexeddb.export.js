import Common from "../../t2/t2.common.handlers.js";

const Export = function()
{
    let panel;
    
    this.init = async function( parent, params )
    {
        panel = await parent.addContainer( { id: "panel", type: "panel", format: "flex" } );

        this.element = panel.element;
        this.type = panel.type;

        Object.assign( this, params );
        Common.call( this ); 
    };
    
    this.run = async function()
    {
        panel.clear();

        let form = t2.common.el( "form", panel.element );
            form.id = "export";
            form.addEventListener( "submit", ( e ) => data( e ) );
        let submit = t2.common.el( "input", panel.element );
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

export default Export;
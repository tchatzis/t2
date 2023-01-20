//import navigation from "../../t2/t2.ui.navigation.js";
//import Layer from "./design.layers.js";
//import Vector from "./design.vector.js";
import Queries from "../../t2/t2.queries.js";

const Design = function()
{
    const self = this;

    this.data = {};

    this.init = async function()
    {
        this.q = new Queries();
        await this.q.init( { table: "projects" } );

        await this.refresh();

        await navigation();
    };

    this.refresh = async function()
    {
        await this.queries();
    };

    async function navigation()
    { 
        let menu = t2.navigation.components.main;
            menu.update( Array.from( t2.movie.scenes.keys() ) );
            menu.highlight( self.info.namespace );

        let view = t2.navigation.components.view;
            view.setModule( self );
            view.update( [] );

        await t2.ui.layout.init( { name: "all", preserve: [ "header", "footer" ] } );

        await t2.navigation.update( 
        [ 
            { id: "submenu",    functions: [ { ignore: "clear" }, { show: null }, { invoke: [ { f: select, args: null } ] } ] },
            { id: "subcontent", functions: [ { ignore: "clear" }, { clear: null }, { hide: null } ] },
            { id: "submargin",  functions: [ { ignore: "clear" }, { clear: null }, { hide: null } ] },
            { id: "menu",       functions: [ { ignore: "clear" }, { show: null } ] },
            { id: "content",    functions: [ { clear: null }, { show: null } ] },
            { id: "margin",     functions: [ { clear: null }, { hide: null } ] }
        ] );
    }

    this.queries = async function()
    {
        await this.q.refresh();

        this.record = this.q.filters.add( { operator: "eq", name: "project", value: [ this.project ] } )?.[ 0 ];
        //this.q.filters.add( { operator: "date.between", name: "datetime", value: [ this.from, this.to ] } );
        //this.q.filters.add( { operator: "date.eq", format: "isoDate", name: "datetime", value: [ this.date ] } );

        this.q.define( 
        [ 
            { key: "project", format: "text", sort: "asc", use: "all" },
        ] );

        Object.assign( this.data, this.q.data );
    };

    async function select()
    {
        let form = await this.addComponent( { id: "project", type: "form", format: "flex" } );
            form.addListener( { type: "submit", handler: async ( args ) =>
            {
                self.project = args.data.project;

                if ( ~self.data.project.indexOf( self.project ) )
                    selected();
                else
                {
                    let confirmed = confirm( `Add ${ self.project }` );

                    if ( confirmed )
                        console.warn( "new", confirmed, self.project );
                    else
                        form.form.reset();
                }
            } } );
            form.addField( { 
                input: { name: "project", type: "datalist", value: self.project || "", required: "" }, 
                cell: { css: {}, display: 4 },
                format: [ "uppercase" ],
                options: self.data.project } );
            form.addField( { 
                input: { type: "submit", value: "OPEN" }, 
                cell: { css: {}, display: 3 },
                format: [] } );
    }

    function selected()
    {
        let view = t2.navigation.components.view;
            view.update( [ "Edit", "View" ] );
            view.activate( view.array[ 0 ] );
    }
};

export default Design;
//import navigation from "../../t2/t2.ui.navigation.js";
//import Layer from "./design.layers.js";
//import Vector from "./design.vector.js";
import Queries from "../../t2/t2.queries.js";

const Design = function()
{
    const self = this;

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
        
        this.q.filters.add( { operator: "eq", name: "project", value: [ this.project ] } );
        //this.q.filters.add( { operator: "date.between", name: "datetime", value: [ this.from, this.to ] } );
        //this.q.filters.add( { operator: "date.eq", format: "isoDate", name: "datetime", value: [ this.date ] } );

        this.q.define( 
        [ 
            { key: "project", format: "text", sort: "asc", use: "all" }
        ] );

        this.data = this.q.data;
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


const Index = function()
{
    const self = this;
    let breadcrumbs;
    let draw;
    let popup;

    this.init = async function()
    {
        await navigation.call( this, 
        { 
            init: { layout: "all", ignore: [ "header" ] }, 
            menu: { activate: self.info.namespace, array: Array.from( t2.movie.scenes.keys() ), ignore: [ "header", "footer" ] }, 
            view: { activate: null, array: [ "2D", "3D" ], ignore: [ "header", "footer" ] } 
        } );

        breadcrumbs = t2.ui.children.get( "footer.breadcrumbs" );

        draw = await this.info.scene.addModule( { default: "default", invoke: "init", path: "../modules/draw", namespace: "draw" } );

        this.routine.project.select();
    };

    this.routine = { project: {}, grid: {}, layers: {} };

    this.routine.project.select = async () =>
    {
        let table = "projects";

        //await t2.db.tx.overwrite( table, 1, { project: "dream" } );

        let records = await t2.db.tx.retrieve( table );        

        let middle = t2.ui.children.get( "middle" );

        popup = await middle.addContainer( { id: "popup", type: "popup", output: null } );
        popup.show();

        let title = await popup.addComponent( { id: "title", type: "title", format: "block", output: "text" }  );
            title.set( "Select Project" );

        let box1 = await popup.addContainer( { id: "settings", type: "box", format: "block", output: null } );

        let project = await box1.addComponent( { id: "project", type: "form", format: "flex" } );
            project.addListener( { type: "submit", handler: async ( data ) => 
            {
                self.data = records.data.find( record => record.project == data.project );

                if ( self.data )
                {
                    breadcrumbs.set( 1, data.project );
                    self.routine.grid.settings();
                }
            } } );
            project.addField( { 
                input: { label: "project", name: "project", type: "datalist", value: "", required: true }, 
                cell: { css: {}, display: 10 },
                format: [], 
                options: records.data.map( record => record.project ) } );
            project.addField( { 
                input: { type: "submit", value: "SELECT" }, 
                cell: { css: {}, display: 4 },
                format: [] } );
    };

    this.routine.grid.settings = async function()
    {
        let table = "projects";
        
        popup.clear();

        breadcrumbs.set( 2, "grid" );
        breadcrumbs.set( 3, "settings" );

        let title = await popup.addComponent( { id: "title", type: "title", format: "text", output: "text" }  );
            title.set( `${ self.data.project } \u00BB Grid Settings` );

        let box1 = await popup.addContainer( { id: "settings", type: "box", format: "block", output: null } );

        let settings = await box1.addComponent( { id: "settings", type: "form", format: "flex" } );
        let clicks = [ { type: "click", handler: settings.change }, { type: "click", handler: ( form ) => update.call( form, table, "settings" ) } ];
            settings.addField( { 
                input: { label: "show grid", name: "grid", type: "checkbox", value: "show", checked: !!self.data.settings?.grid || false }, 
                cell: { css: {}, display: 4 },
                format: [],
                listeners: clicks } );
            settings.addField( { 
                input: { label: "snap to grid", name: "snap", type: "checkbox", value: "snap", checked: !!self.data.settings?.snap || false }, 
                cell: { css: {}, display: 4 },
                format: [],
                listeners: clicks } );
            settings.addField( { 
                input: { label: "precision", name: "precision", type: "number", value: self.data.settings?.precision || 0, step: 0.01 }, 
                cell: { css: {}, display: 4 },
                format: [],
                listeners: clicks } );

        let box2 = await popup.addContainer( { id: "grid", type: "box", format: "block" } );

        let grid = await box2.addComponent( { id: "grid", type: "form", format: "flex" } );
            grid.addListener( { type: "submit", handler: async ( data ) => 
            {
                self.routine.grid.show();
                self.routine.layers.menu();
            } } );
        let inputs = [ { type: "input", handler: grid.change }, { type: "input", handler: ( form ) => update.call( form, table, "grid" ) } ];
            grid.addField( { 
                input: { label: "x", name: "x", type: "number", value: self.data.grid?.x || 0 }, 
                cell: { css: {}, display: 4 },
                format: [],
                listeners: inputs } );
            grid.addField( { 
                input: { label: "y", name: "y", type: "number", value: self.data.grid?.y || 0 }, 
                cell: { css: {}, display: 4 },
                format: [],
                listeners: inputs } );
            grid.addField( { 
                input: { label: "unit", name: "unit", type: "number", value: self.data.grid?.unit || 0 }, 
                cell: { css: {}, display: 4 },
                format: [],
                listeners: inputs } );  
            grid.addField( { 
                input: { type: "submit", value: "LOAD" }, 
                cell: { css: {}, display: 4 },
                format: [] } );  
    };

    this.routine.grid.show = async function()
    {
        let content = t2.ui.children.get( "content" );
        this.grid = await content.addComponent( { id: "grid", type: "canvas" } );
        this.grid.clear();
        this.grid.show();
        
        if ( !self.data.settings.grid )
        {
            this.grid.hide();
            return;
        }

        let x = Math.floor( this.grid.width / self.data.grid.x );
        let y = Math.floor( this.grid.height / self.data.grid.y );

        self.data.grid.pixels = Math.min( x, y );

        draw.set( { pixels: { x: this.grid.width, y: this.grid.height } } );
        
        for ( let x = 0; x < this.grid.width; x += self.data.grid.pixels )
            draw.vertical.call( this.grid.ctx, "rgba( 255, 255, 255, 0.1 )", { x: x, y: this.grid.height } );

        for ( let y = 0; y < this.grid.height; y += self.data.grid.pixels )
            draw.horizontal.call( this.grid.ctx, "rgba( 255, 255, 255, 0.1 )", { x: this.grid.width, y: y } );  
    };

    this.routine.layers.menu = async function()
    {
        popup.clear();
        popup.hide();

        breadcrumbs.set( 2, "layer" );
        breadcrumbs.set( 3, "select" );
        
        let menu = t2.ui.children.get( "menu" );

        let root = new Layer( { name: self.data.project, visible: true, disabled: false, color: "blue", element: menu.element } );
            root.addListener( { type: "contextmenu", handler: self.routine.layers.settings } );
            root.init();
        /*
        let s = l.addSegment( { name: "segment", type: "wall" } );
            s.addVector( new Vector( 1, 2, 3 ) );
            s.addVector( new Vector( 4, 5, 6 ) );
            s.addVector( new Vector( 1, 2, 3 ) );

        console.log( l );
        console.log( s );*/
    };

    this.routine.layers.settings = async function()
    {
        let e = arguments[ 0 ];
            e.preventDefault();
            e.stopPropagation();

        let layer = arguments[ 1 ];
        let link = e.target;
        let name;

        function label( n )
        {
            name = n;

            link.textContent = name;

            breadcrumbs.set( 3, "settings" );
            breadcrumbs.set( 4, name );
        }

        label( link.textContent );
        
        popup.clear();
        popup.show();

        let table = "projects";

        let title = await popup.addComponent( { id: "title", type: "title", format: "text", output: "text" }  );
            title.set( `${ name } \u00BB` );

        let box1 = await popup.addContainer( { id: "add", type: "box", format: "block" } );

        let rename = await box1.addComponent( { id: "rename", type: "form", format: "flex" } );
            rename.addListener( { type: "submit", handler: async ( data ) => 
            {
                label( data.name );
            } } );
            rename.addField( { 
                input: { label: "rename", name: "name", type: "text", required: true, value: link.textContent }, 
                cell: { css: {}, display: 8 },
                format: [] } );
            rename.addField( { 
                input: { type: "submit", value: "RENAME" }, 
                cell: { css: {}, display: 4 },
                format: [] } );  

        let child = await box1.addComponent( { id: "child", type: "form", format: "flex" } );
            child.addListener( { type: "submit", handler: async ( data ) => 
            {
                let newLayer = layer.addLayer( { name: data.name } );
                    newLayer.init();
                    newLayer.element.click();
            } } );
            child.addField( { 
                input: { label: "add child", name: "name", type: "text", required: true }, 
                cell: { css: {}, display: 8 },
                format: [] } );
            child.addField( { 
                input: { type: "submit", value: "ADD" }, 
                cell: { css: {}, display: 4 },
                format: [] } );  

        let box2 = await popup.addContainer( { id: "segments", type: "box", format: "block", output: null } );

        let segments = await box2.addComponent( { id: "segments", type: "list", format: "flex" } );
            segments.addColumn( { 
                input: { name: "x", type: "number", step: self.data.settings.precision, min: 0 }, 
                cell: { css: {}, display: 3, modes: [ "read", "edit" ] },
                format: [ "number" ] } );
            segments.addColumn( { 
                input: { name: "y", type: "number", step: self.data.settings.precision, min: 0 }, 
                cell: { css: {}, display: 3, modes: [ "read", "edit" ] },
                format: [ "number" ] } );
            segments.addColumn( { 
                input: { name: "z", type: "number", step: self.data.settings.precision, min: 0 }, 
                cell: { css: {}, display: 3, modes: [ "read", "edit" ] },
                format: [ "number" ] } );
            segments.setColumns();


    };

    async function update( table, property )
    {
        self.data[ property ] = self.data[ property ] || {};
        
        let form = this;
        let data = { [ property ]: Object.assign( self.data[ property ], form.data ) };

        await t2.db.tx.update( table, self.data.id, data );
  
        console.warn( "update", table, property, data );
    }
};

export default Design;
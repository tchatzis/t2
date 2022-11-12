import navigation from "../../t2/t2.ui.navigation.js";
import Layer from "./design.layers.js";
import Vector from "./design.vector.js";

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
        
        let root = new Layer( { name: "layer1", visible: true, disabled: false, color: "blue", element: menu.element } );
            root.addListener( { type: "click", handler: self.routine.layers.settings } );
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
        let name = link.textContent;

        breadcrumbs.set( 3, "settings" );
        breadcrumbs.set( 4, name );
        
        popup.clear();
        popup.show();

        let table = "projects";

        let title = await popup.addComponent( { id: "title", type: "title", format: "text", output: "text" }  );
            title.set( `${ self.data.project } \u00BB ${ name }` );

        let box1 = await popup.addContainer( { id: "add", type: "box", format: "block" } );

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

export default Index;
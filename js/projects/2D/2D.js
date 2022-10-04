const Main = function( args )
{
    let self = this;
    let draw;
    
    this.init = async function()
    {
        let middle = await t2.ui.root( t2.ui.elements.get( "middle" ).element );

        this.data = {}

        this.grid = await middle.addComponent( { id: "grid", type: "canvas" } );
        this.grid.hide();

        this.popup = await middle.addContainer( { id: "popup", type: "popup" } );
        this.popup.show();

        draw = await args.scene.addModule( { default: "default", invoke: "init", path: "../modules/draw", namespace: "draw" } );

        routine.select.project();
    };

    let routine = {};
        routine.set = {};
        routine.select = {};
        routine.show = {};

    routine.select.project = async () =>
    {
        let table = "projects";

        this.popup.clear();

        let records = await t2.db.tx.retrieve( table );

        let footer = t2.ui.elements.get( "footer" );
        let breadcrumbs = footer.children.get( "breadcrumbs" );

        let title = await this.popup.addComponent( { id: "title", type: "title", format: "text" }  );
            title.set( "Select Project" );

        let box1 = await this.popup.addContainer( { id: "settings", type: "box", format: "block" } );

        let project = await box1.addComponent( { id: "project", type: "form", format: "flex" } );
            project.addListener( { type: "submit", handler: async ( data ) => 
            {
                // set project data
                let record = await project.save( table, data, "project" );

                this.data[ table ] = record.data.find( r => r.project = data.project );

                breadcrumbs.set.path( 1, data.project );
            
                routine.set.grid();
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

    routine.set.grid = async () =>
    {
        let table = "projects";
        
        this.popup.clear();

        let data = this.data[ table ];
        let array = [ "precision", "x", "y", "unit" ];
        let next = routine.show.grid;

        let title = await this.popup.addComponent( { id: "title", type: "title", format: "text" }  );
            title.set( `${ data.project } \u00BB Grid Settings` );

        let box1 = await this.popup.addContainer( { id: "settings", type: "box", format: "block" } );

        let settings = await box1.addComponent( { id: "settings", type: "form", format: "flex" } );
        let clicks = [ { type: "click", handler: settings.change }, { type: "click", handler: ( form ) => update.call( form, table ) } ];
            settings.addField( { 
                input: { label: "show grid", name: "grid", type: "checkbox", value: "show", checked: !!data.grid || false }, 
                cell: { css: {}, display: 4 },
                format: [],
                listeners: clicks.concat( { type: "click", handler: routine.show.grid } ) } );
            settings.addField( { 
                input: { label: "snap to grid", name: "snap", type: "checkbox", value: "snap", checked: !!data.snap || false }, 
                cell: { css: {}, display: 4 },
                format: [],
                listeners: clicks } );
            settings.addField( { 
                input: { label: "precision", name: "precision", type: "number", value: data.precision || 0, step: 0.01 }, 
                cell: { css: {}, display: 4 },
                format: [],
                listeners: clicks } );

        let box2 = await this.popup.addContainer( { id: "grid", type: "box", format: "block" } );

        let grid = await box2.addComponent( { id: "grid", type: "form", format: "flex" } );
        let inputs = [ { type: "input", handler: grid.change }, { type: "input", handler: ( form ) => update.call( form, table ) } ];
            grid.addField( { 
                input: { label: "x", name: "x", type: "number", value: data.x || 0 }, 
                cell: { css: {}, display: 4 },
                format: [],
                listeners: inputs } );
            grid.addField( { 
                input: { label: "y", name: "y", type: "number", value: data.y || 0 }, 
                cell: { css: {}, display: 4 },
                format: [],
                listeners: inputs } );
            grid.addField( { 
                input: { label: "unit", name: "unit", type: "number", value: data.unit || 0 }, 
                cell: { css: {}, display: 4 },
                format: [],
                listeners: inputs } );

        proceed( table, array, next );
    };

    routine.show.grid = async () =>
    {
        let table = "projects";
        let data = self.data[ table ];

        if ( !data.grid )
        {
            this.grid.hide();
            return;
        }

        this.grid.clear();
        this.grid.show();

        let x = Math.floor( this.grid.width / data.x );
        let y = Math.floor( this.grid.height / data.y );

        data.pixels = Math.min( x, y );

        draw.set( { pixels: { x: this.grid.width, y: this.grid.height } } );
        
        for ( let x = 0; x < this.grid.width; x += data.pixels )
            draw.vertical.call( this.grid.ctx, "rgba( 255, 255, 255, 0.1 )", { x: x, y: this.grid.height } );

        for ( let y = 0; y < this.grid.height; y += data.pixels )
            draw.horizontal.call( this.grid.ctx, "rgba( 255, 255, 255, 0.1 )", { x: this.grid.width, y: y } ); 
    };
    
    // not implemented
    routine.set.projects = async () =>
    {
        let table = "projects";

        let records = await t2.db.tx.retrieve( table );
        
        let projects = await box1.addComponent( { id: "projects", type: "table" } );
            /*projects.handlers = { update: async ( e, data ) => 
            { 
                data.id = Number( data.id );

                let record = await t2.db.tx.update( table, data.id, data ); 

                console.log( e.target, record );
            } };*/
            projects.addColumn( { 
                input: { name: "id", type: "hidden" }, 
                cell: { css: {}, display: 0, modes: [ "edit" ] },
                format: [] } );
            projects.addColumn( { 
                input: { name: "project", type: "text" }, 
                cell: { css: { value: null }, display: 3, modes: [ "read", "edit" ] },
                format: [] } );
            projects.addColumn( { 
                input: { type: "submit", value: "UPDATE" }, 
                cell: { css: {}, display: 4, modes: [ "edit" ] },
                format: [] } );
            projects.setColumns( "read" );
            projects.populate( { array: records.data, orderBy: "project" } );
    };

    function check( table, array )
    {
        return array.every( prop => self.data[ table ].hasOwnProperty( prop ) );
    }

    function proceed( table, array, next )
    {
        if ( !check( table, array ) )
            return false;

        next();
    }

    async function update( table )
    {
        let form = this;
        let data = Object.assign( self.data[ table ], form.data );
        let record = await t2.db.tx.update( table, data.id, data );
                    
        console.log( "update", table, data, form.data );
    }
};

export default Main;
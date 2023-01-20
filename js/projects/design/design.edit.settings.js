import Common from "../../t2/t2.container.handlers.js";

const Panel = function( module )
{
    let self = this;
    let panel;
    
    this.init = async function( parent, params )
    {
        panel = await parent.addContainer( { id: "panel", type: "panel", format: "flex" } );
 
        this.element = panel.element;
        this.type = panel.type;

        Object.assign( this, params );
        Common.call( this );
    };

    this.refresh = async function()
    {
        await module.queries(); 

        await navigation();
    }; 

    async function navigation()
    {
        await t2.navigation.update( 
        [ 
            { id: "submenu", functions: [ { ignore: "clear" }, { clear: null } ] }, 
            { id: "subcontent", functions: [ { ignore: "clear" } ] },
            { id: "submargin", functions: [ { ignore: "clear" }, { clear: null } ] },
            { id: "menu", functions: [ { ignore: "clear" } ] },
            { id: "content", functions: [ { ignore: "clear" } ] },
            { id: `content.panels.${ self.id }`, functions: [ { clear: null }, { invoke: [ { f: output, args: null } ] } ] },
            { id: "margin", functions: [ { ignore: "clear" } ] }
        ] );
    } 

    async function output()
    {
        let box = await this.addContainer( { id: "settings", type: "box", format: "block", output: null } );

        let title = await box.addComponent( { id: "title1", type: "title", format: "block", output: "text" } );
            title.set( "Display" );
        
        let display = await box.addComponent( { id: "display", type: "form", format: "block" } );
            display.subscription.add( { event: "change", handler: change } );
            display.addField( { 
                input: { label: "show grid", name: "grid", type: "checkbox", value: "show", checked: !!module.record?.display?.grid }, 
                cell: { css: {}, display: 4 },
                format: [] } );

        title = await box.addComponent( { id: "title2", type: "title", format: "block", output: "text" } );
        title.set( "Grid" );

        let grid = await box.addComponent( { id: "grid", type: "form", format: "block" } );
            grid.subscription.add( { event: "change", handler: change } );   
            grid.addField( { 
                input: { label: "x", name: "x", type: "number", value: module.record?.grid?.x || 0 }, 
                cell: { css: {}, display: 4 },
                format: [],
                listeners: null } );
            grid.addField( { 
                input: { label: "y", name: "y", type: "number", value: module.record?.grid?.y || 0 }, 
                cell: { css: {}, display: 4 },
                format: [],
                listeners: null } );
            grid.addField( { 
                input: { label: "unit", name: "unit", type: "number", value: module.record?.grid?.unit || 0, min: 0 }, 
                cell: { css: {}, display: 4 },
                format: [] } );  
            grid.addField( { 
                input: { label: "snap", name: "snap", type: "checkbox", value: "snap", checked: !!module.record?.grid?.snap }, 
                cell: { css: {}, display: 4 },
                format: [] } );
            grid.addField( { 
                input: { label: "precision", name: "precision", type: "number", value: module.record?.grid?.precision || 0, step: 0.01 }, 
                cell: { css: {}, display: 4 },
                format: [] } );

        async function change( args )
        {
            if ( args.detail )
            {
                let form = args.detail.form;
                let input = args.detail.element;
                let record = module.record || {};
                let object = record[ form.id ];

                if ( object )
                    object[ input.name ] = args.detail.value;
                else
                    record[ form.id ] = Object.assign( record[ form.id ] || {}, { [ input.name ]: args.detail.value } );

                await t2.db.tx.update( module.q.table, Number( record.id ), record ); 
            }
        }
    }
};

export default Panel;